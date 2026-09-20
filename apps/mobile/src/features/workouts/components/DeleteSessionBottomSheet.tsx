import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';

import { workoutsService } from '../services/workouts.service';
import { Typography, Button, BottomSheetModal } from '@/components/ui';
import { useFlashMessage } from '@/providers';
import { Colors } from '@/theme/colors';

export interface DeleteSessionBottomSheetProps {
  sessionId: string | null;
  sessionTitle?: string;
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/** Modern Delete Workout Session Confirmation Bottom Sheet reusing BottomSheetModal UI Primitive */
export const DeleteSessionBottomSheet: React.FC<DeleteSessionBottomSheetProps> = ({
  sessionId,
  sessionTitle,
  visible,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useFlashMessage();
  const [deleting, setDeleting] = useState(false);

  const handleClose = () => {
    setDeleting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!sessionId) return;
    setDeleting(true);

    try {
      await workoutsService.deleteSession(sessionId);
      showSuccess(`Workout session deleted`, 'Deleted');
      queryClient.invalidateQueries();
      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (err: any) {
      console.error('Error deleting workout session:', err);
      showError(err?.message || 'Failed to delete workout session', 'Cannot Delete');
    } finally {
      setDeleting(false);
    }
  };

  if (!visible || !sessionId) return null;

  return (
    <BottomSheetModal
      visible={visible}
      onClose={handleClose}
      title="DELETE WORKOUT"
    >
      <View style={styles.bodyContainer}>
        <Typography variant="body" style={styles.message}>
          Are you sure you want to delete{' '}
          <Typography variant="label" color={Colors.darkCarbon}>
            "{sessionTitle || 'this session'}"
          </Typography>
          ? All sets, logged volumes, and personal records for this session will be removed. This action cannot be undone.
        </Typography>

        <View style={styles.actionRow}>
          <Button
            title="CANCEL"
            variant="outline"
            onPress={handleClose}
            disabled={deleting}
            style={styles.btn}
          />
          <Button
            title="DELETE"
            variant="primary"
            loading={deleting}
            onPress={handleDelete}
            icon={!deleting ? <Trash2 size={16} color="#FFFFFF" /> : undefined}
            style={styles.btn}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  bodyContainer: {
    gap: 16,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
  },
});
