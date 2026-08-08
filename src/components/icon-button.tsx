import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { accentRamp, radius } from '@/theme';

type IconButtonProps = {
  icon: LucideIcon;
  onPress: () => void;
  label: string;
  variant?: 'secondary' | 'ghost';
  /** Icon glyph + hit-box size in px. Defaults to the standard 36px control. */
  size?: number;
  color?: string;
  style?: ViewStyle;
};

export function IconButton({
  icon: Icon,
  onPress,
  label,
  variant = 'secondary',
  size = 36,
  color,
  style,
}: IconButtonProps) {
  const theme = useTheme();
  const iconColor = color ?? (variant === 'ghost' ? theme.accent : theme.text);
  const iconSize = Math.round(size * 0.5);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: theme.divider,
          backgroundColor: pressed
            ? variant === 'ghost'
              ? `${accentRamp[100]}80`
              : theme.surfaceAlt
            : 'transparent',
        },
        style,
      ]}
    >
      <Icon color={iconColor} size={iconSize} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    justifyContent: 'center',
  },
});
