import React from 'react';
import { QueryClient, onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
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

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'FORGE_QUERY_OFFLINE_CACHE',
  throttleTime: 1000,
});

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
