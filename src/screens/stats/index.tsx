import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { ExpenseIncomePie } from './components/expense-income-pie';
import { TrendChart } from './components/trend-chart';
import { ScreenContainer } from '@/components/screen-container';
import {
  totalsByTypeQuery,
  transactionAmountsQuery,
} from '@/db/queries/transactions';
import { useTheme } from '@/hooks/use-theme';
import { MonthSwitcher } from '@/screens/overview/components/month-switcher';
import { useFilterStore } from '@/stores/use-filter-store';
import { useLocale } from '@/stores/use-settings-store';
import { fontSize, spacing } from '@/theme';
import { reconcileMonthlySeries } from '@/utils/chart-geometry';
import { addMonths, monthRange, trailingMonthKeys } from '@/utils/date';

export function Stats() {
  const { t } = useTranslation();
  const theme = useTheme();
  const locale = useLocale();
  const monthCursor = useFilterStore((state) => state.monthCursor);

  const range = useMemo(() => monthRange(new Date(monthCursor)), [monthCursor]);
  const filter = useMemo(() => ({ start: range.start, end: range.end }), [range]);

  const { data: totals } = useLiveQuery(totalsByTypeQuery(filter), [filter]);
  const expenseMinor = totals.find((total) => total.type === 'expense')?.totalMinor ?? 0;
  const incomeMinor = totals.find((total) => total.type === 'income')?.totalMinor ?? 0;

  const trendRange = useMemo(
    () => ({
      start: monthRange(addMonths(new Date(monthCursor), -5)).start,
      end: range.end,
    }),
    [monthCursor, range.end]
  );
  const { data: rawRows } = useLiveQuery(
    transactionAmountsQuery(trendRange),
    [trendRange]
  );
  const monthKeys = useMemo(
    () => trailingMonthKeys(new Date(monthCursor), 6),
    [monthCursor]
  );
  const points = useMemo(
    () => reconcileMonthlySeries(monthKeys, rawRows),
    [monthKeys, rawRows]
  );

  return (
    <ScreenContainer edges={{ top: true }}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: theme.text }]}>{t('stats.title')}</Text>

        <MonthSwitcher />

        <ExpenseIncomePie expenseMinor={expenseMinor} incomeMinor={incomeMinor} />

        <TrendChart locale={locale} points={points} />
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
});
