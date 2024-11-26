# Alyra-Projet-Final (Eusko)

## Stack technique
- Frontend : NextJS + Wagmi + RainbowKit
- Backend : Hardhat
- Data :
   - Documents : IPFS ([Pinata.cloud](https://pinata.cloud/))
   - Oracles : The Graph (Subgraph), [Chainlink](https://dev.chain.link/faucet)
   - NFT generator : [Art engine](https://github.com/nftchef/art-engine)
      - Mettre les images dans layers
      - Generation `npde index.js`
      - Mise à jour des informations `node utils/updateInfo.js` (Par exemple si on change le baseURI)
- Tools : [Remix](https://remix.ethereum.org/), [Slither analyzer](https://github.com/crytic/slither)
