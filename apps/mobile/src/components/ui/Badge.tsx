import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Typography } from './Typography';
import { Colors } from '@/theme/colors';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'cyan' | 'dark' | 'outline';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', style }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { bg: Colors.racingRed, text: Colors.textInverse };
      case 'cyan':
        return { bg: Colors.electricCyan, text: Colors.darkCarbon };
      case 'dark':
        return { bg: Colors.darkCarbon, text: Colors.textInverse };
      case 'outline':
        return { bg: 'transparent', text: Colors.racingRed, border: Colors.racingRed };
      default:
        return { bg: Colors.racingRed, text: Colors.textInverse };
    }
  };

  const currentVariant = getVariantStyles();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentVariant.bg },
        currentVariant.border ? { borderWidth: 1, borderColor: currentVariant.border } : null,
        style,
      ]}
    >
      <Typography variant="caption" style={styles.text} color={currentVariant.text}>
        {label.toUpperCase()}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    transform: [{ skewX: '-10deg' }],
  },
  text: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    transform: [{ skewX: '10deg' }],
  },
});
