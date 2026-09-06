import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Shield, Lock, User, AlertCircle } from 'lucide-react-native';
import { Typography, Button, Input, Checkbox } from '@/components/ui';
import { Colors } from '@/theme/colors';
import { useLoginForm } from '../hooks/useLoginForm';

export interface LoginFormSectionProps {
  onSuccess?: () => void;
}

export const LoginFormSection: React.FC<LoginFormSectionProps> = ({ onSuccess }) => {
  const form = useLoginForm();

  const handleSubmit = () => {
    form.handleLogin(onSuccess);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(600).springify()}
      style={styles.formCard}
    >
      {/* Error Banner */}
      {form.errorMsg && (
        <View style={styles.errorBanner}>
          <AlertCircle size={18} color={Colors.error} style={styles.errorIcon} />
          <Typography variant="body" color={Colors.error} style={styles.errorBannerText}>
            {form.errorMsg}
          </Typography>
        </View>
      )}

      {/* Username / Email Input */}
      <Input
        label="Username or Email"
        placeholder="Enter your username"
        value={form.username}
        onChangeText={form.setUsername}
        leftIcon={<User size={20} color={Colors.textSecondary} />}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Password Input */}
      <Input
        label="Password"
        placeholder="Enter your password"
        value={form.password}
        onChangeText={form.setPassword}
        isPassword
        leftIcon={<Lock size={20} color={Colors.textSecondary} />}
      />

      {/* Remember Me & Forgot Password Row */}
      <View style={styles.optionsRow}>
        <Checkbox
          value={form.rememberMe}
          onValueChange={form.setRememberMe}
          label="Remember session"
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            Alert.alert(
              'Password Recovery',
              'Please contact your administrator to reset your telemetry password.'
            )
          }
        >
          <Typography variant="caption" color={Colors.motorsportBlue} style={styles.forgotText}>
            Forgot Password?
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <Button
        title="Authenticate Session"
        onPress={handleSubmit}
        loading={form.loading}
        style={styles.submitButton}
        icon={<Shield size={18} color={Colors.textInverse} />}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 5,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 24,
  },
  forgotText: {
    fontFamily: 'Poppins_600SemiBold',
  },
  submitButton: {
    marginTop: 4,
  },
});
