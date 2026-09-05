import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAuth } from '@/ctx/auth-context';
import { MotorsportTheme } from '@/constants/theme';
import { MotorsportStripe } from '@/components/MotorsportBadge';

export default function LoginScreen() {
  const { signIn, rememberMe, setRememberMe } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await signIn(username.trim(), password, rememberMe);
      if (!result.success) {
        setErrorMessage(result.error || 'Invalid credentials. Please try again.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={MotorsportTheme.colors.bgDark} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Brand Badge */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>FORGE</Text>
              <View style={styles.mBadge}>
                <View style={[styles.mStripe, { backgroundColor: MotorsportTheme.colors.mCyan }]} />
                <View style={[styles.mStripe, { backgroundColor: MotorsportTheme.colors.mBlue }]} />
                <View style={[styles.mStripe, { backgroundColor: MotorsportTheme.colors.mRed }]} />
              </View>
            </View>
            <Text style={styles.subTitle}>TELEMETRY & PERFORMANCE PORTAL</Text>
          </View>

          {/* Main Card Container */}
          <View style={styles.card}>
            <MotorsportStripe />

            <View style={styles.cardInner}>
              <Text style={styles.cardHeaderTitle}>Sign In</Text>
              <Text style={styles.cardHeaderDesc}>
                Enter your account credentials to access your workout telemetry.
              </Text>

              {/* Error Alert Banner */}
              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Username Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>USERNAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor={MotorsportTheme.colors.textDim}
                  value={username}
                  onChangeText={(val) => {
                    setUsername(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={MotorsportTheme.colors.textDim}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isSubmitting}
                />
              </View>

              {/* Remember Me Checkbox */}
              <TouchableOpacity
                style={styles.rememberContainer}
                activeOpacity={0.8}
                onPress={() => setRememberMe(!rememberMe)}
                disabled={isSubmitting}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>
                <Text style={styles.rememberText}>Remember login session on this device</Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleLogin}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={MotorsportTheme.colors.textWhite} size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>SIGN IN</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Note */}
          <Text style={styles.footerNote}>
            FORGE MOTORSPORT EDITION • SECURED SESSION
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MotorsportTheme.colors.bgDark,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontFamily: MotorsportTheme.fonts.headerHeavy,
    fontSize: 32,
    letterSpacing: 4,
    color: MotorsportTheme.colors.textWhite,
  },
  mBadge: {
    flexDirection: 'row',
    height: 18,
    width: 24,
    transform: [{ skewX: '-20deg' }],
    borderRadius: 2,
    overflow: 'hidden',
  },
  mStripe: {
    flex: 1,
    height: '100%',
  },
  subTitle: {
    fontFamily: MotorsportTheme.fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    color: MotorsportTheme.colors.textMuted,
    marginTop: 6,
  },
  card: {
    backgroundColor: MotorsportTheme.colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MotorsportTheme.colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  cardInner: {
    padding: 24,
  },
  cardHeaderTitle: {
    fontFamily: MotorsportTheme.fonts.header,
    fontSize: 22,
    color: MotorsportTheme.colors.textWhite,
    marginBottom: 6,
  },
  cardHeaderDesc: {
    fontFamily: MotorsportTheme.fonts.body,
    fontSize: 13,
    color: MotorsportTheme.colors.textMuted,
    marginBottom: 20,
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: 'rgba(226, 35, 26, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: MotorsportTheme.colors.mRed,
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: MotorsportTheme.fonts.bodyMedium,
    fontSize: 12,
    color: MotorsportTheme.colors.error,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontFamily: MotorsportTheme.fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: MotorsportTheme.colors.textMuted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: MotorsportTheme.colors.bgInput,
    borderWidth: 1,
    borderColor: MotorsportTheme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: MotorsportTheme.fonts.body,
    fontSize: 14,
    color: MotorsportTheme.colors.textWhite,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: MotorsportTheme.colors.border,
    backgroundColor: MotorsportTheme.colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: MotorsportTheme.colors.mBlue,
    borderColor: MotorsportTheme.colors.mBlue,
  },
  checkmark: {
    color: MotorsportTheme.colors.textWhite,
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberText: {
    fontFamily: MotorsportTheme.fonts.body,
    fontSize: 12,
    color: MotorsportTheme.colors.textMuted,
  },
  submitButton: {
    backgroundColor: MotorsportTheme.colors.mBlue,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: MotorsportTheme.colors.mBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: MotorsportTheme.fonts.header,
    fontSize: 14,
    letterSpacing: 2,
    color: MotorsportTheme.colors.textWhite,
  },
  footerNote: {
    fontFamily: MotorsportTheme.fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: MotorsportTheme.colors.textDim,
    textAlign: 'center',
    marginTop: 28,
  },
});
