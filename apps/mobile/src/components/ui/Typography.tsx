import React from 'react';
import { Text as RNText, TextStyle, StyleSheet, TextProps } from 'react-native';
import { Colors } from '@/theme/colors';

export interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'subtitle' | 'body' | 'label' | 'caption';
  color?: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  style?: TextStyle | TextStyle[];
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  color,
  align = 'left',
  bold = false,
  style,
  ...props
}) => {
  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return styles.h1;
      case 'h2':
        return styles.h2;
      case 'h3':
        return styles.h3;
      case 'subtitle':
        return styles.subtitle;
      case 'body':
        return styles.body;
      case 'label':
        return styles.label;
      case 'caption':
        return styles.caption;
      default:
        return styles.body;
    }
  };

  return (
    <RNText
      style={[
        getVariantStyle(),
        { color: color || Colors.textPrimary, textAlign: align },
        bold && styles.boldFont,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  body: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  caption: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textMuted,
  },
  boldFont: {
    fontWeight: '700',
  },
});
