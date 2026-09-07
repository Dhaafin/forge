import React, { useState } from 'react';
import { Keyboard } from 'react-native';
import { Save } from 'lucide-react-native';

import { exercisesService, ExerciseItem } from '../services/exercises.service';
import { ExerciseForm } from './ExerciseForm';
import { BottomSheetModal } from '@/components/ui';
import { useFlashMessage } from '@/ctx/flash-message-context';

export interface EditExerciseBottomSheetProps {
  exercise: ExerciseItem | null;
  visible: boolean;
  onClose: () => void;
  onSuccess?: (exercise: ExerciseItem) => void;
}

/** Lightweight & Modern Edit Exercise Bottom Sheet reusing BottomSheetModal UI Primitive */
export const EditExerciseBottomSheet: React.FC<EditExerciseBottomSheetProps> = ({
  exercise,
  visible,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useFlashMessage();
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setSubmitting(false);
    onClose();
  };

  const handleSubmit = async (data: { name: string; targetMuscle: string }) => {
    if (!exercise) return;
    Keyboard.dismiss();
    setSubmitting(true);

    try {
      const updated = await exercisesService.updateExercise(exercise.id, data);

      showSuccess(`Exercise "${updated.name}" updated!`, 'Success');
      if (onSuccess) {
        onSuccess(updated);
      }
      handleClose();
    } catch (err: any) {
      console.error('Error updating exercise:', err);
      showError(err?.message || 'Failed to update exercise', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible || !exercise) return null;

  return (
    <BottomSheetModal
      visible={visible}
      onClose={handleClose}
      title="EDIT EXERCISE"
    >
      <ExerciseForm
        initialName={exercise.name}
        initialTargetMuscle={exercise.targetMuscle || 'Chest'}
        submitButtonText="SAVE CHANGES"
        submitButtonIcon={<Save size={16} color="#FFFFFF" />}
        submitButtonVariant="secondary"
        submitting={submitting}
        onCancel={handleClose}
        onSubmit={handleSubmit}
      />
    </BottomSheetModal>
  );
};
