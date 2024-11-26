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
      - On upload le dossier d'image (`builds/images`) dans Pinata (et on récupère le CID)
      - Mise à jour des informations `node utils/updateInfo.js` (Par exemple si on change le baseURI/CID)
      - On upload le dossier d'image (`builds/json`) dans Pinata (et on récupère le CID)
      - On déploit le contrat en précisant le CID du dossier JSON (ex. : `ipfs://Qmd7Nvv76vgL4nCA7upoK2VQgqT8nTifaZw5QSCyrijLrV/`)
      - On se connecte à Opensea avec Metamask
      - On consulte ses NFT
- Tools : [Remix](https://remix.ethereum.org/), [Slither analyzer](https://github.com/crytic/slither)
