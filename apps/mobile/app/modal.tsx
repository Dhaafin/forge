import { Link } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { MotorsportTheme } from '@/constants/theme';
import { MotorsportStripe } from '@/components/MotorsportBadge';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <MotorsportStripe />
        <View style={styles.cardInner}>
          <Text style={styles.title}>FORGE TELEMETRY INFO</Text>
          <Text style={styles.desc}>
            Connected to Next.js REST API server with JWT HS256 Bearer Token authentication.
          </Text>
          <Link href="/" dismissTo style={styles.link}>
            <Text style={styles.linkText}>Close Window</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MotorsportTheme.colors.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: MotorsportTheme.colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MotorsportTheme.colors.border,
    width: '100%',
    overflow: 'hidden',
  },
  cardInner: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontFamily: MotorsportTheme.fonts.header,
    fontSize: 18,
    color: MotorsportTheme.colors.textWhite,
    marginBottom: 8,
  },
  desc: {
    fontFamily: MotorsportTheme.fonts.body,
    fontSize: 13,
    color: MotorsportTheme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  link: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: MotorsportTheme.colors.mBlue,
    borderRadius: 6,
  },
  linkText: {
    fontFamily: MotorsportTheme.fonts.header,
    fontSize: 12,
    letterSpacing: 1,
    color: MotorsportTheme.colors.textWhite,
  },
});
