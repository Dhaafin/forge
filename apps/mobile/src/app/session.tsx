import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Timer } from 'lucide-react-native';

import { useAuth } from '@/ctx/auth-context';
import { Colors } from '@/theme/colors';
import { Typography, Badge } from '@/components/ui';

export default function SessionScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login' as any);
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.racingRed} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.header}>
          <View style={styles.badgeRow}>
            <Badge label="SESSION HUB" variant="primary" />
          </View>

          <View style={styles.logoCircle}>
            <Timer size={32} color={Colors.racingRed} />
          </View>

          <Typography variant="h1" align="center" style={styles.title}>
            ACTIVE <Typography variant="h1" color={Colors.racingRed}>SESSION</Typography>
          </Typography>

          <Typography variant="subtitle" align="center" style={styles.subtitle}>
            Live workout tracking & telemetry timer
          </Typography>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    width: '100%',
  },
  badgeRow: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.racingRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.racingRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
});
