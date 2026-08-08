import { Plus } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
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
        scale.value = withSpring(0.92, { damping: 14 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14 });
      }}
      style={[styles.fab, { backgroundColor: theme.accent }, animatedStyle]}
    >
      <Plus color={theme.background} size={22} strokeWidth={2.5} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    alignItems: 'center',
    borderRadius: radius.md,
    bottom: spacing.lg,
    elevation: 4,
    height: 52,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    width: 52,
  },
});
