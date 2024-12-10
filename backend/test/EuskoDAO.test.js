const { expect } = require("chai");
const hre = require("hardhat");

describe("EuskoDAO", function () {
  let euskoDAO;
  let owner, voter1, voter2;

  beforeEach(async function () {
    // Déploiement du contrat
    [owner, voter1, voter2] = await hre.ethers.getSigners();
    euskoDAO = await hre.ethers.deployContract("EuskoDAO", [
      10, // Initial discount rate
    ]);
  });

  describe("Deployment", function () {
    it("Should set the initial discount rate", async function () {
      expect(await euskoDAO.discountRate()).to.equal(10);
    });

    it("Should set the correct owner", async function () {
      expect(await euskoDAO.owner()).to.equal(owner.address);
    });
  });

  describe("NFT Reward System", function () {
    it("Should mint a reward NFT to a volunteer", async function () {
      const metadata = "https://example.com/badge/1";
      await expect(euskoDAO.mintReward(voter1.address, metadata, "0x"))
        .to.emit(euskoDAO, "RewardMinted")
        .withArgs(voter1.address, 1, metadata);

      expect(await euskoDAO.balanceOf(voter1.address, 1)).to.equal(1);
    });

    it("Should revert when minting to zero address", async function () {
      await expect(
        euskoDAO.mintReward(hre.ethers.ZeroAddress, "metadata", "0x")
      ).to.be.revertedWith("Invalid recipient address");
    });
  });

  describe("Proposal Management", function () {
    it("Should create a proposal", async function () {
      const description = "Increase discount rate to 20%";
      const newRate = 20;

      await expect(euskoDAO.createProposal(description, newRate))
        .to.emit(euskoDAO, "ProposalCreated")
        .withArgs(0, description, newRate);

      const proposal = await euskoDAO.proposals(0);
      expect(proposal.description).to.equal(description);
      expect(proposal.newRate).to.equal(newRate);
      expect(proposal.votesFor).to.equal(0);
      expect(proposal.votesAgainst).to.equal(0);
      expect(proposal.executed).to.equal(false);
    });

    it("Should revert when creating a proposal with rate above 100%", async function () {
      await expect(
        euskoDAO.createProposal("Invalid rate proposal", 101)
      ).to.be.revertedWith("Rate cannot exceed 100%");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await euskoDAO.createProposal("Increase discount rate to 20%", 20);
    });

    it("Should allow voting for a proposal", async function () {
      await expect(euskoDAO.connect(voter1).vote(0, true))
        .to.emit(euskoDAO, "Voted")
        .withArgs(0, voter1.address, true);

      const proposal = await euskoDAO.proposals(0);
      expect(proposal.votesFor).to.equal(1);
      expect(proposal.votesAgainst).to.equal(0);
    });

    it("Should allow voting against a proposal", async function () {
      await expect(euskoDAO.connect(voter1).vote(0, false))
        .to.emit(euskoDAO, "Voted")
        .withArgs(0, voter1.address, false);

      const proposal = await euskoDAO.proposals(0);
      expect(proposal.votesFor).to.equal(0);
      expect(proposal.votesAgainst).to.equal(1);
    });

    it("Should revert if a user votes more than once", async function () {
      await euskoDAO.connect(voter1).vote(0, true);
      await expect(euskoDAO.connect(voter1).vote(0, true)).to.be.revertedWith(
        "Already voted"
      );
    });

    it("Should revert if voting on an executed proposal", async function () {
      await euskoDAO.connect(voter1).vote(0, true);
      await euskoDAO.executeProposal(0);

      await expect(euskoDAO.connect(voter2).vote(0, false)).to.be.revertedWith(
        "Proposal already executed"
      );
    });
  });

  describe("Proposal Execution", function () {
    beforeEach(async function () {
      await euskoDAO.createProposal("Increase discount rate to 20%", 20);
    });

    it("Should execute a proposal if approved", async function () {
      await euskoDAO.connect(voter1).vote(0, true);
      await euskoDAO.connect(voter2).vote(0, true);

      await expect(euskoDAO.executeProposal(0))
        .to.emit(euskoDAO, "ProposalExecuted")
        .withArgs(0, 20);

      const proposal = await euskoDAO.proposals(0);
      expect(proposal.executed).to.equal(true);
      expect(await euskoDAO.discountRate()).to.equal(20);
    });

    it("Should revert if proposal is not approved", async function () {
      await euskoDAO.connect(voter1).vote(0, false);

      await expect(euskoDAO.executeProposal(0)).to.be.revertedWith(
        "Proposal not approved"
      );
    });

    it("Should revert if proposal is already executed", async function () {
      await euskoDAO.connect(voter1).vote(0, true);
      await euskoDAO.executeProposal(0);

      await expect(euskoDAO.executeProposal(0)).to.be.revertedWith(
        "Proposal already executed"
      );
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await euskoDAO.createProposal("Increase discount rate to 20%", 20);
      await euskoDAO.connect(voter1).vote(0, true);
    });

    it("Should return true if a voter has voted on a proposal", async function () {
      expect(await euskoDAO.hasVoted(0, voter1.address)).to.equal(true);
    });

    it("Should return false if a voter has not voted on a proposal", async function () {
      expect(await euskoDAO.hasVoted(0, voter2.address)).to.equal(false);
    });
  });
});
