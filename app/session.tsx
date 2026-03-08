import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { PhotoCard } from '../src/components/PhotoCard';
import { colors, radii, spacing } from '../src/constants/theme';
import { useSession } from '../src/features/session/SessionContext';

export default function SessionScreen() {
  const router = useRouter();
  const {
    photos,
    currentIndex,
    keptIds,
    deletedIds,
    markKeep,
    markDelete,
    undo,
    history,
  } = useSession();

  useEffect(() => {
    if (photos.length > 0 && currentIndex >= photos.length) {
      router.replace('/review');
    }
  }, [currentIndex, photos.length, router]);

  const total = photos.length;
  const displayIndex = Math.min(currentIndex + 1, total);
  const currentPhoto = photos[currentIndex];

  if (total === 0 || !currentPhoto) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No photos loaded</Text>
          <Text style={styles.emptyText}>Start a new session from the home screen.</Text>
          <PrimaryButton
            label="Back to Home"
            onPress={() => router.replace('/')}
            style={styles.secondaryAction}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.progressText}>
            {displayIndex} of {total}
          </Text>
          <Text style={styles.mutedText}>Keep: {keptIds.length} · Delete: {deletedIds.length}</Text>
        </View>

        <View style={styles.cardWrapper}>
          <PhotoCard source={currentPhoto.source} label={currentPhoto.label} />
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label="Keep"
            onPress={markKeep}
            variant="primary"
            style={styles.actionButton}
          />
          <PrimaryButton
            label="Delete"
            onPress={markDelete}
            variant="danger"
            style={styles.actionButton}
          />
          <PrimaryButton
            label="Undo"
            onPress={undo}
            variant="secondary"
            disabled={history.length === 0}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Nothing is removed immediately. You will confirm before deleting.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  mutedText: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.muted,
  },
  cardWrapper: {
    flex: 1,
    borderRadius: radii.lg,
  },
  actions: {
    marginTop: spacing.lg,
  },
  actionButton: {
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
  },
  footer: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
  secondaryAction: {
    marginTop: spacing.md,
  },
});
