import { StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/stores/use-settings-store';
import { fontSize, spacing } from '@/theme';
import { formatDayHeading } from '@/utils/date';

/** `dayKey` is the `yyyy-MM-dd` grouping key produced by `@/utils/date`. */
export function DayHeader({ dayKey }: { dayKey: string }) {
  const theme = useTheme();
  const locale = useLocale();

  return (
    <Text style={[styles.heading, { color: theme.textMuted }]}>
      {formatDayHeading(new Date(`${dayKey}T00:00:00`).getTime(), locale)}
    </Text>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: fontSize.h6,
    fontWeight: '700',
    letterSpacing: 0.5,
    paddingBottom: spacing.xs,
    paddingTop: spacing.md,
    textTransform: 'uppercase',
  },
});
