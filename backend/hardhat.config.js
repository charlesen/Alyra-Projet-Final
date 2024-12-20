require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */

// Deploy on sepolia
// npx hardhat vars set INFURA_API_KEY "YOUR_INFURA_API_KEY"
const INFURA_API_KEY = vars.get("INFURA_API_KEY");

// npx hardhat vars set SEPOLIA_PRIVATE_KEY "YOUR_PRIVATE_KEY"
const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY");

// npx hardhat vars set ETHERSCAN_API_KEY "G3SS5QHHYDRRRASIXB3MGJCIB3DZ6VX6II"
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");

// Instanciate a provider
const rpcUrl = `https://sepolia.infura.io/v3/${INFURA_API_KEY}`;

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: rpcUrl,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY, // Clé API Etherscan
  },
};

// Doc deploiement :
// npx hardhat ignition deploy ignition/modules/Eusko.js --network sepolia
// npx hardhat ignition deploy ignition/modules/EuskoDAO.js --network sepolia

// Vérification contrat :
// npx hardhat verify --network sepolia 0xfaC7B9F5d5f142f9cFf65d45921898FB6b7bE2d1 "0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4"
