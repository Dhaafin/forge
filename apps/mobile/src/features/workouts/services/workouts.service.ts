import { apiFetch } from '@/lib/api';
import { ApiConfig } from '@/config/api.config';

export interface WorkoutSetPayload {
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  set_type?: 'normal' | 'warmup' | 'drop' | 'failure';
  sequence_order?: number;
}

export interface CreateWorkoutSessionPayload {
  title?: string;
  duration_minutes?: number;
  start_time?: string;
  end_time?: string;
  sets: WorkoutSetPayload[];
}

export interface ExerciseHistorySetLog {
  id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  set_type: string;
  is_pr: boolean;
}

export interface ExerciseSessionHistoryLog {
  session_id: string;
  session_title: string;
  date: string;
  sets: ExerciseHistorySetLog[];
  session_volume: number;
  session_max_weight: number;
  session_estimated_1rm: number;
}

export interface ExerciseHistoryDetails {
  exercise_id: string;
  exercise_name: string;
  target_muscle: string;
  all_time_max_weight: number;
  all_time_max_volume: number;
  estimated_1rm: number;
  history: ExerciseSessionHistoryLog[];
}

export const workoutsService = {
  /** Create / commit a completed workout session */
  async createSession(payload: CreateWorkoutSessionPayload): Promise<any> {
    return apiFetch<any>(ApiConfig.endpoints.workouts.sessions, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Fetch exercise history, 1RM stats, and past session set logs */
  async getExerciseHistory(exerciseId: string, limit = 5): Promise<ExerciseHistoryDetails> {
    const endpoint = `${ApiConfig.endpoints.exercises}/${exerciseId}/history?limit=${limit}`;
    return apiFetch<ExerciseHistoryDetails>(endpoint);
  },
};
