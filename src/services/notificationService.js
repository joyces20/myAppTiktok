import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

// ─────────────────────────────────────────────
// 1. PERMISSIONS & TOKEN FCM
// ─────────────────────────────────────────────

/**
 * Demande la permission d'envoyer des notifications push.
 * Retourne true si accordée, false sinon.
 */
export const requestNotificationPermission = async () => {
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
};

/**
 * Récupère le token FCM de l'appareil.
 * Ce token identifie l'appareil pour envoyer des notifs push ciblées.
 */
export const getFCMToken = async () => {
  const token = await messaging().getToken();
  return token;
};

/**
 * Sauvegarde le token FCM dans Firestore pour l'utilisateur connecté.
 * À appeler au login ou au démarrage de l'app.
 */
export const saveFCMToken = async (userId) => {
  const token = await getFCMToken();
  await firestore().collection('users').doc(userId).update({
    fcmToken: token,
  });
};

// ─────────────────────────────────────────────
// 2. CRÉER UNE NOTIFICATION (appelé par les autres membres)
// ─────────────────────────────────────────────

/**
 * Crée une notification dans Firestore.
 * @param {string} toUserId     - Destinataire
 * @param {string} fromUserId   - Expéditeur
 * @param {string} type         - 'like' | 'comment' | 'follow'
 * @param {string} videoId      - Optionnel (pour like et comment)
 */
export const createNotification = async (toUserId, fromUserId, type, videoId = null) => {
  await firestore().collection('notifications').add({
    user_id: toUserId,
    from_user_id: fromUserId,
    type,
    video_id: videoId,
    read: false,
    created_at: firestore.FieldValue.serverTimestamp(),
  });
};

// ─────────────────────────────────────────────
// 3. RÉCUPÉRER LES NOTIFICATIONS
// ─────────────────────────────────────────────

/**
 * Récupère toutes les notifications d'un utilisateur,
 * triées de la plus récente à la plus ancienne.
 */
export const getNotifications = async (userId) => {
  const snapshot = await firestore()
    .collection('notifications')
    .where('user_id', '==', userId)
    .orderBy('created_at', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Écoute les notifications en temps réel (listener).
 * Utile pour mettre à jour l'écran automatiquement.
 * @returns {function} unsubscribe — à appeler pour stopper l'écoute
 */
export const listenToNotifications = (userId, onUpdate) => {
  const unsubscribe = firestore()
    .collection('notifications')
    .where('user_id', '==', userId)
    .orderBy('created_at', 'desc')
    .onSnapshot((snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      onUpdate(notifications);
    });

  return unsubscribe;
};

// ─────────────────────────────────────────────
// 4. MARQUER COMME LU
// ─────────────────────────────────────────────

/**
 * Marque une seule notification comme lue.
 */
export const markAsRead = async (notificationId) => {
  await firestore().collection('notifications').doc(notificationId).update({
    read: true,
  });
};

/**
 * Marque TOUTES les notifications d'un utilisateur comme lues.
 */
export const markAllAsRead = async (userId) => {
  const snapshot = await firestore()
    .collection('notifications')
    .where('user_id', '==', userId)
    .where('read', '==', false)
    .get();

  // On fait toutes les mises à jour en une seule fois (batch)
  const batch = firestore().batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });
  await batch.commit();
};

// ─────────────────────────────────────────────
// 5. ÉCOUTE DES NOTIFS PUSH (foreground)
// ─────────────────────────────────────────────

/**
 * Écoute les notifications push quand l'app est ouverte (foreground).
 * @returns {function} unsubscribe
 */
export const listenToForegroundMessages = (onMessage) => {
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    onMessage(remoteMessage);
  });
  return unsubscribe;
};