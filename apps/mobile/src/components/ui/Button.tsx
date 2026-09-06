import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { Typography } from './Typography';
import { Colors } from '@/theme/colors';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'dark' | 'outline';
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  loading = false,
  variant = 'primary',
  icon,
  style,
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { bg: Colors.racingRed, text: Colors.textInverse, border: 'transparent' };
      case 'secondary':
        return { bg: Colors.motorsportBlue, text: Colors.textInverse, border: 'transparent' };
      case 'dark':
        return { bg: Colors.darkCarbon, text: Colors.textInverse, border: 'transparent' };
      case 'outline':
        return { bg: 'transparent', text: Colors.darkCarbon, border: Colors.border };
      default:
        return { bg: Colors.racingRed, text: Colors.textInverse, border: 'transparent' };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: vStyles.bg, borderColor: vStyles.border },
        disabled && styles.disabledButton,
        style,
      ]}
      activeOpacity={0.8}
      disabled={disabled || loading}
      {...props}
    >
      {/* Motorsport Racing Stripes Line */}
      {variant === 'primary' && !disabled && (
        <View style={styles.stripeContainer}>
          <View style={[styles.stripe, { backgroundColor: Colors.motorsportBlue }]} />
          <View style={[styles.stripe, { backgroundColor: Colors.electricCyan }]} />
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={vStyles.text} size="small" />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Typography
            variant="label"
            style={styles.text}
            color={disabled ? Colors.textMuted : vStyles.text}
          >
            {title.toUpperCase()}
          </Typography>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 0.8,
  },
  disabledButton: {
    backgroundColor: Colors.disabled,
    borderColor: 'transparent',
  },
  stripeContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    flexDirection: 'row',
  },
  stripe: {
    flex: 1,
  },
});
