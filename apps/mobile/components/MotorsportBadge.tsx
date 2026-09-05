import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotorsportTheme } from '@/constants/theme';

export function MotorsportStripe() {
  return (
    <View style={styles.stripeContainer}>
      <View style={[styles.bar, { backgroundColor: MotorsportTheme.colors.mCyan }]} />
      <View style={[styles.bar, { backgroundColor: MotorsportTheme.colors.mBlue }]} />
      <View style={[styles.bar, { backgroundColor: MotorsportTheme.colors.mRed }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  stripeContainer: {
    flexDirection: 'row',
    height: 4,
    width: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  bar: {
    flex: 1,
    height: '100%',
  },
});
