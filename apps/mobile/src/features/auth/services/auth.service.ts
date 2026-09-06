import { apiFetch } from '@/lib/api';
import { StoredUser } from '@/lib/storage';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  token: string;
  refreshToken?: string;
  user: StoredUser;
  error?: string;
}

export const authService = {
  /** Submit user login credentials to server */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /** Refresh expired access token using refresh token */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  /** Fetch current authenticated user profile */
  async getCurrentUser(): Promise<{ user: StoredUser }> {
    return apiFetch<{ user: StoredUser }>('/api/auth/me');
  },
};
