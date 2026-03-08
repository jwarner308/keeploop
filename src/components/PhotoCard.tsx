import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadow, spacing } from '../constants/theme';

type Props = {
  source: ImageSourcePropType;
  label?: string;
};

export function PhotoCard({ source, label }: Props) {
  return (
    <View style={styles.container}>
      <Image source={source} style={styles.image} resizeMode="cover" />
      {label ? (
        <View style={styles.caption}>
          <Text style={styles.captionText}>{label}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  caption: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(17, 24, 39, 0.65)',
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.subheading,
  },
});
