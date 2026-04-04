# GUIDE COMPLET : AUTOMATISATION DE LA FICHE OPÉRATRICE (CI)

Ce document détaille les fonctionnalités d'automatisation mises en place pour simplifier la saisie technique des États de Codage (Fiche Opératrice) selon les normes SYDAM World de la Douane Ivoirienne.

## 1. Intelligence du Dossier (Pré-remplissage)
Le système analyse les données du transit pour pré-remplir automatiquement les champs suivants dès l'ouverture de la fiche :

- **Bureau de Douane** : 
  - Si le transport est **Aérien** -> Code `CIABJ` (Aéroport Abidjan).
  - Si le transport est **Maritime** -> Code `CIPBT` (Port Abidjan).
- **Relation Acheteur/Vendeur** : Code `8` (Sans lien) par défaut.
- **Code Additionnel** : `000` par défaut (Importation standard).
- **Mode de Paiement** : `1` (Virement/Comptant) par défaut.

## 2. Le Moteur de Calcul Fiscal (Temps Réel)
Le système calcule instantanément les taxes dès que les valeurs FOB, Fret et Assurance sont saisies.

### Taux Appliqués (Normes CI) :
| Taxe | Taux / Formule | Description |
| :--- | :--- | :--- |
| **Valeur CAF** | FOB + Fret + Ass. | Base de calcul de l'ensemble des taxes. |
| **RSTA** | 1% de la CAF | Redevance Statistique (Obligatoire). |
| **PCS** | 0.8% de la CAF | Prélèvement Communautaire de Solidarité (UEMOA). |
| **PCC** | 0.5% de la CAF | Prélèvement Communautaire (CEDEAO). |
| **TVA** | 18% | Appliquée sur la base (CAF + DD + RSTA + PCS + PCC). |
| **AIRSI** | 5% | Appliqué si le régime fiscal est "Informel". |

### Dynamique du Régime Fiscal :
En haut de la fiche, vous pouvez alterner entre :
- **Régime Réel** : L'AIRSI est forcé à **0** (pour les entreprises immatriculées).
- **Informel** : L'AIRSI (5%) est automatiquement ajouté au calcul des taxes.

## 3. Synthèse Financière (Facilitation Comptable)
En bas de page, une section isolée récapitule les montants totaux par catégorie :
- **Total CIF (CAF)** : Valeur en douane cumulée de tous les articles.
- **Détail Taxes Douane** : Cumul séparé des Droits (DD), de la Stat (RSTA) et de la TVA.
- **Détail Impôts & Caution** : Montant de l'AIRSI et de la Caution (si régime suspensif).
- **Total Général** : Somme totale à prévoir pour le dossier (CAF + Taxes + Caution).

## 4. Mode d'Emploi pour le Comptable
1. Saisissez la **Nomenclature (Code SH)** de chaque article.
2. Remplissez les colonnes **FOB**, **Fret** et **Assurance**.
3. Remplissez uniquement la colonne **DD (Droits de Douane)**.
4. Le système calculera automatiquement toutes les autres lignes (RSTA, PCS, TVA, AIRSI).
5. Vérifiez le **Régime Fiscal Client** en haut pour ajuster l'AIRSI si nécessaire.

---
*Ce système a été conçu pour réduire les erreurs de calcul manuel et accélérer la liquidation des dossiers de transit.*
