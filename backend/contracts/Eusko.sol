// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// Importation pour prévenir les attaques de réentrance
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// Importation pour interagir avec l'EURC (ERC20 standard)
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./Authorizable.sol";

/// @title Contrat Stablecoin Eusko adossé à l'EURC
/// @notice Un système de jetons pour récompenser les bénévoles avec des jetons Eusko (EUS), adossés à l'EURC.
///         L'Eusko peut être émis en échange d'EURC et ne peut être dépensé qu'avec des commerçants approuvés.
contract Eusko is ERC20, Authorizable, ReentrancyGuard {
    IERC20 public eurcToken;

    /// @dev Suit le total des euros en réserve adossés aux jetons.
    uint256 public totalEurosInReserve;

    /// @dev Mapping pour suivre les actes de bénévolat
    struct Act {
        string description;
        uint256 reward; // Récompense en Eusko
        uint256 timestamp;
    }
    mapping(address => Act[]) private volunteerActs;

    /// @dev Mapping des commerçants approuvés.
    mapping(address => bool) private merchantRegistry;

    /// @dev Suit les soldes des commerçants en Eusko.
    mapping(address => uint256) private merchantBalances;

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

    /// @notice Émis lorsqu'un acte de volontariat est enregistré.
    /// @param volunteer L'adresse du volontaire.
    /// @param description La description du volontariat.
    /// @param reward La reward du volontariat.
    /// @param timestamp Le timestamp du volontariat.
    event VolunteerActRegistered(
        address indexed volunteer,
        string description,
        uint256 reward,
        uint256 timestamp
    );

    /// @notice Émis lorsque des jetons Eusko sont dépensés par un utilisateur.
    /// @param spender L'adresse de l'utilisateur qui dépense les jetons.
    /// @param merchant L'adresse du commerçant recevant les jetons.
    /// @param amount Le nombre de jetons dépensés.
    event EuskoSpent(
        address indexed spender,
        address indexed merchant,
        uint256 amount
    );

    /// @notice Émis lorsqu'un commerçant réclame ses fonds équivalents en euros.
    /// @param merchant L'adresse du commerçant.
    /// @param amount Le nombre d'euros réclamés.
    event MerchantClaimedFunds(address indexed merchant, uint256 amount);

    /// @notice Émis lorsqu'un mint est effectué avec de l'EURC.
    /// @param minter L'adresse du minteur (propriétaire).
    /// @param recipient L'adresse qui reçoit les jetons Eusko.
    /// @param amount Le montant d'Eusko minté.
    /// @param eurcAmount Le montant d'EURC déposé.
    event EuskoMintedWithEURC(
        address indexed minter,
        address indexed recipient,
        uint256 amount,
        uint256 eurcAmount
    );

    /// @notice Émis lorsqu'un utilisateur rachète des Eusko contre de l'EURC.
    /// @param redeemer L'adresse de l'utilisateur qui a racheté des jetons.
    /// @param amount Le montant d'Eusko brûlé.
    /// @param eurcAmount Le montant d'EURC retourné.
    event EuskoRedeemed(
        address indexed redeemer,
        uint256 amount,
        uint256 eurcAmount
    );

    /**
     * @dev Initialise le contrat en définissant le nom et le symbole du jeton, et en initialisant l'EURC.
     * @param eurcAddress L'adresse du contrat EURC à utiliser.
     */
    constructor(address eurcAddress) ERC20("Eusko", "EUS") {
        require(eurcAddress != address(0), "EURC address cannot be zero");
        eurcToken = IERC20(eurcAddress);
        totalEurosInReserve = 0;
    }

    /**
     * @notice Mint des jetons Eusko en échange d'EURC.
     * @dev Seul le propriétaire peut appeler cette fonction pour mint des jetons pour un utilisateur spécifique.
     * @param _recipient L'adresse qui recevra les jetons Eusko.
     * @param _eurcAmount Le montant d'EURC déposé.
     */
    function mintWithEURC(
        address _recipient,
        uint256 _eurcAmount
    ) external onlyAuthorized nonReentrant {
        require(_eurcAmount > 0, "EURC amount must be greater than zero");

        // Transfert de l'EURC du propriétaire vers le contrat
        bool success = eurcToken.transferFrom(
            msg.sender,
            address(this),
            _eurcAmount
        );
        require(success, "EURC transfer failed");

        // Mint des jetons Eusko à l'adresse spécifiée
        _mint(_recipient, _eurcAmount);
        totalEurosInReserve += _eurcAmount;

        emit EuskoMintedWithEURC(
            msg.sender,
            _recipient,
            _eurcAmount,
            _eurcAmount
        );
    }

    /**
     * @notice Rachète des jetons Eusko contre de l'EURC.
     * @dev L'utilisateur doit avoir un solde suffisant en Eusko.
     * @param _euskoAmount Le montant d'Eusko à racheter.
     */
    function redeem(uint256 _euskoAmount) external nonReentrant {
        require(
            balanceOf(msg.sender) >= _euskoAmount,
            "Insufficient Eusko balance"
        );
        require(
            eurcToken.balanceOf(address(this)) >= _euskoAmount,
            "Insufficient EURC in reserve"
        );

        // Brûler les jetons Eusko de l'utilisateur
        _burn(msg.sender, _euskoAmount);
        totalEurosInReserve -= _euskoAmount;

        // Transfert de l'EURC à l'utilisateur (équivalence 1EURC = 1Eusko)
        bool success = eurcToken.transfer(msg.sender, _euskoAmount);
        require(success, "EURC transfer failed");

        emit EuskoRedeemed(msg.sender, _euskoAmount, _euskoAmount);
    }

    /**
     * @notice Enregistrement d'un nouvel acte de volontariat.
     * @dev Seul le propriétaire du contrat peut appeler cette fonction.
     * @param _volunteer L'adresse du volontaire.
     * @param _description La description de l'acte.
     * @param _reward Le montant de la rachat.
     */
    function registerAct(
        address _volunteer,
        string memory _description,
        uint256 _reward
    ) external onlyAuthorized {
        require(_volunteer != address(0), "Invalid volunteer address");
        require(_reward > 0, "Reward must be greater than zero");

        // Ajouter l'acte au registre
        volunteerActs[_volunteer].push(
            Act({
                description: _description,
                reward: _reward,
                timestamp: block.timestamp
            })
        );

        // Récompenser le bénévole
        _mint(_volunteer, _reward);

        emit VolunteerActRegistered(
            _volunteer,
            _description,
            _reward,
            block.timestamp
        );
    }

    /**
     * @notice Obtient les actes d'un volontaire.
     * @param _volunteer L'adresse du volontaire.
     */
    function getActs(address _volunteer) external view returns (Act[] memory) {
        return volunteerActs[_volunteer];
    }

    /**
     * @notice Ajoute un nouveau commerçant au registre approuvé.
     * @dev Seul le propriétaire du contrat peut appeler cette fonction.
     * @param _merchant L'adresse du commerçant à approuver.
     */
    function addMerchant(address _merchant) external onlyAuthorized {
        require(!merchantRegistry[_merchant], "Merchant already approved");
        merchantRegistry[_merchant] = true;
        emit MerchantAdded(_merchant);
    }

    /**
     * @notice Supprime un commerçant du registre approuvé.
     * @dev Seul le propriétaire du contrat peut appeler cette fonction.
     * @param _merchant L'adresse du commerçant à supprimer.
     */
    function removeMerchant(address _merchant) external onlyAuthorized {
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
    function claimFunds() external nonReentrant {
        require(merchantRegistry[msg.sender], "Caller is not a merchant");
        uint256 balance = merchantBalances[msg.sender];
        require(balance > 0, "No balance to claim");
        require(
            eurcToken.balanceOf(address(this)) >= balance,
            "Insufficient EURC in reserve"
        );

        // Mise à jour des soldes
        merchantBalances[msg.sender] = 0;
        totalEurosInReserve -= balance;

        // Transfert de l'EURC au commerçant
        bool success = eurcToken.transfer(msg.sender, balance);
        require(success, "EURC transfer failed");

        // Émission de l'événement
        emit MerchantClaimedFunds(msg.sender, balance);
    }

    /**
     * @notice Vérifie si une adresse est un commerçant approuvé.
     * @param _merchant L'adresse à vérifier.
     * @return True si l'adresse est un commerçant approuvé, false sinon.
     */
    function isApprovedMerchant(
        address _merchant
    ) external view returns (bool) {
        return merchantRegistry[_merchant];
    }

    /**
     * @notice Obtient le solde d'un commerçant en jetons Eusko.
     * @param _merchant L'adresse du commerçant.
     * @return Le solde du commerçant.
     */
    function getMerchantBalance(
        address _merchant
    ) external view returns (uint256) {
        return merchantBalances[_merchant];
    }

    /**
     * @notice Brûle des jetons Eusko depuis une adresse spécifique.
     * @dev Seul le propriétaire du contrat peut appeler cette fonction. Met à jour la réserve totale en euros.
     * @param _from L'adresse depuis laquelle les jetons seront brûlés.
     * @param _amount Le montant de jetons à brûler.
     */
    function burn(address _from, uint256 _amount) external onlyAuthorized {
        _burn(_from, _amount);
        totalEurosInReserve -= _amount;
        emit EuskoBurned(_from, _amount);
    }

    /**
     * @notice Redéfinit le nombre de décimales utilisées par le token Eusko.
     * @dev Aligne le nombre de décimales du token Eusko sur celui de l'EURC, qui est de 6 décimales.
     * @return Le nombre de décimales du token Eusko, c'est-à-dire 6.
     */
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
