// src/components/auth/PrivateRoute.jsx
// Protège les écrans qui nécessitent d'être connecté.
// Utilisé par le Membre 3 (navigation) dans le navigateur principal.
//
// Utilisation dans le navigateur :
//
//   import PrivateRoute from '../components/auth/PrivateRoute';
//
//   // Entourer les écrans protégés :
//   <Stack.Screen name="Feed" component={PrivateRoute(FeedScreen)} />
//
// Ou utiliser directement dans le navigateur avec une logique de redirection.

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

// HOC (Higher Order Component) qui enveloppe un écran
export function withAuth(WrappedScreen) {
  return function AuthGuard(props) {
    const { isLoggedIn, initialized } = useAuth();

    // Attendre la vérification de session
    if (!initialized) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator color="#FE2C55" size="large" />
        </View>
      );
    }

    // Non connecté → rediriger vers Login
    if (!isLoggedIn) {
      props.navigation.replace('Login');
      return null;
    }

    return <WrappedScreen {...props} />;
  };
}

// Hook utilitaire pour vérifier l'état auth dans les navigateurs
export function useAuthGuard() {
  const { isLoggedIn, initialized } = useAuth();
  return { isLoggedIn, initialized };
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
