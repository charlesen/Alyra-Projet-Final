// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Eusko Stablecoin Contract
/// @notice A token system to reward volunteers with Eusko (EUS) tokens, backed by euros. Eusko can only be spent with approved merchants.
/// @dev This contract implements ERC20 and includes additional functionality for merchant integration and euro-backed stability.
contract Eusko is ERC20, Ownable {
    /// @dev Tracks the total euros in reserve backing the tokens.
    uint256 public totalEurosInReserve;

    /// @dev Mapping of approved merchants.
    mapping(address => bool) private merchantRegistry;

    /// @dev Tracks the balances of merchants in Eusko.
    mapping(address => uint256) private merchantBalances;

    /// @notice Emitted when Eusko tokens are minted.
    /// @param to The address that received the tokens.
    /// @param amount The number of tokens minted.
    event EuskoMinted(address indexed to, uint256 amount);

    /// @notice Emitted when Eusko tokens are burned.
    /// @param from The address from which the tokens were burned.
    /// @param amount The number of tokens burned.
    event EuskoBurned(address indexed from, uint256 amount);

    /// @notice Emitted when a new merchant is added.
    /// @param merchant The address of the approved merchant.
    event MerchantAdded(address indexed merchant);

    /// @notice Emitted when a merchant is removed.
    /// @param merchant The address of the removed merchant.
    event MerchantRemoved(address indexed merchant);

    /// @notice Emitted when Eusko tokens are spent by a user.
    /// @param spender The address of the user spending the tokens.
    /// @param merchant The address of the merchant receiving the tokens.
    /// @param amount The number of tokens spent.
    event EuskoSpent(address indexed spender, address indexed merchant, uint256 amount);

    /// @notice Emitted when a merchant claims their euro-equivalent funds.
    /// @param merchant The address of the merchant.
    /// @param amount The number of euros claimed.
    event MerchantClaimedFunds(address indexed merchant, uint256 amount);

    /**
     * @dev Initializes the contract by setting the token name and symbol.
     * @notice Initializes the Eusko token with a total euro reserve of 0.
     */
    constructor() ERC20("Eusko", "EUS") Ownable(msg.sender) {
        totalEurosInReserve = 0;
    }

    /**
     * @notice Mint Eusko tokens for a specific address.
     * @dev Only callable by the contract owner. Updates the total euro reserve.
     * @param _to The address to receive the tokens.
     * @param _amount The amount of tokens to mint.
     */
    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
        totalEurosInReserve += _amount;
        emit EuskoMinted(_to, _amount);
    }

    /**
     * @notice Burn Eusko tokens from a specific address.
     * @dev Only callable by the contract owner. Updates the total euro reserve.
     * @param _from The address from which tokens will be burned.
     * @param _amount The amount of tokens to burn.
     */
    function burn(address _from, uint256 _amount) external onlyOwner {
        _burn(_from, _amount);
        totalEurosInReserve -= _amount;
        emit EuskoBurned(_from, _amount);
    }

    /**
     * @notice Add a new merchant to the approved registry.
     * @dev Only callable by the contract owner.
     * @param _merchant The address of the merchant to approve.
     */
    function addMerchant(address _merchant) external onlyOwner {
        require(!merchantRegistry[_merchant], "Merchant already approved");
        merchantRegistry[_merchant] = true;
        emit MerchantAdded(_merchant);
    }

    /**
     * @notice Remove a merchant from the approved registry.
     * @dev Only callable by the contract owner.
     * @param _merchant The address of the merchant to remove.
     */
    function removeMerchant(address _merchant) external onlyOwner {
        require(merchantRegistry[_merchant], "Merchant not approved");
        merchantRegistry[_merchant] = false;
        emit MerchantRemoved(_merchant);
    }

    /**
     * @notice Spend Eusko tokens with an approved merchant.
     * @dev Transfers tokens to the contract and credits the merchant's balance. Follows the Checks-Effects-Interactions pattern.
     * @param _merchant The address of the merchant to receive the tokens.
     * @param _amount The amount of tokens to spend.
     */
    function spend(address _merchant, uint256 _amount) external {
        require(merchantRegistry[_merchant], "Not an approved merchant");
        require(_amount > 0, "Amount must be greater than zero");

        // Checks
        _transfer(msg.sender, address(this), _amount);

        // Effects
        merchantBalances[_merchant] += _amount;

        // Interactions
        emit EuskoSpent(msg.sender, _merchant, _amount);
    }

    /**
     * @notice Claim euro-equivalent funds for a merchant's balance.
     * @dev Clears the merchant's balance and reduces the total reserve.
     */
    function claimFunds() external {
        require(merchantRegistry[msg.sender], "Caller is not a merchant");
        uint256 balance = merchantBalances[msg.sender];
        require(balance > 0, "No balance to claim");

        // Effects
        merchantBalances[msg.sender] = 0;
        totalEurosInReserve -= balance;

        // Interactions
        emit MerchantClaimedFunds(msg.sender, balance);

        // Simulate external euro transfer
        // Example: Transfer funds through an external banking system or stablecoin bridge
    }

    /**
     * @notice Check if an address is an approved merchant.
     * @param _merchant The address to check.
     * @return True if the address is an approved merchant, false otherwise.
     */
    function isApprovedMerchant(address _merchant) external view returns (bool) {
        return merchantRegistry[_merchant];
    }

    /**
     * @notice Get the balance of a merchant in Eusko tokens.
     * @param _merchant The address of the merchant.
     * @return The balance of the merchant.
     */
    function getMerchantBalance(address _merchant) external view returns (uint256) {
        return merchantBalances[_merchant];
    }
}
