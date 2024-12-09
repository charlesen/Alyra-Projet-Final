// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title EurcMock
 * @dev Mock implementation of an ERC20 token for EURC. Includes mint and burn functionalities.
 */
contract EurcMock is ERC20 {
    /**
     * @dev Constructor that mints an initial supply to the deployer's address.
     */
    constructor() ERC20("EURC", "EURC") {
        _mint(msg.sender, 1000000000 * 10 ** decimals()); // Mint initial supply
    }

    /**
     * @dev Allows minting of new tokens to a specific address.
     * @param to The address to receive the newly minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @dev Allows burning of tokens from a specific address.
     * @param from The address from which tokens will be burned.
     * @param amount The amount of tokens to burn.
     */
    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}
