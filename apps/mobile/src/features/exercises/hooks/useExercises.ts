import { useState, useEffect, useCallback } from 'react';
import { exercisesService, ExerciseItem } from '../services/exercises.service';

const DEFAULT_LIMIT = 50;

export function useExercises() {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ total: number; hasMore: boolean }>({
    total: 0,
    hasMore: false,
  });

  // Debounce search value by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const loadExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await exercisesService.getExercises({
        limit: DEFAULT_LIMIT,
        offset: 0,
        search: debouncedSearch.trim() || undefined,
        targetMuscle: selectedMuscle || undefined,
      });

      setExercises(res.data || []);
      setMeta({
        total: res.meta.total,
        hasMore: res.meta.hasMore,
      });
    } catch (err: any) {
      console.error('Error fetching exercises:', err);
      setError(err?.message || 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedMuscle]);

  // Fetch when debouncedSearch or muscle filter changes
  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  return {
    exercises,
    loading,
    error,
    search,
    setSearch,
    selectedMuscle,
    setSelectedMuscle,
    meta,
    refetch: loadExercises,
  };
}

