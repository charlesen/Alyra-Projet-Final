// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const SIGNERS = [
  "0x1C59e75469a7627350602D30701a7c599Bf47844",
  "0x83b818D115a744DEdc4158ac96AaAeb194676951",
  "0xdeFb8Df39Aa3a68bfF36A0C997434Cf9c9b895b1",
  "0x871c0626DE3CA1303c5cC9CeC879BA9681bF973A",
];

const THRESHOLD = 3;

module.exports = buildModule("EuskoMultiSig", (m) => {
  const signers = m.getParameter("SIGNERS", SIGNERS);
  const threshold = m.getParameter("THRESHOLD", THRESHOLD);

  const EuskoMultiSig = m.contract("EuskoMultiSig", [signers, threshold]);

  return { EuskoMultiSig };
});
