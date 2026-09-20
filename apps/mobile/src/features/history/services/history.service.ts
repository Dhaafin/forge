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

    const mapItem = (item: any): WorkoutSessionItem => {
      let calculatedSetsCount = 0;
      let calculatedVolumeKg = 0;

      if (Array.isArray(item.sets)) {
        calculatedSetsCount = item.sets.length;
        calculatedVolumeKg = item.sets.reduce(
          (sum: number, s: any) => sum + ((Number(s.weight_kg ?? s.weightKg) || 0) * (Number(s.reps) || 0)),
          0
        );
      } else {
        calculatedSetsCount = Number(item.setsCount ?? item.sets_count ?? 0);
        calculatedVolumeKg = Number(item.totalVolumeKg ?? item.total_volume_kg ?? 0);
      }

      return {
        id: item.id,
        userId: item.user_id || item.userId,
        title: item.title || 'Workout Session',
        startTime: item.start_time || item.startTime,
        endTime: item.end_time || item.endTime,
        durationMinutes: item.duration_minutes ?? item.durationMinutes ?? 0,
        setsCount: calculatedSetsCount,
        totalVolumeKg: Math.round(calculatedVolumeKg * 10) / 10,
      };
    };

    if (Array.isArray(res)) {
      return {
        data: res.map(mapItem),
        meta: {
          total: res.length,
          limit: query.limit || 20,
          offset: query.offset || 0,
          hasMore: false,
        },
      };
    }

    if (res && Array.isArray(res.data)) {
      return {
        data: res.data.map(mapItem),
        meta: res.meta || {
          total: res.data.length,
          limit: query.limit || 20,
          offset: query.offset || 0,
          hasMore: false,
        },
      };
    }

    return res as HistoryResponse;
  },
};
