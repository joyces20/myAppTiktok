/**
 * SearchScreen.jsx
 * Écran principal Recherche & Découverte
 * Membre 7 — Recherche & Découverte | branche: feature/search
 *
 * Layout :
 *  - Mode repos  → Page Découverte (tendances + grille vidéos)
 *  - Mode focus  → Suggestions récentes
 *  - Mode résultats → Onglets filtres + ResultsList
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

import SearchBar from '../components/search/SearchBar';
import ResultsList from '../components/search/ResultsList';
import useSearch from '../hooks/useSearch';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const VIDEO_TILE_SIZE = (width - 3) / COLUMN_COUNT; // 1px gap entre tuiles

// ─────────────────────────────────────────────
// Onglets de filtre
// ─────────────────────────────────────────────
const FILTERS = [
  { key: 'all', label: 'Tout' },
  { key: 'users', label: 'Comptes' },
  { key: 'hashtags', label: 'Hashtags' },
  { key: 'sounds', label: 'Sons' },
];

const FilterTabs = ({ activeFilter, onFilterChange }) => (
  <View style={styles.filterRow}>
    {FILTERS.map((f) => (
      <TouchableOpacity
        key={f.key}
        style={[styles.filterTab, activeFilter === f.key && styles.filterTabActive]}
        onPress={() => onFilterChange(f.key)}
        activeOpacity={0.8}
      >
        <Text style={[styles.filterLabel, activeFilter === f.key && styles.filterLabelActive]}>
          {f.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ─────────────────────────────────────────────
// Carte tendance hashtag
// ─────────────────────────────────────────────
const TrendingCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.trendCard} onPress={() => onPress(item)} activeOpacity={0.7}>
    <Text style={styles.trendRank}>#{item.rank ?? '–'}</Text>
    <View style={styles.trendInfo}>
      <Text style={styles.trendTag}>#{item.tag}</Text>
      <Text style={styles.trendCount}>{formatCount(item.videoCount)} vidéos</Text>
    </View>
    <Text style={styles.trendArrow}>›</Text>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────
// Tuile vidéo (grille découverte)
// ─────────────────────────────────────────────
const VideoTile = ({ item, onPress }) => (
  <TouchableOpacity
    style={[styles.videoTile, { width: VIDEO_TILE_SIZE, height: VIDEO_TILE_SIZE * 1.4 }]}
    onPress={() => onPress(item)}
    activeOpacity={0.85}
  >
    <Image
      source={item.thumbnailURL ? { uri: item.thumbnailURL } : require('../assets/default-thumb.png')}
      style={styles.videoThumb}
      resizeMode="cover"
    />
    {/* Overlay likes */}
    <View style={styles.videoOverlay}>
      <Text style={styles.videoLikes}>❤️ {formatCount(item.likeCount)}</Text>
    </View>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────
// Recherches récentes
// ─────────────────────────────────────────────
const RecentSearches = ({ items, onSelect, onDelete }) => {
  if (!items || items.length === 0) return null;
  return (
    <View style={styles.recentSection}>
      <Text style={styles.recentTitle}>Recherches récentes</Text>
      {items.map((s) => (
        <View key={s.query + s.timestamp?.seconds} style={styles.recentRow}>
          <TouchableOpacity style={styles.recentText} onPress={() => onSelect(s.query)}>
            <Text style={styles.recentIcon}>🕐</Text>
            <Text style={styles.recentQuery}>{s.query}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(s.query)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.recentDelete}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────
// Écran principal
// ─────────────────────────────────────────────
const SearchScreen = ({ navigation }) => {
  const [isFocused, setIsFocused] = useState(false);

  const {
    query,
    activeFilter,
    results,
    trending,
    discoveryVideos,
    recentSearches,
    isLoading,
    isLoadingDiscovery,
    error,
    hasSearched,
    totalResults,
    handleQueryChange,
    clearSearch,
    submitSearch,
    handleFilterChange,
    handleDeleteRecent,
    selectSuggestion,
    loadInitialData,
  } = useSearch();

  // ── Navigation ────────────────────────────────────────────────────────
  const handleUserPress = useCallback(
    (user) => navigation.navigate('UserProfile', { userId: user.id }),
    [navigation]
  );

  const handleHashtagPress = useCallback(
    (hashtag) => navigation.navigate('HashtagFeed', { tag: hashtag.tag }),
    [navigation]
  );

  const handleSoundPress = useCallback(
    (sound) => navigation.navigate('SoundDetail', { soundId: sound.id }),
    [navigation]
  );

  const handleVideoPress = useCallback(
    (video) => navigation.navigate('VideoFeed', { videoId: video.id }),
    [navigation]
  );

  const handleTrendingPress = useCallback(
    (hashtag) => {
      selectSuggestion('#' + hashtag.tag);
      setIsFocused(false);
    },
    [selectSuggestion]
  );

  // ── Annuler ──────────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    clearSearch();
    setIsFocused(false);
  }, [clearSearch]);

  const handleSuggestionSelect = useCallback(
    (text) => {
      selectSuggestion(text);
      setIsFocused(false);
    },
    [selectSuggestion]
  );

  // ── Décider quel contenu afficher ────────────────────────────────────
  const showResults = hasSearched || (query.length > 0 && isLoading);
  const showRecents = isFocused && !query && recentSearches.length > 0;
  const showDiscovery = !isFocused && !query;

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Barre de recherche ── */}
      <SearchBar
        value={query}
        onChangeText={handleQueryChange}
        onSubmit={submitSearch}
        onClear={clearSearch}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onCancel={handleCancel}
        placeholder="Comptes, hashtags, sons…"
        showCancelButton={isFocused || query.length > 0}
      />

      {/* ── Onglets filtre (visible seulement si résultats) ── */}
      {showResults && (
        <FilterTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} />
      )}

      {/* ── Erreur ── */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ── Résultats ── */}
      {showResults && (
        <ResultsList
          results={results}
          activeFilter={activeFilter}
          isLoading={isLoading}
          hasSearched={hasSearched}
          query={query}
          onUserPress={handleUserPress}
          onHashtagPress={handleHashtagPress}
          onSoundPress={handleSoundPress}
        />
      )}

      {/* ── Recherches récentes (focus vide) ── */}
      {showRecents && (
        <ScrollView keyboardShouldPersistTaps="handled">
          <RecentSearches
            items={recentSearches}
            onSelect={handleSuggestionSelect}
            onDelete={handleDeleteRecent}
          />
        </ScrollView>
      )}

      {/* ── Page Découverte ── */}
      {showDiscovery && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingDiscovery}
              onRefresh={loadInitialData}
              tintColor="#fe2c55"
            />
          }
        >
          {/* Tendances */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Tendances</Text>
            {isLoadingDiscovery ? (
              <ActivityIndicator color="#fe2c55" style={{ marginTop: 16 }} />
            ) : (
              trending.map((item, index) => (
                <TrendingCard
                  key={item.id}
                  item={{ ...item, rank: index + 1 }}
                  onPress={handleTrendingPress}
                />
              ))
            )}
          </View>

          {/* Grille vidéos découverte */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Découverte</Text>
          </View>

          {isLoadingDiscovery ? (
            <ActivityIndicator color="#fe2c55" style={{ marginBottom: 32 }} />
          ) : (
            <View style={styles.videoGrid}>
              {discoveryVideos.map((video) => (
                <VideoTile key={video.id} item={video} onPress={handleVideoPress} />
              ))}
            </View>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
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
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Filtres
  filterRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    paddingHorizontal: 12,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: '#fe2c55',
  },
  filterLabel: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  filterLabelActive: {
    color: '#fff',
    fontWeight: '700',
  },

  // Erreur
  errorBanner: {
    backgroundColor: '#3a0010',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorText: {
    color: '#fe2c55',
    fontSize: 13,
  },

  // Sections découverte
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },

  // Trending card
  trendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  trendRank: {
    color: '#fe2c55',
    fontSize: 18,
    fontWeight: '900',
    width: 36,
  },
  trendInfo: {
    flex: 1,
    marginLeft: 8,
  },
  trendTag: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  trendCount: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  trendArrow: {
    color: '#555',
    fontSize: 22,
    fontWeight: '300',
  },

  // Grille vidéos
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
    paddingHorizontal: 0,
  },
  videoTile: {
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  videoThumb: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
  },
  videoLikes: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Recherches récentes
  recentSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  recentTitle: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  recentText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentIcon: {
    fontSize: 14,
    marginRight: 10,
  },
  recentQuery: {
    color: '#fff',
    fontSize: 15,
  },
  recentDelete: {
    color: '#555',
    fontSize: 22,
    fontWeight: '300',
    paddingLeft: 12,
  },
});

export default SearchScreen;
