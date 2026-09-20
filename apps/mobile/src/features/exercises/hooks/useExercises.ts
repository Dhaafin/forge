import { useState, useEffect, useCallback, useMemo } from 'react';
import { exercisesService, ExerciseItem } from '../services/exercises.service';

const DEFAULT_LIMIT = 100;

export function useExercises() {
  const [rawExercises, setRawExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  const loadExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await exercisesService.getExercises({
        limit: DEFAULT_LIMIT,
        offset: 0,
      });

      setRawExercises(res.data || []);
    } catch (err: any) {
      console.error('Error fetching exercises:', err);
      setError(err?.message || 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch once on mount
  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  // Instant client-side filtering (zero latency, zero skeleton flicker)
  const exercises = useMemo(() => {
    let result = rawExercises;
    if (selectedMuscle) {
      const target = selectedMuscle.toLowerCase();
      result = result.filter(
        (item) => item.targetMuscle && item.targetMuscle.toLowerCase() === target
      );
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (item) => item.name && item.name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [rawExercises, selectedMuscle, search]);

  const meta = useMemo(
    () => ({
      total: exercises.length,
      hasMore: false,
    }),
    [exercises.length]
  );

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

