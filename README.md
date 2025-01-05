# Projet Eusko Token

- Lien de l'application : [Eusko3](https://eusko.vercel.app/)

## Prérequis

- Node.js version >= 18
- NPM ou Yarn pour gérer les dépendances
- Hardhat pour gérer les contrats intelligents
- Metamask (configuré pour le réseau Sepolia)
- ETH de test pour les frais de gaz (via un faucet)
- EURC de test (via un faucet compatible EURC)

## Installation

1. Clonez le dépôt

```bash
git clone <url-du-depot>
cd Eusko
```

2. Installez les dépendances

Pour le backend :

```bash
cd backend
npm install
```

Pour le frontend :

```bash
cd frontend
npm install
```

## Architecture

```bash
├── backend # Smart Contracts et outils associés
│ ├── contracts # Contrats intelligents (Eusko.sol, Authorizable.sol, etc.)
│ ├── test # Tests pour les smart contracts
│ ├── hardhat.config.js # Configuration Hardhat
│ ├── coverage # Rapport de couverture des tests
├── frontend # Interface utilisateur (Next.js)
│ ├── app # Pages de l'application (admin, settings, volunteering, etc.)
│ ├── components # Composants React pour la DApp
│ ├── public # Actifs publics (images, fichiers JSON)
│ ├── constants # Données statiques
│ ├── hooks # Hooks personnalisés
│ ├── lib # Fonctions utilitaires
│ ├── tailwind.config.js # Configuration TailwindCSS
├── docs # Documentation supplémentaire
```

## Backend : Contrats intelligents

1. Description des contrats
   Eusko.sol : Gère les fonctionnalités principales du token Eusko (mint, redeem, acts de bénévolat, etc.).
   Authorizable.sol : Permet de restreindre certaines actions aux comptes autorisés.
   EurcMock.sol : Mock d’un contrat EURC utilisé pour les tests locaux.
2. Commandes principales
   Compiler les contrats :

```bash
npx hardhat compile
```

Déployer les contrats :

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Tester les contrats :

```bash
npx hardhat test
```

Générer le rapport de couverture :

```bash
npx hardhat coverage
```

## Frontend : Application décentralisée (DApp)

1. Technologies principales
   Next.js : Framework React pour le développement frontend.
   TailwindCSS : Framework CSS pour le style.
   RainbowKit + Wagmi : Gestion des connexions wallet et des interactions avec la blockchain.
   React Query : Gestion des états asynchrones.
2. Fonctionnalités principales
   Dashboard : Consultation des soldes en Eusko, des points de bénévolat, et des fonds de réserve.
   Volunteering : Enregistrement et consultation des actes de bénévolat.
   Exchange : Conversion entre EURC et Eusko.
   Settings : Gestion des paramètres, incluant l’ajout d’un QR code.
   Admin : Réservé aux comptes autorisés (mint, update reserve, etc.).
   Procédure de déploiement
3. Déploiement des contrats
   Déployez Eusko.sol sur le réseau Sepolia.
   Notez l'adresse du contrat déployé (par exemple : 0xfaC7B9F5d5f142f9cFf65d45921898FB6b7bE2d1).
4. Configuration EURC
   Accédez au contrat EURC sur Etherscan.
   Approuvez le contrat Eusko pour dépenser vos EURC :
   Spender : Adresse du contrat Eusko.
   Value : Montant en EURC (ex : 30000000 pour 30 EURC avec 6 décimales).
5. Mint des tokens Eusko
   Depuis la DApp, un administrateur peut minter des Eusko en entrant :

Recipient : Adresse du bénéficiaire.
Amount : Montant en EURC.
Testing

1. Tests backend
   Tous les tests des contrats intelligents sont réalisés avec Hardhat et Chai. Les fonctionnalités testées incluent :

Mint et redeem des tokens Eusko.
Gestion des actes de bénévolat.
Interaction avec les commerçants approuvés.
Tests des conditions de sécurité (reentrancy, overflows, etc.).
Exécution des tests :

bash
Copier le code
npx hardhat test 2. Tests frontend
Les tests frontend valident les interactions avec les contrats et l’UX de l’application via des simulations manuelles (Metamask, wagmi).

Notes importantes
Les tokens EURC et Eusko utilisent 6 décimales. Assurez-vous d'utiliser le format approprié (par exemple, 30000000 pour 30 EURC).
Actuellement, le projet est déployé sur Sepolia Testnet. En production, envisagez des blockchains avec des frais de gaz réduits (Polygon, BSC, etc.).
Proxy non implémenté dans cette version : toute mise à jour nécessitera un redéploiement complet.
