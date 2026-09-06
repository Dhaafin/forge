import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { MotorsportColors } from '../../theme/colors';
import { Eye, EyeOff } from 'lucide-react-native';

interface MotorsportInputProps extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
  error?: string;
}

export function MotorsportInput({
  label,
  icon,
  isPassword = false,
  error,
  style,
  ...props
}: MotorsportInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error ? styles.inputWrapperError : null,
        ]}
      >
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={MotorsportColors.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOff size={18} color={MotorsportColors.textSecondary} />
            ) : (
              <Eye size={18} color={MotorsportColors.textSecondary} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    width: '100%',
  },
  label: {
    color: MotorsportColors.textSecondary,
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MotorsportColors.bgInput,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MotorsportColors.borderDark,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: MotorsportColors.red,
    backgroundColor: '#1E293B',
    shadowColor: MotorsportColors.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  inputWrapperError: {
    borderColor: MotorsportColors.error,
  },
  iconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: MotorsportColors.textPrimary,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  eyeButton: {
    padding: 6,
  },
  errorText: {
    color: MotorsportColors.error,
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginTop: 4,
  },
});
