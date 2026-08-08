import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { BalanceCard } from './components/balance-card';
import { MonthSwitcher } from './components/month-switcher';
import { RecentTransactions } from './components/recent-transactions';
import { TopCategoryRow } from './components/top-category-row';
import { ScreenContainer } from '@/components/screen-container';
import {
  listTransactionsQuery,
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

  const { data: totals } = useLiveQuery(totalsByTypeQuery(filter), [filter]);
  const { data: balance } = useLiveQuery(netBalanceQuery(), []);
  const { data: expenseCategories } = useLiveQuery(
    spendingByCategoryQuery(filter, 'expense'),
    [filter]
  );
  const { data: incomeSources } = useLiveQuery(
    spendingByCategoryQuery(filter, 'income'),
    [filter]
  );
  const { data: recent } = useLiveQuery(listTransactionsQuery(filter), [filter]);

  const spentMinor =
    totals.find((total) => total.type === 'expense')?.totalMinor ?? 0;
  const earnedMinor =
    totals.find((total) => total.type === 'income')?.totalMinor ?? 0;
  const netMinor = balance[0]?.netMinor ?? 0;
  const topCategory = expenseCategories[0];
  const topCategoryPct =
    topCategory && spentMinor > 0
      ? Math.round((topCategory.totalMinor / spentMinor) * 100)
      : 0;

  return (
    <ScreenContainer edges={{ top: true }}>
      {/* No page title on Home — the tab bar already labels it; the month
          switcher is the screen's header, matching the mockup. */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <MonthSwitcher />

        <BalanceCard
          earnedMinor={earnedMinor}
          incomeSources={incomeSources}
          netMinor={netMinor}
          spentMinor={spentMinor}
        />

        {topCategory ? (
          <>
            <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
              {t('overview.topCategory')}
            </Text>
            <TopCategoryRow
              amountMinor={topCategory.totalMinor}
              categoryColor={topCategory.categoryColor}
              categoryIsDefault={topCategory.categoryIsDefault}
              categoryName={topCategory.categoryName}
              pct={topCategoryPct}
            />
          </>
        ) : null}

        <RecentTransactions items={recent.slice(0, 4)} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  sectionHeading: {
    fontSize: fontSize.h6,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
});
