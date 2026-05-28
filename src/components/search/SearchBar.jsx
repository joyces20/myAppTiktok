/**
 * SearchBar.jsx
 * Barre de recherche stylisée TikTok
 * Membre 7 — Recherche & Découverte | branche: feature/search
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';

const SearchBar = ({
  value,
  onChangeText,
  onSubmit,
  onClear,
  onFocus,
  onBlur,
  placeholder = 'Rechercher',
  autoFocus = false,
  showCancelButton = true,
  onCancel,
}) => {
  const cancelAnim = useRef(new Animated.Value(0)).current;
  const isFocused = useRef(false);

  // ── Animation du bouton Annuler ──────────────────────────────────────
  const animateCancel = (show) => {
    Animated.spring(cancelAnim, {
      toValue: show ? 1 : 0,
      useNativeDriver: false,
      tension: 80,
      friction: 10,
    }).start();
  };

  const cancelWidth = cancelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 64],
  });

  const cancelOpacity = cancelAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const handleFocus = () => {
    isFocused.current = true;
    animateCancel(showCancelButton);
    onFocus?.();
  };

  const handleBlur = () => {
    isFocused.current = false;
    if (!value) animateCancel(false);
    onBlur?.();
  };

  // Si value change et qu'il y a du texte, assure que le bouton est visible
  useEffect(() => {
    if (value && showCancelButton) animateCancel(true);
    if (!value && !isFocused.current) animateCancel(false);
  }, [value]);

  return (
    <View style={styles.container}>
      {/* Input wrapper */}
      <View style={styles.inputWrapper}>
        {/* Icône loupe */}
        <Text style={styles.searchIcon}>🔍</Text>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#888"
          returnKeyType="search"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never" // On gère manuellement
        />

        {/* Bouton clear (×) si texte présent */}
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <View style={styles.clearCircle}>
              <Text style={styles.clearIcon}>×</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Bouton Annuler animé */}
      {showCancelButton && (
        <Animated.View style={[styles.cancelWrapper, { width: cancelWidth, opacity: cancelOpacity }]}>
          <TouchableOpacity
            onPress={() => {
              animateCancel(false);
              onCancel?.();
            }}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#000',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 44,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    paddingVertical: 0, // Fix Android
  },
  clearBtn: {
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  cancelWrapper: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cancelBtn: {
    paddingLeft: 10,
  },
  cancelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SearchBar;
