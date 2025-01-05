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

    address public reserve; // Adresse de la réserve

    /// @dev Mapping pour suivre les actes de bénévolat
    struct Act {
        address organism; // Adresse de l'organisme : Permet de garder une trace de l'organisme qui a validé ou proposé l'acte.
        string description; // Description de l'acte
        uint256 reward; // Stocke la récompense en Eusko, alignée sur la tokenomics
        uint256 timestamp; // Timestamp de réalisation
    }

    // Mapping pour chaque benevole
    mapping(address => Act[]) public volunteerActs;

    /// @dev Mapping des commerçants/organismes approuvés.
    mapping(address => bool) private merchantRegistry;

    /// @dev Suit les soldes des commerçants en Eusko.
    mapping(address => uint256) private merchantBalances;

    /// @notice Émis lorsque l'adresse de la réserve est mise à jour.
    /// @param oldReserve L'ancienne adresse de la réserve.
    /// @param newReserve La nouvelle adresse de la réserve.
    event ReserveUpdated(
        address indexed oldReserve,
        address indexed newReserve
    );

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
    /// @param organism L'adresse de l'organisme.
    /// @param description La description du volontariat.
    /// @param reward La reward du volontariat.
    /// @param timestamp Le timestamp du volontariat.
    event VolunteerActRegistered(
        address indexed volunteer,
        address indexed organism,
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

    /// @notice Émis lorsqu'un acte expiré est supprimé.
    /// @param volunteer L'adresse du bénévole.
    /// @param description La description de l'acte expiré.
    /// @param reward Le montant de la récompense associée.
    /// @param timestamp Le timestamp de l'acte expiré.
    event ExpiredActRemoved(
        address indexed volunteer,
        string description,
        uint256 reward,
        uint256 timestamp
    );

    /**
     * @dev Initialise le contrat en définissant le nom et le symbole du jeton, et en initialisant l'EURC.
     * @param eurcAddress L'adresse du contrat EURC à utiliser.
     */
    constructor(address eurcAddress) ERC20("Eusko", "EUS") {
        require(eurcAddress != address(0), "EURC address cannot be zero");

        // Initialisation de l'EURC
        eurcToken = IERC20(eurcAddress);

        // Initialisation de la réserve
        totalEurosInReserve = 0;

        // La réserve par défaut est celle du propriétaire du contrat
        reserve = msg.sender;
    }

    /**
     * @notice Met à jour l'adresse de la réserve.
     * @param _newReserve La nouvelle adresse de la réserve.
     */
    function updateReserve(address _newReserve) external onlyAuthorized {
        require(_newReserve != address(0), "Invalid new reserve address");
        address oldReserve = reserve;
        reserve = _newReserve;
        emit ReserveUpdated(oldReserve, _newReserve);
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

        // Transfert de l'EURC du minter (personnes authorisées dont le propriétaire du contrat) vers le contrat EURC
        // On s'assure ainsi que pour chaque EUS minté, le contrat aura un solde d'EURC équivalent
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
     * @notice Enregistre un acte de bénévolat et transfère des tokens depuis la réserve.
     * @param _volunteer Adresse du bénévole.
     * @param _organism Adresse de l'organisme.
     * @param _description Description de l'acte.
     * @param _reward Récompense pour l'acte.
     */
    function registerAct(
        address _volunteer,
        address _organism,
        string memory _description,
        uint256 _reward
    ) external nonReentrant onlyAuthorized {
        require(_volunteer != address(0), "Invalid volunteer address");
        require(_organism != address(0), "Invalid organism address");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_reward > 0, "Reward must be greater than zero");

        // Vérifie que la réserve a suffisamment de fonds
        require(balanceOf(reserve) >= _reward, "Insufficient reserve balance");

        // Ajoute l'acte au registre
        volunteerActs[_volunteer].push(
            Act({
                organism: _organism,
                description: _description,
                reward: _reward,
                timestamp: block.timestamp
            })
        );

        // Transfére des fonds depuis la réserve vers le bénévole
        _transfer(reserve, _volunteer, _reward);

        emit VolunteerActRegistered(
            _volunteer,
            _organism,
            _description,
            _reward,
            block.timestamp
        );
    }

    /**
     * @notice Récupère les actes d'un bénévole.
     * @param _volunteer Adresse du bénévole.
     * @return Liste des actes de bénévolat effectués par le bénévole.
     */
    function getActsByVolunteer(
        address _volunteer
    ) external view returns (Act[] memory) {
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
    function spend(address _merchant, uint256 _amount) external nonReentrant {
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
     * @notice Supprime les actes expirés d'un bénévole.
     * @param _volunteer L'adresse du bénévole.
     */
    function removeExpiredActs(
        address _volunteer
    ) external nonReentrant onlyAuthorized {
        Act[] storage acts = volunteerActs[_volunteer];
        uint256 currentTime = block.timestamp;
        uint256 totalToRevoke = 0;

        for (uint256 i = 0; i < acts.length; i++) {
            if (currentTime - acts[i].timestamp > 365 days) {
                totalToRevoke += acts[i].reward;

                emit ExpiredActRemoved(
                    _volunteer,
                    acts[i].description,
                    acts[i].reward,
                    acts[i].timestamp
                );

                // Supprime l'acte expiré
                acts[i] = acts[acts.length - 1]; // Remplace par le dernier acte
                acts.pop(); // Réduction de la taille du tableau

                if (i > 0) {
                    i--; // Réduction de l'index pour évaluer le nouvel élément
                }
            }
        }

        // Réduction de la balance en Eusko de l'utilisateur
        if (totalToRevoke > 0) {
            _transfer(_volunteer, reserve, totalToRevoke);
        }
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
