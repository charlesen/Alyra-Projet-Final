// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// Importation pour prévenir les attaques de réentrance
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// Importation pour interagir avec d'autres tokens ERC20
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
// Importation pour intégrer les oracles de prix (par exemple, Chainlink)
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/// @title Contrat Stablecoin Eusko avec Multi-Actifs
/// @notice Un système de jetons pour récompenser les bénévoles avec des jetons Eusko (EUS), adossés à divers actifs. L'Eusko peut être émis en déposant des actifs acceptés en collatéral par le propriétaire et ne peut être dépensé qu'avec des commerçants approuvés.
/// @dev Ce contrat implémente l'ERC20 et inclut des fonctionnalités supplémentaires pour l'intégration des commerçants et la stabilité adossée à plusieurs actifs.
contract EuskoV2 is ERC20, Ownable, ReentrancyGuard {
    /// @dev Suit le total des euros en réserve adossés aux jetons.
    uint256 public totalEurosInReserve;

    /// @dev Mapping des commerçants approuvés.
    mapping(address => bool) private merchantRegistry;

    /// @dev Suit les soldes des commerçants en Eusko.
    mapping(address => uint256) private merchantBalances;

    /// @dev Tokens acceptés comme collatéral pour le mint d'Eusko.
    mapping(address => bool) public acceptedCollateralTokens;

    /// @dev Soldes totaux de collatéral détenus par le contrat. token => amount
    mapping(address => uint256) public totalCollateralBalances;

    /// @dev Mapping des flux de prix pour chaque token de collatéral. token => priceFeed
    mapping(address => address) public priceFeeds;

    /// @notice Émis lorsque des jetons Eusko sont mintés.
    /// @param to L'adresse qui a reçu les jetons.
    /// @param amount Le nombre de jetons mintés.
    event EuskoMinted(address indexed to, uint256 amount);

    /// @notice Émis lorsque des jetons Eusko sont brûlés.
    /// @param from L'adresse depuis laquelle les jetons ont été brûlés.
    /// @param amount Le nombre de jetons brûlés.
    event EuskoBurned(address indexed from, uint256 amount);

    /// @notice Émis lorsqu'un nouveau commerçant est ajouté.
    /// @param merchant L'adresse du commerçant approuvé.
    event MerchantAdded(address indexed merchant);

    /// @notice Émis lorsqu'un commerçant est supprimé.
    /// @param merchant L'adresse du commerçant supprimé.
    event MerchantRemoved(address indexed merchant);

    /// @notice Émis lorsque des jetons Eusko sont dépensés par un utilisateur.
    /// @param spender L'adresse de l'utilisateur qui dépense les jetons.
    /// @param merchant L'adresse du commerçant recevant les jetons.
    /// @param amount Le nombre de jetons dépensés.
    event EuskoSpent(address indexed spender, address indexed merchant, uint256 amount);

    /// @notice Émis lorsqu'un commerçant réclame ses fonds équivalents en euros.
    /// @param merchant L'adresse du commerçant.
    /// @param amount Le nombre d'euros réclamés.
    event MerchantClaimedFunds(address indexed merchant, uint256 amount);

    /// @notice Émis lorsqu'un token de collatéral est accepté.
    /// @param token L'adresse du token de collatéral accepté.
    event CollateralTokenAccepted(address indexed token);

    /// @notice Émis lorsqu'un token de collatéral est retiré de la liste des acceptés.
    /// @param token L'adresse du token de collatéral retiré.
    event CollateralTokenRemoved(address indexed token);

    /// @notice Émis lorsqu'un mint est effectué avec du collatéral.
    /// @param minter L'adresse du minteur (propriétaire).
    /// @param recipient L'adresse qui reçoit les jetons Eusko.
    /// @param amount Le montant d'Eusko minté.
    /// @param collateralToken Le token de collatéral utilisé.
    /// @param collateralAmount Le montant du collatéral fourni.
    event EuskoMintedWithCollateral(
        address indexed minter,
        address indexed recipient,
        uint256 amount,
        address indexed collateralToken,
        uint256 collateralAmount
    );

    /// @notice Émis lorsqu'un utilisateur rachète des Eusko contre du collatéral.
    /// @param redeemer L'adresse de l'utilisateur qui a racheté des jetons.
    /// @param amount Le montant d'Eusko brûlé.
    /// @param collateralToken Le token de collatéral retourné.
    /// @param collateralAmount Le montant du collatéral retourné.
    event EuskoRedeemed(
        address indexed redeemer,
        uint256 amount,
        address indexed collateralToken,
        uint256 collateralAmount
    );

    /**
     * @dev Initialise le contrat en définissant le nom et le symbole du jeton, et en définissant le propriétaire initial.
     * @notice Initialise le jeton Eusko avec une réserve totale en euros de 0.
     */
    constructor() ERC20("Eusko", "EUS") Ownable(msg.sender) {
        totalEurosInReserve = 0;
    }

    /**
     * @notice Mint des jetons Eusko pour une adresse spécifique.
     * @dev Seul le propriétaire du contrat peut appeler cette fonction. Met à jour la réserve totale en euros.
     * @param _to L'adresse qui recevra les jetons.
     * @param _amount Le montant de jetons à mint.
     */
    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
        totalEurosInReserve += _amount;
        emit EuskoMinted(_to, _amount);
    }

    /**
     * @notice Brûle des jetons Eusko depuis une adresse spécifique.
     * @dev Seul le propriétaire du contrat peut appeler cette fonction. Met à jour la réserve totale en euros.
     * @param _from L'adresse depuis laquelle les jetons seront brûlés.
     * @param _amount Le montant de jetons à brûler.
     */
    function burn(address _from, uint256 _amount) external onlyOwner {
        _burn(_from, _amount);
        totalEurosInReserve -= _amount;
        emit EuskoBurned(_from, _amount);
    }

    /**
     * @notice Ajoute un nouveau commerçant au registre approuvé.
     * @dev Seul le propriétaire du contrat peut appeler cette fonction.
     * @param _merchant L'adresse du commerçant à approuver.
     */
    function addMerchant(address _merchant) external onlyOwner {
        require(!merchantRegistry[_merchant], "Merchant already approved");
        merchantRegistry[_merchant] = true;
        emit MerchantAdded(_merchant);
    }

    /**
     * @notice Supprime un commerçant du registre approuvé.
     * @dev Seul le propriétaire du contrat peut appeler cette fonction.
     * @param _merchant L'adresse du commerçant à supprimer.
     */
    function removeMerchant(address _merchant) external onlyOwner {
        require(merchantRegistry[_merchant], "Merchant not approved");
        merchantRegistry[_merchant] = false;
        emit MerchantRemoved(_merchant);
    }

    /**
     * @notice Dépense des jetons Eusko auprès d'un commerçant approuvé.
     * @dev Transfère les jetons au contrat et crédite le solde du commerçant.
     * @param _merchant L'adresse du commerçant qui reçoit les jetons.
     * @param _amount Le montant de jetons à dépenser.
     */
    function spend(address _merchant, uint256 _amount) external {
        require(merchantRegistry[_merchant], "Not an approved merchant");
        require(_amount > 0, "Amount must be greater than zero");

        // Transfert des jetons de l'utilisateur vers le contrat
        _transfer(msg.sender, address(this), _amount);

        // Mise à jour du solde du commerçant
        merchantBalances[_merchant] += _amount;

        // Émission de l'événement
        emit EuskoSpent(msg.sender, _merchant, _amount);
    }

    /**
     * @notice Réclame les fonds équivalents en euros pour le solde d'un commerçant.
     * @dev Efface le solde du commerçant et réduit la réserve totale.
     */
    function claimFunds() external {
        require(merchantRegistry[msg.sender], "Caller is not a merchant");
        uint256 balance = merchantBalances[msg.sender];
        require(balance > 0, "No balance to claim");

        // Mise à jour des soldes
        merchantBalances[msg.sender] = 0;
        totalEurosInReserve -= balance;

        // Émission de l'événement
        emit MerchantClaimedFunds(msg.sender, balance);

        // Simuler le transfert externe en euros
        // Exemple : Transférer des fonds via un système bancaire externe ou un pont stablecoin
    }

    /**
     * @notice Vérifie si une adresse est un commerçant approuvé.
     * @param _merchant L'adresse à vérifier.
     * @return True si l'adresse est un commerçant approuvé, false sinon.
     */
    function isApprovedMerchant(address _merchant) external view returns (bool) {
        return merchantRegistry[_merchant];
    }

    /**
     * @notice Obtient le solde d'un commerçant en jetons Eusko.
     * @param _merchant L'adresse du commerçant.
     * @return Le solde du commerçant.
     */
    function getMerchantBalance(address _merchant) external view returns (uint256) {
        return merchantBalances[_merchant];
    }

    /**
     * @notice Ajoute un nouveau token de collatéral accepté.
     * @dev Seul le propriétaire du contrat peut appeler cette fonction.
     * @param token L'adresse du token de collatéral à accepter.
     */
    function addAcceptedCollateralToken(address token) external onlyOwner {
        require(!acceptedCollateralTokens[token], "Collateral token already accepted");
        acceptedCollateralTokens[token] = true;
        emit CollateralTokenAccepted(token);
    }

    /**
     * @notice Retire un token de collatéral de la liste des acceptés.
     * @dev Seul le propriétaire du contrat peut appeler cette fonction.
     * @param token L'adresse du token de collatéral à retirer.
     */
    function removeAcceptedCollateralToken(address token) external onlyOwner {
        require(acceptedCollateralTokens[token], "Collateral token not accepted");
        acceptedCollateralTokens[token] = false;
        emit CollateralTokenRemoved(token);
    }

    /**
     * @notice Définit le flux de prix pour un token de collatéral.
     * @dev Seul le propriétaire du contrat peut appeler cette fonction.
     * @param collateralToken L'adresse du token de collatéral.
     * @param priceFeed L'adresse du flux de prix associé.
     */
    function setPriceFeed(address collateralToken, address priceFeed) external onlyOwner {
        require(acceptedCollateralTokens[collateralToken], "Collateral token not accepted");
        priceFeeds[collateralToken] = priceFeed;
    }

    /**
     * @notice Mint des jetons Eusko en déposant du collatéral accepté.
     * @dev Seul le propriétaire peut appeler cette fonction pour mint des jetons pour un utilisateur spécifique.
     * @param recipient L'adresse qui recevra les jetons Eusko.
     * @param collateralToken Le token de collatéral utilisé.
     * @param collateralAmount Le montant du collatéral déposé.
     */
    function mintWithCollateral(
        address recipient,
        address collateralToken,
        uint256 collateralAmount
    ) external onlyOwner nonReentrant {
        require(acceptedCollateralTokens[collateralToken], "Collateral token not accepted");
        require(collateralAmount > 0, "Collateral amount must be greater than zero");
        require(priceFeeds[collateralToken] != address(0), "Price feed not set for collateral token");

        uint256 mintAmount = calculateMintAmount(collateralToken, collateralAmount);
        require(mintAmount > 0, "Mint amount must be greater than zero");

        // Transfert du collatéral du propriétaire vers le contrat
        IERC20(collateralToken).transferFrom(msg.sender, address(this), collateralAmount);

        // Mise à jour des soldes de collatéral
        totalCollateralBalances[collateralToken] += collateralAmount;

        // Mint des jetons Eusko à l'adresse spécifiée
        _mint(recipient, mintAmount);
        totalEurosInReserve += mintAmount; // Ajuster si nécessaire en fonction de l'évaluation

        emit EuskoMintedWithCollateral(msg.sender, recipient, mintAmount, collateralToken, collateralAmount);
    }

    /**
     * @notice Calcule le montant d'Eusko à mint en fonction du collatéral fourni.
     * @param collateralToken Le token de collatéral utilisé.
     * @param collateralAmount Le montant du collatéral déposé.
     * @return Le montant d'Eusko à mint.
     */
    function calculateMintAmount(address collateralToken, uint256 collateralAmount) public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeeds[collateralToken]);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price data");

        uint8 tokenDecimals = IERC20Metadata(collateralToken).decimals();
        uint8 priceDecimals = priceFeed.decimals();

        // Ajustement des décimales
        uint256 adjustedCollateralAmount = collateralAmount * (10 ** (18 - uint256(tokenDecimals)));

        // Calcul de la valeur du collatéral en euros
        uint256 collateralValueInEUR = (adjustedCollateralAmount * uint256(price)) / (10 ** uint256(priceDecimals));

        return collateralValueInEUR;
    }

    /**
     * @notice Rachète des jetons Eusko contre du collatéral.
     * @dev L'utilisateur doit avoir un solde suffisant en Eusko.
     * @param euskoAmount Le montant d'Eusko à racheter.
     * @param collateralToken Le token de collatéral souhaité.
     */
    function redeem(uint256 euskoAmount, address collateralToken) external nonReentrant {
        require(balanceOf(msg.sender) >= euskoAmount, "Insufficient Eusko balance");
        require(acceptedCollateralTokens[collateralToken], "Collateral token not accepted");
        require(priceFeeds[collateralToken] != address(0), "Price feed not set for collateral token");

        uint256 collateralAmount = calculateCollateralAmount(collateralToken, euskoAmount);
        require(collateralAmount > 0, "Collateral amount must be greater than zero");
        require(totalCollateralBalances[collateralToken] >= collateralAmount, "Insufficient collateral in reserve");

        // Brûler les jetons Eusko de l'utilisateur
        _burn(msg.sender, euskoAmount);
        totalEurosInReserve -= euskoAmount; // Ajuster si nécessaire en fonction de l'évaluation

        // Mise à jour des soldes de collatéral
        totalCollateralBalances[collateralToken] -= collateralAmount;

        // Transfert du collatéral à l'utilisateur
        IERC20(collateralToken).transfer(msg.sender, collateralAmount);

        emit EuskoRedeemed(msg.sender, euskoAmount, collateralToken, collateralAmount);
    }

    /**
     * @notice Calcule le montant de collatéral à retourner lors du rachat d'Eusko.
     * @param collateralToken Le token de collatéral souhaité.
     * @param euskoAmount Le montant d'Eusko à racheter.
     * @return Le montant de collatéral à retourner.
     */
    function calculateCollateralAmount(address collateralToken, uint256 euskoAmount) public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeeds[collateralToken]);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price data");

        uint8 tokenDecimals = IERC20Metadata(collateralToken).decimals();
        uint8 priceDecimals = priceFeed.decimals();

        // Calcul du montant de collatéral équivalent
        uint256 collateralAmount = (euskoAmount * (10 ** uint256(priceDecimals))) / uint256(price);
        collateralAmount = collateralAmount / (10 ** (18 - uint256(tokenDecimals)));

        return collateralAmount;
    }
}
