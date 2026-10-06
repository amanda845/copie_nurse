# 🏥 NurseFlow — Dossier de soins infirmier

> **Application web de gestion des soins infirmiers hospitaliers**  
> Projet de Fin d'Études (PFE) — Centre Hospitalier Universitaire de Béjaïa  
> Réalisé par **ZAIDI Amanda**

---

## 📋 Présentation

**NurseFlow** est une application web moderne dédiée aux équipes infirmières hospitalières. Elle centralise la gestion des patients, des dossiers de soins, des transmissions inter-équipes et des diagnostics infirmiers dans une interface claire, rapide et responsive.

L'application est conçue pour le **CHU de Béjaïa** et respecte les protocoles et nomenclatures du système de soins algérien.

---

## ✨ Fonctionnalités principales

| Module | Description |
|--------|-------------|
| 🏠 **Accueil / Dashboard** | Vue en temps réel de la disponibilité des chambres et des lits (*Côté femmes*, *Côté hommes*, *Hôpital de jour*) avec indicateurs KPI |
| 👥 **Mes patients** | Liste complète des patients avec filtres par statut, service et recherche par nom |
| 📁 **Nouveau dossier** | Création rapide d'un dossier de soins pour un nouveau patient admis |
| 🩺 **Diagnostics infirmiers** | Saisie et suivi des diagnostics selon les référentiels NANDA-I |
| ➕ **Soins & Interventions** | Planification et traçabilité des actes infirmiers |
| 📨 **Transmissions** | Transmissions ciblées entre équipes de soins (SOAP, relève) |
| 📊 **Évaluations & Activités** | Suivi du profil infirmier actif et de ses activités enregistrées |

---

## 🏗️ Architecture technique

```
src/
├── components/
│   ├── common/          # Composants réutilisables (AppIcon, AppButton, AppModal…)
│   ├── layout/          # Topbar, Sidebar, Footer, NurseSwitcherModal
│   └── records/         # Composants dossier patient (TreatmentTimeline, etc.)
├── composables/
│   ├── useNurses.js     # Gestion de l'équipe infirmière active
│   ├── usePatients.js   # Données et logique des patients
│   └── useToast.js      # Notifications toast
├── layouts/
│   └── DefaultLayout.vue
├── modules/
│   └── rooms/           # Données réactives des chambres et lits
├── router/              # Routes Vue Router
├── styles/              # CSS global (layout, nurses, dashboard, forms…)
└── views/               # Pages de l'application
    ├── DashboardView.vue
    ├── PatientsView.vue
    ├── DiagnosticsView.vue
    ├── TransmissionsView.vue
    └── …
```

---

## 🛠️ Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| **Vue.js 3** | 3.5.x | Framework frontend (Composition API) |
| **Vue Router 4** | 4.4.x | Routage SPA |
| **Vite** | 8.x | Bundler et serveur de développement |
| **Vanilla CSS** | — | Styles et animations personnalisés |
| **Inter (Google Fonts)** | — | Typographie principale |
| **ScrollReveal** | 4.x | Animations au scroll |

---

## 🚀 Installation et démarrage

### Prérequis

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd com.NurseFlow.app-master

# 2. Installer les dépendances
npm install

# 3. Démarrer le serveur de développement
npm run dev
```

### Build de production

```bash
npm run build
```

Les fichiers compilés seront dans le dossier `dist/`.

### Prévisualisation de la build

```bash
npm run preview
```

---

## ☁️ Déploiement (Vercel)

Le projet inclut un fichier `vercel.json` configuré pour le routage SPA :

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Pour déployer sur Vercel :
1. Importer le projet depuis GitHub sur [vercel.com](https://vercel.com)
2. Framework détecté automatiquement : **Vite**
3. Commande de build : `npm run build`
4. Répertoire de sortie : `dist`

---

## 👩‍⚕️ Fonctionnement — Prise de poste

1. Au démarrage, l'infirmier(e) sélectionne son nom dans la **modale de prise de poste** (accessible via le profil en haut à droite).
2. Toutes les actions, soins et transmissions sont ensuite **signés au nom du soignant actif**.
3. L'équipe infirmière peut être gérée dynamiquement : ajout, modification, suppression de soignants, avec une **barre de recherche** intégrée.

---

## 📱 Responsive Design

NurseFlow est entièrement responsive :

- **Desktop (> 900px)** : sidebar fixe à gauche, contenu en colonnes
- **Tablette (600–900px)** : adaptation des grilles et du topbar
- **Mobile (< 600px)** : sidebar en tiroir coulissant (☰ hamburger), grille KPI 2×2, cartes empilées

---

## 📂 Données et traçabilité

Les données patients et infirmiers sont gérées via les **composables Vue** (`useNurses`, `usePatients`) et persistées en **localStorage** entre les sessions.

Chaque action clinique ou administrative est également enregistrée dans un journal d’audit local : prise de poste, création/modification/suppression d’un traitement, administration et changement de statut, création/modification/résolution/suppression d’un diagnostic, gestion de l’équipe, création ou modification d’un dossier patient et envoi d’un feedback. Chaque entrée contient l’infirmier signataire, l’horodatage ISO, le type d’objet, son identifiant et, lorsque pertinent, les détails avant/après.

Les diagnostics infirmiers sont persistés automatiquement afin que les modifications restent disponibles après actualisation ou nouvelle session.

> ⚠️ **Note PFE** : Cette version utilise encore `localStorage` comme couche de persistance locale. Pour une mise en production hospitalière, le journal devra être remplacé par une API sécurisée avec authentification, contrôle d’accès, base de données, sauvegardes et conservation réglementaire.

---

## 📄 Crédits

```
Projet de Fin d'Études (PFE) — Génie Informatique
Établissement : Université de Béjaïa
Partenaire clinique : CHU Béjaïa — Service des soins infirmiers

Développé par : ZAIDI Amanda
Année académique : 2025–2026
```

---

<div align="center">
  <strong>NurseFlow</strong> — <em>« Prendre soin, c'est aussi écouter. »</em>
</div>
