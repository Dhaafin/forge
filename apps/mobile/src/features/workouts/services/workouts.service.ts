import { apiFetch } from '@/lib/api';
import { ApiConfig } from '@/config/api.config';

export interface WorkoutSetPayload {
  exerciseId: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  setType?: 'normal' | 'warmup' | 'drop' | 'failure' | string;
  sequenceOrder?: number;
}

export interface CreateWorkoutSessionPayload {
  clientSessionId?: string;
  title?: string;
  durationMinutes?: number;
  startTime?: string;
  endTime?: string;
  sets: WorkoutSetPayload[];
}

export interface ExerciseHistorySetLog {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  setType: string;
  isPr: boolean;
}

export interface ExerciseSessionHistoryLog {
  sessionId: string;
  sessionTitle: string;
  date: string;
  sets: ExerciseHistorySetLog[];
  sessionVolume: number;
  sessionMaxWeight: number;
  sessionEstimated1Rm: number;
}

export interface ExerciseHistoryDetails {
  exerciseId: string;
  exerciseName: string;
  targetMuscle: string;
  allTimeMaxWeight: number;
  allTimeMaxVolume: number;
  estimatedOneRm: number;
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

  /** Fetch single workout session details by ID */
  async getSessionById(sessionId: string): Promise<any> {
    return apiFetch<any>(`${ApiConfig.endpoints.workouts.sessions}/${sessionId}`);
  },

  /** Update an existing logged workout session */
  async updateSession(sessionId: string, payload: Partial<CreateWorkoutSessionPayload>): Promise<any> {
    return apiFetch<any>(`${ApiConfig.endpoints.workouts.sessions}/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /** Delete a logged workout session */
  async deleteSession(sessionId: string): Promise<void> {
    return apiFetch<void>(`${ApiConfig.endpoints.workouts.sessions}/${sessionId}`, {
      method: 'DELETE',
    });
  },

  /** Fetch exercise history, 1RM stats, and past session set logs */
  async getExerciseHistory(exerciseId: string, limit = 5): Promise<ExerciseHistoryDetails> {
    const endpoint = `${ApiConfig.endpoints.exercises}/${exerciseId}/history?limit=${limit}`;
    return apiFetch<ExerciseHistoryDetails>(endpoint);
  },
};
