# Membre 2 — Authentification
**myAppTiktok · feature/auth · React Native CLI + Firebase**

---

## Fichiers créés

```
src/
├── services/
│   └── authService.js           Toutes les fonctions Firebase Auth
├── store/
│   └── authStore.js             État global Zustand (user, profile, loading)
├── hooks/
│   └── useAuth.js               Hook principal utilisé par les composants
├── components/
│   └── auth/
│       └── PrivateRoute.jsx     Protection des écrans connectés (HOC)
└── screens/
    └── Auth/
        ├── LoginScreen.jsx      Écran de connexion
        └── RegisterScreen.jsx   Écran d'inscription
```

---

## Flux de connexion

```
Utilisateur tape email + password
        ↓
LoginScreen appelle useAuth().signIn()
        ↓
useAuth.js appelle authService.signIn()
        ↓
authService.js appelle firebase auth().signInWithEmailAndPassword()
        ↓
Firebase retourne l'utilisateur
        ↓
useAuth.js met à jour authStore (setUser)
        ↓
onAuthStateChanged se déclenche → profil Firestore chargé
        ↓
Navigation vers le Feed (gérée par Membre 3)
```

---

## Utilisation par les autres membres

### Savoir si quelqu'un est connecté

```jsx
import { useAuth } from '../hooks/useAuth';

function MonComposant() {
  const { user, isLoggedIn, profile } = useAuth();

  if (!isLoggedIn) return null;
  return <Text>Bonjour {profile?.username}</Text>;
}
```

### Déconnecter l'utilisateur

```jsx
const { signOut } = useAuth();
await signOut();
```

### Protéger un écran (Membre 3 — Navigation)

```jsx
import { useAuthGuard } from '../components/auth/PrivateRoute';

// Dans le navigateur principal, vérifier l'état avant d'afficher le feed :
function RootNavigator() {
  const { isLoggedIn, initialized } = useAuthGuard();

  if (!initialized) return <SplashScreen />;

  return isLoggedIn ? <AppNavigator /> : <AuthNavigator />;
}
```

---

## Installation des dépendances

```bash
npm install @react-native-firebase/app
npm install @react-native-firebase/auth
npm install @react-native-firebase/firestore
npm install @react-native-google-signin/google-signin
npm install zustand
```

---

## Variables d'environnement nécessaires

Demander au Membre 1 les valeurs pour le fichier `.env` :

```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
GOOGLE_WEB_CLIENT_ID=
```

---

## Lancer le projet

```bash
git clone https://github.com/joyces20/myAppTiktok.git
cd myAppTiktok
git checkout develop && git pull origin develop
git checkout feature/auth
npm install
npx react-native run-android
```

---

## Tests manuels à effectuer

| Scénario | Résultat attendu |
|----------|-----------------|
| Inscription avec email valide | Compte créé, redirige vers Feed |
| Inscription email déjà utilisé | Message d'erreur clair |
| Inscription mots de passe différents | Bloqué avant l'appel Firebase |
| Connexion avec bonnes informations | Redirige vers Feed |
| Connexion avec mauvais mot de passe | Message d'erreur clair |
| Connexion Google | Redirection OAuth, profil créé si premier login |
| Rafraîchir l'app en étant connecté | Session conservée, pas renvoyé sur Login |
| Déconnexion | Redirige vers Login |

---

## Questions fréquentes

**Q : Pourquoi séparer authService.js et useAuth.js ?**
R : `authService.js` contient uniquement les appels Firebase — il peut être testé indépendamment de React. `useAuth.js` fait le pont entre Firebase et l'état React (Zustand). Cette séparation rend le code plus maintenable.

**Q : Pourquoi `initialized` en plus de `loading` ?**
R : `loading` indique qu'une action est en cours (connexion en train de se faire). `initialized` indique que la vérification initiale de session est terminée au démarrage — le navigateur principal attend ça avant d'afficher quoi que ce soit.

**Q : Que faire si Firebase n'est pas configuré ?**
R : Demander les fichiers `google-services.json` (Android) et `GoogleService-Info.plist` (iOS) au Membre 1, et les placer aux bons endroits selon la documentation Firebase React Native.

---

*Membre 2 — myAppTiktok | ICT4D | Université de Yaoundé 1*
