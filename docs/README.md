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
