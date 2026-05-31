// src/components/social/CommentSheet.jsx
// Membre 6 — Social
//
// Panneau de commentaires qui s'ouvre depuis le bas de l'écran.
// Affiche la liste des commentaires et permet d'en ajouter.

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { fetchComments, addComment, deleteComment } from '../../services/socialService';

export default function CommentSheet({ visible, onClose, videoId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [text,     setText]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sending,  setSending]  = useState(false);

  const slideAnim = useRef(new Animated.Value(400)).current;

  // Charger les commentaires quand le sheet s'ouvre
  useEffect(() => {
    if (visible) {
      loadComments();
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  async function loadComments() {
    setLoading(true);
    try {
      const data = await fetchComments(videoId);
      setComments(data);
    } catch (err) {
      console.error('Erreur chargement commentaires:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setText('');

    // Ajout optimiste dans la liste
    const tempComment = {
      id:         `temp_${Date.now()}`,
      user_id:    currentUser.uid,
      username:   currentUser.displayName ?? 'moi',
      avatar_url: currentUser.photoURL ?? null,
      content:    trimmed,
      created_at: { seconds: Date.now() / 1000 },
    };
    setComments(prev => [tempComment, ...prev]);

    try {
      await addComment(
        videoId,
        currentUser.uid,
        currentUser.displayName ?? '',
        currentUser.photoURL ?? null,
        trimmed
      );
      // Recharger pour avoir le vrai timestamp
      await loadComments();
    } catch {
      // Rollback
      setComments(prev => prev.filter(c => c.id !== tempComment.id));
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(commentId) {
    setComments(prev => prev.filter(c => c.id !== commentId));
    await deleteComment(videoId, commentId, currentUser.uid).catch(() => {});
  }

  function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60)         return 'maintenant';
    if (diff < 3600)       return `${Math.floor(diff / 60)}min`;
    if (diff < 86400)      return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}j`;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Fond semi-transparent */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kavWrapper}
      >
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* En-tête */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Commentaires</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Handle */}
          <View style={styles.handle} />

          {/* Liste */}
          {loading ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator color="#FE2C55" />
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Sois le premier à commenter</Text>
              }
              renderItem={({ item }) => (
                <View style={styles.commentRow}>
                  {/* Avatar */}
                  {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Text style={styles.avatarText}>
                        {(item.username?.[0] ?? '?').toUpperCase()}
                      </Text>
                    </View>
                  )}

                  {/* Contenu */}
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUsername}>{item.username}</Text>
                    <Text style={styles.commentText}>{item.content}</Text>
                    <Text style={styles.commentTime}>{formatTime(item.created_at)}</Text>
                  </View>

                  {/* Supprimer (si auteur) */}
                  {item.user_id === currentUser?.uid && (
                    <TouchableOpacity
                      onPress={() => handleDelete(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.deleteBtn}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          )}

          {/* Champ de saisie */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ajouter un commentaire..."
              placeholderTextColor="#555"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={300}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!text.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.sendIcon}>➤</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  kavWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    minHeight: 300,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  closeBtn: {
    fontSize: 16,
    color: '#888',
  },
  loaderBox: {
    padding: 32,
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
    marginTop: 24,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    backgroundColor: '#FE2C55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  commentContent: {
    flex: 1,
    gap: 2,
  },
  commentUsername: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  commentText: {
    fontSize: 14,
    color: '#ddd',
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 11,
    color: '#555',
    marginTop: 2,
  },
  deleteBtn: {
    fontSize: 12,
    color: '#555',
    paddingLeft: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#fff',
    maxHeight: 80,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FE2C55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#333',
  },
  sendIcon: {
    color: '#fff',
    fontSize: 16,
  },
});
