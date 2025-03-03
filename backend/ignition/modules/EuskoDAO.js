// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const INITIAL_RATE = 10;
module.exports = buildModule("EuskoDAO", (m) => {
  const initialRate = m.getParameter("INITIAL_RATE", INITIAL_RATE);
  const EuskoDAO = m.contract("EuskoDAO", [initialRate]);

  return { EuskoDAO };
});
