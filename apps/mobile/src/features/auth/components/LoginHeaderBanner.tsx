import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Gauge } from 'lucide-react-native';
import { Typography, Badge } from '@/components/ui';
import { Colors } from '@/theme/colors';

export const LoginHeaderBanner: React.FC = () => {
  return (
    <Animated.View
      entering={FadeInUp.duration(600).springify()}
      style={styles.headerContainer}
    >
      <View style={styles.badgeRow}>
        <Badge label="S1000RR MOTORSPORT" variant="primary" />
        <View style={styles.f1Pill}>
          <Typography variant="caption" style={styles.f1PillText}>
            F1 PERFORMANCE
          </Typography>
        </View>
      </View>

      {/* Logo / Racing Icon */}
      <View style={styles.logoCircle}>
        <Gauge size={32} color={Colors.racingRed} />
      </View>

      <Typography variant="h1" style={styles.title}>
        FORGE <Typography variant="h1" color={Colors.racingRed}>ENGINE</Typography>
      </Typography>

      <Typography variant="subtitle" align="center" style={styles.subtitle}>
        Sign in to access your telemetry & fitness performance analytics
      </Typography>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  f1Pill: {
    backgroundColor: Colors.darkCarbon,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    transform: [{ skewX: '-10deg' }],
  },
  f1PillText: {
    color: Colors.electricCyan,
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 1,
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
    marginBottom: 16,
    shadowColor: Colors.racingRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 30,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    maxWidth: 280,
    fontSize: 13,
    lineHeight: 18,
  },
});
