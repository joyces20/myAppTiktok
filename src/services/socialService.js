// src/services/socialService.js
// Membre 6 — Social
//
// Toutes les interactions sociales avec Firestore sont ici :
// likes, commentaires, partages, follow/unfollow.
// Les composants n'appellent jamais Firestore directement.

import firestore from '@react-native-firebase/firestore';
import { Share } from 'react-native';

// ─── LIKES ────────────────────────────────────────────────────────────────────

/**
 * Vérifie si un utilisateur a déjà liké une vidéo.
 */
export async function isVideoLiked(videoId, userId) {
  const doc = await firestore()
    .collection('videos')
    .doc(videoId)
    .collection('likes')
    .doc(userId)
    .get();
  return doc.exists;
}

/**
 * Like ou unlike une vidéo selon l'état actuel.
 * Met à jour le compteur likes_count en transaction atomique.
 * @returns {boolean} nouvel état du like (true = liké)
 */
export async function toggleLike(videoId, userId) {
  const videoRef   = firestore().collection('videos').doc(videoId);
  const likeRef    = videoRef.collection('likes').doc(userId);

  return firestore().runTransaction(async (tx) => {
    const likeDoc  = await tx.get(likeRef);
    const videoDoc = await tx.get(videoRef);
    const current  = videoDoc.data()?.likes_count ?? 0;

    if (likeDoc.exists) {
      // Déjà liké → retirer le like
      tx.delete(likeRef);
      tx.update(videoRef, { likes_count: Math.max(0, current - 1) });
      return false;
    } else {
      // Pas encore liké → ajouter le like
      tx.set(likeRef, { user_id: userId, created_at: firestore.FieldValue.serverTimestamp() });
      tx.update(videoRef, { likes_count: current + 1 });
      return true;
    }
  });
}

// ─── COMMENTAIRES ─────────────────────────────────────────────────────────────

/**
 * Récupère les commentaires d'une vidéo, triés du plus récent au plus ancien.
 * @returns {Array} liste des commentaires
 */
export async function fetchComments(videoId) {
  const snap = await firestore()
    .collection('videos')
    .doc(videoId)
    .collection('comments')
    .orderBy('created_at', 'desc')
    .limit(50)
    .get();

  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Ajoute un commentaire sur une vidéo.
 * Met à jour le compteur comments_count.
 */
export async function addComment(videoId, userId, username, avatarUrl, content) {
  const videoRef = firestore().collection('videos').doc(videoId);

  await firestore().runTransaction(async (tx) => {
    const videoDoc = await tx.get(videoRef);
    const current  = videoDoc.data()?.comments_count ?? 0;

    const commentRef = videoRef.collection('comments').doc();
    tx.set(commentRef, {
      user_id:    userId,
      username:   username,
      avatar_url: avatarUrl ?? null,
      content:    content.trim(),
      created_at: firestore.FieldValue.serverTimestamp(),
    });

    tx.update(videoRef, { comments_count: current + 1 });
  });
}

/**
 * Supprime un commentaire (seulement si l'utilisateur en est l'auteur).
 */
export async function deleteComment(videoId, commentId, userId) {
  const commentRef = firestore()
    .collection('videos')
    .doc(videoId)
    .collection('comments')
    .doc(commentId);

  const doc = await commentRef.get();
  if (!doc.exists || doc.data().user_id !== userId) return;

  const videoRef = firestore().collection('videos').doc(videoId);

  await firestore().runTransaction(async (tx) => {
    const videoDoc = await tx.get(videoRef);
    const current  = videoDoc.data()?.comments_count ?? 0;
    tx.delete(commentRef);
    tx.update(videoRef, { comments_count: Math.max(0, current - 1) });
  });
}

// ─── PARTAGE ──────────────────────────────────────────────────────────────────

/**
 * Ouvre le menu de partage natif du système.
 * @param {string} videoUrl - URL publique de la vidéo
 * @param {string} description - Description de la vidéo
 */
export async function shareVideo(videoUrl, description = '') {
  try {
    await Share.share({
      message: description
        ? `${description}\n\n${videoUrl}`
        : videoUrl,
      url: videoUrl, // iOS seulement
    });
  } catch (err) {
    console.warn('Partage annulé :', err.message);
  }
}

// ─── FOLLOW / UNFOLLOW ────────────────────────────────────────────────────────

/**
 * Vérifie si currentUser suit targetUser.
 */
export async function isFollowing(currentUserId, targetUserId) {
  const doc = await firestore()
    .collection('follows')
    .doc(`${currentUserId}_${targetUserId}`)
    .get();
  return doc.exists;
}

/**
 * Suit ou arrête de suivre un utilisateur.
 * Met à jour les compteurs following_count et followers_count.
 * @returns {boolean} nouvel état (true = maintenant suivi)
 */
export async function toggleFollow(currentUserId, targetUserId) {
  const followId      = `${currentUserId}_${targetUserId}`;
  const followRef     = firestore().collection('follows').doc(followId);
  const currentRef    = firestore().collection('users').doc(currentUserId);
  const targetRef     = firestore().collection('users').doc(targetUserId);

  return firestore().runTransaction(async (tx) => {
    const followDoc  = await tx.get(followRef);
    const currentDoc = await tx.get(currentRef);
    const targetDoc  = await tx.get(targetRef);

    const currentFollowing = currentDoc.data()?.following_count ?? 0;
    const targetFollowers  = targetDoc.data()?.followers_count  ?? 0;

    if (followDoc.exists) {
      // Déjà suivi → unfollow
      tx.delete(followRef);
      tx.update(currentRef, { following_count: Math.max(0, currentFollowing - 1) });
      tx.update(targetRef,  { followers_count:  Math.max(0, targetFollowers - 1) });
      return false;
    } else {
      // Pas encore suivi → follow
      tx.set(followRef, {
        follower_id:  currentUserId,
        following_id: targetUserId,
        created_at:   firestore.FieldValue.serverTimestamp(),
      });
      tx.update(currentRef, { following_count: currentFollowing + 1 });
      tx.update(targetRef,  { followers_count:  targetFollowers + 1 });
      return true;
    }
  });
}
