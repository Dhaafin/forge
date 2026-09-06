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
import {
  Calendar,
  Search,
  RefreshCw,
  AlertCircle,
  Clock,
  Dumbbell,
  Plus,
} from 'lucide-react-native';

import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { WorkoutSessionItem } from '../services/history.service';
import { RecordModeBottomSheet } from '@/features/workouts/components/RecordModeBottomSheet';
import { ActiveWorkoutScreen } from '@/features/workouts/components/ActiveWorkoutScreen';
import { WorkoutMode } from '@/features/workouts/hooks/useActiveWorkout';
import { Typography, Input, Badge, ScreenHeader, Skeleton } from '@/components/ui';
import { Colors } from '@/theme/colors';

const TIME_WINDOWS = [
  { label: 'All', value: null },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: 'YTD', value: 'ytd' },
];

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export const HistoryOrganism: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [recordSheetVisible, setRecordSheetVisible] = useState(false);
  const [activeWorkoutVisible, setActiveWorkoutVisible] = useState(false);
  const [selectedMode, setSelectedMode] = useState<WorkoutMode>('live');

  const {
    sessions,
    loading,
    error,
    search,
    setSearch,
    selectedWindow,
    setSelectedWindow,
    refetch,
  } = useWorkoutHistory();

  const handleSelectWindow = (value: string | null) => {
    setSelectedWindow(selectedWindow === value ? null : value);
  };

  const handleStartMode = (mode: WorkoutMode) => {
    setSelectedMode(mode);
    setRecordSheetVisible(false);
    setActiveWorkoutVisible(true);
  };

  const renderSessionItem = ({ item, index }: { item: WorkoutSessionItem; index: number }) => (
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
          <Calendar size={16} color={Colors.racingRed} />
        </View>

        <View style={styles.cardMain}>
          <Typography variant="h3" style={styles.sessionTitle} numberOfLines={1}>
            {item.title}
          </Typography>

          <View style={styles.subMetaRow}>
            <Clock size={12} color={Colors.textSecondary} style={{ marginRight: 4 }} />
            <Typography variant="caption" color={Colors.textSecondary}>
              {formatDate(item.startTime)}
            </Typography>
            {item.durationMinutes ? (
              <Typography variant="caption" color={Colors.textSecondary} style={{ marginLeft: 6 }}>
                • {item.durationMinutes} min
              </Typography>
            ) : null}
          </View>
        </View>

        <View style={styles.badgeColumn}>
          {item.setsCount ? (
            <Badge
              label={`${item.setsCount} sets`}
              variant="dark"
              style={styles.badge}
            />
          ) : null}
          {item.totalVolumeKg ? (
            <Badge
              label={`${Math.round(item.totalVolumeKg)} kg`}
              variant="primary"
              style={styles.badge}
            />
          ) : (
            <Badge label="Logged" variant="cyan" style={styles.badge} />
          )}
        </View>
      </View>
    </Animated.View>
  );

  const topInsetPadding = Math.max(insets.top + 16, 28);

  return (
    <View style={[styles.container, { paddingTop: topInsetPadding }]}>
      <View style={styles.headerWrapper}>
        <ScreenHeader
          titleHighlight="History"
          subtitle="Explore past training logs & performance analytics"
          containerStyle={styles.screenHeader}
        />

        {/* Search Input */}
        <Input
          placeholder="Search session title..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Search size={18} color={Colors.textSecondary} />}
          containerStyle={styles.searchInputContainer}
        />

        {/* Filter Chips for Time Presets */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {TIME_WINDOWS.map((window) => {
            const isSelected = selectedWindow === window.value;

            return (
              <TouchableOpacity
                key={window.label}
                style={[
                  styles.filterChip,
                  isSelected && styles.activeFilterChip,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectWindow(window.value)}
              >
                <Typography
                  variant="caption"
                  style={styles.chipText}
                  color={isSelected ? Colors.textInverse : Colors.textSecondary}
                >
                  {window.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Sessions List with Skeleton Placeholders */}
      {loading ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4, 5].map((key) => (
            <View key={key} style={styles.skeletonCard}>
              <Skeleton width={34} height={34} borderRadius={17} style={{ marginRight: 12 }} />
              <View style={{ flex: 1, marginRight: 12 }}>
                <Skeleton width="60%" height={16} borderRadius={6} style={{ marginBottom: 6 }} />
                <Skeleton width="40%" height={12} borderRadius={4} />
              </View>
              <Skeleton width={50} height={20} borderRadius={4} />
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
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSessionItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Dumbbell size={32} color={Colors.textSecondary} style={{ marginBottom: 12 }} />
              <Typography variant="body" color={Colors.textSecondary} align="center">
                No workout sessions recorded yet.
              </Typography>
            </View>
          }
        />
      )}

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setRecordSheetVisible(true)}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Record Mode Choice Sheet */}
      <RecordModeBottomSheet
        visible={recordSheetVisible}
        onClose={() => setRecordSheetVisible(false)}
        onSelectMode={handleStartMode}
      />

      {/* Active Workout Recording Screen */}
      <ActiveWorkoutScreen
        visible={activeWorkoutVisible}
        mode={selectedMode}
        onClose={() => setActiveWorkoutVisible(false)}
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
  cardMain: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  sessionTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.darkCarbon,
    includeFontPadding: false,
    marginBottom: 2,
  },
  subMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeColumn: {
    alignItems: 'flex-end',
    gap: 4,
  },
  badge: {
    marginLeft: 4,
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

