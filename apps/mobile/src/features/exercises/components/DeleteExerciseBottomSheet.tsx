import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
import { Trash2, AlertTriangle, X } from 'lucide-react-native';

import { exercisesService, ExerciseItem } from '../services/exercises.service';
import { Typography, Button } from '@/components/ui';
import { useFlashMessage } from '@/ctx/flash-message-context';
import { Colors } from '@/theme/colors';

export interface DeleteExerciseBottomSheetProps {
  exercise: ExerciseItem | null;
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/** Modern Draggable Delete Exercise Confirmation Bottom Sheet */
export const DeleteExerciseBottomSheet: React.FC<DeleteExerciseBottomSheetProps> = ({
  exercise,
  visible,
  onClose,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const { showSuccess, showError } = useFlashMessage();
  const [deleting, setDeleting] = useState(false);

  const translateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
    }
  }, [visible, translateY]);

  const handleClose = () => {
    setDeleting(false);
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

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.iconCircle}>
                  <AlertTriangle size={20} color={Colors.racingRed} />
                </View>
                <View>
                  <Typography variant="h3" style={styles.title}>
                    DELETE EXERCISE
                  </Typography>
                  <Typography variant="caption" color={Colors.textSecondary}>
                    Confirm permanent deletion
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

            {/* Message Body */}
            <View style={styles.bodyContainer}>
              <Typography variant="body" style={styles.message}>
                Are you sure you want to delete{' '}
                <Typography variant="label" color={Colors.darkCarbon}>
                  "{exercise.name}"
                </Typography>
                ? This action cannot be undone.
              </Typography>

              {/* Action Buttons */}
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
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
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
  cancelBtn: {
    flex: 1,
  },
  deleteBtn: {
    flex: 1,
  },
});
