import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MotorsportTheme } from '@/constants/theme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={MotorsportTheme.colors.mCyan}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: MotorsportTheme.fonts.header,
    fontSize: 14,
    color: MotorsportTheme.colors.textWhite,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
