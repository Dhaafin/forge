import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Dumbbell, Search, RefreshCw, AlertCircle } from 'lucide-react-native';

import { useExercises } from '../hooks/useExercises';
import { ExerciseItem } from '../services/exercises.service';
import { Typography, Input, Badge, ScreenHeader } from '@/components/ui';
import { Colors } from '@/theme/colors';

const MUSCLE_GROUPS = [
  'All',
  'Chest',
  'Back',
  'Legs',
  'Arms',
  'Shoulders',
  'Core',
  'Calves',
];

export const ExercisesOrganism: React.FC = () => {
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
      entering={FadeInDown.delay(Math.min(index * 40, 400)).duration(400)}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardIconCircle}>
          <Dumbbell size={18} color={Colors.racingRed} />
        </View>

        <View style={styles.cardTitleContainer}>
          <Typography variant="h3" style={styles.exerciseName}>
            {item.name}
          </Typography>
        </View>

        <Badge
          label={item.targetMuscle.toUpperCase()}
          variant={item.targetMuscle === selectedMuscle ? 'primary' : 'dark'}
        />
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrapper}>
        <ScreenHeader
          badgeLabel="EXERCISES DATABASE"
          icon={<Dumbbell size={32} color={Colors.racingRed} />}
          titlePrefix="FORGE"
          titleHighlight="EXERCISES"
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

        {/* Muscle Filter Horizontal Chips */}
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
                  styles.chip,
                  isSelected && styles.activeChip,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectMuscle(muscle)}
              >
                <Typography
                  variant="caption"
                  style={styles.chipText}
                  color={isSelected ? Colors.textInverse : Colors.darkCarbon}
                >
                  {muscle}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Exercises List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.racingRed} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  screenHeader: {
    marginBottom: 16,
  },
  searchInputContainer: {
    marginBottom: 12,
  },
  chipsContainer: {
    paddingBottom: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeChip: {
    backgroundColor: Colors.racingRed,
    borderColor: Colors.racingRed,
  },
  chipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 8,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  },
  exerciseName: {
    fontSize: 15,
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
});
