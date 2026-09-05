import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAuth, API_BASE_URL } from '@/ctx/auth-context';
import { MotorsportTheme } from '@/constants/theme';
import { MotorsportStripe } from '@/components/MotorsportBadge';

export type WorkoutSessionItem = {
  id: string;
  userId: string;
  title: string | null;
  startTime: string;
  endTime: string | null;
  durationMinutes: number | null;
  createdAt: string;
};

type TimeWindow = 'all' | '7d' | '30d' | '90d' | 'ytd';

export default function HistoryScreen() {
  const { token } = useAuth();

  const [sessions, setSessions] = useState<WorkoutSessionItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('all');

  const fetchSessions = useCallback(
    async (isRefresh = false) => {
      if (!token) return;

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const queryParams = new URLSearchParams();
        if (search.trim()) queryParams.append('search', search.trim());
        if (timeWindow !== 'all') queryParams.append('timeWindow', timeWindow);
        queryParams.append('limit', '50');

        const response = await fetch(`${API_BASE_URL}/api/workouts/sessions?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const resData = await response.json();
          // Handles envelope response { data: [...], meta: { total } } or array fallback
          if (Array.isArray(resData)) {
            setSessions(resData);
            setTotalCount(resData.length);
          } else if (resData && Array.isArray(resData.data)) {
            setSessions(resData.data);
            setTotalCount(resData.meta?.total ?? resData.data.length);
          }
        }
      } catch (error) {
        console.error('[fetchSessions]', error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, search, timeWindow]
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  };

  const renderItem = ({ item }: { item: WorkoutSessionItem }) => (
    <View style={styles.card}>
      <MotorsportStripe />
      <View style={styles.cardInner}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sessionTitle}>{item.title || 'Workout Session'}</Text>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {item.durationMinutes ? `${item.durationMinutes} min` : 'Completed'}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.dateText}>📅 {formatDate(item.startTime)}</Text>
          <Text style={styles.timeText}>🕒 {formatTime(item.startTime)}</Text>
        </View>
      </View>
    </View>
  );

  const timeWindowOptions: { label: string; value: TimeWindow }[] = [
    { label: 'ALL', value: 'all' },
    { label: '7 DAYS', value: '7d' },
    { label: '30 DAYS', value: '30d' },
    { label: '90 DAYS', value: '90d' },
    { label: 'YTD', value: 'ytd' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={MotorsportTheme.colors.bgDark} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>SESSION TELEMETRY</Text>
            <View style={styles.mBadge}>
              <View style={[styles.mStripe, { backgroundColor: MotorsportTheme.colors.mCyan }]} />
              <View style={[styles.mStripe, { backgroundColor: MotorsportTheme.colors.mBlue }]} />
              <View style={[styles.mStripe, { backgroundColor: MotorsportTheme.colors.mRed }]} />
            </View>
          </View>
          <Text style={styles.subTitle}>WORKOUT LOGS ({totalCount} SESSIONS)</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search sessions by title..."
            placeholderTextColor={MotorsportTheme.colors.textDim}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => fetchSessions()}
            returnKeyType="search"
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {timeWindowOptions.map((opt) => {
            const isActive = timeWindow === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setTimeWindow(opt.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* List of Sessions */}
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={MotorsportTheme.colors.mBlue} />
            <Text style={styles.loadingText}>Fetching Telemetry Logs...</Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchSessions(true)}
                tintColor={MotorsportTheme.colors.mBlue}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>NO TELEMETRY LOGS FOUND</Text>
                <Text style={styles.emptyDesc}>
                  {search ? 'Try adjusting your search criteria.' : 'Record your first workout session to track telemetry.'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MotorsportTheme.colors.bgDark,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    marginBottom: 16,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontFamily: MotorsportTheme.fonts.headerHeavy,
    fontSize: 22,
    letterSpacing: 2,
    color: MotorsportTheme.colors.textWhite,
  },
  mBadge: {
    flexDirection: 'row',
    height: 14,
    width: 20,
    transform: [{ skewX: '-20deg' }],
    borderRadius: 2,
    overflow: 'hidden',
  },
  mStripe: {
    flex: 1,
    height: '100%',
  },
  subTitle: {
    fontFamily: MotorsportTheme.fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: MotorsportTheme.colors.textMuted,
    marginTop: 2,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: MotorsportTheme.colors.bgInput,
    borderWidth: 1,
    borderColor: MotorsportTheme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: MotorsportTheme.fonts.body,
    fontSize: 13,
    color: MotorsportTheme.colors.textWhite,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: MotorsportTheme.colors.bgCard,
    borderWidth: 1,
    borderColor: MotorsportTheme.colors.border,
  },
  chipActive: {
    backgroundColor: MotorsportTheme.colors.mBlue,
    borderColor: MotorsportTheme.colors.mBlue,
  },
  chipText: {
    fontFamily: MotorsportTheme.fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: MotorsportTheme.colors.textMuted,
  },
  chipTextActive: {
    color: MotorsportTheme.colors.textWhite,
  },
  listContent: {
    paddingBottom: 24,
    gap: 14,
  },
  card: {
    backgroundColor: MotorsportTheme.colors.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MotorsportTheme.colors.border,
    overflow: 'hidden',
  },
  cardInner: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionTitle: {
    fontFamily: MotorsportTheme.fonts.header,
    fontSize: 17,
    color: MotorsportTheme.colors.textWhite,
    flex: 1,
    marginRight: 8,
  },
  durationBadge: {
    backgroundColor: 'rgba(0, 163, 224, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 224, 0.3)',
  },
  durationText: {
    fontFamily: MotorsportTheme.fonts.bodySemiBold,
    fontSize: 10,
    color: MotorsportTheme.colors.mCyan,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateText: {
    fontFamily: MotorsportTheme.fonts.body,
    fontSize: 12,
    color: MotorsportTheme.colors.textMuted,
  },
  timeText: {
    fontFamily: MotorsportTheme.fonts.body,
    fontSize: 12,
    color: MotorsportTheme.colors.textMuted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontFamily: MotorsportTheme.fonts.bodyMedium,
    fontSize: 12,
    color: MotorsportTheme.colors.textMuted,
    letterSpacing: 1,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: MotorsportTheme.fonts.header,
    fontSize: 14,
    letterSpacing: 1.5,
    color: MotorsportTheme.colors.textDim,
    marginBottom: 6,
  },
  emptyDesc: {
    fontFamily: MotorsportTheme.fonts.body,
    fontSize: 12,
    color: MotorsportTheme.colors.textMuted,
    textAlign: 'center',
  },
});
