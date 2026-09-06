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

/** Modern, Lightweight Motorsport Styled Button Component */
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
        return {
          bg: Colors.racingRed,
          text: Colors.textInverse,
          border: 'transparent',
          shadow: true,
        };
      case 'secondary':
        return {
          bg: Colors.motorsportBlue,
          text: Colors.textInverse,
          border: 'transparent',
          shadow: false,
        };
      case 'dark':
        return {
          bg: Colors.darkCarbon,
          text: Colors.textInverse,
          border: 'transparent',
          shadow: false,
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: Colors.darkCarbon,
          border: Colors.border,
          shadow: false,
        };
      default:
        return {
          bg: Colors.racingRed,
          text: Colors.textInverse,
          border: 'transparent',
          shadow: true,
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: vStyles.bg, borderColor: vStyles.border },
        vStyles.shadow && styles.primaryShadow,
        disabled && styles.disabledButton,
        style,
      ]}
      activeOpacity={0.82}
      disabled={disabled || loading}
      {...props}
    >
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
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  primaryShadow: {
    shadowColor: Colors.racingRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
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
    fontSize: 13,
    letterSpacing: 0.6,
  },
  disabledButton: {
    backgroundColor: Colors.disabled,
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
});
