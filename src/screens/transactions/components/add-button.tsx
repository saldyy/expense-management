import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';
import { radius, spacing } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type AddButtonProps = {
  label: string;
  onPress: () => void;
};

export function AddButton({ label, onPress }: AddButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 14 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14 });
      }}
      style={[styles.fab, { backgroundColor: theme.accent }, animatedStyle]}
    >
      <Text style={styles.plus}>＋</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    alignItems: 'center',
    borderRadius: radius.pill,
    bottom: spacing.xl,
    elevation: 4,
    height: 60,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    width: 60,
  },
  plus: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 32,
  },
});
