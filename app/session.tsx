import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Animated, Dimensions, Easing, PanResponder, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { PhotoCard } from '../src/components/PhotoCard';
import { ProgressBar } from '../src/components/ProgressBar';
import { StatPill } from '../src/components/StatPill';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, gradients, radii, spacing } from '../src/constants/theme';
import { useSession } from '../src/features/session/SessionContext';

export default function SessionScreen() {
  const router = useRouter();
  const {
    photos,
    currentIndex,
    keptIds,
    deletedIds,
    isActionLocked,
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
  const progress = total > 0 ? currentIndex / total : 0;
  const actionsDisabled = isActionLocked;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const [gestureLocked, setGestureLocked] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const swipeThreshold = Math.min(140, screenWidth * 0.25);

  const resetPosition = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start();
  };

  const forceSwipe = (direction: 'left' | 'right') => {
    if (actionsDisabled || gestureLocked) {
      resetPosition();
      return;
    }
    setGestureLocked(true);
    const toX = direction === 'right' ? screenWidth * 1.2 : -screenWidth * 1.2;
    Animated.timing(pan, {
      toValue: { x: toX, y: 0 },
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      setGestureLocked(false);
      if (direction === 'right') {
        markKeep();
      } else {
        markDelete();
      }
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !actionsDisabled &&
          !gestureLocked &&
          Math.abs(gesture.dx) > 10 &&
          Math.abs(gesture.dy) < 40,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > swipeThreshold) {
            forceSwipe('right');
            return;
          }
          if (gesture.dx < -swipeThreshold) {
            forceSwipe('left');
            return;
          }
          resetPosition();
        },
        onPanResponderTerminate: resetPosition,
      }),
    [actionsDisabled, gestureLocked, pan, swipeThreshold]
  );

  useEffect(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.98);
    pan.setValue({ x: 0, y: 0 });
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [currentIndex, fadeAnim, scaleAnim, pan]);

  const rotate = pan.x.interpolate({
    inputRange: [-screenWidth, 0, screenWidth],
    outputRange: ['-6deg', '0deg', '6deg'],
  });

  const keepOpacity = pan.x.interpolate({
    inputRange: [0, swipeThreshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const deleteOpacity = pan.x.interpolate({
    inputRange: [-swipeThreshold, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (total === 0 || !currentPhoto) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <LinearGradient colors={gradients.screen} style={styles.background}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No photos loaded</Text>
            <Text style={styles.emptyText}>Start a new session from the home screen.</Text>
            <PrimaryButton
              label="Back to Home"
              onPress={() => router.replace('/')}
              style={styles.secondaryAction}
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
          <View style={styles.header}>
            <Text style={styles.progressText}>
              {displayIndex} of {total}
            </Text>
            <View style={styles.pillRow}>
              <View style={styles.pillSpacer}>
                <StatPill label="Keep" value={keptIds.length} tone="success" />
              </View>
              <StatPill label="Delete" value={deletedIds.length} tone="danger" />
            </View>
            <View style={styles.progressWrapper}>
              <ProgressBar progress={progress} />
            </View>
          </View>

          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.cardWrapper,
              {
                opacity: fadeAnim,
                transform: [
                  { translateX: pan.x },
                  { translateY: pan.y },
                  { rotate },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <Animated.View style={[styles.swipeBadge, styles.keepBadge, { opacity: keepOpacity }]}>
              <Text style={styles.swipeBadgeText}>KEEP</Text>
            </Animated.View>
            <Animated.View style={[styles.swipeBadge, styles.deleteBadge, { opacity: deleteOpacity }]}>
              <Text style={styles.swipeBadgeText}>DELETE</Text>
            </Animated.View>
            <PhotoCard source={currentPhoto.source} label={currentPhoto.label} />
          </Animated.View>

          <View style={styles.actions}>
            <PrimaryButton
              label="Keep"
              onPress={markKeep}
              variant="primary"
              style={styles.actionButton}
              disabled={actionsDisabled || gestureLocked}
            />
            <PrimaryButton
              label="Delete"
              onPress={markDelete}
              variant="danger"
              style={styles.actionButton}
              disabled={actionsDisabled || gestureLocked}
            />
            <PrimaryButton
              label="Undo"
              onPress={undo}
              variant="secondary"
              disabled={history.length === 0 || actionsDisabled || gestureLocked}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Nothing is removed immediately. You will confirm before deleting.
            </Text>
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
  header: {
    marginBottom: spacing.md,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: fonts.subheading,
  },
  pillRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  pillSpacer: {
    marginRight: spacing.sm,
  },
  progressWrapper: {
    marginTop: spacing.sm,
  },
  cardWrapper: {
    flex: 1,
    borderRadius: radii.lg,
  },
  swipeBadge: {
    position: 'absolute',
    top: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    zIndex: 2,
  },
  keepBadge: {
    left: spacing.md,
    backgroundColor: 'rgba(22, 163, 74, 0.88)',
  },
  deleteBadge: {
    right: spacing.md,
    backgroundColor: 'rgba(217, 72, 72, 0.88)',
  },
  swipeBadgeText: {
    fontSize: 12,
    letterSpacing: 1,
    color: '#FFFFFF',
    fontFamily: fonts.subheading,
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
    fontFamily: fonts.body,
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
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    fontFamily: fonts.body,
  },
  secondaryAction: {
    marginTop: spacing.md,
  },
});
