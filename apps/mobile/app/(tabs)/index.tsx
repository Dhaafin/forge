import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/ctx/auth-context';
import { MotorsportTheme } from '@/constants/theme';
import { MotorsportStripe } from '@/components/MotorsportBadge';

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={MotorsportTheme.colors.bgDark} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>FORGE</Text>
            <View style={styles.mBadge}>
              <View style={[styles.mStripe, { backgroundColor: MotorsportTheme.colors.mCyan }]} />
              <View style={[styles.mStripe, { backgroundColor: MotorsportTheme.colors.mBlue }]} />
              <View style={[styles.mStripe, { backgroundColor: MotorsportTheme.colors.mRed }]} />
            </View>
          </View>
          <Text style={styles.subTitle}>TELEMETRY DASHBOARD</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.card}>
          <MotorsportStripe />
          <View style={styles.cardInner}>
            <Text style={styles.sectionTag}>ACTIVE PILOT PROFILE</Text>
            <Text style={styles.userName}>{user?.name || 'Dhaafin Makhalingga'}</Text>
            <Text style={styles.userMeta}>Username: @{user?.username || 'dhaafinm'}</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>SESSION AUTHENTICATED</Text>
            </View>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={signOut}
              activeOpacity={0.85}
            >
              <Text style={styles.signOutText}>SIGN OUT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>SYSTEM STATUS</Text>
            <Text style={styles.statVal}>ONLINE</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>SECURITY MODE</Text>
            <Text style={styles.statVal}>ENCRYPTED</Text>
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
    marginTop: 12,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontFamily: MotorsportTheme.fonts.headerHeavy,
    fontSize: 28,
    letterSpacing: 4,
    color: MotorsportTheme.colors.textWhite,
  },
  mBadge: {
    flexDirection: 'row',
    height: 16,
    width: 22,
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
    fontSize: 10,
    letterSpacing: 2,
    color: MotorsportTheme.colors.textMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: MotorsportTheme.colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MotorsportTheme.colors.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardInner: {
    padding: 24,
  },
  sectionTag: {
    fontFamily: MotorsportTheme.fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: MotorsportTheme.colors.mCyan,
    marginBottom: 8,
  },
  userName: {
    fontFamily: MotorsportTheme.fonts.header,
    fontSize: 22,
    color: MotorsportTheme.colors.textWhite,
    marginBottom: 4,
  },
  userMeta: {
    fontFamily: MotorsportTheme.fonts.body,
    fontSize: 14,
    color: MotorsportTheme.colors.textMuted,
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
    marginBottom: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MotorsportTheme.colors.success,
  },
  statusText: {
    fontFamily: MotorsportTheme.fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1,
    color: MotorsportTheme.colors.success,
  },
  signOutButton: {
    backgroundColor: MotorsportTheme.colors.mRed,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontFamily: MotorsportTheme.fonts.header,
    fontSize: 13,
    letterSpacing: 2,
    color: MotorsportTheme.colors.textWhite,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: MotorsportTheme.colors.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MotorsportTheme.colors.border,
    padding: 16,
  },
  statLabel: {
    fontFamily: MotorsportTheme.fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 1,
    color: MotorsportTheme.colors.textDim,
    marginBottom: 6,
  },
  statVal: {
    fontFamily: MotorsportTheme.fonts.header,
    fontSize: 16,
    color: MotorsportTheme.colors.textWhite,
  },
});
