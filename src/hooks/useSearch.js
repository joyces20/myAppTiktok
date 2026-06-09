/**
 * useSearch.js
 * Hook personnalisé pour la logique de recherche
 * Membre 7 — Recherche & Découverte | branche: feature/search
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux'; // ou remplace par ton store Zustand
import {
  searchAll,
  fetchTrending,
  fetchDiscoveryVideos,
  saveRecentSearch,
  getRecentSearches,
  deleteRecentSearch,
} from '../services/searchService';

// Délai de debounce en ms avant de déclencher la recherche
const DEBOUNCE_DELAY = 400;

const useSearch = () => {
  // ── State ──────────────────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'users' | 'hashtags' | 'sounds'
  const [results, setResults] = useState({ users: [], hashtags: [], sounds: [] });
  const [trending, setTrending] = useState([]);
  const [discoveryVideos, setDiscoveryVideos] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Récupère l'uid depuis Redux (ou Zustand selon votre setup)
  const currentUserId = useSelector((state) => state.auth?.user?.uid ?? null);

  // Ref pour le timer de debounce
  const debounceTimer = useRef(null);

  // ── Chargement initial : tendances + vidéos découverte + recherches récentes ──
  useEffect(() => {
    loadInitialData();
  }, [currentUserId]);

  const loadInitialData = useCallback(async () => {
    setIsLoadingDiscovery(true);
    try {
      const [trendingData, discoveryData, recentData] = await Promise.all([
        fetchTrending(),
        fetchDiscoveryVideos(),
        currentUserId ? getRecentSearches(currentUserId) : Promise.resolve([]),
      ]);
      setTrending(trendingData);
      setDiscoveryVideos(discoveryData);
      setRecentSearches(recentData);
    } catch (err) {
      console.error('[useSearch] loadInitialData error:', err);
    } finally {
      setIsLoadingDiscovery(false);
    }
  }, [currentUserId]);

  // ── Debounce sur le query ──────────────────────────────────────────────
  useEffect(() => {
    // Nettoyage du timer précédent
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!query.trim()) {
      // Réinitialiser les résultats si query vide
      setResults({ users: [], hashtags: [], sounds: [] });
      setHasSearched(false);
      setError(null);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(query.trim());
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  // ── Effectuer la recherche ────────────────────────────────────────────
  const performSearch = useCallback(
    async (searchQuery) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await searchAll(searchQuery);
        setResults(data);
        setHasSearched(true);

        // Sauvegarder dans l'historique
        if (currentUserId) {
          await saveRecentSearch(currentUserId, searchQuery);
          // Rafraîchir les recherches récentes
          const updated = await getRecentSearches(currentUserId);
          setRecentSearches(updated);
        }
      } catch (err) {
        console.error('[useSearch] performSearch error:', err);
        setError('Une erreur est survenue lors de la recherche.');
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId]
  );

  // ── Mettre à jour la barre de recherche ──────────────────────────────
  const handleQueryChange = useCallback((text) => {
    setQuery(text);
  }, []);

  // ── Effacer la recherche ─────────────────────────────────────────────
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults({ users: [], hashtags: [], sounds: [] });
    setHasSearched(false);
    setError(null);
    setActiveFilter('all');
  }, []);

  // ── Soumettre manuellement (bouton rechercher) ────────────────────────
  const submitSearch = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (query.trim()) performSearch(query.trim());
  }, [query, performSearch]);

  // ── Changer le filtre actif ──────────────────────────────────────────
  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  // ── Supprimer une recherche récente ──────────────────────────────────
  const handleDeleteRecent = useCallback(
    async (queryToDelete) => {
      if (!currentUserId) return;
      setRecentSearches((prev) => prev.filter((s) => s.query !== queryToDelete));
      await deleteRecentSearch(currentUserId, queryToDelete);
    },
    [currentUserId]
  );

  // ── Sélectionner une recherche récente ou tendance ───────────────────
  const selectSuggestion = useCallback((text) => {
    setQuery(text);
  }, []);

  // ── Résultats filtrés selon l'onglet actif ────────────────────────────
  const filteredResults = (() => {
    switch (activeFilter) {
      case 'users':
        return results.users;
      case 'hashtags':
        return results.hashtags;
      case 'sounds':
        return results.sounds;
      case 'all':
      default:
        return [
          ...results.users.slice(0, 3),
          ...results.hashtags.slice(0, 3),
          ...results.sounds.slice(0, 3),
        ];
    }
  })();

  // ── Nombre total de résultats ─────────────────────────────────────────
  const totalResults =
    results.users.length + results.hashtags.length + results.sounds.length;

  return {
    // State
    query,
    activeFilter,
    results,
    filteredResults,
    trending,
    discoveryVideos,
    recentSearches,
    isLoading,
    isLoadingDiscovery,
    error,
    hasSearched,
    totalResults,

    // Actions
    handleQueryChange,
    clearSearch,
    submitSearch,
    handleFilterChange,
    handleDeleteRecent,
    selectSuggestion,
    loadInitialData,
  };
};

export default useSearch;
