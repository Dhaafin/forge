import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { AuthUser, loadAuthSession, saveAuthSession, clearAuthSession, saveRememberMePreference } from '@/lib/auth-storage';

// Base API URL for Next.js backend
// For physical devices or local dev, set EXPO_PUBLIC_API_URL in apps/mobile/.env
const DEFAULT_API_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  signIn: (username: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isLoading: true,
  rememberMe: true,
  setRememberMe: () => null,
  signIn: async () => ({ success: false }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberMe, setRememberMeState] = useState(true);

  // Load persistent session on app boot
  useEffect(() => {
    async function initSession() {
      try {
        const stored = await loadAuthSession();
        setRememberMeState(stored.rememberMe);

        if (stored.rememberMe && stored.token && stored.user) {
          setToken(stored.token);
          setUser(stored.user);
        }
      } catch (err) {
        console.warn('Failed to load stored auth session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, []);

  const setRememberMe = (val: boolean) => {
    setRememberMeState(val);
    saveRememberMePreference(val);
  };

  const signIn = async (username: string, password: string, remember: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }

      if (!data.token || !data.user) {
        return { success: false, error: 'Invalid response from server' };
      }

      setToken(data.token);
      setUser(data.user);
      setRememberMeState(remember);

      if (remember) {
        await saveAuthSession(data.token, data.user, true);
      } else {
        await clearAuthSession();
        await saveRememberMePreference(false);
      }

      return { success: true };
    } catch (error: any) {
      console.error('[signIn]', error);
      return { success: false, error: 'Unable to connect to authentication server. Check network connection.' };
    }
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    await clearAuthSession();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        rememberMe,
        setRememberMe,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
