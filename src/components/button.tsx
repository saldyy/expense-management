import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { accentRamp, fontFamily, fontSize, radius, spacing } from '@/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  /** `dangerOutline` = secondary shape, accent-700 border + text — "Delete X" on a form. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerOutline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const theme = useTheme();

  const backgroundColor =
    variant === 'primary' ? theme.accent : variant === 'danger' ? accentRamp[700] : 'transparent';
  const textColor =
    variant === 'primary' || variant === 'danger'
      ? theme.background
      : variant === 'ghost'
        ? theme.accent
        : variant === 'dangerOutline'
          ? accentRamp[700]
          : theme.text;
  const borderColor =
    variant === 'secondary'
      ? theme.divider
      : variant === 'danger' || variant === 'dangerOutline'
        ? accentRamp[700]
        : 'transparent';
  const hasBorder =
    variant === 'secondary' || variant === 'danger' || variant === 'dangerOutline';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth: hasBorder ? 1 : 0,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.body,
  },
});
