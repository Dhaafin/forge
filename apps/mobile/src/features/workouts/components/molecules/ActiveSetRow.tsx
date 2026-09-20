import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { Check, Trash2 } from 'lucide-react-native';
import { Typography, Badge } from '@/components/ui';
import { Colors } from '@/theme/colors';
import { ActiveSet } from '../../hooks/useActiveWorkout';

export const SET_TYPES: Array<{
  type: ActiveSet['setType'];
  label: string;
  badgeVariant: 'dark' | 'cyan' | 'primary';
}> = [
  { type: 'normal', label: 'N', badgeVariant: 'dark' },
  { type: 'warmup', label: 'W', badgeVariant: 'cyan' },
  { type: 'drop', label: 'D', badgeVariant: 'primary' },
  { type: 'failure', label: 'F', badgeVariant: 'primary' },
];

export interface ActiveSetRowProps {
  exerciseId: string;
  setRow: ActiveSet;
  onCycleSetType: (exerciseId: string, setId: string, currentType: ActiveSet['setType']) => void;
  onUpdateSet: (exerciseId: string, setId: string, updates: Partial<ActiveSet>) => void;
  onToggleComplete: (exerciseId: string, setId: string) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
}

export const ActiveSetRow: React.FC<ActiveSetRowProps> = ({
  exerciseId,
  setRow,
  onCycleSetType,
  onUpdateSet,
  onToggleComplete,
  onRemoveSet,
}) => {
  const setTypeObj = SET_TYPES.find((t) => t.type === setRow.setType) || SET_TYPES[0];

  // Local string buffers to prevent trailing decimal erasure and cursor jumping
  const [weightText, setWeightText] = useState(
    setRow.weightKg !== undefined && setRow.weightKg !== null && setRow.weightKg > 0
      ? String(setRow.weightKg)
      : ''
  );

  const [repsText, setRepsText] = useState(
    setRow.reps !== undefined && setRow.reps !== null && setRow.reps > 0
      ? String(setRow.reps)
      : ''
  );

  // Sync state if setRow values change externally (e.g. session load / reset)
  useEffect(() => {
    const currentNum = parseFloat(weightText.replace(',', '.')) || 0;
    if (setRow.weightKg !== currentNum) {
      setWeightText(setRow.weightKg > 0 ? String(setRow.weightKg) : '');
    }
  }, [setRow.weightKg]);

  useEffect(() => {
    const currentNum = parseInt(repsText, 10) || 0;
    if (setRow.reps !== currentNum) {
      setRepsText(setRow.reps > 0 ? String(setRow.reps) : '');
    }
  }, [setRow.reps]);

  const handleWeightChange = (val: string) => {
    // 1. Normalize comma separator (common on Indonesian/European Android keyboards)
    const normalized = val.replace(',', '.');

    // 2. Allow empty, whole numbers, or decimal numbers with up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(normalized)) {
      setWeightText(normalized);
      const parsed = parseFloat(normalized);
      onUpdateSet(exerciseId, setRow.id, {
        weightKg: isNaN(parsed) ? 0 : parsed,
      });
    }
  };

  const handleWeightBlur = () => {
    if (weightText === '.' || weightText === '') {
      setWeightText('');
      onUpdateSet(exerciseId, setRow.id, { weightKg: 0 });
    } else {
      const parsed = parseFloat(weightText);
      if (!isNaN(parsed)) {
        setWeightText(String(parsed));
      }
    }
  };

  const handleRepsChange = (val: string) => {
    // Allow only integer digits
    if (/^\d*$/.test(val)) {
      setRepsText(val);
      const parsed = parseInt(val, 10);
      onUpdateSet(exerciseId, setRow.id, {
        reps: isNaN(parsed) ? 0 : parsed,
      });
    }
  };

  const handleRepsBlur = () => {
    if (repsText === '') {
      setRepsText('');
      onUpdateSet(exerciseId, setRow.id, { reps: 0 });
    } else {
      const parsed = parseInt(repsText, 10);
      if (!isNaN(parsed)) {
        setRepsText(String(parsed));
      }
    }
  };

  return (
    <Animated.View
      layout={LinearTransition.springify()}
      entering={FadeInDown.duration(200)}
      exiting={FadeOutUp.duration(150)}
      style={[styles.setRow, setRow.completed && styles.completedSetRow]}
    >
      {/* Set Number Badge */}
      <View style={styles.setNumberBadge}>
        <Typography variant="label" style={styles.setNumberText}>
          {setRow.setNumber}
        </Typography>
      </View>

      {/* Set Type Pill Toggle (N/W/D/F) */}
      <TouchableOpacity
        style={styles.setTypeBtn}
        activeOpacity={0.8}
        onPress={() => onCycleSetType(exerciseId, setRow.id, setRow.setType)}
      >
        <Badge label={setTypeObj.label} variant={setTypeObj.badgeVariant} />
      </TouchableOpacity>

      {/* Flexible Weight Input */}
      <View style={styles.inputBox}>
        <TextInput
          style={styles.numInput}
          keyboardType="decimal-pad"
          value={weightText}
          onChangeText={handleWeightChange}
          onBlur={handleWeightBlur}
          placeholder="0"
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {/* Flexible Reps Input */}
      <View style={styles.inputBox}>
        <TextInput
          style={styles.numInput}
          keyboardType="number-pad"
          value={repsText}
          onChangeText={handleRepsChange}
          onBlur={handleRepsBlur}
          placeholder="0"
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {/* Complete Checkbox Toggle */}
      <TouchableOpacity
        style={[styles.checkBtn, setRow.completed && styles.checkedBtn]}
        onPress={() => onToggleComplete(exerciseId, setRow.id)}
      >
        <Check size={14} color={setRow.completed ? '#FFFFFF' : Colors.textMuted} />
      </TouchableOpacity>

      {/* Delete Set Row */}
      <TouchableOpacity
        style={styles.deleteSetBtn}
        onPress={() => onRemoveSet(exerciseId, setRow.id)}
      >
        <Trash2 size={14} color={Colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
});
