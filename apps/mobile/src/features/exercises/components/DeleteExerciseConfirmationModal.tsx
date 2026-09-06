import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, AlertTriangle } from 'lucide-react-native';

import { exercisesService, ExerciseItem } from '../services/exercises.service';
import { Typography, Button } from '@/components/ui';
import { useFlashMessage } from '@/ctx/flash-message-context';
import { Colors } from '@/theme/colors';

export interface DeleteExerciseConfirmationModalProps {
  exercise: ExerciseItem | null;
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/** Modern Motorsport Delete Exercise Confirmation Dialog */
export const DeleteExerciseConfirmationModal: React.FC<DeleteExerciseConfirmationModalProps> = ({
  exercise,
  visible,
  onClose,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
          />

          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutDown.duration(180)}
            style={[
              styles.modalCard,
              { marginBottom: Math.max(insets.bottom + 20, 32) },
            ]}
          >
            {/* Red Warning Header Circle */}
            <View style={styles.iconCircle}>
              <AlertTriangle size={24} color={Colors.racingRed} />
            </View>

            <Typography variant="h3" style={styles.title} align="center">
              DELETE EXERCISE?
            </Typography>

            <Typography variant="body" style={styles.message} align="center">
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
                style={styles.cancelBtn}
              />
              <Button
                title="DELETE"
                variant="primary"
                loading={deleting}
                onPress={handleDelete}
                icon={!deleting ? <Trash2 size={16} color="#FFFFFF" /> : undefined}
                style={styles.deleteBtn}
              />
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 24,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_900Black',
    letterSpacing: 0.8,
    color: Colors.darkCarbon,
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
  },
  deleteBtn: {
    flex: 1,
  },
});
