import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  FadeIn,
  FadeOutLeft,
  LinearTransition,
} from 'react-native-reanimated';

import type { TransactionListItem } from '@/db/queries/transactions';
import { useCategoryName } from '@/hooks/use-category-name';
import { useFormatCurrency } from '@/hooks/use-format-currency';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/stores/use-settings-store';
import { fontSize, radius, spacing } from '@/theme';
import { formatFullDate } from '@/utils/date';

type TransactionRowProps = {
  item: TransactionListItem;
  onPress: () => void;
  onDelete: () => void;
};

export function TransactionRow({ item, onPress, onDelete }: TransactionRowProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { formatSigned } = useFormatCurrency();
  const categoryName = useCategoryName();
  const locale = useLocale();
  const date = formatFullDate(item.occurredAt, locale);

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOutLeft.duration(180)}
      layout={LinearTransition.springify().damping(18)}
    >
      <Swipeable
        overshootRight={false}
        renderRightActions={() => (
          <Pressable
            accessibilityRole="button"
            onPress={onDelete}
            style={[styles.deleteAction, { backgroundColor: theme.expense }]}
          >
            <Text style={styles.deleteLabel}>{t('common.delete')}</Text>
          </Pressable>
        )}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [
            styles.row,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <View style={[styles.iconBadge, { backgroundColor: theme.surfaceAlt }]}>
            <Text style={styles.icon}>{item.categoryIcon}</Text>
          </View>

          <View style={styles.details}>
            <Text style={[styles.category, { color: theme.text }]}>
              {categoryName(item.categoryName, item.categoryIsDefault)}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.meta, { color: theme.textMuted }]}
            >
              {item.note ? `${date} · ${item.note}` : date}
            </Text>
          </View>

          <Text
            style={[
              styles.amount,
              { color: item.type === 'expense' ? theme.expense : theme.income },
            ]}
          >
            {formatSigned(item.amountMinor, item.type)}
          </Text>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontSize: fontSize.subtitle,
    fontWeight: '700',
  },
  category: {
    fontSize: fontSize.body,
    fontWeight: '600',
  },
  deleteAction: {
    alignItems: 'center',
    borderRadius: radius.md,
    justifyContent: 'center',
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  deleteLabel: {
    color: '#FFFFFF',
    fontSize: fontSize.body,
    fontWeight: '700',
  },
  details: {
    flex: 1,
    gap: 2,
  },
  icon: {
    fontSize: fontSize.subtitle,
  },
  iconBadge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  meta: {
    fontSize: fontSize.caption,
  },
  row: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: 3,
    padding: spacing.md,
  },
});
