# Akieni PMO & Finance — Documentation Produit

> **Statut** : v2.0 - Documentation produit de référence
> **Date** : 2026-07-30
> **Portée** : décrit le produit cible - 16 écrans, 8 rôles, modèle financier et analytique complet. Source de vérité produit pour l'implémentation et la gouvernance.

---

## Table des matières

1. [Résumé exécutif](#1-résumé-exécutif)
2. [Statut du prototype & lecture de ce document](#2-statut-du-prototype--lecture-de-ce-document)
3. [Objectifs & indicateurs de succès](#3-objectifs--indicateurs-de-succès)
4. [Personas & rôles](#4-personas--rôles)
5. [Authentification & sélecteur de rôle](#5-authentification--sélecteur-de-rôle)
6. [Modèle d'habilitation (RBAC) & confidentialité](#6-modèle-dhabilitation-rbac--confidentialité)
7. [Architecture fonctionnelle — les 16 écrans](#7-architecture-fonctionnelle--les-16-écrans)
8. [Détail des modules](#8-détail-des-modules)
9. [Modèle de données](#9-modèle-de-données)
10. [Règles de gestion](#10-règles-de-gestion)
11. [Métriques & formules analytiques](#11-métriques--formules-analytiques)
12. [Workflows de bout en bout](#12-workflows-de-bout-en-bout)
13. [Exigences non-fonctionnelles](#13-exigences-non-fonctionnelles)
14. [Intégrations](#14-intégrations)
15. [Roadmap de livraison](#15-roadmap-de-livraison)
16. [Décisions ouvertes](#16-décisions-ouvertes)
17. [Annexe — État du prototype : réel vs simulé](#17-annexe--état-du-prototype--réel-vs-simulé)
18. [Glossaire](#18-glossaire)

---

## 1. Résumé exécutif

**Akieni PMO** est un outil de gestion de projet sur-mesure pour le pilotage opérationnel (PMO) **et** financier (contrôle de gestion, compta analytique, facturation) d'une société de services. Il unifie RH projet, structuration des projets multi-niveaux, saisie des temps, gestion des congés et des dépenses, reporting analytique et facturation client.

**Contexte métier** : Akieni est une société technologique de Brazzaville (Congo) livrant des plateformes nationales (SFEC/DGID, CAMU, CNSS) et des produits privés (AkieniPay, CarTracking). Le portefeuille type mêle des **programmes multi-lots** pilotés par un PMO et des **projets simples**, en **régie** ou au **forfait**, sur segments Public / Privé / Interne.

**Principe central inchangé** : la **saisie des temps est le capteur du système**. Chaque écriture relie une personne, un projet (ou sous-projet), un poste de coût, une activité, une durée et une date. Un **second capteur** complète le coût réel : les **dépenses projet** (achats/sous-traitance et frais de mission). De ces deux flux dérivent la chargeabilité, la marge, la consommation budgétaire, l'atterrissage et la facturation.

**Chaîne de valeur validée** :

```
Saisie (Staff) → Validation N+1 → [Contestation PM jusqu'à N+7] → Clôture période (PMO)
                                                                         │
Dépenses (Compta) ────────────────────────────────────────────────────┤
                                                                         ▼
                                              Budget / Marge / Atterrissage / Facturation
```

**Trois promesses produit** :

1. **Saisie ultra-rapide** — grille hebdo clavier, mode bulk, vue mobile par pas de 30 min ; friction minimale.
2. **Vérité financière** — budget = main d'œuvre + achats + frais de mission ; marge, atterrissage (EAC) et facturable en continu.
3. **Confidentialité par rôle** — salaires, coût chargé et TJM de référence réservés à Finance / RH / Direction, y compris dans les exports.

**Authentification** : exclusivement **Google Workspace** (SSO). Aucun mot de passe local.

---

## 2. Statut du prototype & lecture de ce document

Ce document décrit le **produit cible** tel que le prototype le spécifie fonctionnellement. Le prototype (`Akieni PMO.dc.html`) est une application single-page interactive **de démonstration** : la logique métier, les écrans, les règles et les calculs y sont définis, mais certaines mécaniques sont **simulées** (données figées, actions se limitant à un message de confirmation, contrôle d'accès purement côté client).

- Le corps du document (§4–§12) décrit le **comportement fonctionnel attendu** — c'est la spécification.
- L'[Annexe §17](#17-annexe--état-du-prototype--réel-vs-simulé) liste précisément **ce qui est réel vs simulé** dans le prototype, pour cadrer l'effort d'implémentation.

> **Point de gouvernance majeur** : dans le prototype, le contrôle d'accès est **cosmétique** (masquage d'affichage côté navigateur ; toutes les données sensibles sont chargées dans le client et le rôle est librement modifiable). En production, **toute la confidentialité doit être appliquée côté serveur** (voir §6 et §13). C'est non négociable.

---

## 3. Objectifs & indicateurs de succès

| #   | Objectif                       | Indicateur cible                                                               |
| --- | ------------------------------ | ------------------------------------------------------------------------------ |
| O1  | Fiabiliser la saisie des temps | ≥ 95 % des feuilles complétées avant 18:00 (close of business) J+0             |
| O2  | Fermer la boucle de validation | 100 % des semaines validées par le N+1 avant clôture de période                |
| O3  | Piloter la marge en temps réel | Marge et atterrissage (EAC) consultables à J+1 sur tous les projets ouverts    |
| O4  | Optimiser l'allocation         | Utilisation cible 85–100 %, bench < 60 % isolé et actionnable                  |
| O5  | Accélérer la facturation       | Pré-factures générées en < 2 jours après clôture, uniquement sur temps validés |
| O6  | Garantir la confidentialité    | 0 fuite de donnée sensible (contrôle serveur + journal d'audit)                |
| O7  | Réduire la friction de saisie  | Temps médian de saisie d'une journée < 60 s                                    |

---

## 4. Personas & rôles

L'application définit **8 rôles**, chacun incarné par un utilisateur de référence dans le prototype :

| Rôle                    | Utilisateur de démo | Département                    | Fonction principale                                                                                  |
| ----------------------- | ------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| **Staff**               | Josué Tchibinda     | Dev · Ingénieur backend        | Saisir ses temps, déclarer ses frais de mission, demander des congés                                 |
| **Chef de projet (PM)** | Blaise Mabiala      | PMO · Chef de projet           | Piloter son projet/lot : structure, budget, ressources, atterrissage ; **contester** les imputations |
| **PMO**                 | Sandrine Okemba     | PMO · Responsable portefeuille | Superviser le portefeuille, arbitrer le staffing, clôturer les périodes                              |
| **Manager (N+1)**       | Yann Massamba       | Dev · Lead technique           | **Valider/rejeter** les temps de son équipe directe, valider les congés                              |
| **Finance**             | Aline Ngoma         | Finance · Contrôle de gestion  | Budget, marge, dépenses, facturation, référentiels financiers                                        |
| **RH**                  | Divine Bantsimba    | RH · Talent & paie             | Fiches employés, salaires, séniorité, contrôle des congés                                            |
| **Direction**           | Frédéric Nzé        | Direction générale             | Vision consolidée, marge, gouvernance, journal d'audit                                               |
| **Admin**               | Rachel Kombo        | IT · Administration            | Paramétrage, référentiels, administration                                                            |

**Distinction structurante (N+1 ≠ PM)** : le **Manager N+1 valide les heures** (il connaît la charge et les absences réelles de son équipe) ; le **Chef de projet ne valide pas** — il suit la consommation de son projet et peut **contester une imputation** (mauvais poste/lot) jusqu'à **N+7** après validation. Cela évite de bloquer paie et facturation sur un valideur mal placé.

**Départements** : Dev, PMO, Consulting, Support, Finance, RH, Direction (référentiel administrable). Le département classe le collaborateur ; les droits viennent du rôle.

---

## 5. Authentification & sélecteur de rôle

- **SSO Google Workspace uniquement** : écran de connexion « Se connecter avec Google Workspace ». L'authentification est déléguée à Google ; aucun mot de passe n'est stocké.
- Restriction au(x) domaine(s) Akieni (à confirmer, voir §16).
- Le **rôle** de l'utilisateur détermine ses écrans, ses données visibles et ses actions. En production, le rôle est attribué par un Admin et porté par la session serveur (dans le prototype, un sélecteur de démo permet d'incarner n'importe quel rôle — à retirer en production).
- Déprovisioning : un compte Google suspendu doit désactiver immédiatement l'accès.

---

## 6. Modèle d'habilitation (RBAC) & confidentialité

### 6.1 Habilitations réelles (telles qu'implémentées dans le prototype)

| Capacité                                                               | Rôles autorisés                      |
| ---------------------------------------------------------------------- | ------------------------------------ |
| **Voir salaires / net / coût chargé / TJM de référence** (`canSalary`) | Finance, RH, Direction               |
| **Voir la marge** (`canMargin`)                                        | Finance, Direction                   |
| **Module Facturation** (`canInvoice`)                                  | Finance, Direction, Admin            |
| **Saisir les dépenses** (`canExpense`)                                 | Finance, Direction, Admin, PMO       |
| **Valider les temps** (`canValidate`)                                  | Manager (N+1), PMO, Direction, Admin |
| **Clôturer / verrouiller une période** (`canLock`)                     | PMO, Direction, Admin                |
| **Arbitrer le staffing** (`canStaff`)                                  | PMO, Direction, Admin, Manager (N+1) |
| **Éditer structure / planning / ressources** (`canEdit`)               | PM, PMO, Direction, Admin            |
| **Éditer le budget** (`canEditBudget`)                                 | PM, PMO, Direction, Admin, Finance   |
| **Écran Référentiels** (`canRef`)                                      | Admin, PMO, Direction, Finance       |
| **Journal d'audit** (`canAudit`)                                       | Direction, Admin                     |

### 6.2 Confidentialité des données sensibles

Règle inchangée et centrale : **salaire brut/net, coût chargé/jour et TJM de référence** ne sont visibles que par **Finance, RH, Direction**. Les autres rôles voient un libellé « — restreint — » ou un bloc de substitution explicite.

- Le **TJM projet** (spécifique à une affectation) reste visible par les intervenants du projet — c'est le **TJM de référence** (fiche) qui est confidentiel.
- Dans l'annuaire, l'en-tête de colonne lui-même s'adapte (« Salaire brut » vs « Salaire · restreint »).
- Dans la grille de TJM (Référentiels), le **coût chargé** reste masqué même pour PMO/Admin (qui accèdent à l'écran) ; seul le **prix de vente** est visible pour eux.

### 6.3 Portée par ligne (row-level)

- **Chef de projet (PM)** : ne voit que **ses** projets (dont il est PM, y compris comme PM d'un sous-projet).
- **Staff** : ne voit que les projets où il est affecté.
- **Manager (N+1)** : à la validation, ne voit que **son équipe directe**.
- Autres rôles habilités : portefeuille complet.

### 6.4 Exigence d'implémentation (critique)

Dans le prototype, ces contrôles sont **cosmétiques** (masquage d'affichage). En production :

- **Toute donnée sensible doit être filtrée côté serveur** — jamais sérialisée vers un rôle non habilité (field-level **et** row-level).
- Les **exports** appliquent exactement les mêmes droits : une colonne sensible est **retirée du fichier**, pas seulement masquée.
- Tout accès en lecture à une donnée sensible et toute modification RH/finance sont **journalisés** (auteur, rôle, horodatage, objet), conservation 5 ans.

---

## 7. Architecture fonctionnelle — les 16 écrans

Navigation latérale, badges calculés en temps réel, orientée **action** (« Ma file d'attente ») plutôt que consultation.

| #   | Écran (clé)                              | Rôle central      | Badge de nav                 |
| --- | ---------------------------------------- | ----------------- | ---------------------------- |
| 1   | **Ma file d'attente** (`dash`)           | tous              | —                            |
| 2   | **Saisie des temps** (`saisie`)          | Staff             | « ! » si semaine non soumise |
| 3   | **Validation des temps** (`validations`) | Manager (N+1)     | nb de semaines à valider     |
| 4   | **Congés & absences** (`conges`)         | N+1 / RH          | nb de demandes en attente    |
| 5   | **Portefeuille projets** (`projets`)     | PM / PMO          | —                            |
| 5b  | **Fiche projet** (`projet`)              | PM / PMO          | (drill-down arborescent)     |
| 6   | **Plan de charge** (`capacite`)          | PMO               | nb de demandes de staffing   |
| 7   | **Dépenses projet** (`depenses`)         | Finance / Compta  | —                            |
| 8   | **Équipe** (`equipe`)                    | Manager / RH      | —                            |
| 8b  | **Fiche employé** (`employe`)            | RH                | —                            |
| 9   | **Reporting & analytics** (`reporting`)  | Direction         | —                            |
| 10  | **Facturation** (`facturation`)          | Finance           | —                            |
| 11  | **Notifications** (`notifs`)             | tous              | « 3 »                        |
| 12  | **Référentiels** (`referentiels`)        | Admin / PMO       | —                            |
| 13  | **Journal d'audit** (`audit`)            | Direction / Admin | —                            |
| +   | **Nouveau projet** (`wizard`)            | PMO / PM          | —                            |

---

## 8. Détail des modules

### 8.1 Ma file d'attente (`dash`)

**Objectif** : accueil par rôle, où **chaque ligne mène à une action**, pas à un tableau.

- **Bandeau de bienvenue** : date du jour + semaine ISO, salutation, et 2 boutons (« Saisir mes temps », « Exporter »).
- **File d'attente « À traiter aujourd'hui »** : liste construite dynamiquement selon le rôle. Exemples :
  - N+1 / PMO / Direction / Admin : « X semaines à valider », « X demandes de congé ».
  - Staff / PM / N+1 : « Votre semaine n'est pas soumise · N h / 40 h » (urgent si < 30 h).
  - PM / PMO : « Recette / QA en dépassement · SFEC », « X contestation en attente ».
  - Finance / Direction : « 2 pré-factures à valider », « X dépenses engagées non facturées ».
  - RH : « X demandes de congé à contrôler », « 1 collaborateur en dépassement de solde ».
  - Admin : « Référentiel des postes de coût ».
- **4 KPI** : Ma chargeabilité, Heures cette semaine (rouge si < 40 h), Projets actifs, et un 4ᵉ KPI **conditionnel** — « Marge portefeuille » si habilité (`canMargin`), sinon « Jours à saisir avant vendredi 18:00 ».
- **Blocs** : Mes projets (semaine en cours, barres d'avancement), Alertes, Mon allocation (cible 85 %).

### 8.2 Saisie des temps (`saisie`) — le cœur

**Objectif** : remplir sa semaine en < 60 s, en capturant projet + poste de coût + activité + durée + date.

**Grille bureau** :

- Colonne projet + 7 colonnes jour + total. Une ligne = projet / « poste · activité », avec **budget restant indicatif** par ligne (rouge si quasi épuisé).
- Cellules éditables (virgule ou point acceptés) ; **total par jour** en rouge si > capacité (8 h/j, si l'alerte est activée).
- **Raccourcis clavier** : Entrée/flèches pour naviguer, « D » pour dupliquer une cellule sur lundi→vendredi.
- Barre « Ajouter une ligne » (projet/poste/activité). **Ajout bloqué si aucune activité ouverte** sur le poste (« demandez au chef de projet d'en créer une »).
- Indicateurs **Facturable** (vert) / **Non facturable** — le non-facturable = projet interne.

**Mode bulk** : imputer un même nombre d'heures/jour sur plusieurs jours cochés (défaut LUN–VEN) pour un projet/poste/activité, en une action.

**Vue mobile** : « Ma journée », total/capacité avec barre, sélecteur de jours, **boutons −/+ par pas de 30 min** (cibles tactiles 44 px), ajout/duplication/soumission. Conçue mobile-first, saisie hors-ligne évoquée.

**Frais de mission (déclarés par le consultant)** : depuis sa feuille, il déclare un frais (projet, poste, nature Transport/Hébergement/Per diem/Restauration, montant, date, **justificatif obligatoire**, bascule « Refacturable au client »). Créé à l'état « engagé », puis contrôlé par la comptabilité (En attente comptable → Contrôlé → Remboursé).

**Soumission** : « Soumettre la semaine » (refusée si 0 h) envoie la feuille au **manager N+1**. Le bouton passe cyan → vert (« ✓ Semaine soumise »).

**Contraintes métier** : on ne saisit que sur des **projets ouverts où l'on est affecté** ; postes/activités proposés = uniquement les **activités ouvertes** (avancement < 100 %) ; semaine active = semaine courante (semaines passées en lecture seule, futures non ouvertes).

### 8.3 Validation des temps (`validations`) — vue Manager N+1

**Accès** : Manager (N+1), PMO, Direction, Admin. Les autres voient un écran verrouillé rappelant que la contestation se fait depuis l'onglet Temps d'un projet.

- **Périmètre** : le N+1 ne voit que **son équipe directe** ; PMO/Direction/Admin voient toutes les équipes et peuvent clôturer.
- **Filtres** : À valider / Validées / Rejetées (compteurs live). Par ligne : personne, dept · N+1, KPI **Saisi / Facturable / Écart** (comparé à 40 h, rouge si ≠), drapeaux d'alerte (ex. « 45 h pour 40 h de capacité », « semaine incomplète »), détail des imputations en **lecture seule** (le N+1 valide les heures, pas les imputations).
- **Actions** : Valider (débloque le caractère facturable des heures), Rejeter **avec motif obligatoire** (notifié e-mail + Slack), **Tout valider**.
- **Clôture de période** (PMO/Direction/Admin) : impossible s'il reste des feuilles à valider ; sinon verrouille la saisie et **ouvre la fenêtre de contestation jusqu'à N+7**. Réouverture possible (action journalisée).
- **Contestations** : bloc alimenté par les signalements des PM (fenêtre N+7), avec action « Corriger l'imputation ».

### 8.4 Congés & absences (`conges`)

**Objectif** : demande self-service + arbitrage par le valideur, avec impact réel sur la capacité.

- **KPI** : Solde acquis, Pris cette année, Planifié, En attente N+1.
- **Onglets** : Mes demandes / À valider (compteur) / Calendrier équipe.
- **Demande** : type (Congé payé, Maladie, Sans solde, Récupération), dates Du/Au. **Décompte automatique** excluant week-ends **et jours fériés** (référentiel). Seul le **Congé payé décompte le solde** ; alerte « solde insuffisant » si dépassement. Garde-fous à la soumission : dates cohérentes, ≥ 1 jour ouvré, solde suffisant si CP.
- **Validation** (N+1, RH, PMO, Direction, Admin) : Valider / Refuser. Un congé **validé réduit la capacité** de la période (mis à 0 % dans le plan de charge, saisie bloquée sur ces jours).
- **Calendrier équipe** : vue Gantt des absences sur 8 semaines.

### 8.5 Portefeuille & Fiche projet (`projets` / `projet`)

#### Portefeuille (`projets`)

Liste filtrable (Tous / Public / Privé / Mes projets). Colonnes : Projet (code + modèle), Client, Segment, Chef de projet, Budget consommé (%), et une 6ᵉ colonne **« Marge » si habilité, sinon « TJM projet moy. »**. Filtrage par rôle (PM = ses projets ; Staff = ses affectations). Boutons « Exporter la liste » et « Nouveau projet ».

#### Fiche projet (`projet`) — structure multi-niveaux

- **Nature** : Programme (multi-lots) / Sous-projet / Projet simple. Pastille de **santé** (nominale / vigilance / sous surveillance) selon % budget et jalons à risque.
- **Drill-down arborescent** : un programme se décompose en **lots/sous-projets** (ex. SFEC → « Cadre légal & conformité », « Solution SI & Infrastructure », « Conduite du changement »), chacun avec son **PM**, ses **postes de coût**, ses **jalons**, son **budget** (part du budget global). Profondeur illimitée. On « pilote » un nœud : titre, stats, onglets, budget, ressources, planning basculent entièrement sur le sous-projet. Fil d'Ariane pour remonter.
- **Édition de structure** (habilités) : renommer, ajuster budget-jours, réaffecter le PM, ajouter/supprimer un sous-niveau, gérer les jalons (add / cycle en cours→risque→fait / renommer / supprimer), ajouter/retirer des postes de coût.

**Onglets de la fiche** :

1. **Aperçu** : 4 tuiles santé (Budget %, Jalons livrés, Activités terminées, Charge équipe), faits clés (client, segment, modèle, PM, budget contractuel, nb postes), prochains jalons, alertes (jalons à risque, postes en dépassement, contestations).
2. **Sous-projets** (programme) : liste des lots, bouton « Piloter » (drill).
3. **Planning** : Gantt / Liste. Activités **datées** en semaines relatives au démarrage, groupées par jalon. Chaque activité : responsable, poste, fenêtre, jours, avancement (0/50/100), état. Panneau de détail jalon (semaine → date, livrable, critère d'acceptation, **bascule facturable + montant d'échéance en Forfait**) ou tâche.
4. **Temps** : registre d'écritures (historique borné à la période ouverte et aux activités démarrées). Modes Synthèse (pivot par personne / poste / semaine) et Écritures (paginées). KPI (loggées, facturables, en attente N+1, contestées). **Contestation** d'une imputation possible.
5. **Ressources** : effectif, allocation %, état (Surchargé ≥ 100 / Optimal ≥ 60 / Sous-chargé), **TJM projet**, séniorité projet, jours planifiés vs loggés, tâches. Pour un programme (scope global) : **consolidation dédupliquée** des équipes de tous les lots (lecture seule). Édition : allocation, séniorité, TJM, ajout/retrait ; détection des personnes portant de la charge sans être affectées.
6. **Budget** — modes **Synthèse** et **Saisie**. Règle centrale : **Budget = Main d'œuvre (jours × TJM) + enveloppe Achats + enveloppe Frais de mission** (toutes en XAF).
   - Main d'œuvre proratisable ; **enveloppes achats/mission contractuelles et verrouillées**. Un sous-projet n'a d'enveloppe que si le contrat lui en attribue une ; sinon dépenses suivies « au réel ».
   - Dépenses classées engagé / facturé / payé (consommé = facturé + payé ; reste = total − consommé − engagé). Détail par nature et **par poste de coût**.
   - **Une enveloppe ne se modifie que par avenant approuvé.**
7. **Atterrissage** : **reste-à-faire (ETC) déduit du planning** (Σ jours × (100 − avancement)/100 par poste), **EAC = consommé + ETC**, écart au budget valorisé. Verdict (dans le budget / en dépassement), pire poste, avertissement si postes sans activité planifiée. Actions : demander un avenant, rééquilibrer, alerter le comité.

**Avenants** : formulaire ciblant une composante (MO / achats / mission), poste concerné, jours ou montant, **motif obligatoire**, nouvelle date de fin, prévisualisation d'impact. **Approbation par Direction/Finance** — seule voie d'augmentation d'une enveloppe : crédite réellement le budget et le poste. Statuts « En attente Direction » / « Approuvé ».

### 8.6 Nouveau projet (`wizard`)

Assistant dont la séquence dépend de la nature :

- **Projet simple** : Identité → Budget → Jalons → Équipe → Récapitulatif.
- **Programme** : Identité → Sous-projets → Budget → Jalons → Récapitulatif.

Étapes : **Identité** (nature, nom obligatoire, code, client, description, segment, modèle Régie/Forfait/Non facturable, dates, PM ; pour un programme : PMO + PM par défaut) · **Sous-projets** (lots avec PM et postes) · **Budget** (jours + TJM par poste, postes de coût, enveloppes MO/achats/mission, TJM moyen implicite) · **Équipe** (STAFF + TJM + allocation, confronté à l'enveloppe vendue) · **Jalons** (nom + semaine ; une activité ouverte est créée par poste) · **Récapitulatif** (création).

À la création, le projet neuf initialise **explicitement** ressources, budget et enveloppes à tous les niveaux (aucune donnée de démo ne fuit) et crée jalons + activités ouvertes pour être immédiatement imputable.

### 8.7 Plan de charge (`capacite`)

**Objectif** : visualiser la charge hebdomadaire (grille personne × semaine, S31→S38) et arbitrer le staffing.

- **Grille** : couleurs par seuil — Optimal 85–100 (vert), Sous-booké 60–85 (cyan), Bench < 60 (transparent), **Overbooké > 100 (rouge)**, **Congé validé = 0 % (hachuré, saisie bloquée)**. Colonne moyenne. Filtres : Tous / Overbookés / Bench / Dev / Consulting. Clic sur cellule → détail d'allocation (« conflit à arbitrer » si > 100).
- **Demande de ressource** : formulaire (projet, sous-projet, profil, séniorité, charge %, semaines De/À) → demande envoyée au PMO (arbitrage sous 48 h).
- **Arbitrage** (PMO/Direction/Admin/N+1) : chaque demande liste des **candidats disponibles** (charge < 70 %). « Pourvoir » **crée réellement l'affectation datée** sur le périmètre demandé, en reprenant le **TJM de vente de la grille en vigueur** pour la séniorité, et passe la demande en « Pourvue ».
- L'**overbooking n'est pas bloquant** : signalé (rouge) et isolable par filtre.

### 8.8 Dépenses projet (`depenses`)

**Accès** : Finance, Direction, Admin, PMO. Les autres voient un écran verrouillé.

- **KPI** : Engagé non facturé (bons de commande), Facturé fournisseur (en attente de paiement), Payé (trésorerie), **Refacturable client** (à reporter en pré-facture régie).
- **Registre** paginé (8/page), filtres : état (Engagé/Facturé/Payé/Refacturable), projet, nature (Achats & sous-traitance / Frais de mission), recherche libellé/fournisseur. Colonnes : charge (libellé + fournisseur + date), projet · périmètre (sous-projet), poste, montant, refacturation, état.
- **Cycle de vie** : `Engagé → Facturé → Payé` (unidirectionnel). Sémantique budgétaire : **engagé = réserve** le budget sans le consommer ; **imputé (facturé/payé) = consomme** l'enveloppe.
- **Saisie** : projet, sous-projet, poste, **nature** (Achat / Mission), montant, date, libellé, fournisseur, pièce justificative, état, **bascule refacturable**. **Contrôle d'enveloppe en direct** (indicatif, non bloquant) : compare le montant au reste disponible de l'enveloppe du périmètre.
- **Deux enveloppes contractuelles** distinctes (achats, mission), ventilables par sous-projet.

### 8.9 Équipe & Fiche employé (`equipe` / `employe`)

- **Annuaire** : liste des collaborateurs — Collaborateur, Département, Manager N+1, Séniorité, Chargeabilité, et **Salaire** (visible pour Finance/RH/Direction, sinon « — restreint — »). Bouton « Exporter l'annuaire » (sans colonnes sensibles pour les non-habilités).
- **Fiche employé** : identité (matricule, N+1, département, entrée, site, contrat) + **bloc rémunération confidentiel** (salaire brut, net, coût chargé/j, TJM de référence) visible seulement pour les habilités ; sinon **bloc de substitution** expliquant le masquage et que ces champs n'apparaissent dans aucun export. Affectations en cours + graphe de chargeabilité 6 mois.

### 8.10 Reporting & analytics (`reporting`)

Catalogue de **13 rapports** en 4 familles (un rapport non autorisé disparaît du menu selon le rôle) :

- **Utilisation** : Chargeabilité par personne, Chargeabilité par département, Allocation & bench.
- **Temps** : Temps loggé vs facturable, Conformité de saisie, Congés & absences.
- **Finance** : Budget vs réel, Atterrissage du portefeuille, Dépenses & engagements, Facturable vs facturé _(Finance/Direction/Admin)_, **Marge par projet** _(Finance/Direction)_.
- **Delivery** : Jalons & retards, Avancement vs charge consommée.

Chaque rapport a une question métier, des filtres (dept/séniorité/segment/modèle/période), 3–4 KPI, un tableau et un **drill-down par ligne**. Calculs : voir §11.

### 8.11 Facturation (`facturation`)

**Accès** : Finance, Direction, Admin. Assistant en 3 étapes :

1. **Période** : période, **modèle Régie vs Forfait**, date d'émission, conditions de paiement, **référence de commande client obligatoire** (bloquante).
   - **Régie** → déclencheur = temps **validés** (par les N+1), hors période contestée.
   - **Forfait** → déclencheur = **jalon accepté** (facturable + montant + « fait ») ; les temps servent au suivi de marge, pas au montant.
2. **Contrôle** : colonne **Inclus** (temps validés / échéances de jalons + frais refacturables non engagés) et colonne **Exclu et pourquoi** (semaines non validées, contestations ouvertes, temps non facturable, frais à notre charge, frais refacturables encore engagés).
3. **Pré-factures** : tableau (réf., projet, client, modèle, jours/forfait, montant HT, statut : Brouillon / À valider / Validée / Envoyée). Export et génération de lot.

### 8.12 Notifications (`notifs`)

- **Fil d'activité** : rappels de saisie, overbooking, dépassement budget, jalon en retard, semaine validée — avec canal (E-mail + Slack / Slack / E-mail) et horodatage. « Tout marquer comme lu ».
- **Règles de rappel** (interrupteurs) : Rappel quotidien de saisie (16:30, jours ouvrés, e-mail + Slack) ; Alerte overbooking (> 100 % sur 2 semaines glissantes) ; Alerte dépassement budget (seuil 90 % d'un poste — **désactivée par défaut**) ; Jalon en retard (notifié au PM du niveau).
- **Relance du jour** : envoi e-mail + Slack aux collaborateurs dont la journée est incomplète avant 18:00.

### 8.13 Référentiels (`referentiels`)

**Accès** : Admin, PMO, Direction, Finance. Trois onglets :

- **Postes de coût** : catalogue, marquage **facturable / non facturable**, usage (nb de projets), activation/désactivation (historique conservé).
- **Grille de TJM datée** : coût chargé/j (masqué hors `canSalary`), prix de vente/j, date d'entrée en vigueur, état (En vigueur / Historique). **Un taux est daté : un changement ne réécrit jamais les périodes déjà facturées.**
- **Calendrier** : jours fériés (République du Congo), capacité de référence (8 h/j) ; fériés + congés validés sortent du calcul de chargeabilité.

### 8.14 Journal d'audit (`audit`)

**Accès** : Direction, Admin. Table traçant les accès et modifications : horodatage, auteur, rôle, action, objet, **nature (sensible / standard)**. Toute lecture d'un salaire, d'un TJM de référence ou d'une marge doit être journalisée. Conservation 5 ans.

### 8.15 Export de données (transverse)

Depuis les listes et rapports : export CSV / Excel / PDF. Champs inclus type : personne, projet, poste de coût, date, durée, statut de validation, TJM projet. **Champs exclus pour les non-habilités : salaire brut/net, coût chargé, TJM de référence, marge — retirés du fichier, pas seulement masqués.** Tout export est journalisé.

---

## 9. Modèle de données

### 9.1 Entités principales

```
User (compte Google) 1─1 Employee ; User >──< Role
Employee ──< (manager N+1, self-ref) ; Department 1──< Employee
Client 1──< Project ; Segment 1──< Project
Project 1──< ProjectNode (arbre : lots/sous-projets, récursif)
ProjectNode : PM(s), CostCenters[], Milestones[], budget (jours + enveloppes)
ProjectNode 1──< Milestone 1──< Deliverable (+ critère d'acceptation, facturable, montant)
ProjectNode 1──< Activity (datée, responsable, poste, jours, avancement)
ProjectNode 1──< Assignment (Employee, TJM projet, séniorité projet, allocation %, dates)
Employee 1──< TimeEntry >── Project/Node, CostCenter, Activity, date, durée, statut
TimeEntry ──> Submission (semaine) ──> Validation (N+1) ──> [Dispute (PM, N+7)]
Period (clôture/verrou) 1──< Submission
LeaveRequest (type, dates, jours calculés, solde, statut) → impacte capacité
Expense (nature achat/mission, poste, montant, état engagé/facturé/payé, refacturable, pièce)
Envelope (par nœud : mo / achats / mission ; contractuelle)
Amendment (composante, poste, jours/montant, motif, date fin, statut) → révise Envelope
RateGrid (séniorité → coût, vente, date d'effet, historisé)
Invoice 1──< InvoiceLine ; Invoice >── Client, Project, modèle, PO
Holiday (calendrier) ; AuditLog (accès sensibles + modifications)
```

### 9.2 Objets de référence du prototype (démo)

`PROJECTS` (SFEC, CAMU, CNSS, AkieniPay, CarTracking, Interne + NSIA), `ROLE_USERS` (8 rôles/utilisateurs), `STAFF` (fiches avec `tjm`, `ref`, `salary`), `PLAN` (charge par personne × semaine), `STAFF_REQ` (demandes de staffing), `AMENDMENTS`, `RATE_GRID` (coût/vente datés par séniorité), `HOLIDAYS`, `AUDIT`, `SUBMISSIONS` (feuilles hebdo), `LEAVES`, `COST_LOAD` (part de coût par projet), `EXP_ENVELOPE` (enveloppes mo/achats/mission, ventilées par sous-projet), `EXPENSES`, `DISPUTES`, `ACT_PLAN` (activités par poste).

---

## 10. Règles de gestion

- **RG-01** — Une saisie n'est possible que sur un **projet ouvert où l'on est affecté**, et sur une **activité ouverte** (avancement < 100 %) d'un poste du périmètre.
- **RG-02** — La soumission d'une semaine est refusée à 0 h ; elle envoie la feuille au **manager N+1**.
- **RG-03** — Le **N+1 valide les heures** (pas les imputations) ; la validation **débloque le caractère facturable**. Le rejet exige un **motif**.
- **RG-04** — Le **PM ne valide pas** ; il **conteste** une imputation jusqu'à **N+7** après validation.
- **RG-05** — La **clôture de période** est impossible tant qu'il reste des feuilles à valider ; elle verrouille la saisie et ouvre la fenêtre de contestation N+7. La réouverture est journalisée.
- **RG-06** — Un **congé payé** décompte le solde ; les week-ends et **jours fériés** sont exclus du décompte. Un congé **validé met la capacité à 0** sur la période et bloque la saisie ces jours-là.
- **RG-07** — **Budget = Main d'œuvre (jours × TJM) + enveloppe Achats + enveloppe Frais de mission.**
- **RG-08** — Les **enveloppes achats/mission sont contractuelles et verrouillées** ; elles ne se modifient que par **avenant approuvé** (par Direction/Finance).
- **RG-09** — Une **dépense** suit le cycle **Engagé → Facturé → Payé** ; engagé **réserve**, imputé **consomme**. Une dépense **refacturable** remonte en pré-facture régie.
- **RG-10** — **Marge = 1 − COST_LOAD** ; la marge portefeuille est pondérée par le revenu vendu, hors projets internes.
- **RG-11** — **Atterrissage** : ETC = Σ jours × (100 − avancement)/100 ; EAC = consommé + ETC ; écart = EAC − budget.
- **RG-12** — **Facturation Régie** = temps **validés** (hors période contestée) ; **Forfait** = **jalon accepté** (facturable + montant + « fait »). La **référence de commande client est obligatoire**. Les frais **engagés** (non facturés) sont exclus.
- **RG-13** — Un **taux (grille TJM) est daté** : un changement ne réécrit jamais les périodes déjà facturées.
- **RG-14** — **Confidentialité** : salaires, coût chargé et TJM de référence réservés à Finance/RH/Direction ; marge à Finance/Direction. Application **serveur** (field + row level), y compris dans les exports.
- **RG-15** — Tout accès sensible et toute modification RH/finance sont **journalisés** (conservation 5 ans).
- **RG-16** — L'**overbooking** (> 100 %) est signalé mais **non bloquant** ; il doit être arbitré via le plan de charge.

---

## 11. Métriques & formules analytiques

- **Capacité** (période) = jours ouvrés × 8 h, **moins fériés et congés validés**.
- **Temps loggé** = Σ durées des saisies ; **Temps facturable** = Σ sur postes facturables (hors interne), **après validation N+1**.
- **Chargeabilité** = moyenne de la charge hebdo ; **les congés validés mettent la semaine à 0**. Cible **85 %**.
- **Allocation** : Overbooké > 100 · Optimal 85–100 · Sous-booké 60–85 · Bench < 60 (sur 8 semaines).
- **Vendu** = MO + achats + mission. **Coût interne** = Vendu × `COST_LOAD`. **Marge %** = 1 − `COST_LOAD` (ex. SFEC 0,686 → marge ~31 % ; AkieniPay 1,034 → **en perte**).
- **Marge portefeuille** = pondérée par le revenu vendu, hors interne.
- **Consommé** = MO proratisée (MO × dépensé/budget) + dépenses imputées (facturé + payé).
- **ETC / EAC** : ETC = Σ jours × (100 − avancement)/100 ; EAC = consommé + ETC ; écart = EAC − vendu.
- **Facturable vs facturé** : facturable = vendu × avancement de charge ; backlog = facturable − facturé.

---

## 12. Workflows de bout en bout

1. **Cycle de saisie** : Staff saisit (quotidien, avant 18:00) → soumet la semaine → **N+1 valide/rejette** → temps validés visibles par le PM → **PM conteste** une imputation (≤ N+7) → **PMO clôture** la période (verrou) → temps prêts à facturer.
2. **Cycle projet** : PMO crée le projet (wizard) → structure en lots (PM par lot) → postes de coût, jalons datés, activités ouvertes → staffing (demande → arbitrage → affectation datée) → exécution (temps + dépenses) → suivi budget/atterrissage → **avenant** si dépassement → clôture.
3. **Cycle congés** : Staff demande (solde contrôlé, fériés exclus) → **N+1 valide** → **capacité réduite** automatiquement → RH contrôle.
4. **Cycle dépenses** : Consultant déclare un frais de mission (justificatif) **ou** Compta saisit un achat → Engagé → Facturé → Payé → refacturable remonte en pré-facture.
5. **Cycle facturation** : Finance choisit période + modèle + PO → contrôle inclus/exclus → génère la pré-facture → validation → émission.

---

## 13. Exigences non-fonctionnelles

- **Sécurité (critique)** : SSO Google OIDC ; **contrôle d'accès serveur** field-level **et** row-level (le prototype est cosmétique) ; chiffrement au repos des données sensibles ; moindre privilège ; retrait effectif du sélecteur de rôle en production.
- **Confidentialité / RGPD** : minimisation, droits d'accès/rectification/portabilité (export RGPD par individu), rétention et purge paramétrables.
- **Audit** : journal immuable des accès sensibles et modifications financières/RH, conservation 5 ans.
- **Performance** : dashboards < 2 s ; saisie fluide, incréments 30 min sur mobile, brouillon hors-ligne.
- **Disponibilité** : cible 99,5 %, sauvegardes quotidiennes, restauration testée.
- **UX / Accessibilité** : responsive **mobile-first pour la saisie** ; WCAG AA ; i18n FR (EN en option, le design system est bilingue).
- **Design system** : Akieni (Swiss/grotesk, near-black sur papier chaud, accent cyan-teal `#12ebd6`, hairlines, radii faibles, mono JetBrains pour les labels). Tokens dans `src/styles/`.
- **Intégrité financière** : idempotence des exports/factures, non-répudiation des pièces émises, taux datés.

---

## 14. Intégrations

| Intégration              | Usage                                                                          | Priorité |
| ------------------------ | ------------------------------------------------------------------------------ | -------- |
| **Google Workspace**     | SSO/OIDC (obligatoire), annuaire, e-mail de rappel                             | P0       |
| **Slack / Chat**         | Rappels de saisie, alertes overbooking / budget / jalon                        | P1       |
| **Logiciel compta/paie** | Export écritures analytiques, coûts, CA ; import solde de congés (à confirmer) | P1       |
| API / Webhooks           | Connecteurs BI, extensions                                                     | P2       |

---

## 15. Roadmap de livraison

Le prototype fait office de spécification fonctionnelle détaillée. Livraison en vagues, chacune fermant une **boucle complète**. Chaque vague = sa propre spec technique → plan → implémentation.

### Vague 0 — Socle technique & sécurité

Auth Google (OIDC réelle), modèle de rôles serveur, **contrôle d'accès field/row-level**, journal d'audit réel, référentiels (départements, séniorités, postes, **grille TJM datée**, calendrier fériés). _Sortie : fondation sécurisée — la confidentialité cosmétique du prototype devient réelle._

### Vague 1 — Projets, RH & structure

Fiches employés (confidentialité), clients/segments, projets multi-niveaux (arbre, PM par nœud), postes de coût, jalons/livrables datés, activités, affectations datées (TJM projet, allocation), wizard de création cohérent (projet immédiatement imputable).

### Vague 2 — Le capteur : saisie & validation

Grille hebdo (single/bulk/mobile), contraintes projet ouvert/affecté/activité ouverte, frais de mission par le consultant, **validation N+1**, contestation PM N+7, **clôture/verrou de période**, rappels e-mail/Slack. _Sortie : donnée fiable._

### Vague 3 — Capacité & congés

Plan de charge (grille datée, overbooking, bench), demande/arbitrage de staffing créant l'affectation, **congés avec impact capacité** et calendrier fériés.

### Vague 4 — Finance & compta analytique

Budget (MO + 2 enveloppes), dépenses (cycle engagé/facturé/payé, refacturable), **avenants** révisant réellement le budget, marge (`COST_LOAD`), **atterrissage (ETC/EAC)**, export comptable.

### Vague 5 — Facturation

Assistant Régie/Forfait (déclencheurs distincts), PO obligatoire, inclus/exclus, pré-factures, avoirs.

### Vague 6 — Reporting & analytics

Les 13 rapports (4 familles), drill-down, dashboards par rôle, Gantt/planning consolidé, portefeuille Direction.

### Vague 7 — Transverses

Export de données planifié, API/BI, mode hors-ligne, notifications avancées.

---

## 16. Décisions ouvertes

| #   | Sujet                             | Question                                                               | Recommandation                                                                                                   |
| --- | --------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Q1  | **Domaines Google**               | Un seul domaine Akieni ou plusieurs (filiales) ?                       | Confirmer la liste des domaines autorisés.                                                                       |
| Q2  | **Granularité de saisie**         | Activité suffit-elle, ou descendre à la tâche sur certains projets ?   | Activité par défaut ; tâche activable par projet.                                                                |
| Q3  | **Solde de congés**               | Calculé par l'outil (droits acquis) ou importé de la paie ?            | Importé de la paie + contrôle de dépassement (évite les divergences).                                            |
| Q4  | **Dépenses engagées**             | Gérer les bons de commande (engagé) ou seulement les factures reçues ? | Cycle complet engagé→facturé→payé (déjà prototypé).                                                              |
| Q5  | **Seuil de validation des frais** | Un montant au-delà duquel la Direction valide en plus du N+1 ?         | À définir (seuil paramétrable).                                                                                  |
| Q6  | **Logiciel comptable cible**      | Quel outil pour le mapping d'export ?                                  | À nommer par la Finance avant la Vague 4.                                                                        |
| Q7  | **Coût chargé**                   | Comment est calculé le coût jour interne (charges, jours/an) ?         | Coefficient de charges + calendrier ouvré paramétrables ; cohérent avec la grille TJM datée.                     |
| Q8  | **Dépendances de planning**       | Gère-t-on prédécesseurs / chemin critique dans le Gantt ?              | Limitation assumée en v1 ; à confirmer pour une version ultérieure.                                              |
| Q9  | **Marge visible par le PM**       | Le PM voit-il la marge de son projet (dérivée des salaires) ?          | Non par défaut (`canMargin` = Finance/Direction) ; exposer un coût standard par séniorité si besoin de pilotage. |

---

## 17. Annexe — État du prototype : réel vs simulé

Pour cadrer l'implémentation, distinction entre ce qui est **réellement dynamique** dans `Akieni PMO.dc.html` et ce qui est **simulé**.

**Réellement dynamique (logique métier présente)** :

- Navigation, sélecteur de rôle, badges calculés (validations, congés, staffing en attente).
- Saisie des temps : édition de cellules, bulk, mobile ±30 min, raccourcis clavier, contrainte d'activité ouverte, soumission, frais de mission.
- Validation : valider/rejeter avec motif, tout valider, verrou de période conditionné, contestations.
- Congés : décompte avec fériés, contrôle de solde (CP), validation, impact capacité dans le plan de charge.
- Plan de charge : grille datée, congés = 0, arbitrage de staffing **créant l'affectation** avec TJM de la grille.
- Projets : drill-down arborescent, édition de structure, budget (MO + enveloppes), avenants **révisant réellement** le budget, atterrissage (ETC déduit du planning), registre de temps déterministe, ressources consolidées.
- Wizard : création d'un projet cohérent et immédiatement imputable.
- Reporting : 13 rapports avec KPI/tableaux/drill-down calculés.
- Facturation : assistant Régie/Forfait avec déclencheurs et inclus/exclus calculés (liste finale statique).

**Simulé (à implémenter réellement)** :

- **Contrôle d'accès** : cosmétique côté client — toutes les données sensibles sont dans le navigateur, le rôle est librement modifiable. → **À refaire côté serveur.**
- **Authentification Google** : bascule un booléen, pas d'OAuth réel.
- **Journal d'audit** : liste statique ; aucune consultation n'écrit réellement d'entrée. → **Journalisation réelle à implémenter.**
- **Exports** : affichent un message, ne génèrent pas de fichier.
- **Notifications** : fil et relances statiques (seuls les interrupteurs de règles ont un effet d'état).
- Certaines actions « métier » (désactiver un poste, générer un lot de factures) se limitent à un message de confirmation.
- Plusieurs blocs du dashboard (Mes projets, Alertes, Allocation) et certains KPI sont codés en dur.

---

## 18. Glossaire

- **TJM** : Taux Journalier Moyen. _Référence_ (fiche, confidentiel) vs _projet_ (spécifique à une affectation).
- **Poste de coût** : axe analytique d'imputation ; facturable ou non.
- **Activité** : unité de travail datée sous un poste, portant l'avancement ; imputable si ouverte.
- **Programme / Lot (sous-projet)** : projet multi-niveaux piloté par un PMO, chaque niveau ayant son PM.
- **Enveloppe** : budget contractuel par composante (main d'œuvre / achats / frais de mission).
- **Engagé / Facturé / Payé** : cycle de vie d'une dépense (réserve → charge fournisseur → décaissement).
- **Refacturable** : dépense reportée au client (pré-facture régie).
- **Chargeabilité / Utilisation** : part du temps (facturable) rapportée à la capacité.
- **Overbooking / Bench** : sur-affectation (> 100 %) / sous-charge (< 60 %).
- **ETC / EAC** : Estimate To Complete / Estimate At Completion (reste-à-faire / coût à terminaison).
- **Avenant** : révision contractuelle approuvée d'un budget/planning.
- **Régie / Forfait** : facturation au temps validé / au prix fixe déclenchée par jalon accepté.
- **COB** : Close of Business (18:00, heure limite de saisie).
- **N+1 / N+7** : manager hiérarchique direct / délai de 7 jours pour contester une imputation.
- **COST_LOAD** : part de coût interne d'un projet (marge = 1 − COST_LOAD).

---

_Fin du document. Prochaine étape recommandée : spec technique de la Vague 0 (socle & sécurité)._
