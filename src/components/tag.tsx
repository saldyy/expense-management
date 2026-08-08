import { StyleSheet, Text } from 'react-native';

import { useColorSchemeName, useTheme } from '@/hooks/use-theme';
import { accentRamp, fontSize, neutralRamp, radius } from '@/theme';

type TagProps = {
  label: string;
  variant?: 'neutral' | 'accent';
  /** Overrides `variant` with a solid fill — used by the Filter sheet's chips. */
  selected?: boolean;
};

export function Tag({ label, variant = 'neutral', selected = false }: TagProps) {
  const theme = useTheme();
  const scheme = useColorSchemeName();
  const neutral = neutralRamp[scheme];

  const backgroundColor = selected
    ? theme.text
    : variant === 'accent'
      ? accentRamp[100]
      : neutral[100];
  const color = selected
    ? theme.background
    : variant === 'accent'
      ? accentRamp[800]
      : neutral[800];

  return (
    <Text style={[styles.tag, { backgroundColor, color }]}>{label}</Text>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: radius.sm,
    flexShrink: 0,
    fontSize: fontSize.caption,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingRight: 13,
    paddingVertical: 3,
  },
});
