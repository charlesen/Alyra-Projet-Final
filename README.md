# Projet Eusko Token

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

## Deploiement du contrat avec Hardhat

Prérequis

- Metamask configuré sur le Sepolia Testnet
- Des ETH pour les frais de gaz
- Des EURC dans votre portefeuille Metamask ([Faucet](https://faucet.circle.com/))
- Le contrat Eusko déployé et accessible

- [En savoir plus](backend/README.md)

Adresses des Contrats

- Contrat EURC : 0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4
- Contrat Eusko : 0xfaC7B9F5d5f142f9cFf65d45921898FB6b7bE2d1
- Contrat EuskoMultiSig : 0x0B87EAA17DE8a4fc4eE1F7C0A12132E518b6Ed83

## Vérification du contrat sur Sepolia

```bash
# Contrat Eusko
npx hardhat verify --network sepolia 0xfaC7B9F5d5f142f9cFf65d45921898FB6b7bE2d1 "0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4"

# Contrat MultiSig

npx hardhat verify --network sepolia "0x0B87EAA17DE8a4fc4eE1F7C0A12132E518b6Ed83" --constructor-args arguments.js
```

## Mint de nouveaux tokens EUSKO

### 1. Approuver le Contrat Eusko pour Dépenser vos EURC

- Accédez au contrat EURC sur Etherscan.
- Dans l'onglet "Write as Proxy", connectez votre Metamask.
- Trouvez la fonction approve et renseignez :
  - \_spender : 0xfaC7B9F5d5f142f9cFf65d45921898FB6b7bE2d1
  - \_value : Montant d'EURC à approuver (par exemple, pour 30 EURC avec 6 décimales : 30000000)
  - Confirmez la transaction dans Metamask.

### 2. Vérifier l'Allowance

- Dans l'onglet "Read Contract" du contrat EURC, trouvez la fonction allowance.
- Renseignez :
  - owner : Votre adresse Metamask
  - spender : Adresse du contrat Eusko
- Cliquez sur "Query" pour vérifier que l'allowance correspond au montant approuvé.

### 3. Mint des Tokens Eusko

:note: :warning: Seuls les propriétaire du contrat Eusko peuvent appeler mintWithEURC.

- Accédez au contrat Eusko sur Etherscan.
- Dans l'onglet "Write Contract", connectez votre Metamask.
- Trouvez la fonction mintWithEURC et renseignez :
  - recipient : Votre adresse Metamask
  - eurcAmount : Montant en EURC (par exemple, 30000000 pour 30 EURC)
- Confirmez la transaction dans Metamask.

### 4. Ajouter le Token Eusko à Metamask

- Dans Metamask, cliquez sur "Importer des tokens".
- Sélectionnez "Token personnalisé" et renseignez :
  - Adresse du contrat : 0xfaC7B9F5d5f142f9cFf65d45921898FB6b7bE2d1
  - Symbole : EUS
  - Décimales : 6
- Importez le token pour voir votre solde en Eusko.

:warning: Notes

- Décimales : Les tokens EURC et Eusko ont 6 décimales. Multipliez les montants par 1e6 pour les unités de base.
- Sécurité : N'approuvez que des contrats de confiance et ne partagez jamais vos clés privées.
- Propriété du Contrat : Si vous n'êtes pas le propriétaire du contrat Eusko, vous devrez demander au propriétaire de mint des tokens pour vous.
