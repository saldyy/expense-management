import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Card } from '@/components/card';
import { useFormatCurrency } from '@/hooks/use-format-currency';
import { useTheme } from '@/hooks/use-theme';
import { fontSize, spacing } from '@/theme';

type BalanceCardProps = {
  netMinor: number;
  spentMinor: number;
  earnedMinor: number;
};

export function BalanceCard({
  netMinor,
  spentMinor,
  earnedMinor,
}: BalanceCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { format } = useFormatCurrency();

  return (
    <Card>
      <Text style={[styles.label, { color: theme.textMuted }]}>
        {t('overview.balance')}
      </Text>
      <Animated.Text
        entering={FadeIn.duration(220)}
        key={netMinor}
        style={[styles.balance, { color: theme.text }]}
      >
        {format(netMinor)}
      </Animated.Text>

      <View style={[styles.row, { borderTopColor: theme.border }]}>
        <View style={styles.cell}>
          <Text style={[styles.label, { color: theme.textMuted }]}>
            {t('overview.spentThisMonth')}
          </Text>
          <Text style={[styles.amount, { color: theme.expense }]}>
            {format(spentMinor)}
          </Text>
        </View>
        <View style={styles.cell}>
          <Text style={[styles.label, { color: theme.textMuted }]}>
            {t('overview.earnedThisMonth')}
          </Text>
          <Text style={[styles.amount, { color: theme.income }]}>
            {format(earnedMinor)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontSize: fontSize.subtitle,
    fontWeight: '700',
  },
  balance: {
    fontSize: fontSize.display,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  cell: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  row: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
  },
});
