import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  FadeInLeft,
  FadeOutRight,
  LinearTransition,
} from 'react-native-reanimated';
import {
  Dumbbell,
  Edit3,
  Calendar,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Clock,
  AlertTriangle,
} from 'lucide-react-native';

import { WorkoutSessionItem } from '../services/history.service';
import { workoutsService } from '@/features/workouts/services/workouts.service';
import { BottomSheetModal, Typography, Button, Input } from '@/components/ui';
import { useFlashMessage } from '@/providers';
import { Colors } from '@/theme/colors';

export interface SessionActionHubBottomSheetProps {
  visible: boolean;
  session: WorkoutSessionItem | null;
  onClose: () => void;
  onEditSets: (sessionId: string) => void;
  onSessionUpdated: () => void;
  onSessionDeleted?: () => void;
}

type HubView = 'menu' | 'rename' | 'timing' | 'delete';

function formatDateHeader(dateStr?: string): string {
  if (!dateStr) return '';
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

export const SessionActionHubBottomSheet: React.FC<SessionActionHubBottomSheetProps> = ({
  visible,
  session,
  onClose,
  onEditSets,
  onSessionUpdated,
  onSessionDeleted,
}) => {
  const { showSuccess, showError } = useFlashMessage();
  const [view, setView] = useState<HubView>('menu');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Form states
  const [title, setTitle] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [durationStr, setDurationStr] = useState('');
  const [loading, setLoading] = useState(false);

  const goToView = (nextView: HubView) => {
    setDirection('forward');
    setView(nextView);
  };

  const goBackToMenu = () => {
    setDirection('backward');
    setView('menu');
  };

  // Sync state when session or visibility changes
  useEffect(() => {
    if (visible && session) {
      setView('menu');
      setDirection('forward');
      setTitle(session.title || '');
      setDateStr(session.startTime ? new Date(session.startTime).toISOString().split('T')[0] : '');
      setDurationStr(session.durationMinutes ? String(session.durationMinutes) : '');
      setLoading(false);
    }
  }, [visible, session]);

  if (!session) return null;

  const handleSaveTitle = async () => {
    if (!title.trim()) {
      showError('Session title cannot be empty', 'Validation Error');
      return;
    }

    setLoading(true);
    try {
      await workoutsService.updateSession(session.id, { title: title.trim() });
      showSuccess('Session title updated', 'Saved');
      onSessionUpdated();
      onClose();
    } catch (err: any) {
      console.error('Error updating session title:', err);
      showError(err?.message || 'Failed to update session title', 'Update Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTiming = async () => {
    setLoading(true);
    try {
      const parsedDate = new Date(dateStr.trim());
      const startTime = isNaN(parsedDate.getTime()) ? session.startTime : parsedDate.toISOString();
      const parsedDuration = durationStr.trim() ? Math.max(1, parseInt(durationStr.trim(), 10)) : session.durationMinutes;

      await workoutsService.updateSession(session.id, {
        startTime,
        durationMinutes: parsedDuration ?? undefined,
      });

      showSuccess('Session timing updated', 'Saved');
      onSessionUpdated();
      onClose();
    } catch (err: any) {
      console.error('Error updating session timing:', err);
      showError(err?.message || 'Failed to update session timing', 'Update Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await workoutsService.deleteSession(session.id);
      showSuccess('Workout session deleted', 'Deleted');
      if (onSessionDeleted) {
        onSessionDeleted();
      } else {
        onSessionUpdated();
      }
      onClose();
    } catch (err: any) {
      console.error('Error deleting session:', err);
      showError(err?.message || 'Failed to delete session', 'Delete Failed');
    } finally {
      setLoading(false);
    }
  };

  // Back button for sub-views
  const renderBackHeader = () => (
    <TouchableOpacity
      onPress={goBackToMenu}
      style={styles.backButton}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <ChevronLeft size={20} color={Colors.textPrimary} />
    </TouchableOpacity>
  );

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={
        view === 'menu'
          ? 'MANAGE SESSION'
          : view === 'rename'
          ? 'RENAME SESSION'
          : view === 'timing'
          ? 'DATE & DURATION'
          : 'DELETE SESSION'
      }
      subtitle={
        view === 'menu'
          ? `${session.title} • ${formatDateHeader(session.startTime)}`
          : view === 'rename'
          ? 'Enter a new title for this workout'
          : view === 'timing'
          ? 'Adjust session date and duration'
          : 'Confirm session deletion'
      }
      headerLeft={
        view === 'menu' ? (
          <View style={styles.iconCircle}>
            <Dumbbell size={18} color={Colors.racingRed} />
          </View>
        ) : (
          renderBackHeader()
        )
      }
    >
      {view === 'menu' && (
        <Animated.View
          key="menu"
          entering={direction === 'backward' ? FadeInLeft.duration(180) : undefined}
          exiting={FadeOutLeft.duration(140)}
          layout={LinearTransition.duration(180)}
          style={styles.menuContainer}
        >
          {/* Option 1: Edit Exercises & Sets */}
          <TouchableOpacity
            style={styles.optionCard}
            activeOpacity={0.8}
            onPress={() => {
              onClose();
              onEditSets(session.id);
            }}
          >
            <View style={[styles.optionIconCircle, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
              <Dumbbell size={20} color={Colors.racingRed} />
            </View>

            <View style={styles.optionMain}>
              <Typography variant="h3" style={styles.optionTitle}>
                Edit Exercises & Sets
              </Typography>
              <Typography variant="caption" color={Colors.textSecondary}>
                Modify exercises, weights (kg), and reps in full editor
              </Typography>
            </View>

            <ChevronRight size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Option 2: Rename Session Title */}
          <TouchableOpacity
            style={styles.optionCard}
            activeOpacity={0.8}
            onPress={() => goToView('rename')}
          >
            <View style={[styles.optionIconCircle, { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' }]}>
              <Edit3 size={20} color={Colors.motorsportBlue} />
            </View>

            <View style={styles.optionMain}>
              <Typography variant="h3" style={styles.optionTitle}>
                Rename Session Title
              </Typography>
              <Typography variant="caption" color={Colors.textSecondary}>
                Change the title (e.g. Upper Body A, Leg Day)
              </Typography>
            </View>

            <ChevronRight size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Option 3: Adjust Date & Duration */}
          <TouchableOpacity
            style={styles.optionCard}
            activeOpacity={0.8}
            onPress={() => goToView('timing')}
          >
            <View style={[styles.optionIconCircle, { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }]}>
              <Calendar size={20} color="#16A34A" />
            </View>

            <View style={styles.optionMain}>
              <Typography variant="h3" style={styles.optionTitle}>
                Adjust Date & Duration
              </Typography>
              <Typography variant="caption" color={Colors.textSecondary}>
                Update workout date and logged duration (minutes)
              </Typography>
            </View>

            <ChevronRight size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Option 4: Delete Session */}
          <TouchableOpacity
            style={styles.dangerRow}
            activeOpacity={0.8}
            onPress={() => goToView('delete')}
          >
            <Trash2 size={16} color={Colors.error} style={{ marginRight: 8 }} />
            <Typography variant="label" color={Colors.error}>
              Delete Workout Session
            </Typography>
          </TouchableOpacity>
        </Animated.View>
      )}

      {view === 'rename' && (
        <Animated.View
          key="rename"
          entering={FadeInRight.duration(180)}
          exiting={FadeOutRight.duration(140)}
          layout={LinearTransition.duration(180)}
          style={styles.formContainer}
        >
          <Input
            label="SESSION TITLE"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Push Day A"
            containerStyle={styles.inputSpacing}
            autoFocus
          />

          <View style={styles.formActions}>
            <Button
              title="Save Title"
              loading={loading}
              variant="primary"
              onPress={handleSaveTitle}
            />
            <Button
              title="Cancel"
              variant="outline"
              disabled={loading}
              onPress={goBackToMenu}
              style={styles.cancelButton}
            />
          </View>
        </Animated.View>
      )}

      {view === 'timing' && (
        <Animated.View
          key="timing"
          entering={FadeInRight.duration(180)}
          exiting={FadeOutRight.duration(140)}
          layout={LinearTransition.duration(180)}
          style={styles.formContainer}
        >
          <Input
            label="DATE (YYYY-MM-DD)"
            value={dateStr}
            onChangeText={setDateStr}
            placeholder="YYYY-MM-DD"
            leftIcon={<Calendar size={16} color={Colors.textSecondary} />}
            containerStyle={styles.inputSpacing}
          />

          <Input
            label="DURATION (MINUTES)"
            value={durationStr}
            onChangeText={setDurationStr}
            keyboardType="numeric"
            placeholder="e.g. 45"
            leftIcon={<Clock size={16} color={Colors.textSecondary} />}
            containerStyle={styles.inputSpacing}
          />

          <View style={styles.formActions}>
            <Button
              title="Save Timing"
              loading={loading}
              variant="primary"
              onPress={handleSaveTiming}
            />
            <Button
              title="Cancel"
              variant="outline"
              disabled={loading}
              onPress={goBackToMenu}
              style={styles.cancelButton}
            />
          </View>
        </Animated.View>
      )}

      {view === 'delete' && (
        <Animated.View
          key="delete"
          entering={FadeInRight.duration(180)}
          exiting={FadeOutRight.duration(140)}
          layout={LinearTransition.duration(180)}
          style={styles.deleteContainer}
        >
          <View style={styles.warningBox}>
            <AlertTriangle size={24} color={Colors.error} style={{ marginRight: 12 }} />
            <Typography variant="body" color={Colors.textPrimary} style={styles.warningText}>
              Are you sure you want to permanently delete this workout session? All logged sets and volume data will be removed.
            </Typography>
          </View>

          <View style={styles.formActions}>
            <Button
              title="Delete Session"
              loading={loading}
              variant="primary"
              style={{ backgroundColor: Colors.error }}
              onPress={handleDelete}
            />
            <Button
              title="Cancel"
              variant="outline"
              disabled={loading}
              onPress={goBackToMenu}
              style={styles.cancelButton}
            />
          </View>
        </Animated.View>
      )}
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuContainer: {
    gap: 12,
    paddingTop: 4,
    paddingBottom: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  optionMain: {
    flex: 1,
    marginRight: 8,
  },
  optionTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkCarbon,
    marginBottom: 2,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  formContainer: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  inputSpacing: {
    marginBottom: 14,
  },
  formActions: {
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    borderColor: Colors.border,
  },
  deleteContainer: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
