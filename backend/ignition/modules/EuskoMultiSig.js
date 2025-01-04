// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const SIGNERS = [
  "0x1C59e75469a7627350602D30701a7c599Bf47844",
  "0x83b818D115a744DEdc4158ac96AaAeb194676951",
  "0xdeFb8Df39Aa3a68bfF36A0C997434Cf9c9b895b1",
  "0x871c0626DE3CA1303c5cC9CeC879BA9681bF973A",
  "0x04b987bC842628aCE61419475b9Da9cDab15d42d",
  "0xD61F13a8025fe52E2483Ddd9b40258f99E839A9C",
  "0x7ab1b30241D96C32EAda618fbD1d4C3a57b50C60",
];

const THRESHOLD = 3;

module.exports = buildModule("Eusko3MultiSig", (m) => {
  const signers = m.getParameter("SIGNERS", SIGNERS);
  const threshold = m.getParameter("THRESHOLD", THRESHOLD);

  const Eusko3MultiSig = m.contract("EuskoMultiSig", [signers, threshold]);

  return { Eusko3MultiSig };
});
