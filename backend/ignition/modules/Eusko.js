// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// const EURC_ADDRESS = vars.get("EURC_ADDRESS");
const EURC_ADDRESS = "0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4";

module.exports = buildModule("EuskoModule", (m) => {
  const eurcAddress = m.getParameter("EURC_ADDRESS", EURC_ADDRESS);
  const Eusko = m.contract("Eusko", [eurcAddress]);

  return { Eusko };
});
