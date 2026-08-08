import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { radius, spacing } from '@/theme';

type SheetProps = {
  children: ReactNode;
  anchor?: 'bottom' | 'center';
  /** Defaults to router.back() — the modal route this lives in is expected to be popped. */
  onClose?: () => void;
};

/**
 * A backdrop + panel over the (still-mounted, dimmed) screen underneath —
 * meant to be the entire body of a `transparentModal` route, matching the
 * mockup's faded-parent-screen dialog pattern.
 */
export function Sheet({ children, anchor = 'bottom', onClose }: SheetProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  function handleClose() {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        onPress={handleClose}
        style={StyleSheet.absoluteFill}
      >
        <Animated.View
          entering={FadeIn.duration(180)}
          style={[styles.backdrop, StyleSheet.absoluteFill]}
        />
      </Pressable>

      <View
        pointerEvents="box-none"
        style={[
          styles.wrapper,
          anchor === 'bottom' ? styles.bottomWrapper : styles.centerWrapper,
        ]}
      >
        <Animated.View
          entering={
            anchor === 'bottom'
              ? SlideInDown.duration(240).springify().damping(22)
              : FadeIn.duration(200)
          }
          style={[
            styles.panel,
            { backgroundColor: theme.surface },
            anchor === 'bottom'
              ? { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingBottom: insets.bottom + spacing.md }
              : { borderRadius: radius.lg, margin: spacing.lg },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  bottomWrapper: {
    justifyContent: 'flex-end',
  },
  centerWrapper: {
    justifyContent: 'center',
  },
  panel: {
    maxHeight: '80%',
    padding: spacing.lg,
  },
  wrapper: {
    flex: 1,
  },
});
