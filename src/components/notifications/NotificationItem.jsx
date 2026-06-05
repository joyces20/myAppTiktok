import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

/**
 * Affiche une seule notification dans la liste.
 * @param {object} notification - La notification depuis Firestore
 * @param {function} onPress    - Action au clic (ex: marquer comme lue)
 */
const NotificationItem = ({ notification, onPress }) => {
  const { type, from_user_id, read, created_at } = notification;

  // Message selon le type de notification
  const getMessage = () => {
    switch (type) {
      case 'like':
        return 'a aimé votre vidéo ❤️';
      case 'comment':
        return 'a commenté votre vidéo 💬';
      case 'follow':
        return 'a commencé à vous suivre 🔔';
      default:
        return 'a interagi avec vous';
    }
  };

  // Formate la date (ex: "il y a 2h")
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000); // en secondes

    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return `Il y a ${Math.floor(diff / 86400)}j`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, !read && styles.unread]}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      {/* Avatar de l'expéditeur */}
      <Image
        source={{ uri: `https://i.pravatar.cc/150?u=${from_user_id}` }}
        style={styles.avatar}
      />

      {/* Contenu */}
      <View style={styles.content}>
        <Text style={styles.message}>
          <Text style={styles.username}>{from_user_id} </Text>
          {getMessage()}
        </Text>
        <Text style={styles.date}>{formatDate(created_at)}</Text>
      </View>

      {/* Point bleu si non lue */}
      {!read && <View style={styles.dot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  unread: {
    backgroundColor: '#f0f8ff', // fond légèrement bleu si non lue
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  username: {
    fontWeight: 'bold',
    color: '#000',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1da1f2',
    marginLeft: 8,
  },
});

export default NotificationItem;