import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BalanceCard } from './components/balance-card';
import { CategoryBreakdown } from './components/category-breakdown';
import { MonthSwitcher } from './components/month-switcher';
import { ScreenContainer } from '@/components/screen-container';
import {
  netBalanceQuery,
  spendingByCategoryQuery,
  totalsByTypeQuery,
} from '@/db/queries/transactions';
import { useTheme } from '@/hooks/use-theme';
import { useFilterStore } from '@/stores/use-filter-store';
import { fontSize, spacing } from '@/theme';
import { monthRange } from '@/utils/date';

export function Overview() {
  const { t } = useTranslation();
  const theme = useTheme();
  const monthCursor = useFilterStore((state) => state.monthCursor);

  const range = useMemo(() => monthRange(new Date(monthCursor)), [monthCursor]);
  const filter = useMemo(() => ({ start: range.start, end: range.end }), [range]);

  // Live queries re-run automatically whenever the tables change.
  const { data: totals } = useLiveQuery(totalsByTypeQuery(filter), [filter]);
  const { data: balance } = useLiveQuery(netBalanceQuery(), []);
  const { data: byCategory } = useLiveQuery(
    spendingByCategoryQuery(filter),
    [filter]
  );

  const spentMinor =
    totals.find((total) => total.type === 'expense')?.totalMinor ?? 0;
  const earnedMinor =
    totals.find((total) => total.type === 'income')?.totalMinor ?? 0;
  const netMinor = balance[0]?.netMinor ?? 0;

  return (
    <ScreenContainer edges={{ top: true }}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: theme.text }]}>
          {t('overview.title')}
        </Text>

        <MonthSwitcher />

        <BalanceCard
          earnedMinor={earnedMinor}
          netMinor={netMinor}
          spentMinor={spentMinor}
        />

        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
            {t('overview.topCategories')}
          </Text>
          <CategoryBreakdown rows={byCategory} totalMinor={spentMinor} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  heading: {
    fontSize: fontSize.display,
    fontWeight: '700',
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeading: {
    fontSize: fontSize.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
