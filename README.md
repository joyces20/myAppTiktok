# 🎵 myAppTiktok — Clone TikTok

> Application mobile de partage de vidéos courtes | React Native CLI + Firebase | Projet scolaire — Équipe de 8

---

## 📌 Table des matières

1. [Présentation du projet](#-présentation-du-projet)
2. [Stack technique](#-stack-technique)
3. [Fonctionnalités](#-fonctionnalités)
4. [Architecture du projet](#-architecture-du-projet)
5. [Schéma de la base de données](#-schéma-de-la-base-de-données)
6. [Organisation de l'équipe](#-organisation-de-léquipe)
7. [Guide de démarrage](#-guide-de-démarrage)
8. [Conventions Git](#-conventions-git)
9. [Règles de collaboration](#-règles-de-collaboration)
10. [Variables d'environnement](#-variables-denvironnement)

---

## 🎯 Présentation du projet

**myAppTiktok** est une application mobile de partage de vidéos courtes, développée dans le cadre d'un projet scolaire en équipe de 8 personnes.
Elle reprend les fonctionnalités clés de TikTok :

- 📱 Feed de vidéos avec défilement vertical (For You Page)
- 🎬 Enregistrement et upload de vidéos
- ❤️ Likes, commentaires et partages
- 🔍 Recherche et découverte de contenu
- 👤 Profils utilisateurs avec abonnements
- 🔔 Notifications en temps réel
- 🎵 Intégration audio et musique

---

## 🔧 Stack technique

| Couche | Technologie |
|---|---|
| Frontend mobile | React Native CLI |
| Navigation | React Navigation v6 |
| Styling | StyleSheet + React Native |
| Base de données | Firebase Firestore |
| Authentification | Firebase Auth |
| Stockage vidéos/images | Firebase Storage |
| État global | Redux Toolkit ou Zustand |
| Notifications | Firebase Cloud Messaging (FCM) |

---

## ✨ Fonctionnalités

### Authentification
- [ ] Inscription / Connexion par email
- [ ] Connexion via Google (OAuth)
- [ ] Déconnexion
- [ ] Profil utilisateur (photo, nom, bio)

### Feed vidéo
- [ ] Défilement vertical (FlatList / FlashList)
- [ ] Lecture automatique au scroll
- [ ] Mise en pause au tap
- [ ] For You Page (recommandations)
- [ ] Barre de progression vidéo

### Upload & Édition
- [ ] Accès caméra et galerie
- [ ] Enregistrement de vidéos
- [ ] Ajout de musique / son
- [ ] Description et hashtags
- [ ] Publication de la vidéo

### Social
- [ ] Liker une vidéo
- [ ] Commenter une vidéo
- [ ] Partager une vidéo
- [ ] Suivre / Ne plus suivre un utilisateur

### Profil utilisateur
- [ ] Page profil (vidéos, infos, abonnés)
- [ ] Modifier son profil
- [ ] Voir les vidéos likées

### Recherche & Découverte
- [ ] Barre de recherche (utilisateurs, hashtags, sons)
- [ ] Page Découverte avec tendances
- [ ] Résultats filtrés

### Notifications
- [ ] Notifications push (FCM)
- [ ] Centre de notifications in-app
- [ ] Notifications : nouveau follower, like, commentaire

---

## 🗂️ Architecture du projet

```
myAppTiktok/
├── android/
├── ios/
├── src/
│   ├── assets/                  # Images, fonts, icônes statiques
│   ├── components/
│   │   ├── ui/                  # Boutons, inputs, modals, loaders...
│   │   ├── auth/                # PrivateRoute, formulaires auth
│   │   ├── feed/                # VideoCard, VideoPlayer, FeedList
│   │   ├── profile/             # ProfileHeader, VideoGrid
│   │   ├── social/              # LikeButton, CommentSheet
│   │   ├── search/              # SearchBar, ResultsList
│   │   └── notifications/       # NotificationItem, NotifList
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.jsx
│   │   │   └── RegisterScreen.jsx
│   │   ├── Feed/
│   │   │   └── FeedScreen.jsx
│   │   ├── Upload/
│   │   │   └── UploadScreen.jsx
│   │   ├── Profile/
│   │   │   └── ProfileScreen.jsx
│   │   ├── Search/
│   │   │   └── SearchScreen.jsx
│   │   └── Notifications/
│   │       └── NotificationsScreen.jsx
│   ├── navigation/              # Stack, Tab, navigateur principal
│   ├── services/                # Appels Firebase (auth, firestore, storage)
│   │   ├── firebase.js
│   │   ├── authService.js
│   │   ├── videoService.js
│   │   └── userService.js
│   ├── store/                   # État global (Redux / Zustand)
│   │   ├── authStore.js
│   │   └── playerStore.js
│   ├── hooks/                   # Custom hooks React
│   │   ├── useAuth.js
│   │   ├── useFeed.js
│   │   └── useSearch.js
│   └── utils/                   # Fonctions utilitaires
├── .env                         # Variables d'environnement (ne jamais committer)
├── .env.example                 # Template des variables (à committer)
├── .gitignore
└── README.md
```

---

## 🗄️ Schéma de la base de données

### Collection `users`

| Champ | Type | Contrainte |
|---|---|---|
| uid | string | PRIMARY KEY (Firebase Auth) |
| username | string | UNIQUE NOT NULL |
| full_name | string | |
| avatar_url | string | |
| bio | string | |
| followers_count | number | DEFAULT 0 |
| following_count | number | DEFAULT 0 |
| created_at | timestamp | DEFAULT NOW() |

### Collection `videos`

| Champ | Type | Contrainte |
|---|---|---|
| id | string | PRIMARY KEY (auto) |
| user_id | string | FK → users |
| video_url | string | NOT NULL |
| thumbnail_url | string | |
| description | string | |
| hashtags | array | |
| likes_count | number | DEFAULT 0 |
| comments_count | number | DEFAULT 0 |
| created_at | timestamp | DEFAULT NOW() |

### Collection `comments`

| Champ | Type | Contrainte |
|---|---|---|
| id | string | PRIMARY KEY (auto) |
| video_id | string | FK → videos |
| user_id | string | FK → users |
| content | string | NOT NULL |
| created_at | timestamp | DEFAULT NOW() |

### Collection `follows`

| Champ | Type | Contrainte |
|---|---|---|
| id | string | PRIMARY KEY (auto) |
| follower_id | string | FK → users |
| following_id | string | FK → users |
| created_at | timestamp | DEFAULT NOW() |

### Collection `notifications`

| Champ | Type | Contrainte |
|---|---|---|
| id | string | PRIMARY KEY (auto) |
| user_id | string | FK → users (destinataire) |
| type | string | like / comment / follow |
| from_user_id | string | FK → users |
| video_id | string | FK → videos (optionnel) |
| read | boolean | DEFAULT false |
| created_at | timestamp | DEFAULT NOW() |

---

## 👥 Organisation de l'équipe

Chaque membre est **seul responsable** de son domaine. Pas de doublon, pas de confusion.

---

### 👤 Membre 1 — Chef de projet & Configuration Firebase

**Branche :** `feature/setup`

**Tâches :**
- Initialiser le projet React Native CLI + installer toutes les dépendances (`react-navigation`, `zustand`, `@react-native-firebase/*`, etc.)
- Créer et configurer le projet Firebase (Firestore, Auth, Storage, FCM)
- Configurer `src/services/firebase.js` (client Firebase)
- Créer le fichier `.env.example`
- Gérer les branches Git, faire les merges vers `develop`
- S'assurer que tout le monde peut lancer le projet

**Fichiers principaux :**
```
src/services/firebase.js
.env.example
package.json
android/google-services.json (template)
ios/GoogleService-Info.plist (template)
```

---

### 👤 Membre 2 — Authentification

**Branche :** `feature/auth`

**Tâches :**
- Écrans Login et Register
- Connexion email/mot de passe avec Firebase Auth
- Connexion Google (OAuth)
- Gestion de la session (persistance)
- Hook `useAuth.js`
- Redirection vers le feed si déjà connecté

**Fichiers principaux :**
```
src/screens/Auth/LoginScreen.jsx
src/screens/Auth/RegisterScreen.jsx
src/components/auth/
src/hooks/useAuth.js
src/services/authService.js
src/store/authStore.js
```

---

### 👤 Membre 3 — Feed Vidéo (For You Page)

**Branche :** `feature/video-feed`

**Tâches :**
- Défilement vertical de vidéos (FlashList)
- Lecture automatique / Pause au tap
- Récupération des vidéos depuis Firestore
- Affichage des infos (description, hashtags, auteur)
- Hook `useFeed.js`

**Fichiers principaux :**
```
src/screens/Feed/FeedScreen.jsx
src/components/feed/VideoCard.jsx
src/components/feed/VideoPlayer.jsx
src/components/feed/FeedList.jsx
src/hooks/useFeed.js
src/services/videoService.js
```

---

### 👤 Membre 4 — Upload & Édition Vidéo

**Branche :** `feature/video-upload`

**Tâches :**
- Accès caméra et galerie (react-native-image-picker)
- Enregistrement de vidéo
- Upload vers Firebase Storage
- Formulaire : description, hashtags, musique
- Publication dans Firestore

**Fichiers principaux :**
```
src/screens/Upload/UploadScreen.jsx
src/components/upload/
src/services/videoService.js (uploadVideo)
```

---

### 👤 Membre 5 — Profil Utilisateur

**Branche :** `feature/profile`

**Tâches :**
- Page profil (avatar, bio, stats, vidéos)
- Modifier son propre profil
- Grille de vidéos publiées
- Vidéos likées

**Fichiers principaux :**
```
src/screens/Profile/ProfileScreen.jsx
src/components/profile/ProfileHeader.jsx
src/components/profile/VideoGrid.jsx
src/services/userService.js
```

---

### 👤 Membre 6 — Social (Likes, Commentaires, Partages)

**Branche :** `feature/social`

**Tâches :**
- Liker / Unliker une vidéo
- Section commentaires (sheet modal)
- Partager une vidéo
- Suivre / Ne plus suivre un utilisateur
- Mise à jour des compteurs Firestore

**Fichiers principaux :**
```
src/components/social/LikeButton.jsx
src/components/social/CommentSheet.jsx
src/components/social/ShareButton.jsx
src/services/socialService.js
```

---

### 👤 Membre 7 — Recherche & Découverte

**Branche :** `feature/search`

**Tâches :**
- Barre de recherche (utilisateurs, hashtags, sons)
- Page Découverte avec tendances
- Résultats filtrés et affichage
- Hook `useSearch.js`

**Fichiers principaux :**
```
src/screens/Search/SearchScreen.jsx
src/components/search/SearchBar.jsx
src/components/search/ResultsList.jsx
src/hooks/useSearch.js
src/services/searchService.js
```

---

### 👤 Membre 8 — Notifications

**Branche :** `feature/notifications`

**Tâches :**
- Notifications push avec Firebase Cloud Messaging (FCM)
- Centre de notifications in-app
- Types : nouveau follower, like, commentaire
- Marquer comme lu

**Fichiers principaux :**
```
src/screens/Notifications/NotificationsScreen.jsx
src/components/notifications/NotificationItem.jsx
src/services/notificationService.js
```

---

## 🚀 Guide de démarrage

> ⚠️ À lire attentivement par chaque membre avant de commencer à coder.

### Étape 1 — Cloner le dépôt

```bash
git clone https://github.com/joyces20/myAppTiktok.git
cd myAppTiktok
```

### Étape 2 — Installer les dépendances

```bash
npm install
```

### Étape 3 — Configurer les variables d'environnement

```bash
cp .env.example .env
# Remplis .env avec les vraies valeurs Firebase
```

### Étape 4 — Lancer l'application

```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

### Étape 5 — Se mettre sur sa branche

```bash
git checkout develop
git pull origin develop
git checkout feature/MA-BRANCHE
```

---

## 🌿 Conventions Git

### Nommage des branches

```
feature/auth
feature/video-feed
feature/video-upload
feature/profile
feature/social
feature/search
feature/notifications
feature/setup
```

### Messages de commit

```
feat: ajouter l'écran de connexion
fix: corriger le bug de lecture vidéo
style: améliorer le design du feed
refactor: restructurer le service Firebase
docs: mettre à jour le README
```

---

## 🤝 Règles de collaboration

1. ❌ Ne jamais pusher directement sur `main` ou `develop` — toujours passer par une Pull Request
2. ✅ Une Pull Request = une fonctionnalité — ne pas mélanger plusieurs sujets
3. ✅ Toujours faire `git pull origin develop` avant de commencer à coder
4. ✅ Au moins 1 autre membre relit avant de merger une PR
5. ❌ Ne jamais committer le fichier `.env` — il est dans `.gitignore`
6. ✅ Nommer les composants en PascalCase : `VideoCard.jsx`, `ProfileHeader.jsx`
7. ✅ Nommer les fonctions/variables en camelCase : `fetchVideos`, `isPlaying`
8. ✅ Tester sur Android ET iOS avant d'ouvrir une Pull Request
9. ✅ Commenter le code quand la logique est complexe

---

## 🔐 Variables d'environnement

| Variable | Description |
|---|---|
| `FIREBASE_API_KEY` | Clé API de ton projet Firebase |
| `FIREBASE_AUTH_DOMAIN` | Domaine d'authentification Firebase |
| `FIREBASE_PROJECT_ID` | ID du projet Firebase |
| `FIREBASE_STORAGE_BUCKET` | Bucket Firebase Storage |
| `FIREBASE_MESSAGING_SENDER_ID` | Sender ID pour FCM |
| `FIREBASE_APP_ID` | App ID Firebase |

> 🔒 Le fichier `.env` ne doit **jamais** être commité. Seul `.env.example` (sans vraies valeurs) va sur Git.