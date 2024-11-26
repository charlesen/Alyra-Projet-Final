const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Eusko", function () {
    async function deployEuskoFixture() {
        const [owner, merchant, user] = await ethers.getSigners();
        const Eusko = await ethers.getContractFactory("Eusko");
        const eusko = await Eusko.deploy();
        return { eusko, owner, merchant, user };
    }

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            const { eusko, owner } = await loadFixture(deployEuskoFixture);
            expect(await eusko.owner()).to.equal(owner.address);
        });

        it("Should initialize totalEurosInReserve to 0", async function () {
            const { eusko } = await loadFixture(deployEuskoFixture);
            expect(await eusko.totalEurosInReserve()).to.equal(0n);
        });
    });

    describe("Mint", function () {
        it("Should mint tokens and update the reserve", async function () {
            const { eusko, owner, user } = await loadFixture(deployEuskoFixture);
            const amount = ethers.parseEther("100");

            await expect(eusko.connect(owner).mint(user.address, amount))
                .to.emit(eusko, "EuskoMinted")
                .withArgs(user.address, amount);

            expect(await eusko.balanceOf(user.address)).to.equal(amount);
            expect(await eusko.totalEurosInReserve()).to.equal(amount);
        });

        it("Should revert if mint is called by non-owner", async function () {
            const { eusko, user } = await loadFixture(deployEuskoFixture);
            const amount = ethers.parseEther("100");

            await expect(
                eusko.connect(user).mint(user.address, amount)
            ).to.be.revertedWithCustomError(eusko, "OwnableUnauthorizedAccount").withArgs(user.address);
        });
    });

    describe("Burn", function () {
        it("Should burn tokens and update the reserve", async function () {
            const { eusko, owner, user } = await loadFixture(deployEuskoFixture);
            const amount = ethers.parseEther("50");

            await eusko.connect(owner).mint(user.address, amount);

            await expect(eusko.connect(owner).burn(user.address, amount))
                .to.emit(eusko, "EuskoBurned")
                .withArgs(user.address, amount);

            expect(await eusko.balanceOf(user.address)).to.equal(0n);
            expect(await eusko.totalEurosInReserve()).to.equal(0n);
        });

        it("Should revert if burn is called by non-owner", async function () {
            const { eusko, user } = await loadFixture(deployEuskoFixture);
            const amount = ethers.parseEther("50");

            await expect(
                eusko.connect(user).burn(user.address, amount)
            ).to.be.revertedWithCustomError(eusko, "OwnableUnauthorizedAccount").withArgs(user.address);
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
            ).to.be.revertedWithCustomError(eusko, "OwnableUnauthorizedAccount").withArgs(user.address);

            await expect(
                eusko.connect(user).removeMerchant(merchant.address)
            ).to.be.revertedWithCustomError(eusko, "OwnableUnauthorizedAccount").withArgs(user.address);
        });
    });

    describe("Spend", function () {
        it("Should allow users to spend tokens with approved merchants", async function () {
            const { eusko, owner, merchant, user } = await loadFixture(
                deployEuskoFixture
            );
            const amount = ethers.parseEther("100");
            const spendAmount = ethers.parseEther("30");

            await eusko.connect(owner).mint(user.address, amount);
            await eusko.connect(owner).addMerchant(merchant.address);

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
            const { eusko, user, merchant } = await loadFixture(deployEuskoFixture);
            const spendAmount = ethers.parseEther("30");

            await expect(
                eusko.connect(user).spend(merchant.address, spendAmount)
            ).to.be.revertedWith("Not an approved merchant");
        });
    });

    describe("Claim Funds", function () {
        it("Should allow merchants to claim their funds", async function () {
            const { eusko, owner, merchant, user } = await loadFixture(
                deployEuskoFixture
            );
            const amount = ethers.parseEther("100");
            const spendAmount = ethers.parseEther("40");

            await eusko.connect(owner).mint(user.address, amount);
            await eusko.connect(owner).addMerchant(merchant.address);
            await eusko.connect(user).spend(merchant.address, spendAmount);

            await expect(eusko.connect(merchant).claimFunds())
                .to.emit(eusko, "MerchantClaimedFunds")
                .withArgs(merchant.address, spendAmount);

            expect(await eusko.getMerchantBalance(merchant.address)).to.equal(0n);
            expect(await eusko.totalEurosInReserve()).to.equal(amount - spendAmount);
        });

        it("Should revert if merchant tries to claim with no balance", async function () {
            const { eusko, owner, merchant } = await loadFixture(deployEuskoFixture);

            // Ajouter le commerçant en tant que commerçant approuvé
            await eusko.connect(owner).addMerchant(merchant.address);

            await expect(
                eusko.connect(merchant).claimFunds()
            ).to.be.revertedWith("No balance to claim");
        });

        it("Should revert if a non-merchant tries to claim funds", async function () {
            const { eusko, user } = await loadFixture(deployEuskoFixture);

            await expect(
                eusko.connect(user).claimFunds()
            ).to.be.revertedWith("Caller is not a merchant");
        });
    });
});
