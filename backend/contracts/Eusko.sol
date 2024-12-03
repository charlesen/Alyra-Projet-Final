// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// Importation pour prévenir les attaques de réentrance
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// Importation pour interagir avec l'EURC (ERC20 standard)
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Contrat Stablecoin Eusko adossé à l'EURC
/// @notice Un système de jetons pour récompenser les bénévoles avec des jetons Eusko (EUS), adossés à l'EURC.
///         L'Eusko peut être émis en échange d'EURC et ne peut être dépensé qu'avec des commerçants approuvés.
contract Eusko is ERC20, Ownable, ReentrancyGuard {
    /// @dev Adresse du contrat EURC sur Sepolia
    address public constant EURC_ADDRESS =
        0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4;
    IERC20 public eurcToken;

    /// @dev Suit le total des euros en réserve adossés aux jetons.
    uint256 public totalEurosInReserve;

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
     * @notice Initialise le jeton Eusko avec une réserve totale en euros de 0.
     */
    constructor() ERC20("Eusko", "EUS") Ownable(msg.sender) {
        eurcToken = IERC20(EURC_ADDRESS);
        totalEurosInReserve = 0;
    }

    /**
     * @notice Mint des jetons Eusko en échange d'EURC.
     * @dev Seul le propriétaire peut appeler cette fonction pour mint des jetons pour un utilisateur spécifique.
     * @param recipient L'adresse qui recevra les jetons Eusko.
     * @param eurcAmount Le montant d'EURC déposé.
     */
    function mintWithEURC(
        address recipient,
        uint256 eurcAmount
    ) external onlyOwner nonReentrant {
        require(eurcAmount > 0, "EURC amount must be greater than zero");

        // Transfert de l'EURC du propriétaire vers le contrat
        bool success = eurcToken.transferFrom(
            msg.sender,
            address(this),
            eurcAmount
        );
        require(success, "EURC transfer failed");

        // Mint des jetons Eusko à l'adresse spécifiée
        _mint(recipient, eurcAmount);
        totalEurosInReserve += eurcAmount;

        emit EuskoMintedWithEURC(msg.sender, recipient, eurcAmount, eurcAmount);
    }

    /**
     * @notice Rachète des jetons Eusko contre de l'EURC.
     * @dev L'utilisateur doit avoir un solde suffisant en Eusko.
     * @param euskoAmount Le montant d'Eusko à racheter.
     */
    function redeem(uint256 euskoAmount) external nonReentrant {
        require(
            balanceOf(msg.sender) >= euskoAmount,
            "Insufficient Eusko balance"
        );
        require(
            eurcToken.balanceOf(address(this)) >= euskoAmount,
            "Insufficient EURC in reserve"
        );

        // Brûler les jetons Eusko de l'utilisateur
        _burn(msg.sender, euskoAmount);
        totalEurosInReserve -= euskoAmount;

        // Transfert de l'EURC à l'utilisateur
        bool success = eurcToken.transfer(msg.sender, euskoAmount);
        require(success, "EURC transfer failed");

        emit EuskoRedeemed(msg.sender, euskoAmount, euskoAmount);
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
    function burn(address _from, uint256 _amount) external onlyOwner {
        _burn(_from, _amount);
        totalEurosInReserve -= _amount;
        emit EuskoBurned(_from, _amount);
    }
}
