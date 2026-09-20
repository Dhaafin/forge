import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Calendar, Dumbbell } from 'lucide-react-native';

import { WorkoutMode } from '../hooks/useActiveWorkout';
import { Typography, BottomSheetModal } from '@/components/ui';
import { Colors } from '@/theme/colors';

export interface RecordModeBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectMode: (mode: WorkoutMode) => void;
}

export const RecordModeBottomSheet: React.FC<RecordModeBottomSheetProps> = ({
  visible,
  onClose,
  onSelectMode,
}) => {
  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="RECORD WORKOUT"
      subtitle="Choose how you want to record your session"
      headerLeft={
        <View style={styles.iconCircle}>
          <Dumbbell size={18} color={Colors.racingRed} />
        </View>
      }
    >
      <View style={styles.optionsContainer}>
        {/* Live Workout Mode */}
        <TouchableOpacity
          style={styles.optionCard}
          activeOpacity={0.85}
          onPress={() => {
            onSelectMode('live');
            onClose();
          }}
        >
          <View style={[styles.modeIconCircle, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
            <Play size={22} color={Colors.racingRed} />
          </View>

          <View style={styles.optionMain}>
            <Typography variant="h3" style={styles.optionTitle}>
              Start Live Workout
            </Typography>
            <Typography variant="caption" color={Colors.textSecondary}>
              Real-time timer & telemetry HUD metrics
            </Typography>
          </View>
        </TouchableOpacity>

        {/* Log Past Session Mode */}
        <TouchableOpacity
          style={styles.optionCard}
          activeOpacity={0.85}
          onPress={() => {
            onSelectMode('past');
            onClose();
          }}
        >
          <View style={[styles.modeIconCircle, { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' }]}>
            <Calendar size={22} color={Colors.motorsportBlue} />
          </View>

          <View style={styles.optionMain}>
            <Typography variant="h3" style={styles.optionTitle}>
              Log Past Session
            </Typography>
            <Typography variant="caption" color={Colors.textSecondary}>
              Record workout performed earlier
            </Typography>
          </View>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionMain: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.darkCarbon,
    marginBottom: 2,
  },
});
