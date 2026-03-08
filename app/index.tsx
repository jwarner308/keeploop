import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, fonts, gradients, radii, spacing } from '../src/constants/theme';
import { useSession } from '../src/features/session/SessionContext';
import { usePhotoPermissions } from '../src/hooks/usePhotoPermissions';
import { loadRecentPhotos } from '../src/services/photoLibraryService';
import { DEFAULT_BATCH_SIZE } from '../src/constants/config';
import { LinearGradient } from 'expo-linear-gradient';
import { mockPhotos } from '../src/features/photos/mockPhotos';

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
  const showSettingsHint = !hasAccess && !canAskAgain;

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

  const startDemo = () => {
    resetSession();
    startSession(mockPhotos);
    router.push('/session');
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
      <LinearGradient colors={gradients.screen} style={styles.background}>
        <View style={styles.container}>
          <View style={styles.hero}>
            <View style={styles.badgeRow}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Photo cleanup, done gently</Text>
            </View>
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
            {showSettingsHint ? (
              <Text style={styles.noticeText}>Enable photo access in Settings to use real photos.</Text>
            ) : null}
          </View>

          <View style={styles.actions}>
            <PrimaryButton label={primaryLabel} onPress={handlePrimaryAction} disabled={isLoading} />
            <PrimaryButton
              label="Try a demo session"
              onPress={startDemo}
              variant="secondary"
              style={styles.secondaryAction}
            />
            <PrimaryButton
              label="How deletion works"
              onPress={handleSettings}
              variant="secondary"
              style={styles.secondaryAction}
            />
            {isLoading ? <Text style={styles.loadingText}>Preparing your session...</Text> : null}
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
    justifyContent: 'space-between',
  },
  hero: {
    marginTop: spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
    marginRight: spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.muted,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    fontFamily: fonts.heading,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 16,
    color: colors.muted,
    fontFamily: fonts.body,
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
    fontFamily: fonts.subheading,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: 15,
    color: colors.muted,
    fontFamily: fonts.body,
    marginBottom: spacing.xs,
  },
  noticeText: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.primary,
    fontFamily: fonts.bodyMedium,
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.danger,
    fontFamily: fonts.bodyMedium,
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
    fontFamily: fonts.body,
  },
});
