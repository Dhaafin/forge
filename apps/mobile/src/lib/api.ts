import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clearAuthTokens } from './storage';
import { ApiConfig } from '@/config/api.config';

export const API_BASE_URL = ApiConfig.baseUrl;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

/** High performance fetch wrapper with centralized timeout, auto Authorization & 401 Token Refresh */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = ApiConfig.timeoutMs
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const accessToken = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Create AbortController for network timeout protection
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // Handle 401 Unauthorized (Access Token Expired)
    if (response.status === 401 && !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/refresh')) {
      if (isRefreshing) {
        return new Promise<T>((resolve, reject) => {
          failedQueue.push({
            resolve: async () => {
              try {
                const retryRes = await apiFetch<T>(endpoint, options, timeoutMs);
                resolve(retryRes);
              } catch (err) {
                reject(err);
              }
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh API with timeout
        const refreshController = new AbortController();
        const refreshTimeoutId = setTimeout(() => refreshController.abort(), timeoutMs);

        const refreshRes = await fetch(`${API_BASE_URL}${ApiConfig.endpoints.auth.refresh}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
          signal: refreshController.signal,
        });
        clearTimeout(refreshTimeoutId);

        if (!refreshRes.ok) {
          throw new Error('Failed to refresh token');
        }

        const refreshData = await refreshRes.json();
        if (refreshData.token) {
          await setAccessToken(refreshData.token);
          if (refreshData.refreshToken) {
            await setRefreshToken(refreshData.refreshToken);
          }

          processQueue(null);
          isRefreshing = false;

          // Retry original request
          return apiFetch<T>(endpoint, options, timeoutMs);
        } else {
          throw new Error('Invalid token response');
        }
      } catch (refreshErr) {
        processQueue(refreshErr);
        isRefreshing = false;
        await clearAuthTokens();
        throw refreshErr;
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      if (data?.details && typeof data.details === 'object') {
        const issues: string[] = [];
        const extractZodErrors = (obj: any, path: string[] = []) => {
          if (obj?._errors && Array.isArray(obj._errors) && obj._errors.length > 0) {
            issues.push(`${path.length > 0 ? path.join('.') : 'root'}: ${obj._errors.join(', ')}`);
          }
          for (const key in obj) {
            if (key !== '_errors' && typeof obj[key] === 'object' && obj[key] !== null) {
              extractZodErrors(obj[key], [...path, key]);
            }
          }
        };
        extractZodErrors(data.details);
        if (issues.length > 0) {
          errorMessage = `${data.error || 'Validation failed'}: ${issues.join(' | ')}`;
        } else {
          errorMessage = data.error || errorMessage;
        }
      } else if (typeof data?.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data?.detail)) {
        errorMessage = data.detail
          .map((err: any) => (err.loc ? `${err.loc.slice(1).join('.')}: ${err.msg}` : err.msg || JSON.stringify(err)))
          .join(', ');
      } else if (data?.error) {
        errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      } else if (data?.message) {
        errorMessage = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
      }
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Connection timed out (${timeoutMs / 1000}s). Server at ${API_BASE_URL} did not respond.`);
    }
    if (err.message === 'Network request failed') {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Ensure you have internet / network connectivity.`);
    }
    throw err;
  }
}
