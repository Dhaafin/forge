import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  getRememberMe,
  setRememberMe as saveRememberMePref,
  getStoredUser,
  setStoredUser,
  clearAuthTokens,
  StoredUser,
} from '@/lib/storage';
import { apiFetch } from '@/lib/api';

export interface AuthContextType {
  user: StoredUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  login: (credentials: { username: string; password: string }, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberMe, setRememberMeState] = useState(true);

  const updateRememberMe = (value: boolean) => {
    setRememberMeState(value);
    saveRememberMePref(value);
  };

  // Restore session on app startup
  useEffect(() => {
    async function loadSession() {
      try {
        const savedRemember = await getRememberMe();
        setRememberMeState(savedRemember);

        const accessToken = await getAccessToken();
        const refreshToken = await getRefreshToken();
        const cachedUser = await getStoredUser();

        if (accessToken || refreshToken) {
          if (cachedUser) {
            setUser(cachedUser);
          }

          // Verify or refresh user profile
          try {
            const res = await apiFetch('/api/auth/me');
            if (res.user) {
              setUser(res.user);
              await setStoredUser(res.user);
            }
          } catch (err) {
            // Token might be expired, apiFetch interceptor will try refresh
            console.log('Session validation info:', err);
          }
        }
      } catch (err) {
        console.error('Error loading session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  const login = async (
    credentials: { username: string; password: string },
    remember: boolean
  ) => {
    setIsLoading(true);
    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.token && response.user) {
        await setAccessToken(response.token);
        // Save refresh token (same token or dedicated refresh token)
        await setRefreshToken(response.token);
        await setStoredUser(response.user);
        await saveRememberMePref(remember);

        setUser(response.user);
        setRememberMeState(remember);
      } else {
        throw new Error(response.error || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await clearAuthTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        rememberMe,
        setRememberMe: updateRememberMe,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
