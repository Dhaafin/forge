import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'forge_jwt_token';
const USER_KEY = 'forge_user_data';
const REMEMBER_KEY = 'forge_remember_me_pref';

async function setItem(key: string, value: string | null) {
  if (Platform.OS === 'web') {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  } else {
    if (value) {
      await SecureStore.setItemAsync(key, value);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
}

export type AuthUser = {
  id: string;
  username: string;
  name: string;
};

export async function saveAuthSession(token: string, user: AuthUser, rememberMe: boolean) {
  await setItem(TOKEN_KEY, token);
  await setItem(USER_KEY, JSON.stringify(user));
  await setItem(REMEMBER_KEY, rememberMe ? 'true' : 'false');
}

export async function loadAuthSession(): Promise<{ token: string | null; user: AuthUser | null; rememberMe: boolean }> {
  try {
    const rememberPref = await getItem(REMEMBER_KEY);
    const rememberMe = rememberPref !== 'false'; // default to true if not explicitly set to false

    const token = await getItem(TOKEN_KEY);
    const userJson = await getItem(USER_KEY);
    const user = userJson ? (JSON.parse(userJson) as AuthUser) : null;

    if (token && user) {
      return { token, user, rememberMe };
    }
    return { token: null, user: null, rememberMe };
  } catch {
    return { token: null, user: null, rememberMe: true };
  }
}

export async function clearAuthSession() {
  await setItem(TOKEN_KEY, null);
  await setItem(USER_KEY, null);
}

export async function saveRememberMePreference(rememberMe: boolean) {
  await setItem(REMEMBER_KEY, rememberMe ? 'true' : 'false');
}
