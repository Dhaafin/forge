import { Platform } from 'react-native';

/** Resolve base API URL strictly from environment variables */
function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl;
  }

  if (__DEV__) {
    // Development fallback only
    return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  }

  throw new Error(
    'EXPO_PUBLIC_API_URL environment variable is not defined. Please set it in .env.local or build environment.'
  );
}

/** Centralized API Configuration driven 100% by environment variables */
export const ApiConfig = {
  baseUrl: getApiBaseUrl(),
  timeoutMs: 12000, // 12s timeout for network requests
  endpoints: {
    auth: {
      login: '/api/auth/login',
      refresh: '/api/auth/refresh',
      me: '/api/auth/me',
    },
    exercises: '/api/exercises',
    workouts: {
      sessions: '/api/workouts/sessions',
      sets: '/api/workouts/sets',
    },
  },
};
