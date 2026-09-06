import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Plus,
  Check,
  Trash2,
  Timer as TimerIcon,
  Flame,
  Dumbbell,
  Layers,
} from 'lucide-react-native';

import { useActiveWorkout, WorkoutMode, ActiveExercise, ActiveSet } from '../hooks/useActiveWorkout';
import { ExercisePickerBottomSheet } from './ExercisePickerBottomSheet';
import { Typography, Badge, Button } from '@/components/ui';
import { Colors } from '@/theme/colors';

export interface ActiveWorkoutScreenProps {
  visible: boolean;
  mode: WorkoutMode;
  onClose: () => void;
  onSuccess?: () => void;
}

const SET_TYPES: Array<{ type: ActiveSet['setType']; label: string; badgeVariant: 'dark' | 'cyan' | 'primary' }> = [
  { type: 'normal', label: 'N', badgeVariant: 'dark' },
  { type: 'warmup', label: 'W', badgeVariant: 'cyan' },
  { type: 'drop', label: 'D', badgeVariant: 'primary' },
  { type: 'failure', label: 'F', badgeVariant: 'primary' },
];

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const ActiveWorkoutScreen: React.FC<ActiveWorkoutScreenProps> = ({
  visible,
  mode,
  onClose,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const [pickerVisible, setPickerVisible] = useState(false);

  const {
    title,
    setTitle,
    elapsedSeconds,
    exercises,
    submitting,
    startSession,
    resetSession,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    toggleSetComplete,
    finishWorkout,
    totalSetsCount,
    totalVolumeKg,
  } = useActiveWorkout(() => {
    if (onSuccess) onSuccess();
    onClose();
  });

  // Start session when modal opens
  React.useEffect(() => {
    if (visible) {
      startSession(mode);
    }
  }, [visible, mode, startSession]);

  const handleDiscard = () => {
    if (exercises.length > 0) {
      Alert.alert(
        'Discard Workout?',
        'Are you sure you want to exit? All recorded sets will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              resetSession();
              onClose();
            },
          },
        ]
      );
    } else {
      resetSession();
      onClose();
    }
  };

  const cycleSetType = (exerciseId: string, setId: string, currentType: ActiveSet['setType']) => {
    const currentIndex = SET_TYPES.findIndex((t) => t.type === currentType);
    const nextIndex = (currentIndex + 1) % SET_TYPES.length;
    updateSet(exerciseId, setId, { setType: SET_TYPES[nextIndex].type });
  };

  if (!visible) return null;

  const topPadding = Math.max(insets.top + 4, 16);
  const bottomPadding = Math.max(insets.bottom + 8, 16);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleDiscard}>
      <View style={[styles.container, { paddingTop: topPadding }]}>
        {/* Top Header Navigation */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={handleDiscard}>
            <X size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Session Title..."
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.badgeWrapper}>
            {mode === 'live' && <View style={styles.livePulseDot} />}
            <Badge
              label={mode === 'live' ? 'LIVE' : 'LOG'}
              variant={mode === 'live' ? 'primary' : 'cyan'}
            />
          </View>
        </View>

        {/* Motorsport Accent Stripe under Top Header */}
        <View style={styles.topAccentStripe}>
          <View style={[styles.stripeHalf, { backgroundColor: Colors.racingRed }]} />
          <View style={[styles.stripeHalf, { backgroundColor: Colors.motorsportBlue }]} />
        </View>

        {/* Live HUD Metric Bar */}
        <View style={styles.hudContainer}>
          <View style={styles.hudCard}>
            <View style={[styles.hudIconCircle, { backgroundColor: '#FEE2E2' }]}>
              <TimerIcon size={16} color={Colors.racingRed} />
            </View>
            <View style={styles.hudTextGroup}>
              <Typography variant="caption" color={Colors.textSecondary} style={styles.hudLabel}>
                {mode === 'live' ? 'LIVE TIMER' : 'DURATION'}
              </Typography>
              <Typography variant="h3" style={styles.hudValue}>
                {formatTimer(elapsedSeconds)}
              </Typography>
            </View>
          </View>

          <View style={styles.hudCard}>
            <View style={[styles.hudIconCircle, { backgroundColor: '#DBEAFE' }]}>
              <Layers size={16} color={Colors.motorsportBlue} />
            </View>
            <View style={styles.hudTextGroup}>
              <Typography variant="caption" color={Colors.textSecondary} style={styles.hudLabel}>
                SETS
              </Typography>
              <Typography variant="h3" style={styles.hudValue}>
                {totalSetsCount}
              </Typography>
            </View>
          </View>

          <View style={styles.hudCard}>
            <View style={[styles.hudIconCircle, { backgroundColor: '#E0F2FE' }]}>
              <Flame size={16} color={Colors.electricCyan} />
            </View>
            <View style={styles.hudTextGroup}>
              <Typography variant="caption" color={Colors.textSecondary} style={styles.hudLabel}>
                VOLUME
              </Typography>
              <Typography variant="h3" style={styles.hudValue}>
                {Math.round(totalVolumeKg)} kg
              </Typography>
            </View>
          </View>
        </View>

        {/* Action Button: Add Exercise under HUD */}
        <View style={styles.addExerciseSubHeader}>
          <Button
            title="+ ADD EXERCISE"
            variant="outline"
            icon={<Plus size={16} color={Colors.racingRed} />}
            onPress={() => setPickerVisible(true)}
            style={styles.addExerciseBtnStyle}
          />
        </View>

        {/* Main Workout Exercises List */}
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomPadding + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {exercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Dumbbell size={40} color={Colors.textMuted} style={{ marginBottom: 12 }} />
              <Typography variant="h3" align="center" style={{ marginBottom: 4 }}>
                No Exercises Added Yet
              </Typography>
              <Typography variant="body" color={Colors.textSecondary} align="center">
                Tap "+ ADD EXERCISE" above to start building your workout session.
              </Typography>
            </View>
          ) : (
            exercises.map((exItem, exIdx) => (
              <Animated.View
                key={exItem.id}
                layout={LinearTransition.springify()}
                entering={FadeInDown.delay(exIdx * 40).duration(300)}
                style={styles.exerciseCard}
              >
                {/* Left Edge Motorsport Accent Stripe */}
                <View style={styles.cardStripe}>
                  <View style={[styles.stripePart, { backgroundColor: Colors.racingRed }]} />
                  <View style={[styles.stripePart, { backgroundColor: Colors.motorsportBlue }]} />
                </View>

                <View style={styles.cardInner}>
                  {/* Exercise Card Header */}
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseTitleBox}>
                      <Typography variant="h3" style={styles.exerciseName}>
                        {exItem.name}
                      </Typography>
                      <Badge label={exItem.targetMuscle} variant="dark" style={{ marginTop: 2 }} />
                    </View>

                    <TouchableOpacity
                      style={styles.deleteExerciseBtn}
                      activeOpacity={0.7}
                      onPress={() => removeExercise(exItem.id)}
                    >
                      <Trash2 size={16} color={Colors.racingRed} />
                    </TouchableOpacity>
                  </View>

                  {/* Flexible Set Table */}
                  <View style={styles.tableHeader}>
                    <Typography variant="caption" style={[styles.colHeader, { width: 32 }]}>
                      SET
                    </Typography>
                    <Typography variant="caption" style={[styles.colHeader, { width: 40 }]}>
                      TYPE
                    </Typography>
                    <Typography variant="caption" style={[styles.colHeader, { flex: 1 }]}>
                      KG
                    </Typography>
                    <Typography variant="caption" style={[styles.colHeader, { flex: 1 }]}>
                      REPS
                    </Typography>
                    <Typography variant="caption" style={[styles.colHeader, { width: 44, textAlign: 'center' }]}>
                      DONE
                    </Typography>
                    <Typography variant="caption" style={[styles.colHeader, { width: 28 }]} />
                  </View>

                  {exItem.sets.map((setRow) => {
                    const setTypeObj = SET_TYPES.find((t) => t.type === setRow.setType) || SET_TYPES[0];

                    return (
                      <Animated.View
                        key={setRow.id}
                        layout={LinearTransition.springify()}
                        entering={FadeInDown.duration(200)}
                        exiting={FadeOutUp.duration(150)}
                        style={[styles.setRow, setRow.completed && styles.completedSetRow]}
                      >
                        {/* Set Number */}
                        <View style={styles.setNumberBadge}>
                          <Typography variant="label" style={styles.setNumberText}>
                            {setRow.setNumber}
                          </Typography>
                        </View>

                        {/* Set Type Pill Toggle (N/W/D/F) */}
                        <TouchableOpacity
                          style={styles.setTypeBtn}
                          activeOpacity={0.8}
                          onPress={() => cycleSetType(exItem.id, setRow.id, setRow.setType)}
                        >
                          <Badge label={setTypeObj.label} variant={setTypeObj.badgeVariant} />
                        </TouchableOpacity>

                        {/* Flexible Weight Input */}
                        <View style={styles.inputBox}>
                          <TextInput
                            style={styles.numInput}
                            keyboardType="decimal-pad"
                            value={setRow.weightKg ? setRow.weightKg.toString() : ''}
                            onChangeText={(val) =>
                              updateSet(exItem.id, setRow.id, { weightKg: parseFloat(val) || 0 })
                            }
                            placeholder="0"
                            placeholderTextColor={Colors.textMuted}
                          />
                        </View>

                        {/* Flexible Reps Input */}
                        <View style={styles.inputBox}>
                          <TextInput
                            style={styles.numInput}
                            keyboardType="number-pad"
                            value={setRow.reps ? setRow.reps.toString() : ''}
                            onChangeText={(val) =>
                              updateSet(exItem.id, setRow.id, { reps: parseInt(val, 10) || 0 })
                            }
                            placeholder="0"
                            placeholderTextColor={Colors.textMuted}
                          />
                        </View>

                        {/* Complete Checkbox Toggle */}
                        <TouchableOpacity
                          style={[styles.checkBtn, setRow.completed && styles.checkedBtn]}
                          onPress={() => toggleSetComplete(exItem.id, setRow.id)}
                        >
                          <Check size={14} color={setRow.completed ? '#FFFFFF' : Colors.textMuted} />
                        </TouchableOpacity>

                        {/* Delete Set Row */}
                        <TouchableOpacity
                          style={styles.deleteSetBtn}
                          onPress={() => removeSet(exItem.id, setRow.id)}
                        >
                          <X size={16} color={Colors.textMuted} />
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  })}

                  {/* Add Set Button (Auto-copies previous set) */}
                  <TouchableOpacity
                    style={styles.addSetBtn}
                    activeOpacity={0.8}
                    onPress={() => addSet(exItem.id)}
                  >
                    <Plus size={14} color={Colors.racingRed} style={{ marginRight: 4 }} />
                    <Typography variant="label" color={Colors.racingRed}>
                      Add Set
                    </Typography>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))
          )}
        </ScrollView>

        {/* Bottom Action Footer Bar */}
        <View style={[styles.bottomBar, { paddingBottom: bottomPadding }]}>
          <Button
            title="FINISH WORKOUT"
            variant="primary"
            loading={submitting}
            icon={!submitting ? <Check size={18} color="#FFFFFF" /> : undefined}
            onPress={finishWorkout}
            style={styles.finishBtn}
          />
        </View>

        {/* Exercise Picker Modal */}
        <ExercisePickerBottomSheet
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          onSelectExercise={(selected) => addExercise(selected)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  titleContainer: {
    flex: 1,
  },
  titleInput: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.darkCarbon,
    paddingVertical: 2,
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.racingRed,
  },
  topAccentStripe: {
    height: 3,
    flexDirection: 'row',
    width: '100%',
  },
  stripeHalf: {
    flex: 1,
    height: '100%',
  },
  hudContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  addExerciseSubHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  addExerciseBtnStyle: {
    width: '100%',
  },
  hudCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hudIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  hudTextGroup: {
    flex: 1,
  },
  hudLabel: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  hudValue: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkCarbon,
    marginTop: -1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardStripe: {
    width: 4,
    flexDirection: 'column',
  },
  stripePart: {
    flex: 1,
  },
  cardInner: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseTitleBox: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.darkCarbon,
  },
  deleteExerciseBtn: {
    padding: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 6,
  },
  colHeader: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 6,
  },
  completedSetRow: {
    opacity: 0.65,
  },
  setNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  setNumberText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkCarbon,
  },
  setTypeBtn: {
    width: 34,
    alignItems: 'center',
  },
  inputBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numInput: {
    width: '100%',
    height: 38,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.darkCarbon,
    textAlign: 'center',
    paddingHorizontal: 4,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBtn: {
    backgroundColor: Colors.racingRed,
    borderColor: Colors.racingRed,
  },
  deleteSetBtn: {
    width: 24,
    alignItems: 'center',
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
  },
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

