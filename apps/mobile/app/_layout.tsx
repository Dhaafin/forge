import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useFonts, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';

import { AuthProvider, useAuth } from '@/ctx/auth-context';
import { MotorsportTheme } from '@/constants/theme';

function NavigationStack() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      // User is not authenticated -> redirect to login screen
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      // User is authenticated -> redirect to (tabs) dashboard
      router.replace('/(tabs)');
    }
  }, [token, isAuthLoading, segments, router]);

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MotorsportTheme.colors.mBlue} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Telemetry Info' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_800ExtraBold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MotorsportTheme.colors.mBlue} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <NavigationStack />
      <StatusBar style="light" />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: MotorsportTheme.colors.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
