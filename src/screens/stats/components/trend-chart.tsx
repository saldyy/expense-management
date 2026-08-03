import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { Line, Path, Svg } from 'react-native-svg';

import { Card } from '@/components/card';
import { useFormatCurrency } from '@/hooks/use-format-currency';
import { useTheme } from '@/hooks/use-theme';
import { fontSize, radius, spacing } from '@/theme';
import {
  buildGroupedColumns,
  buildYAxisTicks,
  roundedTopRectPath,
  type MonthPoint,
} from '@/utils/chart-geometry';
import { formatMonthShort } from '@/utils/date';

const CHART_HEIGHT = 140;
const BAR_RADIUS = 4;

type TrendChartProps = {
  points: MonthPoint[];
  locale: string;
};

export function TrendChart({ points, locale }: TrendChartProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { format } = useFormatCurrency();
  const [width, setWidth] = useState<number | null>(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);

  const maxValueMinor = useMemo(
    () => Math.max(0, ...points.flatMap((p) => [p.expenseMinor, p.incomeMinor])),
    [points]
  );
  const ticks = useMemo(() => buildYAxisTicks(maxValueMinor), [maxValueMinor]);
  const scaleMax = ticks[ticks.length - 1] ?? 0;

  const columns = useMemo(
    () =>
      width == null
        ? []
        : buildGroupedColumns(points, { width, height: CHART_HEIGHT, maxValueMinor: scaleMax }),
    [points, width, scaleMax]
  );

  function handleLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  const selectedPoint = points.find((p) => p.monthKey === selectedMonthKey) ?? null;

  return (
    <Card>
      <Text style={[styles.heading, { color: theme.textMuted }]}>
        {t('stats.sixMonthTrend')}
      </Text>

      <View style={styles.legendRow}>
        <LegendSwatch color={theme.expense} label={t('common.expense')} />
        <LegendSwatch color={theme.income} label={t('common.income')} />
      </View>

      <View onLayout={handleLayout} style={styles.chartArea}>
        {width != null ? (
          <Svg height={CHART_HEIGHT} width={width}>
            {ticks.map((tick) => {
              const y = CHART_HEIGHT - (scaleMax > 0 ? (tick / scaleMax) * CHART_HEIGHT : 0);
              return (
                <Line
                  key={tick}
                  stroke={theme.border}
                  strokeWidth={StyleSheet.hairlineWidth}
                  x1={0}
                  x2={width}
                  y1={y}
                  y2={y}
                />
              );
            })}
            {columns.map((column) => (
              <Path
                d={roundedTopRectPath(
                  column.expense.x,
                  column.expense.y,
                  column.expense.width,
                  column.expense.height,
                  BAR_RADIUS
                )}
                fill={theme.expense}
                key={`${column.monthKey}-expense`}
              />
            ))}
            {columns.map((column) => (
              <Path
                d={roundedTopRectPath(
                  column.income.x,
                  column.income.y,
                  column.income.width,
                  column.income.height,
                  BAR_RADIUS
                )}
                fill={theme.income}
                key={`${column.monthKey}-income`}
              />
            ))}
          </Svg>
        ) : null}

        {width != null ? (
          <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
            {columns.map((column) => (
              <Pressable
                accessibilityRole="button"
                key={column.monthKey}
                onPress={() =>
                  setSelectedMonthKey((current) =>
                    current === column.monthKey ? null : column.monthKey
                  )
                }
                style={[
                  styles.hitTarget,
                  { left: column.clusterCenterX - width / points.length / 2, width: width / points.length },
                ]}
              />
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.axisRow}>
        {points.map((point) => (
          <Text
            key={point.monthKey}
            style={[
              styles.axisLabel,
              {
                color:
                  point.monthKey === selectedMonthKey ? theme.accent : theme.textMuted,
              },
            ]}
          >
            {formatMonthShort(new Date(`${point.monthKey}-01T00:00:00`), locale)}
          </Text>
        ))}
      </View>

      {selectedPoint ? (
        <View style={[styles.callout, { borderTopColor: theme.border }]}>
          <Text style={[styles.calloutText, { color: theme.expense }]}>
            {t('common.expense')}: {format(selectedPoint.expenseMinor)}
          </Text>
          <Text style={[styles.calloutText, { color: theme.income }]}>
            {t('common.income')}: {format(selectedPoint.incomeMinor)}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  const theme = useTheme();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <Text style={[styles.legendLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  axisLabel: {
    flex: 1,
    fontSize: fontSize.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  axisRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  callout: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  calloutText: {
    fontSize: fontSize.caption,
    fontWeight: '600',
  },
  chartArea: {
    height: CHART_HEIGHT,
    marginTop: spacing.md,
  },
  heading: {
    fontSize: fontSize.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  hitTarget: {
    height: CHART_HEIGHT,
    position: 'absolute',
    top: 0,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  legendLabel: {
    fontSize: fontSize.caption,
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  swatch: {
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
});
