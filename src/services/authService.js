// src/services/authService.js
// Toutes les interactions Firebase Auth passent par ici.
// Les composants n'appellent jamais Firebase directement.

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configuration Google Sign-In (appeler une fois au démarrage de l'app)
export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
  });
}

// ─── Inscription ──────────────────────────────────────────────────────────────
// Crée un compte Firebase Auth + document dans la collection users
export async function signUp(email, password, username) {
  const { user } = await auth().createUserWithEmailAndPassword(email, password);

  // Mettre à jour le displayName dans Firebase Auth
  await user.updateProfile({ displayName: username });

  // Créer le profil dans Firestore
  await firestore().collection('users').doc(user.uid).set({
    uid:              user.uid,
    username:         username.trim().toLowerCase(),
    full_name:        username.trim(),
    avatar_url:       null,
    bio:              '',
    followers_count:  0,
    following_count:  0,
    created_at:       firestore.FieldValue.serverTimestamp(),
  });

  return user;
}

// ─── Connexion email / mot de passe ───────────────────────────────────────────
export async function signIn(email, password) {
  const { user } = await auth().signInWithEmailAndPassword(email, password);
  return user;
}

// ─── Connexion Google (OAuth) ─────────────────────────────────────────────────
export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices();
  const signInResult = await GoogleSignin.signIn();

  const idToken = signInResult.data?.idToken ?? signInResult.idToken;
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  const { user } = await auth().signInWithCredential(googleCredential);

  // Créer le profil Firestore seulement si c'est la première connexion
  const userDoc = await firestore().collection('users').doc(user.uid).get();
  if (!userDoc.exists) {
    await firestore().collection('users').doc(user.uid).set({
      uid:              user.uid,
      username:         user.email.split('@')[0].toLowerCase(),
      full_name:        user.displayName ?? '',
      avatar_url:       user.photoURL ?? null,
      bio:              '',
      followers_count:  0,
      following_count:  0,
      created_at:       firestore.FieldValue.serverTimestamp(),
    });
  }

  return user;
}

// ─── Déconnexion ──────────────────────────────────────────────────────────────
export async function signOut() {
  // Déconnecter Google si l'utilisateur s'était connecté avec Google
  const isGoogleUser = await GoogleSignin.isSignedIn().catch(() => false);
  if (isGoogleUser) {
    await GoogleSignin.signOut().catch(() => {});
  }
  await auth().signOut();
}

// ─── Récupérer l'utilisateur actuel ──────────────────────────────────────────
export function getCurrentUser() {
  return auth().currentUser;
}

// ─── Écouter les changements d'état auth ─────────────────────────────────────
// Retourne la fonction de désabonnement à appeler dans useEffect cleanup
export function onAuthStateChanged(callback) {
  return auth().onAuthStateChanged(callback);
}
