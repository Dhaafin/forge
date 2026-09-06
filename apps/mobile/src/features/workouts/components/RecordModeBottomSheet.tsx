import React, { useRef, useEffect } from 'react';
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
import { Play, Calendar, X, Dumbbell } from 'lucide-react-native';

import { WorkoutMode } from '../hooks/useActiveWorkout';
import { Typography } from '@/components/ui';
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
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
    }
  }, [visible, translateY]);

  const handleClose = () => {
    translateY.value = 0;
    onClose();
  };

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

  if (!visible) return null;

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
            {/* Top Handle */}
            <View style={styles.handleContainer} {...panResponder.panHandlers}>
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
                    RECORD WORKOUT
                  </Typography>
                  <Typography variant="caption" color={Colors.textSecondary}>
                    Choose how you want to record your session
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

            {/* Mode Option Cards */}
            <View style={styles.optionsContainer}>
              {/* Live Workout Mode */}
              <TouchableOpacity
                style={styles.optionCard}
                activeOpacity={0.85}
                onPress={() => {
                  onSelectMode('live');
                  handleClose();
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
                  handleClose();
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
    marginBottom: 20,
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
