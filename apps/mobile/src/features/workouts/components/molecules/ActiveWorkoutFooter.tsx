import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Button } from '@/components/ui';
import { Colors } from '@/theme/colors';

export interface ActiveWorkoutFooterProps {
  submitting: boolean;
  onFinishWorkout: () => void;
  bottomPadding: number;
}

export const ActiveWorkoutFooter: React.FC<ActiveWorkoutFooterProps> = ({
  submitting,
  onFinishWorkout,
  bottomPadding,
}) => {
  return (
    <View style={[styles.bottomBar, { paddingBottom: bottomPadding }]}>
      <Button
        title="FINISH WORKOUT"
        variant="primary"
        loading={submitting}
        icon={!submitting ? <Check size={18} color="#FFFFFF" /> : undefined}
        onPress={onFinishWorkout}
        style={styles.finishBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  finishBtn: {
    width: '100%',
  },
});
