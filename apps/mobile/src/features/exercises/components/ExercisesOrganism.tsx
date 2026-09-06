import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dumbbell, Search, RefreshCw, AlertCircle, ChevronRight, Plus } from 'lucide-react-native';

import { useExercises } from '../hooks/useExercises';
import { ExerciseItem } from '../services/exercises.service';
import { CreateExerciseBottomSheet } from './CreateExerciseBottomSheet';
import { Typography, Input, Badge, ScreenHeader, Skeleton } from '@/components/ui';
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

export const ExercisesOrganism: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [createSheetVisible, setCreateSheetVisible] = useState(false);

  const {
    exercises,
    loading,
    error,
    search,
    setSearch,
    selectedMuscle,
    setSelectedMuscle,
    refetch,
  } = useExercises();

  const handleSelectMuscle = (muscle: string) => {
    if (muscle === 'All') {
      setSelectedMuscle(null);
    } else {
      setSelectedMuscle(selectedMuscle === muscle ? null : muscle);
    }
  };

  const renderExerciseItem = ({ item, index }: { item: ExerciseItem; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 35, 350)).duration(350)}
      style={styles.card}
    >
      {/* Left Edge Accent Stripe */}
      <View style={styles.cardStripe}>
        <View style={[styles.stripePart, { backgroundColor: Colors.racingRed }]} />
        <View style={[styles.stripePart, { backgroundColor: Colors.motorsportBlue }]} />
      </View>

      <View style={styles.cardInner}>
        <View style={styles.cardIconCircle}>
          <Dumbbell size={16} color={Colors.racingRed} />
        </View>

        <View style={styles.cardTitleContainer}>
          <Typography variant="h3" style={styles.exerciseName}>
            {item.name}
          </Typography>
        </View>

        <Badge
          label={item.targetMuscle}
          variant={item.targetMuscle === selectedMuscle ? 'primary' : 'dark'}
        />

        <ChevronRight size={16} color={Colors.textMuted} style={styles.chevron} />
      </View>
    </Animated.View>
  );

  const topInsetPadding = Math.max(insets.top + 16, 28);

  return (
    <View style={[styles.container, { paddingTop: topInsetPadding }]}>
      <View style={styles.headerWrapper}>
        <ScreenHeader
          titleHighlight="Exercises"
          subtitle="Explore targeting movements for your workout programs"
          containerStyle={styles.screenHeader}
        />

        {/* Search Input */}
        <Input
          placeholder="Search exercise name..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Search size={18} color={Colors.textSecondary} />}
          containerStyle={styles.searchInputContainer}
        />

        {/* Filter Chips */}
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

      {/* Main Exercises List with Skeleton Placeholders */}
      {loading ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4, 5].map((key) => (
            <View key={key} style={styles.skeletonCard}>
              <Skeleton width={34} height={34} borderRadius={17} style={{ marginRight: 12 }} />
              <View style={{ flex: 1, marginRight: 12 }}>
                <Skeleton width="75%" height={16} borderRadius={6} />
              </View>
              <Skeleton width={60} height={20} borderRadius={4} />
            </View>
          ))}
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <AlertCircle size={32} color={Colors.error} style={{ marginBottom: 12 }} />
          <Typography variant="body" color={Colors.error} align="center">
            {error}
          </Typography>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <RefreshCw size={16} color={Colors.racingRed} style={{ marginRight: 6 }} />
            <Typography variant="label" color={Colors.racingRed}>
              Retry
            </Typography>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={renderExerciseItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Typography variant="body" color={Colors.textSecondary}>
                No exercises found matching your search.
              </Typography>
            </View>
          }
        />
      )}

      {/* Bottom-Right Floating Action Button (FAB) anchored 16px above ActionBar */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setCreateSheetVisible(true)}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Create Exercise Bottom Sheet */}
      <CreateExerciseBottomSheet
        visible={createSheetVisible}
        onClose={() => setCreateSheetVisible(false)}
        onSuccess={() => refetch()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerWrapper: {
    paddingHorizontal: 20,
  },
  screenHeader: {
    marginBottom: 12,
  },
  searchInputContainer: {
    marginBottom: 12,
  },
  chipsContainer: {
    paddingBottom: 14,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
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
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 84,
    gap: 10,
  },
  skeletonList: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 10,
  },
  skeletonCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  cardStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    flexDirection: 'column',
  },
  stripePart: {
    flex: 1,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    paddingLeft: 18,
  },
  cardIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  exerciseName: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.darkCarbon,
    includeFontPadding: false,
  },
  chevron: {
    marginLeft: 6,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.racingRed,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.racingRed,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.racingRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 99,
  },
});
