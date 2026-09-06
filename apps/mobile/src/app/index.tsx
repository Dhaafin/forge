import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LogOut, Gauge } from 'lucide-react-native';

import { useAuth } from '@/ctx/auth-context';
import { Colors } from '@/theme/colors';
import { Typography, Button, Badge } from '@/components/ui';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

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

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Simple Welcome Hub Header */}
        <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.header}>
          <View style={styles.badgeRow}>
            <Badge label="FORGE ENGINE" variant="primary" />
          </View>

          <View style={styles.logoCircle}>
            <Gauge size={32} color={Colors.racingRed} />
          </View>

          <Typography variant="h1" align="center" style={styles.title}>
            Welcome, <Typography variant="h1" color={Colors.racingRed}>{user.name || user.username}</Typography>
          </Typography>

          <Typography variant="subtitle" align="center" style={styles.subtitle}>
            Your telemetry hub is ready
          </Typography>
        </Animated.View>

        {/* Action Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.actionCard}>
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleLogout}
            icon={<LogOut size={18} color={Colors.darkCarbon} />}
          />
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
    marginBottom: 40,
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
  actionCard: {
    width: '100%',
    maxWidth: 320,
  },
});
