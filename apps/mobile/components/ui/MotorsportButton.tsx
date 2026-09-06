import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, TouchableOpacityProps } from 'react-native';
import { MotorsportColors } from '../../theme/colors';

interface MotorsportButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
}

export function MotorsportButton({
  title,
  isLoading = false,
  variant = 'primary',
  icon,
  disabled,
  style,
  ...props
}: MotorsportButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return '#475569';
    if (variant === 'secondary') return MotorsportColors.blue;
    if (variant === 'outline') return 'transparent';
    return MotorsportColors.red;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.buttonOutline,
        style,
      ]}
      activeOpacity={0.8}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Decorative Speed Accent Line */}
      {variant === 'primary' && !disabled ? <View style={styles.speedLine} /> : null}

      {isLoading ? (
        <ActivityIndicator color={MotorsportColors.textPrimary} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
          <Text style={styles.text}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: MotorsportColors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonOutline: {
    borderWidth: 1.5,
    borderColor: MotorsportColors.borderDark,
    shadowOpacity: 0,
    elevation: 0,
  },
  speedLine: {
    position: 'absolute',
    left: -10,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ skewX: '-20deg' }],
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: 8,
  },
  text: {
    color: MotorsportColors.textPrimary,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
