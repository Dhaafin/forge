import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Typography } from './Typography';
import { Badge } from './Badge';
import { Colors } from '@/theme/colors';

export interface ScreenHeaderProps {
  badgeLabel?: string;
  titlePrefix?: string;
  titleHighlight?: string;
  subtitle?: string;
  containerStyle?: ViewStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  badgeLabel,
  titlePrefix,
  titleHighlight,
  subtitle,
  containerStyle,
}) => {
  return (
    <Animated.View
      entering={FadeInUp.duration(400).springify()}
      style={[styles.headerContainer, containerStyle]}
    >
      {/* Motorsport S1000RR M-Tricolor Header Accent Stripe Bar */}
      <View style={styles.tricolorStripe}>
        <View style={[styles.stripeSegment, { backgroundColor: Colors.background }]} />
        <View style={[styles.stripeSegment, { backgroundColor: Colors.motorsportBlue }]} />
        <View style={[styles.stripeSegment, { backgroundColor: Colors.racingRed }]} />
        <View style={[styles.stripeSegment, { backgroundColor: Colors.electricCyan }]} />
      </View>

      <View style={styles.headerContent}>
        {badgeLabel && (
          <View style={styles.topRow}>
            <Badge label={badgeLabel} variant="primary" />
          </View>
        )}

        <Typography variant="h2" style={styles.title}>
          {titlePrefix ? `${titlePrefix} ` : ''}
          {titleHighlight && (
            <Typography variant="h2" color={Colors.racingRed}>
              {titleHighlight}
            </Typography>
          )}
        </Typography>

        {subtitle && (
          <Typography variant="caption" style={styles.subtitle}>
            {subtitle}
          </Typography>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 16,
    width: '100%',
  },
  tricolorStripe: {
    flexDirection: 'row',
    height: 4,
    width: 64,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
    transform: [{ skewX: '-12deg' }],
  },
  stripeSegment: {
    flex: 1,
  },
  headerContent: {
    width: '100%',
  },
  topRow: {
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.3,
    fontFamily: 'Inter_900Black',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
});
