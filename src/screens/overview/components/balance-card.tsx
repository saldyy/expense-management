import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Card } from '@/components/card';
import { Divider } from '@/components/divider';
import { useCategoryName } from '@/hooks/use-category-name';
import { useFormatCurrency } from '@/hooks/use-format-currency';
import { useTheme } from '@/hooks/use-theme';
import { accentRamp, fontFamily, fontSize, spacing } from '@/theme';

type IncomeSource = {
  categoryId: string;
  categoryName: string;
  categoryIsDefault: boolean;
  totalMinor: number;
};

type BalanceCardProps = {
  netMinor: number;
  spentMinor: number;
  earnedMinor: number;
  incomeSources: IncomeSource[];
};

export function BalanceCard({
  netMinor,
  spentMinor,
  earnedMinor,
  incomeSources,
}: BalanceCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { format } = useFormatCurrency();
  const categoryName = useCategoryName();

  return (
    <Card elevated>
      <Text style={[styles.kicker, { color: theme.accent }]}>
        {t('overview.balance')}
      </Text>
      <Animated.Text
        entering={FadeIn.duration(220)}
        key={netMinor}
        style={[styles.balance, { color: theme.text }]}
      >
        {format(netMinor)}
      </Animated.Text>

      <Divider style={styles.divider} />
      <View style={styles.row}>
        <View style={styles.cell}>
          <Text style={[styles.label, { color: theme.textMuted }]}>
            {t('overview.earnedThisMonth')}
          </Text>
          <Text style={[styles.amount, { color: theme.text }]}>
            {format(earnedMinor)}
          </Text>
        </View>
        <View style={styles.cell}>
          <Text style={[styles.label, { color: theme.textMuted }]}>
            {t('overview.spentThisMonth')}
          </Text>
          <Text style={[styles.amount, { color: accentRamp[700] }]}>
            {format(spentMinor)}
          </Text>
        </View>
      </View>

      {incomeSources.length > 0 ? (
        <>
          <Divider style={styles.divider} />
          <Text style={[styles.label, { color: theme.textMuted }]}>
            {t('overview.incomeSources')}
          </Text>
          <View style={styles.sources}>
            {incomeSources.map((source) => (
              <View key={source.categoryId} style={styles.sourceRow}>
                <Text style={[styles.sourceName, { color: theme.text }]}>
                  {categoryName(source.categoryName, source.categoryIsDefault)}
                </Text>
                <Text style={[styles.sourceAmount, { color: theme.text }]}>
                  {format(source.totalMinor)}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.body,
  },
  balance: {
    fontFamily: fontFamily.heading,
    fontSize: 36,
    marginTop: spacing.xs,
  },
  cell: {
    flex: 1,
    gap: 3,
  },
  divider: {
    marginVertical: spacing.sm + 2,
  },
  kicker: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: fontSize.caption,
  },
  row: {
    flexDirection: 'row',
  },
  sourceAmount: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
  },
  sourceName: {
    fontSize: fontSize.body,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sources: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
