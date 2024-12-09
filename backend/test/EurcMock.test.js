// test/EurcMock.test.js

require("@nomicfoundation/hardhat-toolbox");
const { expect } = require("chai");

describe("EurcMock", function () {
  let eurcMock, owner, addr1, addr2;

  beforeEach(async function () {
    eurcMock = await hre.ethers.deployContract("EurcMock");
    [owner, addr1, addr2] = await hre.ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should set the correct initial supply", async function () {
      const totalSupply = await eurcMock.totalSupply();
      const ownerBalance = await eurcMock.balanceOf(owner.address);
      expect(totalSupply).to.equal(ownerBalance);
    });

    it("Should have the correct name and symbol", async function () {
      expect(await eurcMock.name()).to.equal("EURC");
      expect(await eurcMock.symbol()).to.equal("EURC");
    });
  });

  describe("Mint", function () {
    it("Should mint tokens to the specified address", async function () {
      const mintAmount = hre.ethers.parseUnits(
        "1000",
        await eurcMock.decimals()
      );
      const initialSupply = hre.ethers.parseUnits(
        "1000000000",
        await eurcMock.decimals()
      );

      await eurcMock.mint(addr1.address, mintAmount);

      expect(await eurcMock.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await eurcMock.totalSupply()).to.equal(initialSupply + mintAmount);
    });

    it("Should allow minting multiple times", async function () {
      const mintAmount = hre.ethers.parseUnits(
        "500",
        await eurcMock.decimals()
      );

      await eurcMock.mint(addr1.address, mintAmount);
      await eurcMock.mint(addr1.address, mintAmount);

      expect(await eurcMock.balanceOf(addr1.address)).to.equal(
        mintAmount * BigInt(2)
      );
    });
  });

  describe("Burn", function () {
    it("Should burn tokens from the specified address", async function () {
      const burnAmount = hre.ethers.parseUnits(
        "1000",
        await eurcMock.decimals()
      );
      const initialSupply = hre.ethers.parseUnits(
        "1000000000",
        await eurcMock.decimals()
      );

      // Mint tokens to addr1
      await eurcMock.mint(addr1.address, burnAmount);

      // Burn tokens from addr1
      await eurcMock.burn(addr1.address, burnAmount);

      expect(await eurcMock.balanceOf(addr1.address)).to.equal(0);
      expect(await eurcMock.totalSupply()).to.equal(initialSupply);
    });

    it("Should revert when trying to burn more than the balance", async function () {
      const burnAmount = hre.ethers.parseUnits(
        "1000",
        await eurcMock.decimals()
      );

      // Attempt to burn tokens without a sufficient balance
      await expect(
        eurcMock.burn(addr1.address, burnAmount)
      ).to.be.revertedWithCustomError(eurcMock, "ERC20InsufficientBalance");
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const transferAmount = hre.ethers.parseUnits(
        "500",
        await eurcMock.decimals()
      );
      const initialSupply = hre.ethers.parseUnits(
        "1000000000",
        await eurcMock.decimals()
      );

      // Transfer tokens from owner to addr1
      await eurcMock.transfer(addr1.address, transferAmount);

      expect(await eurcMock.balanceOf(owner.address)).to.equal(
        initialSupply - transferAmount
      );
      expect(await eurcMock.balanceOf(addr1.address)).to.equal(transferAmount);
    });

    it("Should fail when transferring more than balance", async function () {
      const transferAmount = hre.ethers.parseUnits(
        "2000000000",
        await eurcMock.decimals()
      );

      // Attempt to transfer more than balance
      await expect(
        eurcMock.connect(addr1).transfer(addr2.address, transferAmount)
      ).to.be.revertedWithCustomError(eurcMock, "ERC20InsufficientBalance");
    });
  });

  describe("Approvals and Allowance", function () {
    it("Should allow accounts to approve allowances", async function () {
      const allowanceAmount = hre.ethers.parseUnits(
        "1000",
        await eurcMock.decimals()
      );

      // Approve addr1 to spend on behalf of owner
      await eurcMock.approve(addr1.address, allowanceAmount);
      expect(await eurcMock.allowance(owner.address, addr1.address)).to.equal(
        allowanceAmount
      );
    });

    it("Should allow transfers from an approved account", async function () {
      const allowanceAmount = hre.ethers.parseUnits(
        "1000",
        await eurcMock.decimals()
      );
      const initialSupply = hre.ethers.parseUnits(
        "1000000000",
        await eurcMock.decimals()
      );

      // Approve addr1
      await eurcMock.approve(addr1.address, allowanceAmount);

      // Perform transfer from addr1 on behalf of owner
      await eurcMock
        .connect(addr1)
        .transferFrom(owner.address, addr2.address, allowanceAmount);

      expect(await eurcMock.balanceOf(owner.address)).to.equal(
        initialSupply - allowanceAmount
      );
      expect(await eurcMock.balanceOf(addr2.address)).to.equal(allowanceAmount);
    });

    it("Should fail when trying to transfer more than the approved allowance", async function () {
      const allowanceAmount = hre.ethers.parseUnits(
        "500",
        await eurcMock.decimals()
      );

      // Approve addr1
      await eurcMock.approve(addr1.address, allowanceAmount);

      // Attempt to transfer more than approved allowance
      await expect(
        eurcMock
          .connect(addr1)
          .transferFrom(
            owner.address,
            addr2.address,
            allowanceAmount + BigInt(1)
          )
      ).to.be.revertedWithCustomError(eurcMock, "ERC20InsufficientAllowance");
    });
  });
});
