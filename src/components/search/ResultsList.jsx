/**
 * ResultsList.jsx
 * Affichage des résultats de recherche (utilisateurs, hashtags, sons)
 * Membre 7 — Recherche & Découverte | branche: feature/search
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

// ─────────────────────────────────────────────
// Item : Utilisateur
// ─────────────────────────────────────────────
const UserItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.itemRow} onPress={() => onPress(item)} activeOpacity={0.7}>
    <Image
      source={item.photoURL ? { uri: item.photoURL } : {uri:'https://via.placeholder.com/150'}}
      style={styles.avatar}
    />
    <View style={styles.itemInfo}>
      <Text style={styles.itemTitle} numberOfLines={1}>
        @{item.username || item.displayName}
      </Text>
      <Text style={styles.itemSub} numberOfLines={1}>
        {item.displayName} · {formatCount(item.followersCount)} abonnés
      </Text>
    </View>
    <Text style={styles.itemBadge}>👤</Text>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────
// Item : Hashtag
// ─────────────────────────────────────────────
const HashtagItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.itemRow} onPress={() => onPress(item)} activeOpacity={0.7}>
    <View style={styles.hashtagIconBox}>
      <Text style={styles.hashtagSymbol}>#</Text>
    </View>
    <View style={styles.itemInfo}>
      <Text style={styles.itemTitle} numberOfLines={1}>
        #{item.tag}
      </Text>
      <Text style={styles.itemSub} numberOfLines={1}>
        {formatCount(item.videoCount)} vidéos
      </Text>
    </View>
    <Text style={styles.itemBadge}>🏷️</Text>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────
// Item : Son / Musique
// ─────────────────────────────────────────────
const SoundItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.itemRow} onPress={() => onPress(item)} activeOpacity={0.7}>
    <View style={styles.soundIconBox}>
      <Text style={styles.soundNote}>♪</Text>
    </View>
    <View style={styles.itemInfo}>
      <Text style={styles.itemTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.itemSub} numberOfLines={1}>
        {item.artist} · {formatCount(item.usageCount)} vidéos
      </Text>
    </View>
    <Text style={styles.itemBadge}>🎵</Text>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────
// Séparateur de section
// ─────────────────────────────────────────────
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// ─────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────
const ResultsList = ({
  results,        // { users: [], hashtags: [], sounds: [] }
  activeFilter,   // 'all' | 'users' | 'hashtags' | 'sounds'
  isLoading,
  hasSearched,
  query,
  onUserPress,
  onHashtagPress,
  onSoundPress,
}) => {
  // Construire la liste flat avec sections si filtre = 'all'
  const listData = buildListData(results, activeFilter);

  const handlePress = useCallback(
    (item) => {
      switch (item.type) {
        case 'user':
          onUserPress?.(item);
          break;
        case 'hashtag':
          onHashtagPress?.(item);
          break;
        case 'sound':
          onSoundPress?.(item);
          break;
      }
    },
    [onUserPress, onHashtagPress, onSoundPress]
  );

  const renderItem = useCallback(
    ({ item }) => {
      if (item._sectionHeader) {
        return <SectionHeader title={item._sectionHeader} />;
      }
      switch (item.type) {
        case 'user':
          return <UserItem item={item} onPress={handlePress} />;
        case 'hashtag':
          return <HashtagItem item={item} onPress={handlePress} />;
        case 'sound':
          return <SoundItem item={item} onPress={handlePress} />;
        default:
          return null;
      }
    },
    [handlePress]
  );

  // ── Loader ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#fe2c55" size="large" />
        <Text style={styles.loadingText}>Recherche en cours…</Text>
      </View>
    );
  }

  // ── Aucun résultat ────────────────────────────────────────────────────
  if (hasSearched && listData.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noResultIcon}>🔍</Text>
        <Text style={styles.noResultTitle}>Aucun résultat</Text>
        <Text style={styles.noResultSub}>
          Aucun résultat pour « {query} »
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={listData}
      keyExtractor={(item) => item._key ?? item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const buildListData = (results, filter) => {
  if (filter === 'users') return results.users;
  if (filter === 'hashtags') return results.hashtags;
  if (filter === 'sounds') return results.sounds;

  // Mode 'all' : intercaler les section headers
  const data = [];
  if (results.users.length > 0) {
    data.push({ _key: '__header_users', _sectionHeader: 'Comptes' });
    data.push(...results.users.slice(0, 3));
  }
  if (results.hashtags.length > 0) {
    data.push({ _key: '__header_hashtags', _sectionHeader: 'Hashtags' });
    data.push(...results.hashtags.slice(0, 3));
  }
  if (results.sounds.length > 0) {
    data.push({ _key: '__header_sounds', _sectionHeader: 'Sons' });
    data.push(...results.sounds.slice(0, 3));
  }
  return data;
};

const formatCount = (n) => {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  list: {
    paddingBottom: 40,
  },
  // Section
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
  },
  sectionTitle: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Row générique
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  itemSub: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  itemBadge: {
    fontSize: 16,
    marginLeft: 8,
  },
  // Avatar user
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#222',
  },
  // Hashtag icon
  hashtagIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  hashtagSymbol: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  // Sound icon
  soundIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fe2c55',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundNote: {
    color: '#fff',
    fontSize: 22,
  },
  // États vides / loading
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    color: '#888',
    marginTop: 12,
    fontSize: 14,
  },
  noResultIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noResultTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  noResultSub: {
    color: '#888',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default ResultsList;
