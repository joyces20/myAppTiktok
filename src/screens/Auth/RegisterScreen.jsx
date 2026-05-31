// src/screens/Auth/RegisterScreen.jsx
// Écran d'inscription — username, email, password

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';

function parseFirebaseError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Cette adresse email est déjà utilisée.';
    case 'auth/invalid-email':
      return 'Adresse email invalide.';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    case 'auth/network-request-failed':
      return 'Vérifiez votre connexion internet.';
    default:
      return 'Une erreur est survenue. Réessayez.';
  }
}

function validateForm(username, email, password, confirm) {
  if (!username.trim())         return 'Le nom d\'utilisateur est requis.';
  if (username.trim().length < 3) return 'Le nom d\'utilisateur doit avoir au moins 3 caractères.';
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) return 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, _ et .';
  if (!email.trim())            return 'L\'adresse email est requise.';
  if (!password)                return 'Le mot de passe est requis.';
  if (password.length < 6)      return 'Le mot de passe doit contenir au moins 6 caractères.';
  if (password !== confirm)     return 'Les mots de passe ne correspondent pas.';
  return null;
}

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();

  const [username,     setUsername]     = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [confirm,      setConfirm]      = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  async function handleRegister() {
    setError('');

    const validationError = validateForm(username, email, password, confirm);
    if (validationError) return setError(validationError);

    setLoading(true);
    const { error: err } = await signUp(email.trim(), password, username.trim());
    setLoading(false);

    if (err) setError(parseFirebaseError(err.code));
  }

  // Indicateur de force du mot de passe
  function getPasswordStrength() {
    if (!password) return null;
    if (password.length < 6)  return { label: 'Trop court', color: '#FE2C55', width: '25%' };
    if (password.length < 8)  return { label: 'Faible',     color: '#FF9500', width: '50%' };
    if (password.length < 12) return { label: 'Moyen',      color: '#FFD60A', width: '75%' };
    return                           { label: 'Fort',        color: '#30D158', width: '100%' };
  }

  const strength = getPasswordStrength();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoins des millions de créateurs</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Nom d'utilisateur */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom d'utilisateur</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputPrefix}>@</Text>
              <TextInput
                style={[styles.input, styles.inputWithPrefix]}
                placeholder="ton_pseudo"
                placeholderTextColor="#555"
                value={username}
                onChangeText={t => setUsername(t.replace(/\s/g, ''))}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Adresse email</Text>
            <TextInput
              style={styles.input}
              placeholder="ton@email.com"
              placeholderTextColor="#555"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Minimum 6 caractères"
                placeholderTextColor="#555"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="next"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(v => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>

            {/* Barre de force */}
            {strength && (
              <View style={styles.strengthBar}>
                <View style={styles.strengthTrack}>
                  <View style={[styles.strengthFill, { width: strength.width, backgroundColor: strength.color }]} />
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
              </View>
            )}
          </View>

          {/* Confirmer mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
            <TextInput
              style={[
                styles.input,
                confirm && password !== confirm && styles.inputError,
              ]}
              placeholder="Répète ton mot de passe"
              placeholderTextColor="#555"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
            {confirm && password !== confirm && (
              <Text style={styles.fieldError}>Les mots de passe ne correspondent pas</Text>
            )}
          </View>

          {/* Bouton inscription */}
          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleRegister}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnPrimaryText}>Créer mon compte</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Lien vers connexion */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 40,
  },

  // En-tête
  header: {
    paddingTop: 56,
    marginBottom: 32,
  },
  backBtn: {
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },

  // Formulaire
  form: {
    gap: 16,
  },
  errorBox: {
    backgroundColor: 'rgba(254, 44, 85, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(254, 44, 85, 0.4)',
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    color: '#FE2C55',
    fontSize: 13,
    lineHeight: 18,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1.5,
    borderColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    color: '#fff',
  },
  inputError: {
    borderColor: 'rgba(254, 44, 85, 0.6)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderWidth: 1.5,
    borderColor: '#222',
    borderRadius: 10,
    paddingLeft: 14,
  },
  inputPrefix: {
    fontSize: 15,
    color: '#555',
    marginRight: 2,
  },
  inputWithPrefix: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: 0,
    backgroundColor: 'transparent',
  },
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 16,
  },
  fieldError: {
    fontSize: 12,
    color: '#FE2C55',
    marginTop: 2,
  },

  // Barre de force
  strengthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  strengthTrack: {
    flex: 1,
    height: 3,
    backgroundColor: '#222',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 50,
  },

  // Bouton
  btnPrimary: {
    backgroundColor: '#FE2C55',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#FE2C55',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#555',
    fontSize: 14,
  },
  footerLink: {
    color: '#FE2C55',
    fontSize: 14,
    fontWeight: '700',
  },
});
