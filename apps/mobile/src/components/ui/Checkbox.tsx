import React from 'react';
import { TouchableOpacity, StyleSheet, View, ViewStyle } from 'react-native';
import ExpoCheckbox from 'expo-checkbox';
import { Typography } from './Typography';
import { Colors } from '@/theme/colors';

export interface CheckboxProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  label?: string;
  style?: ViewStyle;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  value,
  onValueChange,
  label,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
    >
      <ExpoCheckbox
        value={value}
        onValueChange={onValueChange}
        color={value ? Colors.racingRed : Colors.border}
        style={styles.checkbox}
      />
      {label && (
        <Typography variant="body" style={styles.label}>
          {label}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
  },
  label: {
    marginLeft: 10,
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
