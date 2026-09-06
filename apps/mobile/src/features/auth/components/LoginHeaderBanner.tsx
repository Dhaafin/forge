import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Dumbbell } from 'lucide-react-native';
import { Typography } from '@/components/ui';
import { Colors } from '@/theme/colors';

export const LoginHeaderBanner: React.FC = () => {
  return (
    <Animated.View
      entering={FadeInUp.duration(600).springify()}
      style={styles.headerContainer}
    >
      {/* Brand Icon */}
      <View style={styles.logoCircle}>
        <Dumbbell size={32} color={Colors.racingRed} />
      </View>

      {/* App Title */}
      <Typography variant="h1" style={styles.title}>
        FORGE
      </Typography>

      {/* Inspiring Gym Quote Subtitle */}
      <Typography variant="subtitle" align="center" style={styles.subtitle}>
        "Forged in sweat, defined by discipline."
      </Typography>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
    fontSize: 32,
    letterSpacing: 2,
    fontFamily: 'Inter_900Black',
    marginBottom: 6,
  },
  subtitle: {
    maxWidth: 280,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
