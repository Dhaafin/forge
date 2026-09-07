import React from 'react';
import { QueryClient, onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider, Persister } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Bind React Native NetInfo to TanStack Query onlineManager
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected && !!state.isInternetReachable);
  });
});

const SEVEN_DAYS_MS = 1000 * 60 * 60 * 24 * 7;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 mins fresh
      gcTime: SEVEN_DAYS_MS,      // 7 days offline persistence
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

const asyncStoragePersister: Persister = {
  persistClient: async (client) => {
    try {
      await AsyncStorage.setItem('FORGE_QUERY_OFFLINE_CACHE', JSON.stringify(client));
    } catch {
      // Ignore write errors
    }
  },
  restoreClient: async () => {
    try {
      const cache = await AsyncStorage.getItem('FORGE_QUERY_OFFLINE_CACHE');
      return cache ? JSON.parse(cache) : undefined;
    } catch {
      return undefined;
    }
  },
  removeClient: async () => {
    try {
      await AsyncStorage.removeItem('FORGE_QUERY_OFFLINE_CACHE');
    } catch {
      // Ignore remove errors
    }
  },
};

interface OfflineQueryProviderProps {
  children: React.ReactNode;
}

export function OfflineQueryProvider({ children }: OfflineQueryProviderProps) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: SEVEN_DAYS_MS, // 7 days max cache age
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
