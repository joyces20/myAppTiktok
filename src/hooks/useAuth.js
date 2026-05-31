// src/hooks/useAuth.js
// Hook principal d'authentification.
// C'est le seul endroit que les composants utilisent pour tout ce qui concerne l'auth.

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  signIn      as _signIn,
  signUp      as _signUp,
  signOut     as _signOut,
  signInWithGoogle as _signInWithGoogle,
  onAuthStateChanged,
  getCurrentUser,
} from '../services/authService';
import firestore from '@react-native-firebase/firestore';

export function useAuth() {
  const user        = useAuthStore(s => s.user);
  const profile     = useAuthStore(s => s.profile);
  const loading     = useAuthStore(s => s.loading);
  const initialized = useAuthStore(s => s.initialized);

  const setUser        = useAuthStore(s => s.setUser);
  const setProfile     = useAuthStore(s => s.setProfile);
  const setLoading     = useAuthStore(s => s.setLoading);
  const setInitialized = useAuthStore(s => s.setInitialized);
  const reset          = useAuthStore(s => s.reset);

  // Écouter Firebase Auth au montage de l'app
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Récupérer le profil Firestore
        try {
          const doc = await firestore()
            .collection('users')
            .doc(firebaseUser.uid)
            .get();
          setProfile(doc.exists ? doc.data() : null);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setInitialized(true);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ─── Actions ────────────────────────────────────────────────────────────────

  async function signIn(email, password) {
    setLoading(true);
    try {
      const u = await _signIn(email, password);
      setUser(u);
      return { error: null };
    } catch (err) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email, password, username) {
    setLoading(true);
    try {
      const u = await _signUp(email, password, username);
      setUser(u);
      return { error: null };
    } catch (err) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await _signOut();
    reset();
  }

  async function signInWithGoogle() {
    setLoading(true);
    try {
      const u = await _signInWithGoogle();
      setUser(u);
      return { error: null };
    } catch (err) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  }

  return {
    user,
    profile,
    loading,
    initialized,
    isLoggedIn: !!user,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };
}
