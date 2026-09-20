import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ActiveWorkoutOrganism, WorkoutMode } from '@/features/workouts';

export default function WorkoutPage() {
  const params = useLocalSearchParams<{ mode?: WorkoutMode; sessionId?: string }>();
  const mode = (params.mode as WorkoutMode) || (params.sessionId ? 'past' : 'live');

  return <ActiveWorkoutOrganism mode={mode} sessionId={params.sessionId} />;
}

