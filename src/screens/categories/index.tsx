import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Path, Svg } from 'react-native-svg';

import { CategoryRow } from './components/category-row';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { IconButton } from '@/components/icon-button';
import { ScreenContainer } from '@/components/screen-container';
import { SegmentedControl } from '@/components/segmented-control';
import { spendingByCategoryQuery, totalsByTypeQuery } from '@/db/queries/transactions';
import type { TransactionType } from '@/db/schema';
import { useCategoryName } from '@/hooks/use-category-name';
import { useFormatCurrency } from '@/hooks/use-format-currency';
import { useTheme } from '@/hooks/use-theme';
import { useFilterStore } from '@/stores/use-filter-store';
import { useLocale } from '@/stores/use-settings-store';
import { fontFamily, fontSize, spacing } from '@/theme';
import { buildDonutArcs } from '@/utils/chart-geometry';
import { formatMonthTitle, monthRange } from '@/utils/date';

const DONUT_MIN_SIZE = 176;
const DONUT_MAX_SIZE = 240;
const DONUT_STROKE = 24;
/** Keeps the ring's thickness-to-diameter proportion constant as the chart grows. */
const DONUT_OUTER_RADIUS_RATIO = 72 / DONUT_MIN_SIZE;
/** Roughly how many characters of the centered total fit at the min size, e.g. "$1,234.56". */
const DONUT_BASELINE_CHARS = 9;
const DONUT_GROWTH_PER_CHAR = 8;

/** Grows the donut so a long formatted total still fits inside the ring instead of overflowing it. */
function donutSizeForLabel(label: string): number {
  const extraChars = Math.max(0, label.length - DONUT_BASELINE_CHARS);
  return Math.min(DONUT_MIN_SIZE + extraChars * DONUT_GROWTH_PER_CHAR, DONUT_MAX_SIZE);
}

export function Categories() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const locale = useLocale();
  const { format } = useFormatCurrency();
  const resolveCategoryName = useCategoryName();
  const monthCursor = useFilterStore((state) => state.monthCursor);
  const [tab, setTab] = useState<TransactionType>('expense');

  const range = useMemo(() => monthRange(new Date(monthCursor)), [monthCursor]);
  const filter = useMemo(() => ({ start: range.start, end: range.end }), [range]);

  const { data: totals } = useLiveQuery(totalsByTypeQuery(filter), [filter]);
  const { data: rows } = useLiveQuery(
    spendingByCategoryQuery(filter, tab),
    [filter, tab]
  );

  const displayTotal =
    totals.find((total) => total.type === tab)?.totalMinor ?? 0;
  const formattedTotal = format(displayTotal);

  const donutSize = useMemo(() => donutSizeForLabel(formattedTotal), [formattedTotal]);
  const donutCenterPx = donutSize / 2;
  const donutOuterRadius = donutSize * DONUT_OUTER_RADIUS_RATIO;
  const donutInnerRadius = donutOuterRadius - DONUT_STROKE;

  const arcs = useMemo(
    () =>
      buildDonutArcs(
        rows.map((row) => ({
          key: row.categoryId,
          value: row.totalMinor,
          color: row.categoryColor,
        })),
        {
          cx: donutCenterPx,
          cy: donutCenterPx,
          outerRadius: donutOuterRadius,
          innerRadius: donutInnerRadius,
        }
      ),
    [rows, donutCenterPx, donutOuterRadius, donutInnerRadius]
  );

  const analysisText = useMemo(() => {
    if (rows.length === 0) {
      return null;
    }
    const top = rows[0];
    const topPct = displayTotal > 0 ? Math.round((top.totalMinor / displayTotal) * 100) : 0;

    if (rows.length === 1) {
      const key =
        tab === 'income' ? 'categoriesScreen.analysisIncomeSingle' : 'categoriesScreen.analysisExpenseSingle';
      return t(key, {
        name: resolveCategoryName(top.categoryName, top.categoryIsDefault),
        pct: topPct,
      });
    }

    const smallest = rows[rows.length - 1];
    const smallPct =
      displayTotal > 0 ? Math.round((smallest.totalMinor / displayTotal) * 100) : 0;
    const key = tab === 'income' ? 'categoriesScreen.analysisIncome' : 'categoriesScreen.analysisExpense';
    return t(key, {
      name: resolveCategoryName(top.categoryName, top.categoryIsDefault),
      pct: topPct,
      smallName: resolveCategoryName(smallest.categoryName, smallest.categoryIsDefault),
      smallPct,
    });
  }, [displayTotal, resolveCategoryName, rows, t, tab]);

  return (
    <ScreenContainer edges={{ top: true }}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('categoriesScreen.title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            {formatMonthTitle(new Date(monthCursor), locale)} · {format(displayTotal)}{' '}
            {t('categoriesScreen.totalSuffix')}
          </Text>
        </View>
        <IconButton
          icon={Plus}
          label={t('categoriesScreen.addCategory')}
          onPress={() => router.push('/category/new')}
        />
      </View>

      <SegmentedControl
        onChange={setTab}
        options={[
          { value: 'expense', label: t('categoriesScreen.expenseTab') },
          { value: 'income', label: t('categoriesScreen.incomeTab') },
        ]}
        style={styles.segmented}
        value={tab}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {rows.length === 0 ? (
          <EmptyState icon="📊" title={t('categoriesScreen.noActivity')} />
        ) : (
          <>
            <Animated.View entering={FadeIn.duration(220)} style={styles.donutWrap}>
              <Svg height={donutSize} width={donutSize}>
                {arcs.map((arc) => (
                  <Path d={arc.path} fill={arc.color} fillRule="evenodd" key={arc.key} />
                ))}
              </Svg>
              <View
                pointerEvents="none"
                style={[
                  styles.donutCenter,
                  {
                    left: (donutSize - donutInnerRadius * 2) / 2,
                    right: (donutSize - donutInnerRadius * 2) / 2,
                  },
                ]}
              >
                <Text style={[styles.donutLabel, { color: theme.textMuted }]}>
                  {t(tab === 'income' ? 'overview.earnedThisMonth' : 'overview.spentThisMonth')}
                </Text>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[styles.donutValue, { color: theme.text }]}
                >
                  {formattedTotal}
                </Text>
              </View>
            </Animated.View>

            <View style={styles.rows}>
              {rows.map((row) => {
                const pct = displayTotal > 0 ? Math.round((row.totalMinor / displayTotal) * 100) : 0;
                return (
                  <CategoryRow
                    amountMinor={row.totalMinor}
                    categoryColor={row.categoryColor}
                    categoryId={row.categoryId}
                    categoryIsDefault={row.categoryIsDefault}
                    categoryName={row.categoryName}
                    key={row.categoryId}
                    pct={pct}
                  />
                );
              })}
            </View>

            {analysisText ? (
              <Card elevated style={styles.analysisCard}>
                <Text style={[styles.analysisKicker, { color: theme.accent }]}>
                  {t('categoriesScreen.analysisKicker')}
                </Text>
                <Text style={[styles.analysisBody, { color: theme.text }]}>
                  {analysisText}
                </Text>
              </Card>
            ) : null}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  analysisBody: {
    fontSize: fontSize.caption,
    opacity: 0.85,
  },
  analysisCard: {
    marginTop: spacing.lg,
  },
  analysisKicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  donutCenter: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
  },
  donutLabel: {
    fontSize: fontSize.caption,
  },
  donutValue: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.h5,
  },
  donutWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  rows: {
    gap: spacing.md,
  },
  segmented: {
    marginVertical: spacing.md,
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
