import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  ScrollView,
  ActivityIndicator,
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
import {
  Dumbbell,
  X,
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
import { Typography, Input, Badge, Button, Skeleton } from '@/components/ui';
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
  const insets = useSafeAreaInsets();
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
        <TouchableOpacity
          style={styles.cardHeader}
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

        {/* Accordion History Content */}
        {isExpanded && (
          <View style={styles.accordionContainer}>
            {isHistoryLoading ? (
              <View style={styles.centerPadding}>
                <ActivityIndicator size="small" color={Colors.racingRed} />
                <Typography variant="caption" color={Colors.textSecondary} style={{ marginTop: 6 }}>
                  Loading history stats...
                </Typography>
              </View>
            ) : historyData && (historyData.all_time_max_weight > 0 || historyData.history.length > 0) ? (
              <View style={styles.historyContent}>
                {/* All-time Stats Summary Bar */}
                <View style={styles.statsRow}>
                  <View style={styles.statPill}>
                    <Trophy size={14} color={Colors.racingRed} style={{ marginRight: 6 }} />
                    <Typography variant="caption" color={Colors.textSecondary}>
                      Max: <Typography variant="label" color={Colors.darkCarbon}>{historyData.all_time_max_weight} kg</Typography>
                    </Typography>
                  </View>

                  <View style={styles.statPill}>
                    <Zap size={14} color={Colors.electricCyan} style={{ marginRight: 6 }} />
                    <Typography variant="caption" color={Colors.textSecondary}>
                      Est 1RM: <Typography variant="label" color={Colors.darkCarbon}>{historyData.estimated_1rm} kg</Typography>
                    </Typography>
                  </View>
                </View>

                {/* 3 Recent History Logs */}
                <Typography variant="label" style={styles.historySectionLabel}>
                  RECENT SESSION LOGS
                </Typography>

                {historyData.history.slice(0, 3).map((log, idx) => (
                  <View key={log.session_id || idx} style={styles.historyLogRow}>
                    <Typography variant="caption" color={Colors.textSecondary} style={{ width: 80 }}>
                      {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Typography>

                    <Typography variant="caption" color={Colors.darkCarbon} style={{ flex: 1 }}>
                      {log.sets.map((s) => `${s.weight_kg}kg × ${s.reps}`).join(' • ')}
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
              { paddingBottom: Math.max(insets.bottom + 12, 20) },
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
                    SELECT EXERCISE
                  </Typography>
                  <Typography variant="caption" color={Colors.textSecondary}>
                    Choose exercise & view 1RM history
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
                keyExtractor={(item) => item.id}
                renderItem={renderExerciseRow}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onEndReached={loadMore}
                onEndReachedThreshold={0.4}
                ListFooterComponent={
                  loadingMore ? (
                    <ActivityIndicator size="small" color={Colors.racingRed} style={{ paddingVertical: 16 }} />
                  ) : null
                }
              />
            )}
          </Animated.View>

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
    height: '92%',
    maxHeight: '94%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
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
    marginBottom: 10,
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
    padding: 12,
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
