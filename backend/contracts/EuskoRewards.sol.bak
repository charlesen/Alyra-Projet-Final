// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Contrat de Récompense Eusko pour les Bénévoles
/// @notice Permet d'émettre des NFT de récompense aux bénévoles.
contract EuskoRewards is ERC1155, Ownable(msg.sender) {
    uint256 private _currentRewardId = 1;

    constructor() ERC1155("https://nft.edounze.com/api/token/{id}.json") {}

    /**
     * @notice Émet un NFT de récompense pour un bénévole.
     * @param to L'adresse du bénévole.
     * @param data Données supplémentaires (optionnelles).
     */
    function mintReward(address to, bytes memory data) external onlyOwner {
        _mint(to, _currentRewardId, 1, data);
        _currentRewardId += 1;
    }
}
