import { useEffect, useCallback } from 'react';
import { firestore } from '../services/firebase';
import { useFeedStore } from '../store/feedStore';

const PAGE_SIZE = 10;

export const useFeed = () => {
  const {
    videos,
    loading,
    loadingMore,
    error,
    lastDoc,
    hasMore,
    setVideos,
    appendVideos,
    setLoading,
    setLoadingMore,
    setError,
    setLastDoc,
    setHasMore,
  } = useFeedStore();

  // Chargement initial des vidéos
  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const snapshot = await firestore()
        .collection('videos')
        .orderBy('created_at', 'desc')
        .limit(PAGE_SIZE)
        .get();

      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVideos(fetched);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      setError('Impossible de charger les vidéos.');
      console.error('[useFeed] fetchVideos error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger plus de vidéos (pagination)
  const fetchMoreVideos = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc) return;

    try {
      setLoadingMore(true);

      const snapshot = await firestore()
        .collection('videos')
        .orderBy('created_at', 'desc')
        .startAfter(lastDoc)
        .limit(PAGE_SIZE)
        .get();

      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      appendVideos(fetched);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      setError('Impossible de charger plus de vidéos.');
      console.error('[useFeed] fetchMoreVideos error:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastDoc]);

  useEffect(() => {
    fetchVideos();
  }, []);

  return {
    videos,
    loading,
    loadingMore,
    error,
    hasMore,
    fetchVideos,
    fetchMoreVideos,
  };
};