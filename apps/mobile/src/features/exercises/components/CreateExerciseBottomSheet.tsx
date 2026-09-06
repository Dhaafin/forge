import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dumbbell, X, Plus } from 'lucide-react-native';

import { exercisesService, ExerciseItem } from '../services/exercises.service';
import { Typography, Input, Button, Skeleton } from '@/components/ui';
import { useFlashMessage } from '@/ctx/flash-message-context';
import { Colors } from '@/theme/colors';

const TARGET_MUSCLES = [
  'Chest',
  'Back',
  'Legs',
  'Arms',
  'Shoulders',
  'Core',
  'Glutes',
  'Full Body',
];

export interface CreateExerciseBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (exercise: ExerciseItem) => void;
}

/** Lightweight & Modern S1000RR Styled Create Exercise Bottom Sheet */
export const CreateExerciseBottomSheet: React.FC<CreateExerciseBottomSheetProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const { showSuccess, showError, showWarning } = useFlashMessage();

  const [name, setName] = useState('');
  const [targetMuscle, setTargetMuscle] = useState('Chest');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setTargetMuscle('Chest');
    setSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    const trimmedName = name.trim();

    if (!trimmedName) {
      showWarning('Exercise name is required.', 'Validation');
      return;
    }

    setSubmitting(true);

    try {
      const newExercise = await exercisesService.createExercise({
        name: trimmedName,
        targetMuscle,
      });

      showSuccess(`Exercise "${newExercise.name}" created!`, 'Success');
      resetForm();
      if (onSuccess) {
        onSuccess(newExercise);
      }
      onClose();
    } catch (err: any) {
      console.error('Error creating exercise:', err);
      showError(err?.message || 'Failed to create exercise', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
          />

          <Animated.View
            entering={SlideInDown.duration(320).springify().damping(18)}
            exiting={SlideOutDown.duration(220)}
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom + 16, 24) },
            ]}
          >
            {/* Top Handle Indicator */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.iconCircle}>
                  <Dumbbell size={18} color={Colors.racingRed} />
                </View>
                <View>
                  <Typography variant="h3" style={styles.title}>
                    CREATE EXERCISE
                  </Typography>
                  <Typography variant="caption" color={Colors.textSecondary}>
                    Add custom exercise to library
                  </Typography>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* M-Tricolor Line */}
            <View style={styles.tricolorLine}>
              <View style={[styles.triSegment, { backgroundColor: Colors.racingRed }]} />
              <View style={[styles.triSegment, { backgroundColor: Colors.motorsportBlue }]} />
              <View style={[styles.triSegment, { backgroundColor: Colors.electricCyan }]} />
            </View>

            {/* Submitting Skeleton Loader */}
            {submitting ? (
              <View style={styles.submittingSkeletonContainer}>
                <Typography variant="caption" color={Colors.racingRed} style={{ marginBottom: 8 }}>
                  SAVING NEW EXERCISE...
                </Typography>
                <Skeleton width="100%" height={48} borderRadius={10} style={{ marginBottom: 12 }} />
                <Skeleton width="100%" height={40} borderRadius={8} />
              </View>
            ) : (
              <View style={styles.formContainer}>
                {/* Exercise Name Input */}
                <Input
                  label="EXERCISE NAME"
                  placeholder="e.g., Incline Dumbbell Press"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoFocus
                />

                {/* Target Muscle Selector */}
                <Typography variant="label" style={styles.muscleLabel}>
                  TARGET MUSCLE GROUP
                </Typography>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.muscleChipsScroll}
                >
                  {TARGET_MUSCLES.map((muscle) => {
                    const isSelected = targetMuscle === muscle;
                    return (
                      <TouchableOpacity
                        key={muscle}
                        style={[
                          styles.muscleChip,
                          isSelected && styles.activeMuscleChip,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setTargetMuscle(muscle)}
                      >
                        <Typography
                          variant="caption"
                          style={styles.chipText}
                          color={isSelected ? Colors.electricCyan : Colors.textPrimary}
                        >
                          {muscle.toUpperCase()}
                        </Typography>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <Button
                    title="CANCEL"
                    variant="ghost"
                    onPress={handleClose}
                    style={styles.cancelBtn}
                  />
                  <Button
                    title="CREATE EXERCISE"
                    variant="primary"
                    loading={submitting}
                    onPress={handleSubmit}
                    icon={<Plus size={16} color="#FFFFFF" />}
                    style={styles.submitBtn}
                  />
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  title: {
    fontSize: 15,
    fontFamily: 'Inter_900Black',
    letterSpacing: 0.8,
    color: Colors.darkCarbon,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  tricolorLine: {
    height: 3,
    flexDirection: 'row',
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: 18,
  },
  triSegment: {
    flex: 1,
  },
  formContainer: {
    gap: 14,
  },
  submittingSkeletonContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  muscleLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.5,
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 4,
  },
  muscleChipsScroll: {
    gap: 8,
    paddingBottom: 6,
  },
  muscleChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    transform: [{ skewX: '-10deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeMuscleChip: {
    backgroundColor: Colors.darkCarbon,
    borderColor: Colors.racingRed,
    borderWidth: 1.5,
  },
  chipText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.5,
    includeFontPadding: false,
    textAlignVertical: 'center',
    transform: [{ skewX: '10deg' }],
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
  },
  submitBtn: {
    flex: 2,
  },
});
