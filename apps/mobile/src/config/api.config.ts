import { Platform } from 'react-native';

/** Production Vercel live backend URL */
export const PRODUCTION_API_URL = 'https://forge-tau-black.vercel.app';

/** Local Dev Fallback (Android emulator: 10.0.2.2, iOS/Web: localhost) */
export const LOCAL_DEV_API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

/** Centralized API Configuration for Mobile App */
export const ApiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || PRODUCTION_API_URL,
  timeoutMs: 12000, // 12s timeout for remote cloud requests
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
