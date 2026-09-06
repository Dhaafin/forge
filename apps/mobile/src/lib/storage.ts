import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'forge_access_token';
const REFRESH_TOKEN_KEY = 'forge_refresh_token';
const REMEMBER_ME_KEY = 'forge_remember_me';
const USER_KEY = 'forge_user_data';

export interface StoredUser {
  id: string;
  username: string;
  name?: string;
}

// ── Access Token ─────────────────────────────────────────────────────────────

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error reading access token from SecureStore:', error);
    return null;
  }
}

export async function setAccessToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving access token to SecureStore:', error);
  }
}

// ── Refresh Token ────────────────────────────────────────────────────────────

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error reading refresh token from SecureStore:', error);
    return null;
  }
}

export async function setRefreshToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving refresh token to SecureStore:', error);
  }
}

// ── Remember Me Setting ──────────────────────────────────────────────────────

export async function getRememberMe(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(REMEMBER_ME_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setRememberMe(remember: boolean): Promise<void> {
  try {
    await SecureStore.setItemAsync(REMEMBER_ME_KEY, remember ? 'true' : 'false');
  } catch (error) {
    console.error('Error setting remember me preference:', error);
  }
}

// ── Stored User Profile ──────────────────────────────────────────────────────

export async function getStoredUser(): Promise<StoredUser | null> {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: StoredUser): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user data to SecureStore:', error);
  }
}

// ── Clear Tokens / Logout ───────────────────────────────────────────────────

export async function clearAuthTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    // Keep REMEMBER_ME_KEY so preference remains when opening app next time
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
}
