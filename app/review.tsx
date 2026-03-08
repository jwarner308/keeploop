import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, gradients, radii, spacing } from '../src/constants/theme';
import { useSession } from '../src/features/session/SessionContext';
import { DEFAULT_BATCH_SIZE } from '../src/constants/config';
import { loadRecentPhotos } from '../src/services/photoLibraryService';
import { deletePhotos } from '../src/services/deletionService';

export default function ReviewScreen() {
  const router = useRouter();
  const { photos, keptIds, deletedIds, unmarkDelete, resetSession, startSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const deletedPhotos = useMemo(
    () => photos.filter((photo) => deletedIds.includes(photo.id)),
    [photos, deletedIds]
  );

  const totalReviewed = keptIds.length + deletedIds.length;
  const deleteCount = deletedIds.length;

  const handleConfirm = () => {
    if (deleteCount === 0) {
      Alert.alert('Nothing to delete', 'You have not marked any photos for deletion.');
      return;
    }

    Alert.alert('Confirm deletion', `Delete ${deleteCount} photo${deleteCount === 1 ? '' : 's'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: async () => {
          setIsLoading(true);
          try {
            const result = await deletePhotos(deletedIds);
            const failed = result.failedIds.length;
            Alert.alert(
              result.mode === 'simulated' ? 'Simulated deletion' : 'Deletion complete',
              failed === 0
                ? `Deleted ${result.deletedIds.length} photo${result.deletedIds.length === 1 ? '' : 's'}.`
                : `Deleted ${result.deletedIds.length} photo${result.deletedIds.length === 1 ? '' : 's'}. ${failed} failed.`
            );
            resetSession();
            router.replace('/');
          } catch (err) {
            Alert.alert('Deletion failed', 'Please try again.');
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const handleStartAnother = async () => {
    setIsLoading(true);
    try {
      const nextPhotos = await loadRecentPhotos(DEFAULT_BATCH_SIZE);
      if (nextPhotos.length === 0) {
        Alert.alert('No photos found', 'Add some photos and try again.');
        return;
      }
      resetSession();
      startSession(nextPhotos);
      router.replace('/session');
    } catch (err) {
      Alert.alert('Unable to load photos', 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (photos.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <LinearGradient colors={gradients.screen} style={styles.background}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No session to review</Text>
            <Text style={styles.emptyText}>Start a new batch to review photos.</Text>
            <PrimaryButton
              label="Start New Batch"
              onPress={handleStartAnother}
              style={styles.secondaryAction}
              disabled={isLoading}
            />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <LinearGradient colors={gradients.screen} style={styles.background}>
        <View style={styles.container}>
          <Text style={styles.title}>Review Summary</Text>
          <Text style={styles.subtitle}>
            Reviewed {totalReviewed} · Keep {keptIds.length} · Delete {deletedIds.length}
          </Text>
          <Text style={styles.helperText}>Nothing is removed until you confirm.</Text>
          <Text style={styles.noteText}>Deletion is simulated in this MVP.</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Marked for deletion</Text>
            <Text style={styles.cardText}>Tap any photo to unmark it.</Text>

            <FlatList
              data={deletedPhotos}
              keyExtractor={(item) => item.id}
              numColumns={3}
              columnWrapperStyle={styles.column}
              contentContainerStyle={styles.grid}
              renderItem={({ item }) => (
                <View style={styles.gridItem}>
                  <View style={styles.gridThumb}>
                    <Image source={item.source} style={styles.gridImage} resizeMode="cover" />
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Marked</Text>
                    </View>
                    <View style={styles.unmarkOverlay}>
                      <PrimaryButton
                        label="Unmark"
                        onPress={() => unmarkDelete(item.id)}
                        variant="secondary"
                        style={styles.unmarkButton}
                      />
                    </View>
                  </View>
                  <Text style={styles.gridLabel} numberOfLines={1}>
                    {item.label ?? 'Photo'}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No photos are marked for deletion.</Text>
              }
            />
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              label="Confirm Delete"
              onPress={handleConfirm}
              variant="danger"
              disabled={isLoading || deleteCount === 0}
            />
            <PrimaryButton
              label="Start Another Batch"
              onPress={handleStartAnother}
              variant="secondary"
              style={styles.secondaryAction}
              disabled={isLoading}
            />
            <PrimaryButton
              label="Cancel"
              onPress={() => router.replace('/')}
              variant="secondary"
              style={styles.secondaryAction}
              disabled={isLoading}
            />
          </View>
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
    fontSize: 24,
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
  helperText: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.muted,
    fontFamily: fonts.body,
  },
  noteText: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.muted,
    fontFamily: fonts.body,
  },
  card: {
    flex: 1,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: fonts.subheading,
  },
  cardText: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.muted,
    fontFamily: fonts.body,
  },
  grid: {
    paddingTop: spacing.md,
  },
  column: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  gridItem: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  gridThumb: {
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  unmarkOverlay: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
  },
  gridLabel: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.muted,
    fontFamily: fonts.body,
  },
  unmarkButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: fonts.bodyMedium,
  },
  actions: {
    marginTop: spacing.md,
  },
  secondaryAction: {
    marginTop: spacing.sm,
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
    fontFamily: fonts.subheading,
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    fontFamily: fonts.body,
  },
});
