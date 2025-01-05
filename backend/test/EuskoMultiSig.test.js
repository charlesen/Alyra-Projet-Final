require("@nomicfoundation/hardhat-toolbox");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("EuskoMultiSig", function () {
  async function deployMultiSigFixture() {
    const [owner, signer1, signer2, signer3, signer4, nonSigner] =
      await hre.ethers.getSigners();

    const signers = [
      owner.address,
      signer1.address,
      signer2.address,
      signer3.address,
    ];
    const threshold = 3;

    // Déploiement du contrat EuskoMultiSig
    const multiSig = await hre.ethers.deployContract("EuskoMultiSig", [
      signers,
      threshold,
    ]);

    return {
      multiSig,
      owner,
      signer1,
      signer2,
      signer3,
      signer4,
      nonSigner,
      threshold,
    };
  }

  describe("Deployment", function () {
    it("Should deploy with correct signers and threshold", async function () {
      const { multiSig, owner, signer1, signer2, signer3, threshold } =
        await loadFixture(deployMultiSigFixture);

      expect(await multiSig.threshold()).to.equal(threshold);
      expect(await multiSig.isSigner(owner.address)).to.be.true;
      expect(await multiSig.isSigner(signer1.address)).to.be.true;
      expect(await multiSig.isSigner(signer2.address)).to.be.true;
      expect(await multiSig.isSigner(signer3.address)).to.be.true;
    });

    it("Should revert deployment with invalid threshold", async function () {
      const signers = ["0x0000000000000000000000000000000000000001"];
      await expect(
        hre.ethers.deployContract("EuskoMultiSig", [signers, 2])
      ).to.be.revertedWith("Signers < threshold");
    });
  });

  describe("Transaction Management", function () {
    it("Should allow a signer to submit a transaction", async function () {
      const { multiSig, owner } = await loadFixture(deployMultiSigFixture);
      const target = "0x000000000000000000000000000000000000dead";
      const value = hre.ethers.parseEther("0");
      const data = "0x";

      // Submit d'une transaction
      await multiSig.connect(owner).submitTransaction(target, value, data);

      // Vérifiez si la transaction est bien enregistrée
      const txn = await multiSig.transactions(0);
      expect(txn.target.toLowerCase()).to.equal(target.toLowerCase());
    });

    it("Should allow execution when confirmations reach the threshold", async function () {
      const { multiSig, owner, signer1, signer2, signer3 } = await loadFixture(
        deployMultiSigFixture
      );
      const target = "0x000000000000000000000000000000000000dead";
      const value = hre.ethers.parseEther("0");
      const data = "0x";

      await multiSig.connect(owner).submitTransaction(target, value, data);

      await multiSig.connect(owner).confirmTransaction(0);
      await multiSig.connect(signer1).confirmTransaction(0);
      await multiSig.connect(signer2).confirmTransaction(0);

      await multiSig.connect(signer3).executeTransaction(0);

      const txn = await multiSig.transactions(0);
      expect(txn.executed).to.be.true;
    });
  });

  describe("Signer Management", function () {
    it("Should allow multisig to add a new signer", async function () {
      const { multiSig, owner, signer1, signer2, signer4 } = await loadFixture(
        deployMultiSigFixture
      );

      const newSigner = signer4.address;
      const data = multiSig.interface.encodeFunctionData("addSigner", [
        newSigner,
      ]);

      await multiSig.connect(owner).submitTransaction(multiSig.target, 0, data);

      await multiSig.connect(owner).confirmTransaction(0);
      await multiSig.connect(signer1).confirmTransaction(0);
      await multiSig.connect(signer2).confirmTransaction(0);

      await multiSig.connect(owner).executeTransaction(0);

      expect(await multiSig.isSigner(newSigner)).to.be.true;
    });

    it("Should allow multisig to remove an existing signer", async function () {
      const { multiSig, owner, signer1, signer2 } = await loadFixture(
        deployMultiSigFixture
      );

      const oldSigner = signer1.address;
      const data = multiSig.interface.encodeFunctionData("removeSigner", [
        oldSigner,
      ]);

      await multiSig.connect(owner).submitTransaction(multiSig.target, 0, data);

      await multiSig.connect(owner).confirmTransaction(0);
      await multiSig.connect(signer1).confirmTransaction(0);
      await multiSig.connect(signer2).confirmTransaction(0);

      await multiSig.connect(owner).executeTransaction(0);

      expect(await multiSig.isSigner(oldSigner)).to.be.false;
    });
  });
});
