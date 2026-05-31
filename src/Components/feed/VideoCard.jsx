import { firestore } from './firebase';

/**
 * Récupère les données d'une vidéo par son ID
 * @param {string} videoId
 * @returns {Promise<object|null>}
 */
export const getVideoById = async videoId => {
  try {
    const doc = await firestore().collection('videos').doc(videoId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  } catch (err) {
    console.error('[videoService] getVideoById error:', err);
    throw err;
  }
};

/**
 * Récupère les vidéos d'un utilisateur
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getVideosByUser = async userId => {
  try {
    const snapshot = await firestore()
      .collection('videos')
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('[videoService] getVideosByUser error:', err);
    throw err;
  }
};

/**
 * Incrémente le compteur de vues d'une vidéo
 * @param {string} videoId
 */
export const incrementVideoViews = async videoId => {
  try {
    await firestore()
      .collection('videos')
      .doc(videoId)
      .update({
        views_count: firestore.FieldValue.increment(1),
      });
  } catch (err) {
    console.error('[videoService] incrementVideoViews error:', err);
  }
};