import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import {
  Dumbbell,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Trophy,
  Zap,
} from 'lucide-react-native';

import { useExercisePicker } from '../hooks/useExercisePicker';
import { ExerciseItem } from '@/features/exercises/services/exercises.service';
import { CreateExerciseBottomSheet } from '@/features/exercises/components/CreateExerciseBottomSheet';
import { Typography, Input, Badge, Skeleton, BottomSheetModal } from '@/components/ui';
import { Colors } from '@/theme/colors';

const MUSCLE_GROUPS = [
  'All',
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
  'Full Body',
];

export interface ExercisePickerBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseItem) => void;
}

export const ExercisePickerBottomSheet: React.FC<ExercisePickerBottomSheetProps> = ({
  visible,
  onClose,
  onSelectExercise,
}) => {
  const [createSheetVisible, setCreateSheetVisible] = useState(false);

  const {
    exercises,
    loading,
    loadingMore,
    search,
    setSearch,
    selectedMuscle,
    setSelectedMuscle,
    loadMore,
    expandedExerciseId,
    historyMap,
    loadingHistoryMap,
    toggleExpandExercise,
    refetch,
  } = useExercisePicker(visible);

  const handleClose = () => {
    onClose();
  };

  const handleSelectMuscle = (muscle: string) => {
    if (muscle === 'All') {
      setSelectedMuscle(null);
    } else {
      setSelectedMuscle(selectedMuscle === muscle ? null : muscle);
    }
  };

  const renderExerciseRow = ({ item }: { item: ExerciseItem }) => {
    const isExpanded = expandedExerciseId === item.id;
    const historyData = historyMap[item.id];
    const isHistoryLoading = loadingHistoryMap[item.id];

    return (
      <View style={styles.exerciseCard}>
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.cardMainTouchable}
            activeOpacity={0.7}
            onPress={() => toggleExpandExercise(item.id)}
          >
            <View style={styles.cardIconCircle}>
              <Dumbbell size={16} color={Colors.racingRed} />
            </View>

            <View style={styles.cardMainInfo}>
              <Typography variant="h3" style={styles.exerciseName}>
                {item.name}
              </Typography>
              <Typography variant="caption" color={Colors.textSecondary}>
                {item.targetMuscle}
              </Typography>
            </View>

            <Badge label={item.targetMuscle} variant="dark" style={styles.badge} />

            <View style={styles.chevronBox}>
              {isExpanded ? (
                <ChevronUp size={18} color={Colors.racingRed} />
              ) : (
                <ChevronDown size={18} color={Colors.textSecondary} />
              )}
            </View>
          </TouchableOpacity>

          {/* Direct 1-Tap Quick Add Button */}
          <TouchableOpacity
            style={styles.quickAddBtn}
            activeOpacity={0.8}
            onPress={() => {
              onSelectExercise(item);
              handleClose();
            }}
          >
            <Plus size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Accordion History Content */}
        {isExpanded && (
          <View style={styles.accordionContainer}>
            {isHistoryLoading ? (
              <View style={styles.centerPadding}>
                <Skeleton width="80%" height={24} borderRadius={8} />
              </View>
            ) : historyData && (historyData.allTimeMaxWeight > 0 || historyData.history.length > 0) ? (
              <View style={styles.historyContent}>
                {/* All-time Stats Summary Bar */}
                <View style={styles.statsRow}>
                  <View style={styles.statPill}>
                    <Trophy size={14} color={Colors.racingRed} style={{ marginRight: 6 }} />
                    <Typography variant="caption" color={Colors.textSecondary}>
                      Max: <Typography variant="label" color={Colors.darkCarbon}>{historyData.allTimeMaxWeight} kg</Typography>
                    </Typography>
                  </View>

                  <View style={styles.statPill}>
                    <Zap size={14} color={Colors.electricCyan} style={{ marginRight: 6 }} />
                    <Typography variant="caption" color={Colors.textSecondary}>
                      Est 1RM: <Typography variant="label" color={Colors.darkCarbon}>{historyData.estimatedOneRm} kg</Typography>
                    </Typography>
                  </View>
                </View>

                {/* 3 Recent History Logs */}
                <Typography variant="label" style={styles.historySectionLabel}>
                  RECENT SESSION LOGS
                </Typography>

                {historyData.history.slice(0, 3).map((log, idx) => (
                  <View key={log.sessionId || idx} style={styles.historyLogRow}>
                    <Typography variant="caption" color={Colors.textSecondary} style={{ width: 80 }}>
                      {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Typography>

                    <Typography variant="caption" color={Colors.darkCarbon} style={{ flex: 1 }}>
                      {log.sets.map((s) => `${s.weightKg}kg × ${s.reps}`).join(' • ')}
                    </Typography>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.centerPadding}>
                <Typography variant="caption" color={Colors.textSecondary}>
                  Belum ada riwayat latihan untuk gerakan ini.
                </Typography>
              </View>
            )}

            {/* Action Button to Add to Workout */}
            <TouchableOpacity
              style={styles.addExerciseBtn}
              activeOpacity={0.85}
              onPress={() => {
                onSelectExercise(item);
                handleClose();
              }}
            >
              <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Typography variant="label" color="#FFFFFF">
                ADD TO WORKOUT
              </Typography>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={handleClose}
      title="SELECT EXERCISE"
      subtitle="Choose exercise & view 1RM history"
      headerLeft={
        <View style={styles.iconCircle}>
          <Dumbbell size={18} color={Colors.racingRed} />
        </View>
      }
      heightPercent="92%"
    >
      {/* Search Input */}
      <Input
        placeholder="Search exercise name..."
        value={search}
        onChangeText={setSearch}
        leftIcon={<Search size={18} color={Colors.textSecondary} />}
        containerStyle={styles.searchInputContainer}
      />

      {/* Create Custom Exercise Button right under search bar */}
      <TouchableOpacity
        style={styles.createInlineBtn}
        activeOpacity={0.8}
        onPress={() => setCreateSheetVisible(true)}
      >
        <Plus size={14} color={Colors.racingRed} style={{ marginRight: 6 }} />
        <Typography variant="label" color={Colors.racingRed}>
          CREATE NEW EXERCISE
        </Typography>
      </TouchableOpacity>

      {/* Muscle Filter Chips */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {MUSCLE_GROUPS.map((muscle) => {
            const isSelected =
              muscle === 'All' ? selectedMuscle === null : selectedMuscle === muscle;

            return (
              <TouchableOpacity
                key={muscle}
                style={[
                  styles.filterChip,
                  isSelected && styles.activeFilterChip,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectMuscle(muscle)}
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
      </View>

      {/* Exercise List */}
      {loading ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4, 5].map((k) => (
            <View key={k} style={styles.skeletonCard}>
              <Skeleton width={34} height={34} borderRadius={17} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Skeleton width="60%" height={16} borderRadius={6} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderExerciseRow}
          style={styles.flatList}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                <Skeleton width={120} height={14} borderRadius={4} />
              </View>
            ) : null
          }
        />
      )}

      {/* Integration with CreateExerciseBottomSheet */}
      <CreateExerciseBottomSheet
        visible={createSheetVisible}
        onClose={() => setCreateSheetVisible(false)}
        onSuccess={(newExercise) => {
          refetch();
          onSelectExercise(newExercise);
          handleClose();
        }}
      />
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
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
  searchInputContainer: {
    marginBottom: 8,
  },
  createInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  chipsWrapper: {
    height: 36,
    marginBottom: 10,
    justifyContent: 'center',
  },
  chipsContainer: {
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterChip: {
    backgroundColor: Colors.darkCarbon,
    borderColor: Colors.darkCarbon,
  },
  chipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  flatList: {
    flex: 1,
  },
  listContent: {
    gap: 8,
    paddingBottom: 40,
  },
  skeletonList: {
    gap: 8,
  },
  skeletonCard: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cardMainTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.racingRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cardIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardMainInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.darkCarbon,
  },
  badge: {
    marginRight: 8,
  },
  chevronBox: {
    padding: 4,
  },
  accordionContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    padding: 12,
    gap: 10,
  },
  centerPadding: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  historyContent: {
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historySectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  historyLogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.racingRed,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
});
