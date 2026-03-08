import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, radii, spacing } from '../src/constants/theme';
import { useSession } from '../src/features/session/SessionContext';
import { usePhotoPermissions } from '../src/hooks/usePhotoPermissions';
import { loadRecentPhotos } from '../src/services/photoLibraryService';
import { DEFAULT_BATCH_SIZE } from '../src/constants/config';

export default function OnboardingScreen() {
  const router = useRouter();
  const { startSession, resetSession } = useSession();
  const { permission, loading: permissionLoading, request } = usePhotoPermissions();
  const [sessionLoading, setSessionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessLevel = permission?.accessPrivileges ?? 'all';
  const isLimited = accessLevel === 'limited';
  const hasAccess = Boolean(permission?.granted);
  const canAskAgain = permission?.canAskAgain ?? true;
  const isLoading = permissionLoading || sessionLoading;

  const primaryLabel = useMemo(() => {
    if (hasAccess) {
      return 'Start Review';
    }
    if (!canAskAgain) {
      return 'Open Settings';
    }
    return 'Allow Photo Access';
  }, [canAskAgain, hasAccess]);

  const loadSession = async () => {
    setSessionLoading(true);
    setError(null);
    try {
      const photos = await loadRecentPhotos(DEFAULT_BATCH_SIZE);
      if (photos.length === 0) {
        setError('No photos found in your library. Add a few photos and try again.');
        return;
      }
      resetSession();
      startSession(photos);
      router.push('/session');
    } catch (err) {
      setError('We could not load your photos. Please try again.');
    } finally {
      setSessionLoading(false);
    }
  };

  const handlePrimaryAction = async () => {
    setError(null);
    if (hasAccess) {
      await loadSession();
      return;
    }
    if (!canAskAgain) {
      Linking.openSettings();
      return;
    }
    const response = await request();
    if (response.granted) {
      await loadSession();
      return;
    }
    setError('Photo access is required to start a session.');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>KeepLoop</Text>
          <Text style={styles.subtitle}>Review photos quickly. Delete only after you confirm.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How it works</Text>
          <Text style={styles.cardText}>Swipe right to keep. Swipe left to mark for deletion.</Text>
          <Text style={styles.cardText}>Nothing is removed immediately.</Text>
          <Text style={styles.cardText}>You review and confirm before anything is deleted.</Text>
          {isLimited ? (
            <Text style={styles.noticeText}>Limited access: only selected photos will appear.</Text>
          ) : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.actions}>
          <PrimaryButton label={primaryLabel} onPress={handlePrimaryAction} disabled={isLoading} />
          <PrimaryButton
            label="How deletion works"
            onPress={handleSettings}
            variant="secondary"
            style={styles.secondaryAction}
          />
          {isLoading ? <Text style={styles.loadingText}>Preparing your session...</Text> : null}
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
    justifyContent: 'space-between',
  },
  hero: {
    marginTop: spacing.lg,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 16,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: 15,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  noticeText: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.primary,
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.danger,
  },
  actions: {
    marginBottom: spacing.sm,
  },
  secondaryAction: {
    marginTop: spacing.sm,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
});
