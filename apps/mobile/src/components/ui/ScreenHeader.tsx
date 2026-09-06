import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Typography } from './Typography';
import { Badge } from './Badge';
import { Colors } from '@/theme/colors';

export interface ScreenHeaderProps {
  badgeLabel: string;
  icon?: React.ReactNode;
  titlePrefix: string;
  titleHighlight?: string;
  subtitle?: string;
  containerStyle?: ViewStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  badgeLabel,
  icon,
  titlePrefix,
  titleHighlight,
  subtitle,
  containerStyle,
}) => {
  return (
    <Animated.View
      entering={FadeInUp.duration(600).springify()}
      style={[styles.headerContainer, containerStyle]}
    >
      <View style={styles.badgeRow}>
        <Badge label={badgeLabel} variant="primary" />
      </View>

      {icon && <View style={styles.logoCircle}>{icon}</View>}

      <Typography variant="h1" align="center" style={styles.title}>
        {titlePrefix}{' '}
        {titleHighlight && (
          <Typography variant="h1" color={Colors.racingRed}>
            {titleHighlight}
          </Typography>
        )}
      </Typography>

      {subtitle && (
        <Typography variant="subtitle" align="center" style={styles.subtitle}>
          {subtitle}
        </Typography>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  badgeRow: {
    marginBottom: 16,
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
    fontSize: 28,
    letterSpacing: -0.5,
    marginBottom: 6,
    fontFamily: 'Inter_900Black',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 290,
  },
});
