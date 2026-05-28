/**
 * searchService.js
 * Service de recherche connecté à Firebase Firestore
 * Membre 7 — Recherche & Découverte | branche: feature/search
 */

import firestore from '@react-native-firebase/firestore';

// ─────────────────────────────────────────────
// Recherche d'utilisateurs par nom ou username
// ─────────────────────────────────────────────
export const searchUsers = async (query) => {
  if (!query || query.trim().length === 0) return [];

  const q = query.toLowerCase().trim();

  try {
    // Firebase ne supporte pas le LIKE natif → on utilise range query sur username
    const snapshot = await firestore()
      .collection('users')
      .where('usernameLower', '>=', q)
      .where('usernameLower', '<=', q + '\uf8ff')
      .limit(20)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      type: 'user',
      ...doc.data(),
    }));
  } catch (error) {
    console.error('[searchService] searchUsers error:', error);
    return [];
  }
};

// ─────────────────────────────────────────────
// Recherche de hashtags
// ─────────────────────────────────────────────
export const searchHashtags = async (query) => {
  if (!query || query.trim().length === 0) return [];

  const q = query.replace(/^#/, '').toLowerCase().trim();

  try {
    const snapshot = await firestore()
      .collection('hashtags')
      .where('tag', '>=', q)
      .where('tag', '<=', q + '\uf8ff')
      .orderBy('tag')
      .orderBy('videoCount', 'desc')
      .limit(15)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      type: 'hashtag',
      ...doc.data(),
    }));
  } catch (error) {
    console.error('[searchService] searchHashtags error:', error);
    return [];
  }
};

// ─────────────────────────────────────────────
// Recherche de sons / musiques
// ─────────────────────────────────────────────
export const searchSounds = async (query) => {
  if (!query || query.trim().length === 0) return [];

  const q = query.toLowerCase().trim();

  try {
    const snapshot = await firestore()
      .collection('sounds')
      .where('titleLower', '>=', q)
      .where('titleLower', '<=', q + '\uf8ff')
      .limit(15)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      type: 'sound',
      ...doc.data(),
    }));
  } catch (error) {
    console.error('[searchService] searchSounds error:', error);
    return [];
  }
};

// ─────────────────────────────────────────────
// Recherche globale combinée (users + hashtags + sons)
// ─────────────────────────────────────────────
export const searchAll = async (query) => {
  if (!query || query.trim().length === 0) return { users: [], hashtags: [], sounds: [] };

  const [users, hashtags, sounds] = await Promise.all([
    searchUsers(query),
    searchHashtags(query),
    searchSounds(query),
  ]);

  return { users, hashtags, sounds };
};

// ─────────────────────────────────────────────
// Tendances — top hashtags par nombre de vidéos
// ─────────────────────────────────────────────
export const fetchTrending = async () => {
  try {
    const snapshot = await firestore()
      .collection('hashtags')
      .orderBy('videoCount', 'desc')
      .limit(10)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      type: 'hashtag',
      ...doc.data(),
    }));
  } catch (error) {
    console.error('[searchService] fetchTrending error:', error);
    return [];
  }
};

// ─────────────────────────────────────────────
// Vidéos suggérées pour la page Découverte
// ─────────────────────────────────────────────
export const fetchDiscoveryVideos = async () => {
  try {
    const snapshot = await firestore()
      .collection('videos')
      .where('isPublic', '==', true)
      .orderBy('likeCount', 'desc')
      .limit(30)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      type: 'video',
      ...doc.data(),
    }));
  } catch (error) {
    console.error('[searchService] fetchDiscoveryVideos error:', error);
    return [];
  }
};

// ─────────────────────────────────────────────
// Sauvegarder une recherche récente (Firestore user doc)
// ─────────────────────────────────────────────
export const saveRecentSearch = async (userId, query) => {
  if (!userId || !query) return;
  try {
    const ref = firestore().collection('users').doc(userId);
    await ref.update({
      recentSearches: firestore.FieldValue.arrayUnion({
        query,
        timestamp: firestore.Timestamp.now(),
      }),
    });
  } catch (error) {
    console.error('[searchService] saveRecentSearch error:', error);
  }
};

// ─────────────────────────────────────────────
// Récupérer les recherches récentes d'un user
// ─────────────────────────────────────────────
export const getRecentSearches = async (userId) => {
  if (!userId) return [];
  try {
    const doc = await firestore().collection('users').doc(userId).get();
    const data = doc.data();
    if (!data?.recentSearches) return [];

    // Trier par timestamp décroissant + limiter à 10
    return [...data.recentSearches]
      .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)
      .slice(0, 10);
  } catch (error) {
    console.error('[searchService] getRecentSearches error:', error);
    return [];
  }
};

// ─────────────────────────────────────────────
// Supprimer une recherche récente
// ─────────────────────────────────────────────
export const deleteRecentSearch = async (userId, queryToDelete) => {
  if (!userId) return;
  try {
    const doc = await firestore().collection('users').doc(userId).get();
    const data = doc.data();
    if (!data?.recentSearches) return;

    const updated = data.recentSearches.filter((s) => s.query !== queryToDelete);
    await firestore().collection('users').doc(userId).update({ recentSearches: updated });
  } catch (error) {
    console.error('[searchService] deleteRecentSearch error:', error);
  }
};
