import { useState, useEffect, useCallback } from 'react';
import { historyService, WorkoutSessionItem } from '../services/history.service';

const DEFAULT_LIMIT = 50;

export function useWorkoutHistory() {
  const [sessions, setSessions] = useState<WorkoutSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ total: number; hasMore: boolean }>({
    total: 0,
    hasMore: false,
  });

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await historyService.getHistory({
        limit: DEFAULT_LIMIT,
        offset: 0,
        search: debouncedSearch.trim() || undefined,
        timeWindow: selectedWindow || undefined,
      });

      setSessions(res.data || []);
      setMeta({
        total: res.meta?.total || 0,
        hasMore: res.meta?.hasMore || false,
      });
    } catch (err: any) {
      console.error('Error fetching workout history:', err);
      setError(err?.message || 'Failed to load workout history');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedWindow]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    sessions,
    loading,
    error,
    search,
    setSearch,
    selectedWindow,
    setSelectedWindow,
    meta,
    refetch: loadHistory,
  };
}
