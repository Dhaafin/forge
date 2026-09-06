import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  PanResponder,
} from 'react-native';
import Animated, {
  SlideInDown,
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Edit3, X, Save } from 'lucide-react-native';

import { exercisesService, ExerciseItem } from '../services/exercises.service';
import { TARGET_MUSCLES } from './CreateExerciseBottomSheet';
import { Typography, Input, Button } from '@/components/ui';
import { useFlashMessage } from '@/ctx/flash-message-context';
import { Colors } from '@/theme/colors';

export interface EditExerciseBottomSheetProps {
  exercise: ExerciseItem | null;
  visible: boolean;
  onClose: () => void;
  onSuccess?: (exercise: ExerciseItem) => void;
}

/** Lightweight & Modern Draggable Edit Exercise Bottom Sheet */
export const EditExerciseBottomSheet: React.FC<EditExerciseBottomSheetProps> = ({
  exercise,
  visible,
  onClose,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const { showSuccess, showError, showWarning } = useFlashMessage();

  const [name, setName] = useState('');
  const [targetMuscle, setTargetMuscle] = useState<string>('Chest');
  const [submitting, setSubmitting] = useState(false);

  const translateY = useSharedValue(0);

  useEffect(() => {
    if (visible && exercise) {
      setName(exercise.name);
      setTargetMuscle(exercise.targetMuscle || 'Chest');
      translateY.value = 0;
    }
  }, [visible, exercise, translateY]);

  const handleClose = () => {
    setSubmitting(false);
    translateY.value = 0;
    onClose();
  };

  // Reanimated + PanResponder drag-to-dismiss gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.value = gestureState.dy;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 60 || gestureState.vy > 0.5) {
          translateY.value = withTiming(400, { duration: 180 }, () => {
            runOnJS(handleClose)();
          });
        } else {
          translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
        }
      },
    })
  ).current;

  const animatedDragStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSubmit = async () => {
    if (!exercise) return;
    Keyboard.dismiss();
    const trimmedName = name.trim();

    if (!trimmedName) {
      showWarning('Exercise name is required.', 'Validation');
      return;
    }

    setSubmitting(true);

    try {
      const updated = await exercisesService.updateExercise(exercise.id, {
        name: trimmedName,
        targetMuscle,
      });

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
            entering={SlideInDown.duration(250)}
            exiting={SlideOutDown.duration(200)}
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom + 16, 24) },
              animatedDragStyle,
            ]}
          >
            {/* Draggable Top Handle */}
            <View style={styles.handleContainer} {...panResponder.panHandlers}>
              <View style={styles.handle} />
            </View>

            {/* Sheet Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.iconCircle}>
                  <Edit3 size={18} color={Colors.motorsportBlue} />
                </View>
                <View>
                  <Typography variant="h3" style={styles.title}>
                    EDIT EXERCISE
                  </Typography>
                  <Typography variant="caption" color={Colors.textSecondary}>
                    Update exercise details
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

            {/* Form Fields */}
            <View style={styles.formContainer}>
              <Input
                label="EXERCISE NAME"
                placeholder="e.g., Incline Dumbbell Press"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoFocus
              />

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
                        color={isSelected ? Colors.textInverse : Colors.textSecondary}
                      >
                        {muscle}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.actionRow}>
                <Button
                  title="CANCEL"
                  variant="outline"
                  onPress={handleClose}
                  disabled={submitting}
                  style={styles.cancelBtn}
                />
                <Button
                  title="SAVE CHANGES"
                  variant="secondary"
                  loading={submitting}
                  onPress={handleSubmit}
                  icon={!submitting ? <Save size={16} color="#FFFFFF" /> : undefined}
                  style={styles.submitBtn}
                />
              </View>
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 14,
    marginHorizontal: -20,
    marginTop: -8,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  formContainer: {
    gap: 14,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeMuscleChip: {
    backgroundColor: Colors.darkCarbon,
    borderColor: Colors.darkCarbon,
  },
  chipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
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
