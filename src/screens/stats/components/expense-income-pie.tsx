import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Path, Svg } from 'react-native-svg';

import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { useFormatCurrency } from '@/hooks/use-format-currency';
import { useTheme } from '@/hooks/use-theme';
import { fontSize, radius, spacing } from '@/theme';
import { buildDonutArcs } from '@/utils/chart-geometry';

const SIZE = 160;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 70;
const INNER_RADIUS = 44;

type ExpenseIncomePieProps = {
  expenseMinor: number;
  incomeMinor: number;
};

export function ExpenseIncomePie({ expenseMinor, incomeMinor }: ExpenseIncomePieProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { format } = useFormatCurrency();

  const arcs = useMemo(
    () =>
      buildDonutArcs(
        [
          { key: 'expense', value: expenseMinor, color: theme.expense },
          { key: 'income', value: incomeMinor, color: theme.income },
        ],
        { cx: CENTER, cy: CENTER, outerRadius: OUTER_RADIUS, innerRadius: INNER_RADIUS }
      ),
    [expenseMinor, incomeMinor, theme.expense, theme.income]
  );

  if (expenseMinor === 0 && incomeMinor === 0) {
    return (
      <Card>
        <EmptyState icon="📊" title={t('stats.noActivity')} />
      </Card>
    );
  }

  const netMinor = incomeMinor - expenseMinor;

  return (
    <Card>
      <Animated.View entering={FadeIn.duration(220)} style={styles.chartRow}>
        <View style={styles.ring}>
          <Svg height={SIZE} width={SIZE}>
            {arcs.map((arc) => (
              <Path d={arc.path} fill={arc.color} fillRule="evenodd" key={arc.key} />
            ))}
          </Svg>
          <View style={styles.center} pointerEvents="none">
            <Text style={[styles.centerLabel, { color: theme.textMuted }]}>
              {t('stats.netThisMonth')}
            </Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[styles.centerValue, { color: theme.text }]}
            >
              {format(netMinor)}
            </Text>
          </View>
        </View>

        <View style={styles.legend}>
          <LegendRow
            color={theme.expense}
            label={t('common.expense')}
            share={arcs.find((arc) => arc.key === 'expense')?.share ?? 0}
            value={format(expenseMinor)}
          />
          <LegendRow
            color={theme.income}
            label={t('common.income')}
            share={arcs.find((arc) => arc.key === 'income')?.share ?? 0}
            value={format(incomeMinor)}
          />
        </View>
      </Animated.View>
    </Card>
  );
}

function LegendRow({
  color,
  label,
  value,
  share,
}: {
  color: string;
  label: string;
  value: string;
  share: number;
}) {
  const theme = useTheme();

  return (
    <View style={styles.legendRow}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <View style={styles.legendText}>
        <Text style={[styles.legendLabel, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.legendValue, { color: theme.textMuted }]}>
          {value} · {Math.round(share * 100)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: (SIZE - INNER_RADIUS * 2) / 2,
    position: 'absolute',
    right: (SIZE - INNER_RADIUS * 2) / 2,
    top: 0,
  },
  centerLabel: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  centerValue: {
    fontSize: fontSize.body,
    fontWeight: '700',
  },
  chartRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
  },
  legend: {
    flex: 1,
    gap: spacing.md,
  },
  legendLabel: {
    fontSize: fontSize.body,
    fontWeight: '600',
  },
  legendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  legendText: {
    gap: 2,
  },
  legendValue: {
    fontSize: fontSize.caption,
  },
  ring: {
    height: SIZE,
    width: SIZE,
  },
  swatch: {
    borderRadius: radius.pill,
    height: 12,
    width: 12,
  },
});
