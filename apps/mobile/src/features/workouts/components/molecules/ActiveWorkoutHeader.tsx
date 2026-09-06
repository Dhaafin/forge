import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Typography, Badge } from '@/components/ui';
import { Colors } from '@/theme/colors';
import { WorkoutMode } from '../../hooks/useActiveWorkout';

export interface ActiveWorkoutHeaderProps {
  title: string;
  setTitle: (title: string) => void;
  mode: WorkoutMode;
  onDiscard: () => void;
}

export const ActiveWorkoutHeader: React.FC<ActiveWorkoutHeaderProps> = ({
  title,
  setTitle,
  mode,
  onDiscard,
}) => {
  return (
    <>
      {/* Top Header Navigation */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={onDiscard}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Session Title..."
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.badgeWrapper}>
          {mode === 'live' && <View style={styles.livePulseDot} />}
          <Badge
            label={mode === 'live' ? 'LIVE' : 'LOG'}
            variant={mode === 'live' ? 'primary' : 'cyan'}
          />
        </View>
      </View>

      {/* Motorsport Accent Stripe under Top Header */}
      <View style={styles.topAccentStripe}>
        <View style={[styles.stripeHalf, { backgroundColor: Colors.racingRed }]} />
        <View style={[styles.stripeHalf, { backgroundColor: Colors.motorsportBlue }]} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  titleContainer: {
    flex: 1,
  },
  titleInput: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.darkCarbon,
    paddingVertical: 2,
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.racingRed,
  },
  topAccentStripe: {
    height: 3,
    flexDirection: 'row',
    width: '100%',
  },
  stripeHalf: {
    flex: 1,
    height: '100%',
  },
});
