import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotorsportColors } from '../../theme/colors';

interface MotorsportBadgeProps {
  label?: string;
  sublabel?: string;
}

export function MotorsportBadge({ label = 'S1000RR', sublabel = 'POWERED BY FORGE' }: MotorsportBadgeProps) {
  return (
    <View style={styles.container}>
      {/* Tri-color M Stripes */}
      <View style={styles.stripeContainer}>
        <View style={[styles.stripe, { backgroundColor: MotorsportColors.cyan }]} />
        <View style={[styles.stripe, { backgroundColor: MotorsportColors.blue }]} />
        <View style={[styles.stripe, { backgroundColor: MotorsportColors.red }]} />
      </View>

      <View style={styles.textWrapper}>
        <Text style={styles.label}>{label}</Text>
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MotorsportColors.borderDark,
    alignSelf: 'flex-start',
  },
  stripeContainer: {
    flexDirection: 'row',
    transform: [{ skewX: '-15deg' }],
    marginRight: 10,
  },
  stripe: {
    width: 6,
    height: 16,
    marginRight: 3,
    borderRadius: 1,
  },
  textWrapper: {
    flexDirection: 'column',
  },
  label: {
    color: MotorsportColors.textPrimary,
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sublabel: {
    color: MotorsportColors.textSecondary,
    fontFamily: 'Poppins_400Regular',
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
