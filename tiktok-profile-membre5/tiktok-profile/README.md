# Tâche Membre 5 — Page Profil Utilisateur

## Structure des fichiers

```
src/
├── App.jsx                          ← Point d'entrée (importer ProfilePage)
├── pages/
│   ├── ProfilePage.jsx              ← Page principale du profil
│   └── ProfilePage.css
└── components/
    ├── ProfileStats.jsx             ← Statistiques (abonnements, abonnés, j'aimes)
    ├── ProfileStats.css
    ├── ProfileActions.jsx           ← Boutons (S'abonner, Message, Partager)
    ├── ProfileActions.css
    ├── ProfileTabs.jsx              ← Onglets (Vidéos / Aimées / Favoris)
    ├── ProfileTabs.css
    ├── VideoGrid.jsx                ← Grille des vidéos
    └── VideoGrid.css
```

## Fonctionnalités implémentées

- ✅ Avatar avec badge de vérification
- ✅ Nom d'utilisateur et handle (@)
- ✅ Stats : abonnements, abonnés, j'aimes (formatage automatique : 24800 → 24,8k)
- ✅ Bio multiligne
- ✅ Lien externe cliquable
- ✅ Bouton S'abonner / Abonné(e) avec toggle (compteur mis à jour)
- ✅ Boutons Message et Partager
- ✅ 3 onglets : Vidéos / Aimées / Favoris
- ✅ Grille de vidéos 3 colonnes (ratio 9:16) avec effet hover
- ✅ Top bar sticky + tabs sticky au scroll

## Intégration dans le projet

1. Copier le dossier `src/` dans votre projet existant
2. Dans votre fichier de routing, ajouter :

```jsx
import ProfilePage from "./pages/ProfilePage";

// Exemple avec React Router
<Route path="/profile/:userId" element={<ProfilePage />} />
```

3. Pour passer les données dynamiques, modifier le fichier `ProfilePage.jsx` :
   - Remplacer l'objet `USER` par les props reçues depuis le router ou un contexte
   - Connecter les vidéos à votre API backend

## Personnalisation rapide

Pour changer les données du profil, modifier l'objet `USER` dans `ProfilePage.jsx` :

```js
const USER = {
  name: "Votre Nom",
  handle: "@votre_handle",
  initials: "VN",
  bio: "Votre bio ici",
  link: "votresite.com",
  verified: true,
  following: 0,
  followers: 0,
  likes: 0,
};
```
