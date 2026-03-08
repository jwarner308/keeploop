import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, gradients, radii, spacing } from '../src/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <LinearGradient colors={gradients.screen} style={styles.background}>
        <View style={styles.container}>
          <Text style={styles.title}>Safety & Trust</Text>
          <Text style={styles.subtitle}>Your photos are safe in KeepLoop.</Text>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, styles.cardTitleFirst]}>Deletion is always confirmed</Text>
            <Text style={styles.cardText}>
              Nothing is removed immediately when you swipe. You review and confirm deletions at the end of
              each session.
            </Text>
            <Text style={styles.cardTitle}>No dark patterns</Text>
            <Text style={styles.cardText}>
              KeepLoop never pressures you to delete. You stay in control of what happens to your photos.
            </Text>
            <Text style={styles.cardTitle}>Private by design</Text>
            <Text style={styles.cardText}>Your photos stay on your device. No uploads. No tracking.</Text>
          </View>

          <PrimaryButton label="Back to Home" onPress={() => router.back()} />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    fontFamily: fonts.heading,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.muted,
    fontFamily: fonts.body,
  },
  card: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
    fontFamily: fonts.subheading,
  },
  cardTitleFirst: {
    marginTop: 0,
  },
  cardText: {
    fontSize: 14,
    color: colors.muted,
    fontFamily: fonts.body,
  },
});
