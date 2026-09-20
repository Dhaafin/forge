import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  StyleProp,
  BackHandler,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
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
  enableDragToDismiss?: boolean;
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
  enableDragToDismiss = true,
}: BottomSheetModalProps) {
  const insets = useSafeAreaInsets();
  const dynamicBottomPadding = Math.max(insets.bottom + 12, 20);
  const [modalVisible, setModalVisible] = useState(visible);
  const dragY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      dragY.value = 0;
      setModalVisible(true);
    } else {
      const timer = setTimeout(() => {
        setModalVisible(false);
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [visible, dragY]);

  useEffect(() => {
    if (!visible) return;
    const backAction = () => {
      onClose();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [visible, onClose]);

  const panGesture = Gesture.Pan()
    .enabled(enableDragToDismiss)
    .onUpdate((event) => {
      if (event.translationY > 0) {
        dragY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 120 || event.velocityY > 600) {
        dragY.value = withTiming(600, { duration: 180 }, () => {
          runOnJS(onClose)();
        });
      } else {
        dragY.value = withSpring(0, { damping: 20, stiffness: 250 });
      }
    });

  const dragAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }],
  }));

  if (!modalVisible && !visible) return null;

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        {visible && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.backdrop}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={onClose}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}

        {visible && (
          <Animated.View
            entering={SlideInDown.duration(250)}
            exiting={SlideOutDown.duration(200)}
            style={[
              styles.sheetContainer,
              { paddingBottom: dynamicBottomPadding },
              heightPercent ? { height: heightPercent as any } : null,
              dragAnimatedStyle,
              containerStyle,
            ]}
          >
            <GestureDetector gesture={panGesture}>
              <View style={styles.handleContainer}>
                <View style={styles.handleBar} />
              </View>
            </GestureDetector>

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
          </Animated.View>
        )}
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
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: -8,
    marginBottom: 6,
  },
  handleBar: {
    width: 38,
    height: 4.5,
    borderRadius: 2.25,
    backgroundColor: Colors.border,
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
