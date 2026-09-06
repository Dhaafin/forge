import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react-native';

import { Typography } from './Typography';
import { Colors } from '@/theme/colors';

export type FlashMessageType = 'success' | 'error' | 'info' | 'warning';

export interface FlashMessageOptions {
  title?: string;
  message: string;
  type?: FlashMessageType;
  duration?: number;
}

export interface FlashMessageProps extends FlashMessageOptions {
  visible: boolean;
  onDismiss: () => void;
}

/** Modern Motorsport S1000RR Styled Top Flash Message / Toast Component */
export const FlashMessage: React.FC<FlashMessageProps> = ({
  visible,
  title,
  message,
  type = 'info',
  duration = 3500,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!visible) {
    return null;
  }

  const getTypeTheme = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#ECFDF5',
          border: '#6EE7B7',
          accent: Colors.success,
          text: '#065F46',
          icon: <CheckCircle2 size={20} color={Colors.success} />,
        };
      case 'error':
        return {
          bg: '#FEF2F2',
          border: '#FCA5A5',
          accent: Colors.racingRed,
          text: '#991B1B',
          icon: <AlertCircle size={20} color={Colors.racingRed} />,
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: '#FDE68A',
          accent: '#F59E0B',
          text: '#92400E',
          icon: <AlertTriangle size={20} color="#F59E0B" />,
        };
      case 'info':
      default:
        return {
          bg: '#EFF6FF',
          border: '#93C5FD',
          accent: Colors.motorsportBlue,
          text: '#1E40AF',
          icon: <Info size={20} color={Colors.motorsportBlue} />,
        };
    }
  };

  const theme = getTypeTheme();
  const topInset = Math.max(insets.top + 8, 20);

  return (
    <Animated.View
      entering={SlideInUp.duration(350).springify()}
      exiting={SlideOutUp.duration(250)}
      style={[styles.container, { top: topInset }]}
    >
      <View
        style={[
          styles.toastCard,
          { backgroundColor: theme.bg, borderColor: theme.border },
        ]}
      >
        {/* Left Color Accent Line */}
        <View style={[styles.leftAccent, { backgroundColor: theme.accent }]} />

        <View style={styles.iconContainer}>{theme.icon}</View>

        <View style={styles.textContainer}>
          {title && (
            <Typography
              variant="label"
              style={styles.titleText}
              color={theme.text}
            >
              {title}
            </Typography>
          )}
          <Typography
            variant="caption"
            style={styles.messageText}
            color={theme.text}
          >
            {message}
          </Typography>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onDismiss}
          style={styles.closeButton}
        >
          <X size={16} color={theme.text} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 9999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconContainer: {
    marginRight: 12,
    marginLeft: 4,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    lineHeight: 16,
    marginBottom: 2,
  },
  messageText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  closeButton: {
    padding: 4,
  },
});
