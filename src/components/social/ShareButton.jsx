// src/components/social/ShareButton.jsx
// Membre 6 — Social
// Bouton de partage qui ouvre le menu natif du système.

import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { shareVideo } from '../../services/socialService';

export default function ShareButton({ videoUrl, description }) {
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    if (loading) return;
    setLoading(true);
    await shareVideo(videoUrl, description);
    setLoading(false);
  }

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={handleShare}
      activeOpacity={0.7}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Text style={styles.icon}>➦</Text>
          <Text style={styles.label}>Partager</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  icon: {
    fontSize: 26,
    color: '#fff',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
