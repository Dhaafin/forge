import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Dumbbell } from 'lucide-react-native';

import { useActiveWorkout, WorkoutMode, ActiveSet } from '../hooks/useActiveWorkout';
import { ExercisePickerBottomSheet } from './ExercisePickerBottomSheet';
import { Typography, Button } from '@/components/ui';
import { Colors } from '@/theme/colors';
import {
  ActiveWorkoutHeader,
  ActiveWorkoutHud,
  ActiveExerciseCard,
  ActiveWorkoutFooter,
  SET_TYPES,
} from './molecules';

export interface ActiveWorkoutOrganismProps {
  mode?: WorkoutMode;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const ActiveWorkoutOrganism: React.FC<ActiveWorkoutOrganismProps> = ({
  mode = 'live',
  onClose,
  onSuccess,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleExit = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

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
    handleExit();
  });

  // Start session on mount
  useEffect(() => {
    startSession(mode);
  }, [mode, startSession]);

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
              handleExit();
            },
          },
        ]
      );
    } else {
      resetSession();
      handleExit();
    }
  };

  const cycleSetType = (exerciseId: string, setId: string, currentType: ActiveSet['setType']) => {
    const currentIndex = SET_TYPES.findIndex((t) => t.type === currentType);
    const nextIndex = (currentIndex + 1) % SET_TYPES.length;
    updateSet(exerciseId, setId, { setType: SET_TYPES[nextIndex].type });
  };

  const topPadding = Math.max(insets.top + 8, 20);
  const bottomPadding = Math.max(insets.bottom + 8, 16);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Top Header Navigation Molecule */}
      <ActiveWorkoutHeader
        title={title}
        setTitle={setTitle}
        mode={mode}
        onDiscard={handleDiscard}
      />

      {/* Live HUD Metric Bar Molecule */}
      <ActiveWorkoutHud
        elapsedSeconds={elapsedSeconds}
        totalSetsCount={totalSetsCount}
        totalVolumeKg={totalVolumeKg}
        mode={mode}
      />

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
          { paddingBottom: bottomPadding + 64 },
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
            <ActiveExerciseCard
              key={exItem.id}
              exercise={exItem}
              index={exIdx}
              onRemoveExercise={removeExercise}
              onAddSet={addSet}
              onCycleSetType={cycleSetType}
              onUpdateSet={updateSet}
              onToggleComplete={toggleSetComplete}
              onRemoveSet={removeSet}
            />
          ))
        )}
      </ScrollView>

      {/* Bottom Action Footer Bar Molecule */}
      <ActiveWorkoutFooter
        submitting={submitting}
        onFinishWorkout={finishWorkout}
        bottomPadding={bottomPadding}
      />

      {/* Exercise Picker Modal */}
      <ExercisePickerBottomSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelectExercise={(selected) => addExercise(selected)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  addExerciseSubHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  addExerciseBtnStyle: {
    width: '100%',
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
});

