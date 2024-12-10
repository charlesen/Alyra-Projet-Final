// test/Eusko.test.js

require("@nomicfoundation/hardhat-toolbox");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");
const { expect } = require("chai");

describe("Eusko", function () {
  /**
   * Déploie les contrats Eusko et EurcMock, et retourne les instances ainsi que les signers.
   * @returns {Object} - Contient eusko, eurcToken, owner, merchant et user.
   */
  async function deployEuskoFixture() {
    // const [owner, merchant, user] = await hre.ethers.getSigners();
    const [owner, merchant, user, volunteer1, volunteer2] =
      await hre.ethers.getSigners();

    // Déployer EurcMock avec une offre initiale
    // const initialEurcSupply = hre.ethers.parseUnits("1000000", 6);
    const eurcToken = await hre.ethers.deployContract("EurcMock");

    // Déployer Eusko avec l'adresse du contrat EurcMock
    const eusko = await hre.ethers.deployContract("Eusko", [eurcToken.target]);

    // return { eusko, eurcToken, owner, merchant, user };
    return { eusko, eurcToken, owner, merchant, user, volunteer1, volunteer2 };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { eusko, owner } = await loadFixture(deployEuskoFixture);
      expect(await eusko.owner()).to.equal(owner.address);
    });

    it("Should deploy contracts to valid addresses", async function () {
      const { eusko, eurcToken } = await loadFixture(deployEuskoFixture);
      expect(eusko.target).to.not.equal(hre.ethers.ZeroAddress);
      expect(eurcToken.address).to.not.equal(hre.ethers.ZeroAddress);
    });

    it("Should return the correct decimals value", async function () {
      const { eusko } = await loadFixture(deployEuskoFixture);

      // Vérifiez que la fonction decimals retourne bien 6
      expect(await eusko.decimals()).to.equal(6);
    });
  });

  describe("Mint with EURC", function () {
    it("Should mint tokens and update the reserve", async function () {
      const { eusko, eurcToken, owner, user } = await loadFixture(
        deployEuskoFixture
      );

      const amount = hre.ethers.parseUnits("20", 6); // 20 EURC avec 6 décimales

      // Le propriétaire approuve le contrat Eusko pour dépenser l'EURC
      await eurcToken.connect(owner).approve(eusko.target, amount);

      // Le propriétaire mint des Eusko pour l'utilisateur
      await expect(eusko.connect(owner).mintWithEURC(user.address, amount))
        .to.emit(eusko, "EuskoMintedWithEURC")
        .withArgs(owner.address, user.address, amount, amount);

      // Vérifier le solde de Eusko
      expect(await eusko.balanceOf(user.address)).to.equal(amount);
      expect(await eusko.totalEurosInReserve()).to.equal(amount);
      expect(await eurcToken.balanceOf(eusko.target)).to.equal(amount);
    });

    it("Should revert if mintWithEURC is called by non-owner", async function () {
      const { eusko, user } = await loadFixture(deployEuskoFixture);
      const amount = hre.ethers.parseUnits("20", 6); // 20 EURC avec 6 décimales

      // L'utilisateur tente de mint des Eusko
      await expect(
        eusko.connect(user).mintWithEURC(user.address, amount)
      ).to.be.revertedWithCustomError(eusko, "OwnableUnauthorizedAccount");
    });

    it("Should revert if EURC transfer fails", async function () {
      const { eusko, eurcToken, owner, user } = await loadFixture(
        deployEuskoFixture
      );
      const amount = hre.ethers.parseUnits("20", 6); // 20 EURC avec 6 décimales

      // Le propriétaire n'a pas approuvé le contrat Eusko pour dépenser l'EURC
      await expect(
        eusko.connect(owner).mintWithEURC(user.address, amount)
      ).to.be.revertedWithCustomError(eusko, "ERC20InsufficientAllowance");
    });
  });

  describe("Volunteer Acts", function () {
    it("Should register a volunteer act and reward Eusko", async function () {
      const { eusko, volunteer1 } = await loadFixture(deployEuskoFixture);
      const description = "Helped at the community center";
      const reward = hre.ethers.parseUnits("50", 6); // 50 Eusko

      // Effectuer la transaction
      const tx = await eusko.registerAct(
        volunteer1.address,
        description,
        reward
      );

      // Récupérer le bloc dans lequel la transaction a été incluse
      const receipt = await tx.wait();
      const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
      const timestamp = block.timestamp;

      // Vérifier l'événement émis
      await expect(tx)
        .to.emit(eusko, "VolunteerActRegistered")
        .withArgs(volunteer1.address, description, reward, timestamp);

      // Vérifier les actes enregistrés
      const acts = await eusko.getActs(volunteer1.address);
      expect(acts.length).to.equal(1);
      expect(acts[0].description).to.equal(description);
      expect(acts[0].reward).to.equal(reward);

      // Vérifier le solde du bénévole
      const balance = await eusko.balanceOf(volunteer1.address);
      expect(balance).to.equal(reward);
    });

    it("Should retrieve acts correctly for multiple volunteers", async function () {
      const { eusko, volunteer1, volunteer2 } = await loadFixture(
        deployEuskoFixture
      );

      await eusko.registerAct(
        volunteer1.address,
        "Act 1",
        hre.ethers.parseUnits("20", 6)
      );
      await eusko.registerAct(
        volunteer1.address,
        "Act 2",
        hre.ethers.parseUnits("30", 6)
      );
      await eusko.registerAct(
        volunteer2.address,
        "Act 3",
        hre.ethers.parseUnits("40", 6)
      );

      const acts1 = await eusko.getActs(volunteer1.address);
      expect(acts1.length).to.equal(2);
      expect(acts1[0].description).to.equal("Act 1");
      expect(acts1[1].description).to.equal("Act 2");

      const acts2 = await eusko.getActs(volunteer2.address);
      expect(acts2.length).to.equal(1);
      expect(acts2[0].description).to.equal("Act 3");
    });

    it("Should revert if registering an act with invalid address", async function () {
      const { eusko } = await loadFixture(deployEuskoFixture);
      await expect(
        eusko.registerAct(
          hre.ethers.ZeroAddress,
          "Invalid Act",
          hre.ethers.parseUnits("50", 6)
        )
      ).to.be.revertedWith("Invalid volunteer address");
    });

    it("Should revert if registering an act with zero reward", async function () {
      const { eusko, volunteer1 } = await loadFixture(deployEuskoFixture);
      await expect(
        eusko.registerAct(volunteer1.address, "No reward", 0)
      ).to.be.revertedWith("Reward must be greater than zero");
    });
  });

  describe("Redeem", function () {
    it("Should allow user to redeem Eusko for EURC", async function () {
      const { eusko, eurcToken, owner, user } = await loadFixture(
        deployEuskoFixture
      );
      const amount = hre.ethers.parseUnits("20", 6); // 20 EURC avec 6 décimales

      // Le propriétaire approuve le contrat Eusko pour dépenser l'EURC
      await eurcToken.connect(owner).approve(eusko.target, amount);

      // Le propriétaire mint des Eusko pour l'utilisateur
      await eusko.connect(owner).mintWithEURC(user.address, amount);

      // L'utilisateur rachète ses Eusko contre de l'EURC
      await expect(eusko.connect(user).redeem(amount))
        .to.emit(eusko, "EuskoRedeemed")
        .withArgs(user.address, amount, amount);

      expect(await eusko.balanceOf(user.address)).to.equal(0);
      expect(await eurcToken.balanceOf(user.address)).to.equal(amount);
      expect(await eusko.totalEurosInReserve()).to.equal(0);
      expect(await eurcToken.balanceOf(eusko.target)).to.equal(0);
    });

    it("Should revert if user tries to redeem more than their balance", async function () {
      const { eusko, user } = await loadFixture(deployEuskoFixture);
      const amount = hre.ethers.parseUnits("20", 6); // 20 EURC avec 6 décimales

      // L'utilisateur n'a pas de solde en Eusko
      await expect(eusko.connect(user).redeem(amount)).to.be.revertedWith(
        "Insufficient Eusko balance"
      );
    });

    it("Should revert if contract has insufficient EURC", async function () {
      const { eusko, eurcToken, owner, user } = await loadFixture(
        deployEuskoFixture
      );
      const amount = hre.ethers.parseUnits("20", 6); // 20 EURC avec 6 décimales

      // Le propriétaire approuve et mint des Eusko pour l'utilisateur
      await eurcToken.connect(owner).approve(eusko.target, amount);
      await eusko.connect(owner).mintWithEURC(user.address, amount);

      // Brûler une partie des EURC dans le contrat pour simuler une réserve insuffisante
      await eurcToken
        .connect(owner)
        .burn(eusko.target, hre.ethers.parseUnits("10", 6)); // Brûler 10 EURC

      // L'utilisateur tente de racheter ses Eusko
      await expect(eusko.connect(user).redeem(amount)).to.be.revertedWith(
        "Insufficient EURC in reserve"
      );
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

      await expect(
        eusko.connect(user).addMerchant(merchant.address)
      ).to.be.revertedWithCustomError(eusko, "OwnableUnauthorizedAccount");

      await expect(
        eusko.connect(user).removeMerchant(merchant.address)
      ).to.be.revertedWithCustomError(eusko, "OwnableUnauthorizedAccount");
    });
  });

  describe("Spend", function () {
    it("Should allow users to spend tokens with approved merchants", async function () {
      const { eusko, eurcToken, owner, merchant, user } = await loadFixture(
        deployEuskoFixture
      );
      const amount = hre.ethers.parseUnits("20", 6); // 20 EURC avec 6 décimales
      const spendAmount = hre.ethers.parseUnits("6", 6); // 6 EURC avec 6 décimales (30%)

      // Mint des Eusko pour l'utilisateur
      await eurcToken.connect(owner).approve(eusko.target, amount);
      await eusko.connect(owner).mintWithEURC(user.address, amount);

      // Ajouter le commerçant
      await eusko.connect(owner).addMerchant(merchant.address);

      // L'utilisateur dépense des Eusko chez le commerçant
      await expect(eusko.connect(user).spend(merchant.address, spendAmount))
        .to.emit(eusko, "EuskoSpent")
        .withArgs(user.address, merchant.address, spendAmount);

      expect(await eusko.balanceOf(user.address)).to.equal(
        amount - spendAmount
      );
      expect(await eusko.getMerchantBalance(merchant.address)).to.equal(
        spendAmount
      );
    });

    it("Should revert if merchant is not approved", async function () {
      const { eusko, eurcToken, owner, user, merchant } = await loadFixture(
        deployEuskoFixture
      );
      const spendAmount = hre.ethers.parseUnits("6", 6); // 6 EURC avec 6 décimales
      const amount = hre.ethers.parseUnits("20", 6); // 20 EURC avec 6 décimales

      // Mint des Eusko pour l'utilisateur
      await eurcToken.connect(owner).approve(eusko.target, amount);
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
      const amount = hre.ethers.parseUnits("20", 6); // 20 EURC avec 6 décimales
      const spendAmount = hre.ethers.parseUnits("8", 6); // 8 EURC avec 6 décimales

      // Mint des Eusko pour l'utilisateur
      await eurcToken.connect(owner).approve(eusko.target, amount);
      await eusko.connect(owner).mintWithEURC(user.address, amount);

      // Ajouter le commerçant
      await eusko.connect(owner).addMerchant(merchant.address);

      // L'utilisateur dépense des Eusko chez le commerçant
      await eusko.connect(user).spend(merchant.address, spendAmount);

      // Le commerçant réclame ses fonds
      await expect(eusko.connect(merchant).claimFunds())
        .to.emit(eusko, "MerchantClaimedFunds")
        .withArgs(merchant.address, spendAmount);

      expect(await eusko.getMerchantBalance(merchant.address)).to.equal(0);
      expect(await eusko.totalEurosInReserve()).to.equal(amount - spendAmount);
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

  describe("Burn", function () {
    it("Should burn tokens successfully and emit event", async function () {
      const { eusko, eurcToken, owner, user } = await loadFixture(
        deployEuskoFixture
      );
      const mintAmount = hre.ethers.parseUnits("150", 6); // Mint 150 EURC
      const burnAmount = hre.ethers.parseUnits("50", 6); // Burn 50 EURC

      // Mint tokens to the user
      await eurcToken.connect(owner).approve(eusko.target, mintAmount);
      await eusko.connect(owner).mintWithEURC(user.address, mintAmount);

      // Burn tokens from the user
      await expect(eusko.connect(owner).burn(user.address, burnAmount))
        .to.emit(eusko, "EuskoBurned")
        .withArgs(user.address, burnAmount);

      // Check remaining balance of the user
      const expectedBalance = mintAmount - burnAmount;
      const userBalance = await eusko.balanceOf(user.address);
      expect(userBalance).to.equal(expectedBalance);

      // Check updated total reserve
      const expectedReserve = mintAmount - burnAmount;
      const totalReserve = await eusko.totalEurosInReserve();
      expect(totalReserve).to.equal(expectedReserve);
    });

    it("Should revert if trying to burn more than the user's balance", async function () {
      const { eusko, eurcToken, owner, user } = await loadFixture(
        deployEuskoFixture
      );
      const mintAmount = hre.ethers.parseUnits("100", 6);
      const burnAmount = hre.ethers.parseUnits("150", 6);

      // Mint tokens to the user
      await eurcToken.connect(owner).approve(eusko.target, mintAmount);
      await eusko.connect(owner).mintWithEURC(user.address, mintAmount);

      // Try burning more tokens than available
      await expect(
        eusko.connect(owner).burn(user.address, burnAmount)
      ).to.be.revertedWithCustomError(eusko, "ERC20InsufficientBalance");
    });
  });

  describe("Authorized Accounts Management", function () {
    it("Should add an authorized account and emit an event", async function () {
      const { eusko, owner, user } = await loadFixture(deployEuskoFixture);

      await expect(eusko.connect(owner).addAuthorizedAccount(user.address))
        .to.emit(eusko, "AuthorizedAccountAdded")
        .withArgs(user.address);

      expect(await eusko.isAuthorizedAccount(user.address)).to.be.true;
    });

    it("Should remove an authorized account and emit an event", async function () {
      const { eusko, owner, user } = await loadFixture(deployEuskoFixture);

      // Add the account first
      await eusko.connect(owner).addAuthorizedAccount(user.address);

      // Remove the account
      await expect(eusko.connect(owner).removeAuthorizedAccount(user.address))
        .to.emit(eusko, "AuthorizedAccountRemoved")
        .withArgs(user.address);

      expect(await eusko.isAuthorizedAccount(user.address)).to.be.false;
    });

    it("Should revert if trying to remove an account that is not authorized", async function () {
      const { eusko, owner, user } = await loadFixture(deployEuskoFixture);

      await expect(
        eusko.connect(owner).removeAuthorizedAccount(user.address)
      ).to.be.revertedWith("Account not authorized");
    });

    it("Should revert if trying to remove an account with invalid address", async function () {
      const { eusko, owner } = await loadFixture(deployEuskoFixture);

      await expect(
        eusko.connect(owner).removeAuthorizedAccount(hre.ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should return true for the owner in isAuthorizedAccount", async function () {
      const { eusko, owner } = await loadFixture(deployEuskoFixture);

      expect(await eusko.isAuthorizedAccount(owner.address)).to.be.true;
    });

    it("Should return false for an unauthorized account in isAuthorizedAccount", async function () {
      const { eusko, user } = await loadFixture(deployEuskoFixture);

      expect(await eusko.isAuthorizedAccount(user.address)).to.be.false;
    });

    it("Should return true for an authorized account in isAuthorizedAccount", async function () {
      const { eusko, owner, user } = await loadFixture(deployEuskoFixture);

      await eusko.connect(owner).addAuthorizedAccount(user.address);
      expect(await eusko.isAuthorizedAccount(user.address)).to.be.true;
    });
  });
});
