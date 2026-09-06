import { useState, useEffect, useCallback } from 'react';
import { exercisesService, ExerciseItem } from '@/features/exercises/services/exercises.service';
import { workoutsService, ExerciseHistoryDetails } from '../services/workouts.service';

const PAGE_SIZE = 15;

export function useExercisePicker(visible: boolean) {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Accordion History State
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [historyMap, setHistoryMap] = useState<Record<string, ExerciseHistoryDetails>>({});
  const [loadingHistoryMap, setLoadingHistoryMap] = useState<Record<string, boolean>>({});

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchExercises = useCallback(async (currentOffset: number, isNewSearch = false) => {
    if (isNewSearch) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await exercisesService.getExercises({
        limit: PAGE_SIZE,
        offset: currentOffset,
        search: debouncedSearch.trim() || undefined,
        targetMuscle: selectedMuscle || undefined,
      });

      const newItems = res.data || [];
      if (isNewSearch) {
        setExercises(newItems);
      } else {
        setExercises((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const uniqueNew = newItems.filter((item) => !existingIds.has(item.id));
          return [...prev, ...uniqueNew];
        });
      }

      setHasMore(res.meta ? res.meta.hasMore : newItems.length >= PAGE_SIZE);
      setOffset(currentOffset + newItems.length);
    } catch (err) {
      console.error('Error fetching exercise picker list:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, selectedMuscle]);

  // Initial fetch on visible or search/filter change
  useEffect(() => {
    if (visible) {
      setOffset(0);
      fetchExercises(0, true);
    }
  }, [visible, debouncedSearch, selectedMuscle, fetchExercises]);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      fetchExercises(offset, false);
    }
  }, [loading, loadingMore, hasMore, offset, fetchExercises]);

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
    loadingMore,
    hasMore,
    search,
    setSearch,
    selectedMuscle,
    setSelectedMuscle,
    loadMore,
    expandedExerciseId,
    historyMap,
    loadingHistoryMap,
    toggleExpandExercise,
    refetch: () => fetchExercises(0, true),
  };
}
