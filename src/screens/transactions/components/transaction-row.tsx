import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  FadeIn,
  FadeOutLeft,
  LinearTransition,
} from 'react-native-reanimated';

import { Tag } from '@/components/tag';
import type { TransactionListItem } from '@/db/queries/transactions';
import { useCategoryName } from '@/hooks/use-category-name';
import { useFormatCurrency } from '@/hooks/use-format-currency';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/stores/use-settings-store';
import { accentRamp, fontFamily, fontSize, radius, spacing } from '@/theme';
import { formatTime } from '@/utils/date';

type TransactionRowProps = {
  item: TransactionListItem;
  onPress: () => void;
  onDelete: () => void;
};

export function TransactionRow({ item, onPress, onDelete }: TransactionRowProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const locale = useLocale();
  const { formatSigned } = useFormatCurrency();
  const categoryName = useCategoryName();

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
            style={[styles.deleteAction, { backgroundColor: accentRamp[700] }]}
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
            { borderBottomColor: theme.divider, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={[styles.bar, { backgroundColor: item.categoryColor }]} />

          <View style={styles.details}>
            <Text style={[styles.category, { color: theme.text }]}>
              {categoryName(item.categoryName, item.categoryIsDefault)}
            </Text>
            <Tag
              label={item.note || categoryName(item.categoryName, item.categoryIsDefault)}
              variant="neutral"
            />
          </View>

          <View style={styles.right}>
            <Text style={[styles.amount, { color: theme.text }]}>
              {formatSigned(item.amountMinor, item.type)}
            </Text>
            <Text style={[styles.time, { color: theme.textMuted }]}>
              {formatTime(item.occurredAt, locale)}
            </Text>
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
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
  category: {
    fontSize: fontSize.body,
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
    fontFamily: fontFamily.heading,
    fontSize: fontSize.body,
  },
  details: {
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 1,
  },
  time: {
    fontSize: 10,
  },
});
