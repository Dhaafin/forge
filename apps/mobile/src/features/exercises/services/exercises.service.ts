import { apiFetch } from '@/lib/api';
import { ApiConfig } from '@/config/api.config';

export interface ExerciseItem {
  id: string;
  name: string;
  targetMuscle: string;
}

export interface ExerciseQuery {
  limit?: number;
  offset?: number;
  search?: string;
  targetMuscle?: string;
}

export interface ExercisesResponse {
  data: ExerciseItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const exercisesService = {
  /** Fetch paginated list of exercises with optional search & muscle filter */
  async getExercises(query: ExerciseQuery = {}): Promise<ExercisesResponse> {
    const params = new URLSearchParams();
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.search) params.append('search', query.search);
    if (query.targetMuscle) params.append('targetMuscle', query.targetMuscle);

    const queryString = params.toString();
    const endpoint = `${ApiConfig.endpoints.exercises}${queryString ? `?${queryString}` : ''}`;

    return apiFetch<ExercisesResponse>(endpoint);
  },
};
