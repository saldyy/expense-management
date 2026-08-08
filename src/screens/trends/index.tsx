import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CategoryShiftRow } from './components/category-shift-row';
import { InsightCard } from './components/insight-card';
import { TrendChart, type TrendPoint } from './components/trend-chart';
import { EmptyState } from '@/components/empty-state';
import { ScreenContainer } from '@/components/screen-container';
import {
  spendingByCategoryQuery,
  totalsByTypeQuery,
  transactionAmountsQuery,
} from '@/db/queries/transactions';
import { useFormatCurrency } from '@/hooks/use-format-currency';
import { useTheme } from '@/hooks/use-theme';
import { useFilterStore } from '@/stores/use-filter-store';
import { useLocale } from '@/stores/use-settings-store';
import { accentRamp, fontFamily, fontSize, neutralRamp, spacing } from '@/theme';
import { reconcileMonthlySeries } from '@/utils/chart-geometry';
import { addMonths, formatMonthShort, monthKey, monthRange, trailingMonthKeys } from '@/utils/date';

export function Trends() {
  const { t } = useTranslation();
  const theme = useTheme();
  const locale = useLocale();
  const { format } = useFormatCurrency();
  const monthCursor = useFilterStore((state) => state.monthCursor);

  const range = useMemo(() => monthRange(new Date(monthCursor)), [monthCursor]);
  const filter = useMemo(() => ({ start: range.start, end: range.end }), [range]);
  const previousMonthDate = useMemo(() => addMonths(new Date(monthCursor), -1), [monthCursor]);
  const previousRange = useMemo(() => monthRange(previousMonthDate), [previousMonthDate]);
  const previousFilter = useMemo(
    () => ({ start: previousRange.start, end: previousRange.end }),
    [previousRange]
  );

  const { data: totals } = useLiveQuery(totalsByTypeQuery(filter), [filter]);
  const { data: previousTotals } = useLiveQuery(
    totalsByTypeQuery(previousFilter),
    [previousFilter]
  );
  const { data: currentCategories } = useLiveQuery(
    spendingByCategoryQuery(filter, 'expense'),
    [filter]
  );
  const { data: previousCategories } = useLiveQuery(
    spendingByCategoryQuery(previousFilter, 'expense'),
    [previousFilter]
  );

  const trendRange = useMemo(
    () => ({ start: monthRange(addMonths(new Date(monthCursor), -5)).start, end: range.end }),
    [monthCursor, range.end]
  );
  const { data: rawRows } = useLiveQuery(transactionAmountsQuery(trendRange), [trendRange]);
  const monthKeys = useMemo(() => trailingMonthKeys(new Date(monthCursor), 6), [monthCursor]);
  const series = useMemo(() => reconcileMonthlySeries(monthKeys, rawRows), [monthKeys, rawRows]);
  const currentMonthKey = useMemo(() => monthKey(monthCursor), [monthCursor]);

  const points: TrendPoint[] = useMemo(
    () =>
      series.map((point) => ({
        monthKey: point.monthKey,
        valueMinor: point.expenseMinor,
        isCurrent: point.monthKey === currentMonthKey,
      })),
    [series, currentMonthKey]
  );

  const expenseMinor = totals.find((total) => total.type === 'expense')?.totalMinor ?? 0;
  const previousExpenseMinor =
    previousTotals.find((total) => total.type === 'expense')?.totalMinor ?? 0;
  const hasActivity = expenseMinor > 0 || previousExpenseMinor > 0;

  const insightText = useMemo(() => {
    const monthLabel = formatMonthShort(previousMonthDate, locale);
    if (previousExpenseMinor <= 0) {
      if (expenseMinor > 0) {
        return t('trends.insightNew', { amount: format(expenseMinor), month: monthLabel });
      }
      return t('trends.insightFlat', { month: monthLabel });
    }
    const changeMinor = expenseMinor - previousExpenseMinor;
    const pct = Math.round((Math.abs(changeMinor) / previousExpenseMinor) * 100);
    if (changeMinor === 0) {
      return t('trends.insightFlat', { month: monthLabel });
    }
    const key = changeMinor > 0 ? 'trends.insightUp' : 'trends.insightDown';
    return t(key, { amount: format(Math.abs(changeMinor)), pct, month: monthLabel });
  }, [expenseMinor, format, locale, previousExpenseMinor, previousMonthDate, t]);

  const categoryShifts = useMemo(() => {
    const ids = new Set([
      ...currentCategories.map((c) => c.categoryId),
      ...previousCategories.map((c) => c.categoryId),
    ]);
    const shifts = Array.from(ids).map((id) => {
      const current = currentCategories.find((c) => c.categoryId === id);
      const previous = previousCategories.find((c) => c.categoryId === id);
      const source = current ?? previous!;
      const currentShare = expenseMinor > 0 ? ((current?.totalMinor ?? 0) / expenseMinor) * 100 : 0;
      const previousShare =
        previousExpenseMinor > 0
          ? ((previous?.totalMinor ?? 0) / previousExpenseMinor) * 100
          : 0;
      const delta = Math.round(currentShare - previousShare);
      return {
        categoryId: id,
        categoryName: source.categoryName,
        categoryIsDefault: source.categoryIsDefault,
        categoryColor: source.categoryColor,
        delta,
      };
    });
    return shifts.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 6);
  }, [currentCategories, previousCategories, expenseMinor, previousExpenseMinor]);

  return (
    <ScreenContainer edges={{ top: true }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t('trends.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {t('trends.subtitle')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!hasActivity ? (
          <EmptyState icon="📈" title={t('trends.noActivity')} />
        ) : (
          <>
            <TrendChart points={points} />

            <InsightCard kicker={t('trends.insightKicker')} text={insightText} />

            {categoryShifts.length > 0 ? (
              <View>
                <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
                  {t('trends.categoryShift')}
                </Text>
                {categoryShifts.map((shift) => (
                  <CategoryShiftRow
                    categoryColor={shift.categoryColor}
                    categoryIsDefault={shift.categoryIsDefault}
                    categoryName={shift.categoryName}
                    deltaColor={
                      shift.delta > 0 ? accentRamp[700] : neutralRamp.light[600]
                    }
                    deltaLabel={`${shift.delta > 0 ? '+' : ''}${shift.delta}%`}
                    key={shift.categoryId}
                  />
                ))}
              </View>
            ) : null}
          </>
        )}
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
  header: {
    paddingTop: spacing.md,
  },
  sectionHeading: {
    fontSize: fontSize.h6,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: fontSize.caption,
    marginTop: 2,
  },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.h4,
  },
});
