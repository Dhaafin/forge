import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { MotorsportTheme } from '@/constants/theme';
import { MotorsportStripe } from '@/components/MotorsportBadge';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={MotorsportTheme.colors.bgDark} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logoText}>FORGE MOTORSPORT</Text>
          <Text style={styles.subTitle}>SYSTEM ARCHITECTURE & SPECS</Text>
        </View>

        <View style={styles.card}>
          <MotorsportStripe />
          <View style={styles.cardInner}>
            <Text style={styles.cardTitle}>ENGINE & TELEMETRY</Text>
            <Text style={styles.cardDesc}>
              Forge Mobile App connects seamlessly with the Next.js REST API server.
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>AUTH PROTOCOL:</Text>
              <Text style={styles.infoVal}>JWT HS256 Bearer Token</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>STORAGE ENCRYPTION:</Text>
              <Text style={styles.infoVal}>Expo SecureStore (Keychain/Keystore)</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>UI THEME:</Text>
              <Text style={styles.infoVal}>BMW S1000RR M-Performance Carbon</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MotorsportTheme.colors.bgDark,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontFamily: MotorsportTheme.fonts.headerHeavy,
    fontSize: 22,
    letterSpacing: 2,
    color: MotorsportTheme.colors.textWhite,
  },
  subTitle: {
    fontFamily: MotorsportTheme.fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: MotorsportTheme.colors.textMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: MotorsportTheme.colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MotorsportTheme.colors.border,
    overflow: 'hidden',
  },
  cardInner: {
    padding: 20,
  },
  cardTitle: {
    fontFamily: MotorsportTheme.fonts.header,
    fontSize: 16,
    color: MotorsportTheme.colors.textWhite,
    marginBottom: 8,
  },
  cardDesc: {
    fontFamily: MotorsportTheme.fonts.body,
    fontSize: 13,
    color: MotorsportTheme.colors.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: MotorsportTheme.colors.border,
  },
  infoLabel: {
    fontFamily: MotorsportTheme.fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1,
    color: MotorsportTheme.colors.textDim,
  },
  infoVal: {
    fontFamily: MotorsportTheme.fonts.bodyMedium,
    fontSize: 11,
    color: MotorsportTheme.colors.mCyan,
  },
});
