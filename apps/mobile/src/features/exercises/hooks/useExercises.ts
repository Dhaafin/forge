import { useState, useEffect, useCallback } from 'react';
import {
  exercisesService,
  ExerciseItem,
  ExerciseQuery,
} from '../services/exercises.service';

export function useExercises(initialQuery: ExerciseQuery = { limit: 50, offset: 0 }) {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ total: number; hasMore: boolean }>({
    total: 0,
    hasMore: false,
  });

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await exercisesService.getExercises({
        ...initialQuery,
        search: search.trim() || undefined,
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
  }, [search, selectedMuscle, initialQuery]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return {
    exercises,
    loading,
    error,
    search,
    setSearch,
    selectedMuscle,
    setSelectedMuscle,
    meta,
    refetch: fetchExercises,
  };
}
