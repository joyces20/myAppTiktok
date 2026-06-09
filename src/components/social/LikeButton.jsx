// src/components/social/LikeButton.jsx
// Membre 6 — Social
//
// Bouton de like avec animation de cœur.
// Gère l'état optimiste : l'UI se met à jour immédiatement,
// sans attendre la réponse Firestore.

import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  Animated,
  StyleSheet,
  View,
} from 'react-native';
import { toggleLike } from '../../services/socialService';

export default function LikeButton({ videoId, userId, initialLiked, initialCount }) {
  const [liked,  setLiked]  = useState(initialLiked  ?? false);
  const [count,  setCount]  = useState(initialCount  ?? 0);
  const [loading, setLoading] = useState(false);

  // Animation du cœur au clic
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  function animateHeart() {
    scale.setValue(0.5);
    opacity.setValue(1);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1.3,
        tension: 200,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }

  async function handlePress() {
    if (loading) return;

    // Mise à jour optimiste
    const newLiked = !liked;
    setLiked(newLiked);
    setCount(c => newLiked ? c + 1 : Math.max(0, c - 1));

    if (newLiked) animateHeart();

    // Appel Firestore
    setLoading(true);
    try {
      await toggleLike(videoId, userId);
    } catch {
      // Rollback si erreur
      setLiked(!newLiked);
      setCount(c => newLiked ? Math.max(0, c - 1) : c + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      {/* Cœur flottant (animation) */}
      <Animated.Text
        style={[
          styles.floatingHeart,
          { transform: [{ scale }], opacity },
        ]}
      >
        ♥
      </Animated.Text>

      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={styles.btn}
        disabled={loading}
      >
        <Text style={[styles.icon, liked && styles.iconLiked]}>
          {liked ? '♥' : '♡'}
        </Text>
        <Text style={[styles.count, liked && styles.countLiked]}>
          {formatCount(count)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  floatingHeart: {
    position: 'absolute',
    top: -20,
    fontSize: 28,
    color: '#FE2C55',
    pointerEvents: 'none',
  },
  btn: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  icon: {
    fontSize: 30,
    color: '#fff',
  },
  iconLiked: {
    color: '#FE2C55',
  },
  count: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  countLiked: {
    color: '#FE2C55',
  },
});
