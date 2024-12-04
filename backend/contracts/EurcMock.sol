// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EurcMock is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        address initialAccount,
        uint256 initialBalance
    ) ERC20(name, symbol) {
        if (initialBalance > 0) {
            _mint(initialAccount, initialBalance);
        }
    }

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }
}
