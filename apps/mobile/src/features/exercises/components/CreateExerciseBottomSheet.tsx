import React, { useState } from 'react';
import { Keyboard } from 'react-native';
import { Plus } from 'lucide-react-native';

import { exercisesService, ExerciseItem } from '../services/exercises.service';
import { ExerciseForm } from './ExerciseForm';
import { BottomSheetModal } from '@/components/ui';
import { useFlashMessage } from '@/ctx/flash-message-context';

export interface CreateExerciseBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (exercise: ExerciseItem) => void;
}

/** Lightweight & Modern Create Exercise Bottom Sheet reusing BottomSheetModal UI Primitive */
export const CreateExerciseBottomSheet: React.FC<CreateExerciseBottomSheetProps> = ({
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
    Keyboard.dismiss();
    setSubmitting(true);

    try {
      const newExercise = await exercisesService.createExercise(data);

      showSuccess(`Exercise "${newExercise.name}" created!`, 'Success');
      if (onSuccess) {
        onSuccess(newExercise);
      }
      handleClose();
    } catch (err: any) {
      console.error('Error creating exercise:', err);
      showError(err?.message || 'Failed to create exercise', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={handleClose}
      title="CREATE EXERCISE"
    >
      <ExerciseForm
        initialName=""
        initialTargetMuscle="Chest"
        submitButtonText="CREATE EXERCISE"
        submitButtonIcon={<Plus size={16} color="#FFFFFF" />}
        submitButtonVariant="primary"
        submitting={submitting}
        onCancel={handleClose}
        onSubmit={handleSubmit}
      />
    </BottomSheetModal>
  );
};
