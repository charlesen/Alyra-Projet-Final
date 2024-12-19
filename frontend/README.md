# Eusko Dapp

- URL : https://eusko.vercel.app/

## Fonctionnalités

### Page d'accueil / Dashboard :

- Affichage du solde de l'utilisateur en Eusko s'il est connecté.
- Présentation du concept (Eusko, bénévolat, commerçants, etc.) en quelques lignes.
- Bouton de connexion/déconnexion au wallet.

### Section Wallet :

- Afficher le solde en temps réel (mise à jour via events ou polling).
- Bouton "Transférer des Eusko" : un formulaire permettant à l'utilisateur d'envoyer des Eusko à une autre adresse.
- Historique des transactions (Eusko reçus, envoyés, redeem EURC/Eusko, etc.) afin que l'utilisateur puisse retracer ses opérations.
- Un indicateur visuel du statut du wallet (connecté/non connecté, réseau utilisé, etc.).

### Section Mint (pour les comptes autorisés) :

- Un onglet réservé aux propriétaires ou comptes autorisés, avec la possibilité de "Mint des Eusko" en échange d'EURC.
- Un champ pour entrer l'adresse du bénéficiaire et le montant d'EURC. Le contrat se charge du reste.
- Affichage d'un message d'erreur ou de succès en fonction du résultat de la transaction.

### Section Bénévolat :

- Liste d'actes de bénévolat "off-chain" (depuis un JSON), par exemple un tableau avec (Titre, Description, Organisme, Récompense potentielle).
- Un bouton "Postuler" ou "S'inscrire" pour manifester son intérêt (côté front, envoi d'une requête "mock" vers l'organisme, ou event local).
- Une section "Mes actes en cours" pour le bénévole connecté : lui permettant de voir sur quels actes il s'est engagé.
- Une fonctionnalité permettant, une fois l'acte terminé, à l'organisme d'ajouter l'acte à la blockchain (via registerAct), ce qui crédite le bénévole en Eusko.

### Section Commerçants :

- Un onglet listant les commerçants approuvés (on peut récupérer cette liste via des appels en lecture sur le smart contract ou la tenir en dur côté front).
- Un bouton "Dépenser mes Eusko" chez un commerçant : ouverture d'un formulaire permettant de saisir le montant.
- Affichage du solde du commerçant (uniquement si l'utilisateur est autorisé ou s'il s'agit du commerçant lui-même).
- Pour le commerçant connecté (si un commerçant se connecte avec sa clé), un bouton "Réclamer mes fonds" (claimFunds).

### Section Admin :

- Ajout/suppression de commerçants.
- Mise à jour de l'adresse de réserve.
- MintWithEURC (déjà prévu dans la section Mint)
- Suppression des actes expirés (removeExpiredActs) pour une maintenance du système.

### Notifications et UX :

- Système de notifications (toast) lors des transactions : en cours, succès, échec.
- Indicateur de chargement lors des appels contractuels lents.
- Messages d'erreur clairs (ex: "Vous n'avez pas le droit de mint", "Vous n'avez pas assez d'Eusko", etc.).

### Mobile first et Accessibilité :

- Prise en charge de différentes langues (français/anglais).
- Respect des standards d'accessibilité (ARIA, etc.).

### DAO intégration (en bonus) :

- Affichage des propositions du DAO (même si non demandé, c'est une idée), voter sur les propositions, etc. (Si le DAO est intégré au projet).
