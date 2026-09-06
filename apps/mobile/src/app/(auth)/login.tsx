import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Shield, Lock, User, Gauge, AlertCircle } from 'lucide-react-native';

import { useLoginForm } from '@/hooks/useLoginForm';
import { Colors } from '@/theme/colors';
import {
  Typography,
  Button,
  Input,
  Checkbox,
  Badge,
} from '@/components/ui';

export default function LoginScreen() {
  const router = useRouter();
  const form = useLoginForm();

  const onSubmit = () => {
    form.handleLogin(() => router.replace('/'));
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Motorsport Header Banner */}
        <Animated.View
          entering={FadeInUp.duration(600).springify()}
          style={styles.headerContainer}
        >
          <View style={styles.badgeRow}>
            <Badge label="S1000RR MOTORSPORT" variant="primary" />
            <View style={styles.f1Pill}>
              <Typography variant="caption" style={styles.f1PillText}>
                F1 PERFORMANCE
              </Typography>
            </View>
          </View>

          {/* Logo / Racing Icon */}
          <View style={styles.logoCircle}>
            <Gauge size={32} color={Colors.racingRed} />
          </View>

          <Typography variant="h1" style={styles.title}>
            FORGE <Typography variant="h1" color={Colors.racingRed}>ENGINE</Typography>
          </Typography>

          <Typography variant="subtitle" align="center" style={styles.subtitle}>
            Sign in to access your telemetry & fitness performance analytics
          </Typography>
        </Animated.View>

        {/* Main Card Form */}
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
            onPress={onSubmit}
            loading={form.loading}
            style={styles.submitButton}
            icon={<Shield size={18} color={Colors.textInverse} />}
          />
        </Animated.View>

        {/* Footer info */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          style={styles.footer}
        >
          <View style={styles.stripeDecoration}>
            <View style={[styles.decorStripe, { backgroundColor: Colors.racingRed }]} />
            <View style={[styles.decorStripe, { backgroundColor: Colors.motorsportBlue }]} />
            <View style={[styles.decorStripe, { backgroundColor: Colors.electricCyan }]} />
          </View>

          <Typography variant="caption" align="center" style={styles.footerText}>
            Forge High-Performance Telemetry System • Secured with JWT
          </Typography>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  f1Pill: {
    backgroundColor: Colors.darkCarbon,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    transform: [{ skewX: '-10deg' }],
  },
  f1PillText: {
    color: Colors.electricCyan,
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 1,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.racingRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.racingRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 30,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    maxWidth: 280,
    fontSize: 13,
    lineHeight: 18,
  },
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
  footer: {
    marginTop: 36,
    alignItems: 'center',
  },
  stripeDecoration: {
    flexDirection: 'row',
    width: 48,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  decorStripe: {
    flex: 1,
  },
  footerText: {
    fontSize: 11,
  },
});
