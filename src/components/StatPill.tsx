import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing } from '../constants/theme';

type Props = {
  label: string;
  value: number;
  tone?: 'default' | 'success' | 'danger';
};

const toneStyles = {
  default: {
    backgroundColor: colors.primarySoft,
    textColor: colors.primary,
  },
  success: {
    backgroundColor: colors.successSoft,
    textColor: colors.success,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    textColor: colors.danger,
  },
};

export function StatPill({ label, value, tone = 'default' }: Props) {
  const palette = toneStyles[tone];
  return (
    <View style={[styles.container, { backgroundColor: palette.backgroundColor }]}>
      <Text style={[styles.label, { color: palette.textColor }]}>{label}</Text>
      <Text style={[styles.value, { color: palette.textColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    marginRight: spacing.xs,
  },
  value: {
    fontSize: 12,
    fontFamily: fonts.subheading,
  },
});
