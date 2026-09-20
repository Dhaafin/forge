import { useState, useEffect, useCallback, useMemo } from 'react';
import { exercisesService, ExerciseItem } from '@/features/exercises/services/exercises.service';
import { workoutsService, ExerciseHistoryDetails } from '../services/workouts.service';

const PAGE_SIZE = 100;

export function useExercisePicker(visible: boolean) {
  const [rawExercises, setRawExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // Accordion History State
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [historyMap, setHistoryMap] = useState<Record<string, ExerciseHistoryDetails>>({});
  const [loadingHistoryMap, setLoadingHistoryMap] = useState<Record<string, boolean>>({});

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const res = await exercisesService.getExercises({
        limit: PAGE_SIZE,
        offset: 0,
      });
      setRawExercises(res.data || []);
    } catch (err) {
      console.error('Error fetching exercise picker list:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when modal becomes visible if not yet loaded
  useEffect(() => {
    if (visible && rawExercises.length === 0) {
      fetchExercises();
    }
  }, [visible, rawExercises.length, fetchExercises]);

  // Instant in-memory filtering (zero latency, zero skeleton flicker)
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

  const loadMore = useCallback(() => {
    // Entire list fetched
  }, []);

  // Toggle Accordion & Fetch History if not cached
  const toggleExpandExercise = useCallback(async (exerciseId: string) => {
    if (expandedExerciseId === exerciseId) {
      setExpandedExerciseId(null);
      return;
    }

    setExpandedExerciseId(exerciseId);

    // Fetch history if not already cached
    if (!historyMap[exerciseId]) {
      setLoadingHistoryMap((prev) => ({ ...prev, [exerciseId]: true }));
      try {
        const historyDetails = await workoutsService.getExerciseHistory(exerciseId, 3);
        setHistoryMap((prev) => ({ ...prev, [exerciseId]: historyDetails }));
      } catch (err) {
        console.error(`Error loading history for exercise ${exerciseId}:`, err);
      } finally {
        setLoadingHistoryMap((prev) => ({ ...prev, [exerciseId]: false }));
      }
    }
  }, [expandedExerciseId, historyMap]);

  return {
    exercises,
    loading,
    loadingMore: false,
    hasMore: false,
    search,
    setSearch,
    selectedMuscle,
    setSelectedMuscle,
    loadMore,
    expandedExerciseId,
    historyMap,
    loadingHistoryMap,
    toggleExpandExercise,
    refetch: fetchExercises,
  };
}
