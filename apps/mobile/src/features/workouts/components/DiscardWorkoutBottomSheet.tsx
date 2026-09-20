import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

import { Typography, Button, BottomSheetModal } from '@/components/ui';
import { Colors } from '@/theme/colors';

export interface DiscardWorkoutBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirmDiscard: () => void;
}

/** Motorsport themed bottom sheet modal to confirm workout discard without using raw Alert.alert */
export const DiscardWorkoutBottomSheet: React.FC<DiscardWorkoutBottomSheetProps> = ({
  visible,
  onClose,
  onConfirmDiscard,
}) => {
  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="DISCARD WORKOUT?"
      subtitle="Are you sure you want to exit?"
      headerLeft={
        <View style={styles.iconCircle}>
          <AlertTriangle size={20} color={Colors.racingRed} />
        </View>
      }
    >
      <View style={styles.content}>
        <Typography variant="body" color={Colors.textSecondary} style={styles.description}>
          All recorded sets and telemetry metrics in this session will be permanently lost.
        </Typography>

        <View style={styles.actions}>
          <Button
            title="KEEP TRAINING"
            variant="outline"
            onPress={onClose}
            style={styles.cancelBtn}
          />
          <Button
            title="DISCARD WORKOUT"
            variant="primary"
            onPress={onConfirmDiscard}
            style={styles.discardBtn}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.racingRed}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  description: {
    marginBottom: 24,
    lineHeight: 20,
  },
  actions: {
    gap: 10,
  },
  cancelBtn: {
    width: '100%',
    borderColor: Colors.border,
  },
  discardBtn: {
    width: '100%',
    backgroundColor: Colors.racingRed,
  },
});
