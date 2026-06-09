// src/store/authStore.js
// État global d'authentification avec Zustand.
// Accessible depuis n'importe quel composant sans prop drilling.

import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user:        null,    // Objet utilisateur Firebase Auth
  profile:     null,    // Profil depuis Firestore (collection users)
  loading:     true,    // true pendant la vérification initiale de session
  initialized: false,   // true une fois la vérification initiale terminée

  setUser:        (user)        => set({ user }),
  setProfile:     (profile)     => set({ profile }),
  setLoading:     (loading)     => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  // Remet tout à zéro à la déconnexion
  reset: () => set({
    user:        null,
    profile:     null,
    loading:     false,
    initialized: true,
  }),
}));
