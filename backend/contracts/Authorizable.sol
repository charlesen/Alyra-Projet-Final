// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Authorizable
/// @notice Contrat abstrait pour gérer des comptes autorisés
abstract contract Authorizable is Ownable {
    mapping(address => bool) private _authorizedAccounts;

    event AuthorizedAccountAdded(address indexed account);
    event AuthorizedAccountRemoved(address indexed account);

    /// @notice Modificateur pour restreindre l'accès aux comptes autorisés
    modifier onlyAuthorized() {
        _checkAuthorization();
        _;
    }

    constructor() Ownable(msg.sender) {}

    function _checkAuthorization() internal view {
        require(
            owner() == msg.sender || _authorizedAccounts[msg.sender],
            "Not authorized"
        );
    }

    function addAuthorizedAccount(address _account) external onlyOwner {
        require(_account != address(0), "Invalid address");
        require(!_authorizedAccounts[_account], "Account already authorized");
        _authorizedAccounts[_account] = true;
        emit AuthorizedAccountAdded(_account);
    }

    function removeAuthorizedAccount(address _account) external onlyOwner {
        require(_account != address(0), "Invalid address");
        require(_authorizedAccounts[_account], "Account not authorized");
        _authorizedAccounts[_account] = false;
        emit AuthorizedAccountRemoved(_account);
    }

    function isAuthorizedAccount(
        address _account
    ) external view returns (bool) {
        return owner() == _account || _authorizedAccounts[_account];
    }
}
