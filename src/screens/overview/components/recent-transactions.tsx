import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import type { TransactionListItem } from '@/db/queries/transactions';
import { useCategoryName } from '@/hooks/use-category-name';
import { useFormatCurrency } from '@/hooks/use-format-currency';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/stores/use-settings-store';
import { fontFamily, fontSize, spacing } from '@/theme';
import { formatTime } from '@/utils/date';

type RecentTransactionsProps = {
  items: TransactionListItem[];
};

export function RecentTransactions({ items }: RecentTransactionsProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const locale = useLocale();
  const { formatSigned } = useFormatCurrency();
  const categoryName = useCategoryName();

  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: theme.textMuted }]}>
          {t('overview.recent')}
        </Text>
        <Button
          label={t('overview.seeAll')}
          onPress={() => router.push('/transactions')}
          style={styles.seeAll}
          variant="ghost"
        />
      </View>

      {items.map((item) => (
        <View
          key={item.id}
          style={[styles.row, { borderBottomColor: theme.divider }]}
        >
          <View style={[styles.bar, { backgroundColor: item.categoryColor }]} />
          <View style={styles.text}>
            <Text style={[styles.name, { color: theme.text }]}>
              {categoryName(item.categoryName, item.categoryIsDefault)}
            </Text>
            <Text style={[styles.meta, { color: theme.textMuted }]}>
              {item.note ? `${item.note} · ` : ''}
              {formatTime(item.occurredAt, locale)}
            </Text>
          </View>
          <Text style={[styles.amount, { color: theme.text }]}>
            {formatSigned(item.amountMinor, item.type)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.body,
  },
  bar: {
    alignSelf: 'stretch',
    borderRadius: 2,
    width: 4,
  },
  header: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  heading: {
    fontSize: fontSize.h6,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  meta: {
    fontSize: fontSize.caption,
  },
  name: {
    fontSize: fontSize.body,
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  seeAll: {
    minHeight: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  text: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
});
