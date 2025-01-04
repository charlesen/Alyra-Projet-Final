// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title EuskoMultiSig
 * @notice Un multisig simple (3 sur 5 par ex.) pour sécuriser, par exemple, l'appel à Eusko.mintWithEURC().
 *         Seul le multisig est "autorisé" dans le contrat Eusko. Les 5 signataires doivent co-signer une
 *         transaction. Dès que 3 signatures sont collectées, la transaction peut être exécutée.
 */
contract EuskoMultiSig {
    /// @notice Les signataires (fixé au déploiement, mais on pourra désormais les modifier)
    address[] public signers;

    /// @notice Nombre minimum de signatures requises (ex: 3)
    uint256 public threshold;

    /// @notice Structure d'une transaction en attente
    struct Transaction {
        address target; // Adresse du contrat Eusko
        uint256 value; // Ether envoyé
        bytes data; // Encodage fonction + params (ex: mintWithEURC(...) encodé)
        bool executed; // true quand déjà exécutée
        uint256 numConfirmations; // combien de signataires ont confirmé
    }

    /// @notice Tableau de transactions
    Transaction[] public transactions;

    /// @notice Suivi des confirmations : txId => (signer => bool)
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    /// Events standards
    event SubmitTransaction(
        uint256 indexed txIndex,
        address indexed target,
        uint256 value,
        bytes data
    );
    event ConfirmTransaction(address indexed signer, uint256 indexed txIndex);
    event ExecuteTransaction(uint256 indexed txIndex);

    /// @notice Constructeur
    constructor(address[] memory _signers, uint256 _threshold) {
        require(_signers.length >= _threshold, "Signers < threshold");
        require(_threshold > 0, "Invalid threshold");

        for (uint256 i = 0; i < _signers.length; i++) {
            require(_signers[i] != address(0), "Zero address not allowed");
            signers.push(_signers[i]);
        }
        threshold = _threshold;
    }

    modifier onlySigner() {
        require(isSigner(msg.sender), "Not a signer");
        _;
    }

    /// @notice Vérifie si `account` est l'un des signers
    function isSigner(address account) public view returns (bool) {
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == account) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Soumettre une transaction (target, value, data)
     * @return txIndex l'index de la transaction nouvellement créée
     */
    function submitTransaction(
        address _target,
        uint256 _value,
        bytes memory _data
    ) public onlySigner returns (uint256 txIndex) {
        txIndex = transactions.length;
        transactions.push(
            Transaction({
                target: _target,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0
            })
        );
        emit SubmitTransaction(txIndex, _target, _value, _data);
    }

    /**
     * @notice Confirmer une transaction (chaque signer peut confirmer une seule fois).
     */
    function confirmTransaction(uint256 txIndex) public onlySigner {
        Transaction storage txn = transactions[txIndex];
        require(!txn.executed, "Tx already executed");
        require(!isConfirmed[txIndex][msg.sender], "Already confirmed");

        txn.numConfirmations += 1;
        isConfirmed[txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, txIndex);
    }

    /**
     * @notice Exécuter la transaction si on a suffisamment de confirmations.
     */
    function executeTransaction(uint256 txIndex) public onlySigner {
        Transaction storage txn = transactions[txIndex];
        require(!txn.executed, "Already executed");
        require(txn.numConfirmations >= threshold, "Not enough confirmations");

        txn.executed = true;
        (bool success, ) = txn.target.call{value: txn.value}(txn.data);
        require(success, "Tx failed");

        emit ExecuteTransaction(txIndex);
    }

    /**
     * @notice Méthode interne pour qu'on puisse ajouter un nouveau signataire.
     *         Seul le multisig lui-même (address(this)) peut l'appeler =>
     *         elle doit être exécutée via "executeTransaction" d'une tx ayant pour
     *         target = ce multisig, data = encodeWithSignature("addSigner(address)", newSigner).
     */
    function addSigner(address newSigner) external {
        require(msg.sender == address(this), "Only multiSig can call");
        require(newSigner != address(0), "Zero address not allowed");
        require(!isSigner(newSigner), "Already a signer");

        signers.push(newSigner);
    }

    /**
     * @notice Méthode pour enlever un signataire
     */
    function removeSigner(address oldSigner) external {
        require(msg.sender == address(this), "Only multiSig can call");
        require(isSigner(oldSigner), "Not currently a signer");

        // On supprime oldSigner du tableau signers
        uint256 length = signers.length;
        for (uint256 i = 0; i < length; i++) {
            if (signers[i] == oldSigner) {
                signers[i] = signers[length - 1];
                signers.pop();
                break;
            }
        }
    }

    /**
     * @notice Met à jour la threshold
     */
    function updateThreshold(uint256 newThreshold) external {
        require(msg.sender == address(this), "Only multiSig can call");
        require(newThreshold > 0, "Invalid newThreshold");
        require(newThreshold <= signers.length, "Threshold>signersCount");
        threshold = newThreshold;
    }

    /// @notice pour recevoir de l'ether, si besoin.
    receive() external payable {}
}
