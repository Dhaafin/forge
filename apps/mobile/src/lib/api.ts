import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clearAuthTokens } from './storage';
import { Platform } from 'react-native';

// Default API URL (Fallback to localhost or Android emulator 10.0.2.2)
const DEFAULT_DEV_API = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_DEV_API;

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

/** High performance fetch wrapper with auto Authorization & 401 Token Refresh */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
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

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized (Access Token Expired)
  if (response.status === 401 && !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/refresh')) {
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        failedQueue.push({
          resolve: async () => {
            try {
              const retryRes = await apiFetch<T>(endpoint, options);
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

      // Call refresh API
      const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

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
        return apiFetch<T>(endpoint, options);
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
    const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}
