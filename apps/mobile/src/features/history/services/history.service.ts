import { apiFetch } from '@/lib/api';
import { ApiConfig } from '@/config/api.config';

export interface WorkoutSessionItem {
  id: string;
  userId: string;
  title: string;
  startTime: string;
  endTime?: string | null;
  durationMinutes?: number | null;
  createdAt?: string;
  setsCount?: number;
  totalVolumeKg?: number;
}

export interface HistoryQuery {
  limit?: number;
  offset?: number;
  search?: string;
  timeWindow?: string; // '7d' | '30d' | '90d' | 'ytd'
}

export interface HistoryResponse {
  data: WorkoutSessionItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const historyService = {
  /** Fetch paginated list of workout session history */
  async getHistory(query: HistoryQuery = {}): Promise<HistoryResponse> {
    const params = new URLSearchParams();
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.search) params.append('search', query.search);
    if (query.timeWindow) params.append('timeWindow', query.timeWindow);

    const queryString = params.toString();
    const endpoint = `${ApiConfig.endpoints.workouts.sessions}${queryString ? `?${queryString}` : ''}`;

    const res = await apiFetch<any>(endpoint);

    // Support both direct array format (from FastAPI directly) or wrapped { data, meta }
    if (Array.isArray(res)) {
      return {
        data: res.map((item: any) => ({
          id: item.id,
          userId: item.user_id || item.userId,
          title: item.title || 'Workout Session',
          startTime: item.start_time || item.startTime,
          endTime: item.end_time || item.endTime,
          durationMinutes: item.duration_minutes ?? item.durationMinutes ?? 0,
          setsCount: item.sets ? item.sets.length : 0,
          totalVolumeKg: item.sets
            ? item.sets.reduce((sum: number, s: any) => sum + ((s.weight_kg || s.weightKg || 0) * (s.reps || 0)), 0)
            : 0,
        })),
        meta: {
          total: res.length,
          limit: query.limit || 20,
          offset: query.offset || 0,
          hasMore: false,
        },
      };
    }

    return res as HistoryResponse;
  },
};
