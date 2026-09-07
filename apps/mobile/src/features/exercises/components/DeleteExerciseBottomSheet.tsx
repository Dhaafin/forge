import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Trash2 } from 'lucide-react-native';

import { exercisesService, ExerciseItem } from '../services/exercises.service';
import { Typography, Button, BottomSheetModal } from '@/components/ui';
import { useFlashMessage } from '@/ctx/flash-message-context';
import { Colors } from '@/theme/colors';

export interface DeleteExerciseBottomSheetProps {
  exercise: ExerciseItem | null;
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/** Modern Delete Exercise Confirmation Bottom Sheet reusing BottomSheetModal UI Primitive */
export const DeleteExerciseBottomSheet: React.FC<DeleteExerciseBottomSheetProps> = ({
  exercise,
  visible,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useFlashMessage();
  const [deleting, setDeleting] = useState(false);

  const handleClose = () => {
    setDeleting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!exercise) return;
    setDeleting(true);

    try {
      await exercisesService.deleteExercise(exercise.id);
      showSuccess(`Exercise "${exercise.name}" deleted`, 'Deleted');
      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (err: any) {
      console.error('Error deleting exercise:', err);
      showError(err?.message || 'Failed to delete exercise', 'Cannot Delete');
    } finally {
      setDeleting(false);
    }
  };

  if (!visible || !exercise) return null;

  return (
    <BottomSheetModal
      visible={visible}
      onClose={handleClose}
      title="DELETE EXERCISE"
    >
      <View style={styles.bodyContainer}>
        <Typography variant="body" style={styles.message}>
          Are you sure you want to delete{' '}
          <Typography variant="label" color={Colors.darkCarbon}>
            "{exercise.name}"
          </Typography>
          ? This action cannot be undone.
        </Typography>

        <View style={styles.actionRow}>
          <Button
            title="CANCEL"
            variant="outline"
            onPress={handleClose}
            disabled={deleting}
            style={styles.btn}
          />
          <Button
            title="DELETE"
            variant="primary"
            loading={deleting}
            onPress={handleDelete}
            icon={!deleting ? <Trash2 size={16} color="#FFFFFF" /> : undefined}
            style={styles.btn}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  bodyContainer: {
    gap: 16,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
  },
});
