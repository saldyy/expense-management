import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { useCategoryName } from '@/hooks/use-category-name';
import { useFormatCurrency } from '@/hooks/use-format-currency';
import { useTheme } from '@/hooks/use-theme';
import { fontSize, radius, spacing } from '@/theme';

type CategoryRow = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  categoryIsDefault: boolean;
  totalMinor: number;
};

type CategoryBreakdownProps = {
  rows: CategoryRow[];
  totalMinor: number;
};

export function CategoryBreakdown({ rows, totalMinor }: CategoryBreakdownProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { format } = useFormatCurrency();
  const categoryName = useCategoryName();

  if (rows.length === 0) {
    return (
      <Card>
        <EmptyState icon="📊" title={t('overview.noSpending')} />
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.list}>
        {rows.slice(0, 5).map((row) => {
          const share = totalMinor > 0 ? row.totalMinor / totalMinor : 0;
          return (
            <Animated.View
              entering={FadeIn.duration(220)}
              key={row.categoryId}
              layout={LinearTransition.springify()}
              style={styles.row}
            >
              <View style={styles.rowHeader}>
                <Text style={styles.icon}>{row.categoryIcon}</Text>
                <Text style={[styles.name, { color: theme.text }]}>
                  {categoryName(row.categoryName, row.categoryIsDefault)}
                </Text>
                <Text style={[styles.amount, { color: theme.text }]}>
                  {format(row.totalMinor)}
                </Text>
              </View>
              <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      backgroundColor: row.categoryColor,
                      width: `${Math.max(share * 100, 2)}%`,
                    },
                  ]}
                />
              </View>
            </Animated.View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontSize: fontSize.body,
    fontWeight: '600',
  },
  fill: {
    borderRadius: radius.pill,
    height: '100%',
  },
  icon: {
    fontSize: fontSize.subtitle,
  },
  list: {
    gap: spacing.md,
  },
  name: {
    flex: 1,
    fontSize: fontSize.body,
  },
  row: {
    gap: spacing.xs,
  },
  rowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  track: {
    borderRadius: radius.pill,
    height: 6,
    overflow: 'hidden',
  },
});
