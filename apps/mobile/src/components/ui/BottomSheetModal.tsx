import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Typography } from './Typography';
import { Colors } from '@/theme/colors';

export interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  heightPercent?: number | string;
}

export function BottomSheetModal({
  visible,
  onClose,
  title,
  subtitle,
  headerLeft,
  headerRight,
  children,
  containerStyle,
  contentStyle,
  heightPercent,
}: BottomSheetModalProps) {
  const insets = useSafeAreaInsets();
  const dynamicBottomPadding = Math.max(insets.bottom + 12, 20);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: dynamicBottomPadding },
            heightPercent ? { height: heightPercent as any } : null,
            containerStyle,
          ]}
        >
          <View style={styles.handleBar} />

          {(title || headerLeft || headerRight) && (
            <View style={styles.header}>
              <View style={styles.headerTitleGroup}>
                {headerLeft}
                <View style={styles.textColumn}>
                  {title && (
                    <Typography variant="h2" style={styles.titleText}>
                      {title}
                    </Typography>
                  )}
                  {subtitle && (
                    <Typography
                      variant="caption"
                      color={Colors.textSecondary}
                      style={styles.subtitleText}
                    >
                      {subtitle}
                    </Typography>
                  )}
                </View>
              </View>

              {headerRight || (
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.7}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={[styles.content, heightPercent ? styles.flexContent : null, contentStyle]}>
            {children}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  sheetContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  textColumn: {
    flex: 1,
  },
  titleText: {
    color: Colors.darkCarbon,
  },
  subtitleText: {
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 16,
  },
  content: {
    width: '100%',
  },
  flexContent: {
    flex: 1,
  },
});
