import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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
import { AuthProvider } from '@/ctx/auth-context';
import { FlashMessageProvider } from '@/ctx/flash-message-context';
import { OfflineQueryProvider } from '@/providers/OfflineQueryProvider';
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
          <View style={styles.container}>
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
          </View>
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
