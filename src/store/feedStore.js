import { create } from 'zustand';

// Store du feed (liste des vidéos + pagination)
export const useFeedStore = create(set => ({
  videos: [],
  loading: false,
  loadingMore: false,
  error: null,
  lastDoc: null,
  hasMore: true,

  setVideos: videos => set({ videos }),
  appendVideos: newVideos =>
    set(state => ({ videos: [...state.videos, ...newVideos] })),
  setLoading: loading => set({ loading }),
  setLoadingMore: loadingMore => set({ loadingMore }),
  setError: error => set({ error }),
  setLastDoc: lastDoc => set({ lastDoc }),
  setHasMore: hasMore => set({ hasMore }),
}));

// Store du lecteur vidéo (quelle vidéo est active, pause/play)
export const usePlayerStore = create(set => ({
  currentIndex: 0,
  isPlaying: true,
  isMuted: false,

  setCurrentIndex: index => set({ currentIndex: index, isPlaying: true }),
  setIsPlaying: isPlaying => set({ isPlaying }),
  togglePlay: () => set(state => ({ isPlaying: !state.isPlaying })),
  toggleMute: () => set(state => ({ isMuted: !state.isMuted })),
}));