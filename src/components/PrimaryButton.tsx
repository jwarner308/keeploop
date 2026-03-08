import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, fonts, radii, spacing } from '../constants/theme';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
};

const variantStyles: Record<Variant, { backgroundColor: string; textColor: string }> = {
  primary: { backgroundColor: colors.primary, textColor: '#FFFFFF' },
  secondary: { backgroundColor: colors.primarySoft, textColor: colors.primary },
  danger: { backgroundColor: colors.dangerSoft, textColor: colors.danger },
};

export function PrimaryButton({ label, onPress, variant = 'primary', disabled, style }: Props) {
  const palette = variantStyles[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.backgroundColor, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: palette.textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.bodyMedium,
  },
});
