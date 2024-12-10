// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Contrat de DAO Eusko avec gestion des récompenses NFT
/// @notice Permet de créer des badges de récompense pour les bénévoles et de gérer la gouvernance.
contract EuskoDAO is ERC1155, Ownable(msg.sender) {
    uint256 private _currentRewardId = 1; // Compteur pour les NFT (badges)
    uint256 public discountRate; // Pourcentage de réduction

    mapping(uint256 => Proposal) public proposals; // Propositions
    uint256 public proposalCount;

    mapping(uint256 => mapping(address => bool)) private votes; // Suivi des votes par utilisateur

    struct Proposal {
        string description;
        uint256 newRate; // Nouveau pourcentage proposé
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
    }

    /// @notice Émis lorsqu'une nouvelle proposition est créée.
    event ProposalCreated(
        uint256 indexed proposalId,
        string description,
        uint256 newRate
    );

    /// @notice Émis lorsqu'une proposition reçoit un vote.
    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool support
    );

    /// @notice Émis lorsqu'une proposition est exécutée.
    event ProposalExecuted(uint256 indexed proposalId, uint256 newRate);

    /// @notice Émis lorsqu'un NFT de récompense est émis.
    event RewardMinted(
        address indexed to,
        uint256 indexed rewardId,
        string metadata
    );

    /// @notice Constructeur
    /// @param _initialRate Taux de réduction initial.
    constructor(
        uint256 _initialRate
    ) ERC1155("https://nft.edounze.com/api/token/{id}.json") {
        require(_initialRate <= 100, "Rate cannot exceed 100%");
        discountRate = _initialRate;
    }

    /**
     * @notice Émet un NFT de récompense pour un bénévole.
     * @param _to Adresse du bénévole.
     * @param _metadata Description ou URL liée au badge.
     * @param _data Données supplémentaires (optionnelles).
     */
    function mintReward(
        address _to,
        string memory _metadata,
        bytes memory _data
    ) external onlyOwner {
        require(_to != address(0), "Invalid recipient address");

        _mint(_to, _currentRewardId, 1, _data);

        emit RewardMinted(_to, _currentRewardId, _metadata);
        _currentRewardId += 1;
    }

    /**
     * @notice Crée une nouvelle proposition.
     * @param _description Description de la proposition.
     * @param _newRate Nouveau pourcentage proposé.
     */
    function createProposal(
        string memory _description,
        uint256 _newRate
    ) external onlyOwner {
        require(_newRate <= 100, "Rate cannot exceed 100%");

        proposals[proposalCount] = Proposal({
            description: _description,
            newRate: _newRate,
            votesFor: 0,
            votesAgainst: 0,
            executed: false
        });

        emit ProposalCreated(proposalCount, _description, _newRate);
        proposalCount++;
    }

    /**
     * @notice Vote pour ou contre une proposition.
     * @param _proposalId ID de la proposition.
     * @param _support Vote pour (true) ou contre (false).
     */
    function vote(uint256 _proposalId, bool _support) external {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(!votes[_proposalId][msg.sender], "Already voted");

        votes[_proposalId][msg.sender] = true;

        if (_support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }

        emit Voted(_proposalId, msg.sender, _support);
    }

    /**
     * @notice Exécute une proposition.
     * @param _proposalId ID de la proposition.
     */
    function executeProposal(uint256 _proposalId) external onlyOwner {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(
            proposal.votesFor > proposal.votesAgainst,
            "Proposal not approved"
        );

        proposal.executed = true;
        discountRate = proposal.newRate;

        emit ProposalExecuted(_proposalId, proposal.newRate);
    }

    /**
     * @notice Vérifie si un utilisateur a voté pour une proposition.
     * @param _proposalId ID de la proposition.
     * @param _voter Adresse de l'utilisateur.
     * @return True si l'utilisateur a voté, sinon False.
     */
    function hasVoted(
        uint256 _proposalId,
        address _voter
    ) external view returns (bool) {
        return votes[_proposalId][_voter];
    }
}
