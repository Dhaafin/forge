import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ActiveWorkoutOrganism, WorkoutMode } from '@/features/workouts';

export default function WorkoutPage() {
  const params = useLocalSearchParams<{ mode?: WorkoutMode }>();
  const mode = (params.mode as WorkoutMode) || 'live';

  return <ActiveWorkoutOrganism mode={mode} />;
}
