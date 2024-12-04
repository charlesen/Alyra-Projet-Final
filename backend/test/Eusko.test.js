// import hre from "hardhat";
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");
const { expect } = require("chai");

describe("Eusko", function () {
  /*************  ✨ Codeium Command ⭐  *************/
  /**
   * Déploie les contrats Eusko et EurcMock factice.
   * Retourne un objet contenant les instances des contrats déployés,
   * ainsi que les signers représentant le propriétaire, le commerçant et l'utilisateur.
   * @returns {Object} - Un objet contenant eusko, eurcToken, owner, merchant et user.
   */
  /******  f5c9110c-65a5-431a-9b59-4bbd00a964a0  *******/
  async function deployEuskoFixture() {
    const [owner, merchant, user] = await hre.ethers.getSigners();

    // Déployer le token EURC factice
    const EurcMock = await hre.ethers.getContractFactory("EurcMock");
    const initialEURCBalance = hre.ethers.utils.parseEther("1000");
    const eurcToken = await EurcMock.deploy(
      "Euro Coin",
      "EURC",
      owner.address,
      initialEURCBalance
    );
    await eurcToken.deployed(); // Assurez-vous que le déploiement est terminé

    console.log("EurcMock deployed at:", eurcToken.address);

    // Déployer le contrat Eusko
    const Eusko = await hre.ethers.getContractFactory("Eusko");
    const eusko = await Eusko.deploy(eurcToken.address);
    await eusko.deployed(); // Assurez-vous que le déploiement est terminé

    console.log("Eusko deployed at:", eusko.address);

    return { eusko, eurcToken, owner, merchant, user };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { eusko, owner } = await loadFixture(deployEuskoFixture);
      expect(await eusko.owner()).to.equal(owner.address);
    });

    it("Should deploy contracts to valid addresses", async function () {
      const { eusko, eurcToken } = await loadFixture(deployEuskoFixture);

      expect(eusko.address).to.not.equal(hre.ethers.constants.AddressZero);
      expect(eurcToken.address).to.not.equal(hre.ethers.constants.AddressZero);
    });
  });

  describe("Mint with EURC", function () {
    it("Should mint tokens and update the reserve", async function () {
      const { eusko, eurcToken, owner, user } = await loadFixture(
        deployEuskoFixture
      );
      const amount = hre.ethers.parseEther("100");

      // Le propriétaire approuve le contrat Eusko pour dépenser l'EURC
      await eurcToken.connect(owner).approve(eusko.address, amount);

      // Le propriétaire mint des Eusko pour l'utilisateur
      await expect(eusko.connect(owner).mintWithEURC(user.address, amount))
        .to.emit(eusko, "EuskoMintedWithEURC")
        .withArgs(owner.address, user.address, amount, amount);

      expect(await eusko.balanceOf(user.address)).to.equal(amount);
      expect(await eusko.totalEurosInReserve()).to.equal(amount);
      expect(await eurcToken.balanceOf(eusko.address)).to.equal(amount);
    });

    it("Should revert if mintWithEURC is called by non-owner", async function () {
      const { eusko, user } = await loadFixture(deployEuskoFixture);
      const amount = hre.ethers.parseEther("100");

      // L'utilisateur tente de mint des Eusko
      await expect(eusko.connect(user).mintWithEURC(user.address, amount))
        .to.be.revertedWithCustomError(eusko, "OwnableUnauthorizedAccount")
        .withArgs(user.address);
    });

    it("Should revert if EURC transfer fails", async function () {
      const { eusko, eurcToken, owner, user } = await loadFixture(
        deployEuskoFixture
      );
      const amount = hre.ethers.parseEther("100");

      // Le propriétaire n'a pas approuvé le contrat Eusko pour dépenser l'EURC
      await expect(eusko.connect(owner).mintWithEURC(user.address, amount))
        .to.be.revertedWithCustomError(eurcToken, "ERC20InsufficientAllowance")
        .withArgs(owner.address, hre.ethers.constants.Zero, amount);
    });
  });

  describe("Redeem", function () {
    it("Should allow user to redeem Eusko for EURC", async function () {
      const { eusko, eurcToken, owner, user } = await loadFixture(
        deployEuskoFixture
      );
      const amount = hre.ethers.parseEther("100");

      // Le propriétaire mint des Eusko pour l'utilisateur
      await eurcToken.connect(owner).approve(eusko.address, amount);
      await eusko.connect(owner).mintWithEURC(user.address, amount);

      // L'utilisateur rachète ses Eusko contre de l'EURC
      await expect(eusko.connect(user).redeem(amount))
        .to.emit(eusko, "EuskoRedeemed")
        .withArgs(user.address, amount, amount);

      expect(await eusko.balanceOf(user.address)).to.equal(
        hre.ethers.constants.Zero
      );
      expect(await eurcToken.balanceOf(user.address)).to.equal(amount);
      expect(await eusko.totalEurosInReserve()).to.equal(
        hre.ethers.constants.Zero
      );
      expect(await eurcToken.balanceOf(eusko.address)).to.equal(
        hre.ethers.constants.Zero
      );
    });

    it("Should revert if user tries to redeem more than their balance", async function () {
      const { eusko, user } = await loadFixture(deployEuskoFixture);
      const amount = hre.ethers.parseEther("100");

      // L'utilisateur n'a pas de solde en Eusko
      await expect(eusko.connect(user).redeem(amount)).to.be.revertedWith(
        "Insufficient Eusko balance"
      );
    });

    it("Should revert if contract has insufficient EURC", async function () {
      const { eusko, eurcToken, owner, user } = await loadFixture(
        deployEuskoFixture
      );
      const amount = hre.ethers.parseEther("100");

      // Le propriétaire mint des Eusko pour l'utilisateur
      await eurcToken.connect(owner).approve(eusko.address, amount);
      await eusko.connect(owner).mintWithEURC(user.address, amount);

      // Brûler les EURC du contrat Eusko pour simuler une réserve insuffisante
      await eurcToken.connect(owner).burn(eusko.address, amount);

      // L'utilisateur tente de racheter ses Eusko
      await expect(eusko.connect(user).redeem(amount))
        .to.be.revertedWithCustomError(eurcToken, "ERC20InsufficientBalance")
        .withArgs(eusko.address, hre.ethers.constants.Zero, amount);
    });
  });

  describe("Merchant Management", function () {
    it("Should add a merchant and emit an event", async function () {
      const { eusko, owner, merchant } = await loadFixture(deployEuskoFixture);

      await expect(eusko.connect(owner).addMerchant(merchant.address))
        .to.emit(eusko, "MerchantAdded")
        .withArgs(merchant.address);

      expect(await eusko.isApprovedMerchant(merchant.address)).to.be.true;
    });

    it("Should remove a merchant and emit an event", async function () {
      const { eusko, owner, merchant } = await loadFixture(deployEuskoFixture);

      await eusko.connect(owner).addMerchant(merchant.address);
      await expect(eusko.connect(owner).removeMerchant(merchant.address))
        .to.emit(eusko, "MerchantRemoved")
        .withArgs(merchant.address);

      expect(await eusko.isApprovedMerchant(merchant.address)).to.be.false;
    });

    it("Should revert when trying to remove a merchant that is not approved", async function () {
      const { eusko, owner, merchant } = await loadFixture(deployEuskoFixture);

      // Ne pas ajouter le commerçant au préalable

      await expect(
        eusko.connect(owner).removeMerchant(merchant.address)
      ).to.be.revertedWith("Merchant not approved");
    });

    it("Should revert if a non-owner tries to add or remove a merchant", async function () {
      const { eusko, user, merchant } = await loadFixture(deployEuskoFixture);

      await expect(eusko.connect(user).addMerchant(merchant.address))
        .to.be.revertedWithCustomError(eusko, "OwnableUnauthorizedAccount")
        .withArgs(user.address);

      await expect(eusko.connect(user).removeMerchant(merchant.address))
        .to.be.revertedWithCustomError(eusko, "OwnableUnauthorizedAccount")
        .withArgs(user.address);
    });
  });

  describe("Spend", function () {
    it("Should allow users to spend tokens with approved merchants", async function () {
      const { eusko, eurcToken, owner, merchant, user } = await loadFixture(
        deployEuskoFixture
      );
      const amount = hre.ethers.parseEther("100");
      const spendAmount = hre.ethers.parseEther("30");

      // Mint des Eusko pour l'utilisateur
      await eurcToken.connect(owner).approve(eusko.address, amount);
      await eusko.connect(owner).mintWithEURC(user.address, amount);

      // Ajouter le commerçant
      await eusko.connect(owner).addMerchant(merchant.address);

      // L'utilisateur dépense des Eusko chez le commerçant
      await expect(eusko.connect(user).spend(merchant.address, spendAmount))
        .to.emit(eusko, "EuskoSpent")
        .withArgs(user.address, merchant.address, spendAmount);

      expect(await eusko.balanceOf(user.address)).to.equal(
        amount.sub(spendAmount)
      );
      expect(await eusko.getMerchantBalance(merchant.address)).to.equal(
        spendAmount
      );
    });

    it("Should revert if merchant is not approved", async function () {
      const { eusko, eurcToken, owner, user, merchant } = await loadFixture(
        deployEuskoFixture
      );
      const spendAmount = hre.ethers.parseEther("30");
      const amount = hre.ethers.parseEther("100");

      // Mint des Eusko pour l'utilisateur
      await eurcToken.connect(owner).approve(eusko.address, amount);
      await eusko.connect(owner).mintWithEURC(user.address, amount);

      // Ne pas ajouter le commerçant

      await expect(
        eusko.connect(user).spend(merchant.address, spendAmount)
      ).to.be.revertedWith("Not an approved merchant");
    });
  });

  describe("Claim Funds", function () {
    it("Should allow merchants to claim their funds", async function () {
      const { eusko, eurcToken, owner, merchant, user } = await loadFixture(
        deployEuskoFixture
      );
      const amount = hre.ethers.parseEther("100");
      const spendAmount = hre.ethers.parseEther("40");

      // Mint des Eusko pour l'utilisateur
      await eurcToken.connect(owner).approve(eusko.address, amount);
      await eusko.connect(owner).mintWithEURC(user.address, amount);

      // Ajouter le commerçant
      await eusko.connect(owner).addMerchant(merchant.address);

      // L'utilisateur dépense des Eusko chez le commerçant
      await eusko.connect(user).spend(merchant.address, spendAmount);

      // Le commerçant réclame ses fonds
      await expect(eusko.connect(merchant).claimFunds())
        .to.emit(eusko, "MerchantClaimedFunds")
        .withArgs(merchant.address, spendAmount);

      expect(await eusko.getMerchantBalance(merchant.address)).to.equal(
        hre.ethers.constants.Zero
      );
      expect(await eusko.totalEurosInReserve()).to.equal(
        amount.sub(spendAmount)
      );
      expect(await eurcToken.balanceOf(merchant.address)).to.equal(spendAmount);
    });

    it("Should revert if merchant tries to claim with no balance", async function () {
      const { eusko, owner, merchant } = await loadFixture(deployEuskoFixture);

      // Ajouter le commerçant
      await eusko.connect(owner).addMerchant(merchant.address);

      await expect(eusko.connect(merchant).claimFunds()).to.be.revertedWith(
        "No balance to claim"
      );
    });

    it("Should revert if a non-merchant tries to claim funds", async function () {
      const { eusko, user } = await loadFixture(deployEuskoFixture);

      await expect(eusko.connect(user).claimFunds()).to.be.revertedWith(
        "Caller is not a merchant"
      );
    });
  });
});
