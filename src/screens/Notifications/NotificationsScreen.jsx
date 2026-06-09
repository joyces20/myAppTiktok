import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import NotificationItem from '../../components/notifications/NotificationItem';
import {
  listenToNotifications,
  markAsRead,
  markAllAsRead,
  saveFCMToken,
  listenToForegroundMessages,
  requestNotificationPermission,
} from '../../services/notificationService';

// ⚠️ Remplace par l'ID de l'utilisateur connecté
// quand le Membre 2 (Auth) aura fini son authStore
const CURRENT_USER_ID = 'userId_test';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Demande la permission et sauvegarde le token FCM
    const setup = async () => {
      const granted = await requestNotificationPermission();
      if (granted) {
        await saveFCMToken(CURRENT_USER_ID);
      }
    };
    setup();

    // 2. Écoute les notifications en temps réel
    const unsubscribeFirestore = listenToNotifications(
      CURRENT_USER_ID,
      (data) => {
        setNotifications(data);
        setLoading(false);
      }
    );

    // 3. Écoute les notifs push en foreground
    const unsubscribeFCM = listenToForegroundMessages((remoteMessage) => {
      console.log('Notification push reçue :', remoteMessage);
      // Le listener Firestore met déjà à jour la liste automatiquement
    });

    // Nettoyage quand on quitte l'écran
    return () => {
      unsubscribeFirestore();
      unsubscribeFCM();
    };
  }, []);

  // Marquer une notification comme lue au clic
  const handlePress = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  // Marquer toutes comme lues
  const handleMarkAllAsRead = async () => {
    await markAllAsRead(CURRENT_USER_ID);
  };

  // Nombre de notifications non lues
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1da1f2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAll}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Liste des notifications */}
      {notifications.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.empty}>Aucune notification pour l'instant 🔕</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem notification={item} onPress={handlePress} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  markAll: {
    fontSize: 13,
    color: '#1da1f2',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    fontSize: 15,
    color: '#999',
  },
});

export default NotificationsScreen;