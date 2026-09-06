import { useState, useEffect, useCallback, useRef } from 'react';
import { workoutsService, WorkoutSetPayload } from '../services/workouts.service';
import { useFlashMessage } from '@/ctx/flash-message-context';

export interface ActiveSet {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  setType: 'normal' | 'warmup' | 'drop' | 'failure';
  completed: boolean;
}

export interface ActiveExercise {
  id: string; // internal instance id
  exerciseId: string;
  name: string;
  targetMuscle: string;
  sets: ActiveSet[];
}

export type WorkoutMode = 'live' | 'past';

export function useActiveWorkout(onSuccess?: () => void) {
  const { showSuccess, showError, showWarning } = useFlashMessage();

  const [active, setActive] = useState(false);
  const [mode, setMode] = useState<WorkoutMode>('live');
  const [title, setTitle] = useState('Workout Session');
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [exercises, setExercises] = useState<ActiveExercise[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<any>(null);

  // Live Timer Effect
  useEffect(() => {
    if (active && mode === 'live') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, mode]);

  const startSession = useCallback((sessionMode: WorkoutMode = 'live') => {
    setMode(sessionMode);
    setTitle(sessionMode === 'live' ? 'Live Workout Session' : 'Logged Workout');
    setStartTime(new Date());
    setElapsedSeconds(0);
    setExercises([]);
    setActive(true);
  }, []);

  const resetSession = useCallback(() => {
    setActive(false);
    setElapsedSeconds(0);
    setExercises([]);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const addExercise = useCallback((ex: { id: string; name: string; targetMuscle: string }) => {
    const instanceId = `${ex.id}-${Date.now()}`;
    const initialSet: ActiveSet = {
      id: `${instanceId}-set-1`,
      setNumber: 1,
      weightKg: 0,
      reps: 10,
      setType: 'normal',
      completed: false,
    };

    setExercises((prev) => [
      ...prev,
      {
        id: instanceId,
        exerciseId: ex.id,
        name: ex.name,
        targetMuscle: ex.targetMuscle,
        sets: [initialSet],
      },
    ]);
  }, []);

  const removeExercise = useCallback((instanceId: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== instanceId));
  }, []);

  // Add Set with auto-copy from previous set
  const addSet = useCallback((instanceId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== instanceId) return ex;

        const lastSet = ex.sets[ex.sets.length - 1];
        const nextSetNumber = ex.sets.length + 1;
        const newSet: ActiveSet = {
          id: `${instanceId}-set-${nextSetNumber}-${Date.now()}`,
          setNumber: nextSetNumber,
          weightKg: lastSet ? lastSet.weightKg : 0,
          reps: lastSet ? lastSet.reps : 10,
          setType: 'normal',
          completed: false,
        };

        return { ...ex, sets: [...ex.sets, newSet] };
      })
    );
  }, []);

  const updateSet = useCallback(
    (instanceId: string, setId: string, updates: Partial<ActiveSet>) => {
      setExercises((prev) =>
        prev.map((ex) => {
          if (ex.id !== instanceId) return ex;

          const updatedSets = ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s));
          return { ...ex, sets: updatedSets };
        })
      );
    },
    []
  );

  const removeSet = useCallback((instanceId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== instanceId) return ex;

        const filteredSets = ex.sets
          .filter((s) => s.id !== setId)
          .map((s, index) => ({ ...s, setNumber: index + 1 }));

        return { ...ex, sets: filteredSets };
      })
    );
  }, []);

  const toggleSetComplete = useCallback((instanceId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== instanceId) return ex;

        const updatedSets = ex.sets.map((s) =>
          s.id === setId ? { ...s, completed: !s.completed } : s
        );
        return { ...ex, sets: updatedSets };
      })
    );
  }, []);

  const finishWorkout = useCallback(async () => {
    if (exercises.length === 0) {
      showWarning('Please add at least one exercise to your workout session.', 'Validation');
      return;
    }

    const payloadSets: WorkoutSetPayload[] = [];
    let sequenceOrder = 0;

    exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        payloadSets.push({
          exerciseId: ex.exerciseId,
          setNumber: Math.max(1, Number(s.setNumber) || 1),
          weightKg: Math.max(0, Number(s.weightKg) || 0),
          reps: Math.max(1, Number(s.reps) || 1),
          setType: s.setType,
          sequenceOrder: sequenceOrder++,
        });
      });
    });

    if (payloadSets.length === 0) {
      showWarning('Please log at least one set before saving.', 'Validation');
      return;
    }

    setSubmitting(true);
    try {
      const calculatedDuration = Math.max(1, Math.round(elapsedSeconds / 60));
      const now = new Date();
      const calculatedStart = mode === 'live' ? startTime.toISOString() : new Date(now.getTime() - calculatedDuration * 60000).toISOString();

      await workoutsService.createSession({
        title: title.trim() || 'Workout Session',
        durationMinutes: calculatedDuration,
        startTime: calculatedStart,
        endTime: now.toISOString(),
        sets: payloadSets,
      });

      showSuccess(`Workout "${title}" saved successfully!`, 'Session Completed');
      resetSession();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error saving workout session:', err);
      showError(err?.message || 'Failed to save workout session', 'Error');
    } finally {
      setSubmitting(false);
    }
  }, [exercises, elapsedSeconds, mode, startTime, title, resetSession, onSuccess, showSuccess, showError, showWarning]);

  // Derived stats
  const totalSetsCount = exercises.reduce((acc, e) => acc + e.sets.length, 0);
  const totalVolumeKg = exercises.reduce(
    (acc, e) => acc + e.sets.reduce((sum, s) => sum + (s.weightKg * s.reps), 0),
    0
  );

  return {
    active,
    mode,
    title,
    setTitle,
    startTime,
    elapsedSeconds,
    exercises,
    submitting,
    startSession,
    resetSession,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    toggleSetComplete,
    finishWorkout,
    totalSetsCount,
    totalVolumeKg,
  };
}
