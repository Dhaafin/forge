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
      <View style={styles.topRow}>
        {badgeLabel && <Badge label={badgeLabel} variant="primary" />}
      </View>

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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 12,
    width: '100%',
  },
  topRow: {
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    letterSpacing: -0.3,
    fontFamily: 'Inter_900Black',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
