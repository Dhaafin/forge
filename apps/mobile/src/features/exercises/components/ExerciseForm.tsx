import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Typography, Input, Button } from '@/components/ui';
import { useFlashMessage } from '@/ctx/flash-message-context';
import { Colors } from '@/theme/colors';

export const TARGET_MUSCLES = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
  'Full Body',
] as const;

export interface ExerciseFormProps {
  initialName?: string;
  initialTargetMuscle?: string;
  submitButtonText: string;
  submitButtonIcon?: React.ReactNode;
  submitButtonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (data: { name: string; targetMuscle: string }) => void;
}

export const ExerciseForm: React.FC<ExerciseFormProps> = ({
  initialName = '',
  initialTargetMuscle = 'Chest',
  submitButtonText,
  submitButtonIcon,
  submitButtonVariant = 'primary',
  submitting,
  onCancel,
  onSubmit,
}) => {
  const { showWarning } = useFlashMessage();
  const [name, setName] = useState(initialName);
  const [targetMuscle, setTargetMuscle] = useState(initialTargetMuscle);

  useEffect(() => {
    setName(initialName);
    setTargetMuscle(initialTargetMuscle);
  }, [initialName, initialTargetMuscle]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showWarning('Exercise name is required.', 'Validation');
      return;
    }
    onSubmit({ name: trimmedName, targetMuscle });
  };

  return (
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

      {/* Target Muscle Group Selector */}
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

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Button
          title="CANCEL"
          variant="outline"
          onPress={onCancel}
          disabled={submitting}
          style={styles.cancelBtn}
        />
        <Button
          title={submitButtonText}
          variant={submitButtonVariant}
          loading={submitting}
          onPress={handleSubmit}
          icon={!submitting ? submitButtonIcon : undefined}
          style={styles.submitBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
