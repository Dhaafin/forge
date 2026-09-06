import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Typography } from '@/components/ui';
import { Colors } from '@/theme/colors';
import { LoginHeaderBanner } from './LoginHeaderBanner';
import { LoginFormSection } from './LoginFormSection';

export const LoginOrganism: React.FC = () => {
  const router = useRouter();

  const handleSuccess = () => {
    router.replace('/');
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
        {/* Header Banner Molecule */}
        <LoginHeaderBanner />

        {/* Form Section Molecule */}
        <LoginFormSection onSuccess={handleSuccess} />

        {/* Footer with Cool Gym Quote */}
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
            "Discipline is choosing between what you want now and what you want most."
          </Typography>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
    fontStyle: 'italic',
    maxWidth: 280,
    lineHeight: 16,
  },
});
