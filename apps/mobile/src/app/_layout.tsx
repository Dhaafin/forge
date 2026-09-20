import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import {
  AuthProvider,
  FlashMessageProvider,
  OfflineQueryProvider,
} from '@/providers';
import { ActionBar } from '@/components/navigation/ActionBar';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <OfflineQueryProvider>
      <AuthProvider>
        <FlashMessageProvider>
          <GestureHandlerRootView style={styles.container}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
              }}
            >
              <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="exercises" options={{ headerShown: false }} />
              <Stack.Screen name="session" options={{ headerShown: false }} />
            </Stack>
            <ActionBar />
          </GestureHandlerRootView>
        </FlashMessageProvider>
      </AuthProvider>
    </OfflineQueryProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
