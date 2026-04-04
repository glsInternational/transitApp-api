# Documentations des Automatisations - Transit API (CI)

Ce document récapitule les mécanismes d'automatisation mis en place pour la gestion des dossiers de transit, avec un focus particulier sur les régimes douaniers de Côte d'Ivoire.

## 1. Gestion des Régimes Douaniers (Seeding)
L'API automatise la population et la synchronisation des codes de régimes douaniers officiels (E.g. 1000, 4000, D3, D56, D18).

- **Fichier** : `src/seeders/seedRegimes.js`
- **Mécanisme** : 
    - Connexion automatique à la base de données configurée (`transit`).
    - Utilisation d'UPSERT (`findOneAndUpdate`) pour éviter les doublons tout en permettant la mise à jour des libellés existants.
    - Classification automatique par type : `definitif` (Export/Import direct) et `suspensif` (Entreposage/AT).
- **Endpoint API** : `GET /api/dossiers/regimes` (renvoie la liste synchronisée pour les sélecteurs frontend).

---

## 2. Automatisations Financières (Fiche Opératrice)
Le système automatise les calculs répétitifs lors de la saisie de l'état de codage des dossiers.

- **Contrôleur** : `src/dossier/controllers/dossier.controller.js` -> `updateOperation()`
- **Calculs automatiques par article** :
    - **Valeur CAF** : Somme automatique de `FOB` + `Fret` + `Assurance`.
    - **Total Taxes** : Agrégation dynamique de `DD + RSTA + PCS + PCC + TVA + Autres Taxes`.
- **Calculs globaux du dossier** :
    - **Conversion CFA** : Calcul immédiat de la `valeur_cfa` dès que le cours de change est mis à jour (`valeur_usd * cours`).
    - **Poids et Colis** : Somme automatique des poids bruts (`pb`) et du nombre de colis de tous les articles vers le dossier parent.

---

## 3. Suivi Spécifique des Régimes (D56 & D18)
Pour les régimes suspensifs, le modèle de données inclut des champs d'automatisation du suivi :

- **Modèle** : `src/dossier/models/dossier.model.js` -> `suivi_d56_d18`
- **Champs automatisables** :
    - **nbre_jours_restant** : Calculé en fonction de la date d'échéance et de la date actuelle.
    - **reste_apurer** : Différence entre la quantité initiale et les apurements enregistrés.
    - **Apurements dynamiques** : Le système permet d'ajouter une liste d'apurements qui soustraient automatiquement les quantités du régime source.

---

## 4. Notifications Automatiques
- **Nouveau Dossier** : Envoie une notification à tous les administrateurs dès l'ouverture d'un nouveau dossier.
- **Mise à jour** : Notifie les responsables lors d'une modification critique sur un dossier existant.

---

## 5. Perspectives d'Evolution (Roadmap)
- [ ] **Automatisation de la caution** : Calculer un montant de garantie provisoire basé sur un % des taxes suspendues selon le régime (CI).
- [ ] **Alerte Echéance** : Envoi de SMS/Email automatique 7 jours avant l'expiration d'un régime suspensif (D56/D18).
- [ ] **Mapping Excel Direct** : Possibilité d'importer directement la "Fiche Opératrice" d'un Excel XLSM vers le dossier.

---
*Dernière mise à jour : 03 Avril 2026*
