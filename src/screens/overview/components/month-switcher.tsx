import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useFilterStore } from '@/stores/use-filter-store';
import { useLocale } from '@/stores/use-settings-store';
import { fontSize, radius, spacing } from '@/theme';
import { formatMonthTitle } from '@/utils/date';

export function MonthSwitcher() {
  const theme = useTheme();
  const locale = useLocale();
  const monthCursor = useFilterStore((state) => state.monthCursor);
  const goToPreviousMonth = useFilterStore((state) => state.goToPreviousMonth);
  const goToNextMonth = useFilterStore((state) => state.goToNextMonth);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        hitSlop={spacing.sm}
        onPress={goToPreviousMonth}
        style={styles.arrow}
      >
        <Text style={[styles.arrowLabel, { color: theme.accent }]}>‹</Text>
      </Pressable>

      <Text style={[styles.title, { color: theme.text }]}>
        {formatMonthTitle(new Date(monthCursor), locale)}
      </Text>

      <Pressable
        accessibilityRole="button"
        hitSlop={spacing.sm}
        onPress={goToNextMonth}
        style={styles.arrow}
      >
        <Text style={[styles.arrowLabel, { color: theme.accent }]}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  arrow: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  arrowLabel: {
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 30,
  },
  container: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  title: {
    fontSize: fontSize.body,
    fontWeight: '600',
  },
});
