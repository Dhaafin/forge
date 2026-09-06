import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LogOut, UserCheck, Activity, ShieldCheck } from 'lucide-react-native';

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
        {/* Top Motorsport Status Banner */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <View style={styles.statusRow}>
            <Badge label="TELEMETRY ACTIVE" variant="primary" />
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Typography variant="caption" style={styles.liveText}>
                ONLINE
              </Typography>
            </View>
          </View>

          <Typography variant="h1" style={styles.title}>
            FORGE <Typography variant="h1" color={Colors.racingRed}>DASHBOARD</Typography>
          </Typography>

          <Typography variant="subtitle" align="center" style={styles.subtitle}>
            Welcome back to your high-performance telemetry engine
          </Typography>
        </Animated.View>

        {/* User Profile Telemetry Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.card}>
          <View style={styles.userHeader}>
            <View style={styles.avatarCircle}>
              <UserCheck size={28} color={Colors.electricCyan} />
            </View>
            <View style={styles.userInfo}>
              <Typography variant="h2" style={styles.userName}>
                {user.name || user.username}
              </Typography>
              <Typography variant="body" color={Colors.textSecondary}>
                @{user.username}
              </Typography>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Metric Stats Mock Row */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Activity size={18} color={Colors.racingRed} />
              <Typography variant="caption" color={Colors.textSecondary} style={styles.metricLabel}>
                Session Status
              </Typography>
              <Typography variant="label" color={Colors.success}>
                SECURED
              </Typography>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <ShieldCheck size={18} color={Colors.motorsportBlue} />
              <Typography variant="caption" color={Colors.textSecondary} style={styles.metricLabel}>
                JWT Token
              </Typography>
              <Typography variant="label" color={Colors.darkCarbon}>
                VALIDATED
              </Typography>
            </View>
          </View>
        </Animated.View>

        {/* Logout Action */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.actionContainer}>
          <Button
            title="Terminate Session"
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
    paddingTop: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkCarbon,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  liveText: {
    color: Colors.textInverse,
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
  },
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 24,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.darkCarbon,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  actionContainer: {
    marginTop: 8,
  },
});
