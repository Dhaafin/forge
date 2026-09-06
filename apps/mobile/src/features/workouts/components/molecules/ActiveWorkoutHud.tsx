import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Timer as TimerIcon, Flame, Layers } from 'lucide-react-native';
import { Typography } from '@/components/ui';
import { Colors } from '@/theme/colors';
import { WorkoutMode } from '../../hooks/useActiveWorkout';

export interface ActiveWorkoutHudProps {
  elapsedSeconds: number;
  totalSetsCount: number;
  totalVolumeKg: number;
  mode: WorkoutMode;
}

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const ActiveWorkoutHud: React.FC<ActiveWorkoutHudProps> = ({
  elapsedSeconds,
  totalSetsCount,
  totalVolumeKg,
  mode,
}) => {
  return (
    <View style={styles.hudContainer}>
      <View style={styles.hudCard}>
        <View style={[styles.hudIconCircle, { backgroundColor: '#FEE2E2' }]}>
          <TimerIcon size={16} color={Colors.racingRed} />
        </View>
        <View style={styles.hudTextGroup}>
          <Typography variant="caption" color={Colors.textSecondary} style={styles.hudLabel}>
            {mode === 'live' ? 'LIVE TIMER' : 'DURATION'}
          </Typography>
          <Typography variant="h3" style={styles.hudValue}>
            {formatTimer(elapsedSeconds)}
          </Typography>
        </View>
      </View>

      <View style={styles.hudCard}>
        <View style={[styles.hudIconCircle, { backgroundColor: '#DBEAFE' }]}>
          <Layers size={16} color={Colors.motorsportBlue} />
        </View>
        <View style={styles.hudTextGroup}>
          <Typography variant="caption" color={Colors.textSecondary} style={styles.hudLabel}>
            SETS
          </Typography>
          <Typography variant="h3" style={styles.hudValue}>
            {totalSetsCount}
          </Typography>
        </View>
      </View>

      <View style={styles.hudCard}>
        <View style={[styles.hudIconCircle, { backgroundColor: '#E0F2FE' }]}>
          <Flame size={16} color={Colors.electricCyan} />
        </View>
        <View style={styles.hudTextGroup}>
          <Typography variant="caption" color={Colors.textSecondary} style={styles.hudLabel}>
            VOLUME
          </Typography>
          <Typography variant="h3" style={styles.hudValue}>
            {Math.round(totalVolumeKg)} kg
          </Typography>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hudContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  hudCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hudIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  hudTextGroup: {
    flex: 1,
  },
  hudLabel: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  hudValue: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkCarbon,
    marginTop: -1,
  },
});
