import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { Trash2, Plus } from 'lucide-react-native';
import { Typography, Badge } from '@/components/ui';
import { Colors } from '@/theme/colors';
import { ActiveExercise, ActiveSet } from '../../hooks/useActiveWorkout';
import { ActiveSetRow } from './ActiveSetRow';

export interface ActiveExerciseCardProps {
  exercise: ActiveExercise;
  index: number;
  onRemoveExercise: (exerciseId: string) => void;
  onAddSet: (exerciseId: string) => void;
  onCycleSetType: (exerciseId: string, setId: string, currentType: ActiveSet['setType']) => void;
  onUpdateSet: (exerciseId: string, setId: string, updates: Partial<ActiveSet>) => void;
  onToggleComplete: (exerciseId: string, setId: string) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
}

export const ActiveExerciseCard: React.FC<ActiveExerciseCardProps> = ({
  exercise,
  index,
  onRemoveExercise,
  onAddSet,
  onCycleSetType,
  onUpdateSet,
  onToggleComplete,
  onRemoveSet,
}) => {
  return (
    <Animated.View
      layout={LinearTransition.springify()}
      entering={FadeInDown.delay(index * 40).duration(300)}
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
              {exercise.name}
            </Typography>
            <Badge label={exercise.targetMuscle} variant="dark" style={{ marginTop: 2 }} />
          </View>

          <TouchableOpacity
            style={styles.deleteExerciseBtn}
            activeOpacity={0.7}
            onPress={() => onRemoveExercise(exercise.id)}
          >
            <Trash2 size={16} color={Colors.racingRed} />
          </TouchableOpacity>
        </View>

        {/* Set Table Header */}
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

        {/* Set Rows */}
        {exercise.sets.map((setRow) => (
          <ActiveSetRow
            key={setRow.id}
            exerciseId={exercise.id}
            setRow={setRow}
            onCycleSetType={onCycleSetType}
            onUpdateSet={onUpdateSet}
            onToggleComplete={onToggleComplete}
            onRemoveSet={onRemoveSet}
          />
        ))}

        {/* Add Set Button */}
        <TouchableOpacity
          style={styles.addSetBtn}
          activeOpacity={0.8}
          onPress={() => onAddSet(exercise.id)}
        >
          <Plus size={14} color={Colors.racingRed} style={{ marginRight: 4 }} />
          <Typography variant="label" color={Colors.racingRed}>
            Add Set
          </Typography>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
});
