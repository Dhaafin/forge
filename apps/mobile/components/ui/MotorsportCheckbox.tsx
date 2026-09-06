import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Checkbox from 'expo-checkbox';
import { MotorsportColors } from '../../theme/colors';

interface MotorsportCheckboxProps {
  label: string;
  value: boolean;
  onValueChange: (newValue: boolean) => void;
}

export function MotorsportCheckbox({ label, value, onValueChange }: MotorsportCheckboxProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
    >
      <Checkbox
        style={styles.checkbox}
        value={value}
        onValueChange={onValueChange}
        color={value ? MotorsportColors.red : MotorsportColors.borderDark}
      />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  label: {
    color: MotorsportColors.textSecondary,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginLeft: 8,
  },
});
