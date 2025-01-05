# Projet Eusko 3

Ce projet est une application décentralisée (DApp) développée pour interagir avec le contrat intelligent Eusko. Elle permet aux utilisateurs d'effectuer diverses actions comme la gestion des actes de bénévolat, l'émission et la réclamation des jetons Eusko, et bien plus encore, via une interface conviviale.

## Fonctionnalités

L'application frontend permet d'exécuter les actions suivantes :

### Dashboard

- Affichage du solde de son compte Eusko
- Affichage de ses points de bénévolats
- Affichage du solde de la réserve
- Affichage du solde du fond de garanti

### Actes de bénévolat

- Enregistrement d'un acte de bénévolat (description, récompense, organisme).
- Visualisation des actes d'un utilisateur.

### Gestion des jetons Eusko :

- Mint des jetons Eusko (en échange d'EURC).
- Rachat des jetons Eusko contre EURC.
- Transfert d'EUSKO d'un portefeuille vers un autre

### Commerçants approuvés (A développer)

- Dépense des jetons Eusko auprès de commerçants.
- Réclamation des fonds par les commerçants.

### Paramètres

- Affichage d'un QR code présentable chez les commerçants partenaires pour obtenir un cashback (A finaliser)

### Admin

- Mise à jour de la réserve.
- Gestion des comptes autorisés.

## Structure du projet

Voici un aperçu de la structure principale du projet :

```bash
frontend/
├── README.md
├── app
│   ├── about
│   │   └── page.js
│   ├── admin
│   │   └── page.js
│   ├── api
│   │   └── volunteering
│   │       └── route.js
│   ├── exchange
│   │   └── page.js
│   ├── favicon.ico
│   ├── fonts
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
│   ├── globals.css
│   ├── layout.js
│   ├── manifest.js
│   ├── page.js
│   ├── settings
│   │   └── page.js
│   ├── transfer
│   │   └── page.js
│   ├── volunteering
│   │   └── page.js
│   └── wagmi.js
├── components
│   ├── ActCard.jsx
│   ├── AddSigner.jsx
│   ├── EuskoBalance.jsx
│   ├── EventsList.js
│   ├── ExchangeEusko.jsx
│   ├── GuaranteeFundBalance.jsx
│   ├── Mint.jsx
│   ├── MintMultiSig.jsx
│   ├── MintMultisigView.jsx
│   ├── ReserveBalance.jsx
│   ├── Settings.jsx
│   ├── TransactionsList.jsx
│   ├── TransferEusko.jsx
│   ├── UpdateReserve.jsx
│   ├── VolunteerPoints.jsx
│   ├── VolunteeringList.jsx
│   ├── shared
│   │   ├── Aside.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── Layout.jsx
│   │   └── NotConnected.jsx
│   └── ui
│       ├── alert.jsx
│       ├── button.jsx
│       ├── toast.jsx
│       └── toaster.jsx
├── components.json
├── constants
│   └── index.js
├── hooks
│   ├── use-toast.js
│   ├── useIsAuthorized.js
│   └── useVolunteeringActions.js
├── jsconfig.json
├── lib
│   ├── client.js
│   ├── utils.js
│   └── volunteeringActions.js
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── data
│   │   └── volunteer_opportunities.json
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
└── tailwind.config.js
```

<details>

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

</details>
