import { useMemo, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Line, Path, Svg } from 'react-native-svg';

import { useFormatCurrency } from '@/hooks/use-format-currency';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/stores/use-settings-store';
import { accentRamp, fontSize, neutralRamp, spacing } from '@/theme';
import { buildColumns, buildYAxisTicks, roundedTopRectPath } from '@/utils/chart-geometry';
import { formatMonthShort } from '@/utils/date';

const CHART_HEIGHT = 140;
const BAR_RADIUS = 4;

export type TrendPoint = { monthKey: string; valueMinor: number; isCurrent: boolean };

type TrendChartProps = {
  points: TrendPoint[];
};

export function TrendChart({ points }: TrendChartProps) {
  const theme = useTheme();
  const locale = useLocale();
  const { format } = useFormatCurrency();
  const neutral = neutralRamp.light; // bars use fixed ramp steps, not theme-flipped
  const [width, setWidth] = useState<number | null>(null);

  const maxValueMinor = useMemo(
    () => Math.max(0, ...points.map((p) => p.valueMinor)),
    [points]
  );
  const ticks = useMemo(() => buildYAxisTicks(maxValueMinor), [maxValueMinor]);
  const scaleMax = ticks[ticks.length - 1] ?? 0;

  const columns = useMemo(
    () =>
      width == null
        ? []
        : buildColumns(
            points.map((p) => ({ monthKey: p.monthKey, valueMinor: p.valueMinor })),
            { width, height: CHART_HEIGHT, maxValueMinor: scaleMax }
          ),
    [points, width, scaleMax]
  );

  function handleLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  return (
    <View>
      <View onLayout={handleLayout} style={styles.chartArea}>
        {width != null ? (
          <Svg height={CHART_HEIGHT} width={width}>
            {ticks.map((tick) => {
              const y = CHART_HEIGHT - (scaleMax > 0 ? (tick / scaleMax) * CHART_HEIGHT : 0);
              return (
                <Line
                  key={tick}
                  stroke={theme.divider}
                  strokeWidth={StyleSheet.hairlineWidth}
                  x1={0}
                  x2={width}
                  y1={y}
                  y2={y}
                />
              );
            })}
            {columns.map((column, i) => (
              <Path
                d={roundedTopRectPath(
                  column.bar.x,
                  column.bar.y,
                  column.bar.width,
                  column.bar.height,
                  BAR_RADIUS
                )}
                fill={points[i]?.isCurrent ? accentRamp[500] : neutral[800]}
                key={column.monthKey}
              />
            ))}
          </Svg>
        ) : null}
      </View>

      <View style={styles.labelRow}>
        {points.map((point) => (
          <View key={point.monthKey} style={styles.labelCell}>
            <Text
              style={[
                styles.value,
                { color: theme.textMuted, opacity: point.isCurrent ? 1 : 0.6 },
              ]}
            >
              {format(point.valueMinor)}
            </Text>
            <Text
              style={[
                styles.month,
                {
                  color: point.isCurrent ? theme.text : theme.textMuted,
                  opacity: point.isCurrent ? 1 : 0.55,
                },
              ]}
            >
              {formatMonthShort(new Date(`${point.monthKey}-01T00:00:00`), locale)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartArea: {
    height: CHART_HEIGHT,
  },
  labelCell: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  labelRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  month: {
    fontSize: fontSize.caption,
    fontWeight: '600',
  },
  value: {
    fontSize: 10,
  },
});
