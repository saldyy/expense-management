import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { accentRamp, fontSize, radius } from '@/theme';

type IconButtonProps = {
  icon: LucideIcon;
  onPress: () => void;
  label: string;
  variant?: 'secondary' | 'ghost';
  /** Icon glyph + hit-box size in px. Defaults to the standard 36px control. */
  size?: number;
  color?: string;
  style?: ViewStyle;
  /** Small count badge on the top-right corner. Omitted (or 0) renders nothing. */
  badge?: number;
};

export function IconButton({
  icon: Icon,
  onPress,
  label,
  variant = 'secondary',
  size = 36,
  color,
  style,
  badge,
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
      {badge ? (
        <View
          style={[
            styles.badge,
            { backgroundColor: theme.accent, borderColor: theme.background },
          ]}
        >
          <Text style={[styles.badgeLabel, { color: theme.background }]}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    justifyContent: 'center',
    minWidth: 16,
    paddingHorizontal: 3,
    position: 'absolute',
    right: -4,
    top: -4,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: fontSize.caption,
  },
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    justifyContent: 'center',
    position: 'relative',
  },
});
