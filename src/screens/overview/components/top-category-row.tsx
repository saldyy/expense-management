import { StyleSheet, Text, View } from 'react-native';

import { useCategoryName } from '@/hooks/use-category-name';
import { useFormatCurrency } from '@/hooks/use-format-currency';
import { useTheme } from '@/hooks/use-theme';
import { fontFamily, fontSize, radius, spacing } from '@/theme';

type TopCategoryRowProps = {
  categoryName: string;
  categoryIsDefault: boolean;
  categoryColor: string;
  amountMinor: number;
  pct: number;
};

export function TopCategoryRow({
  categoryName: name,
  categoryIsDefault,
  categoryColor,
  amountMinor,
  pct,
}: TopCategoryRowProps) {
  const theme = useTheme();
  const { format } = useFormatCurrency();
  const resolveName = useCategoryName();

  return (
    <View style={[styles.row, { backgroundColor: theme.surface }]}>
      <View style={[styles.swatch, { backgroundColor: categoryColor }]} />
      <View style={styles.text}>
        <Text style={[styles.name, { color: theme.text }]}>
          {resolveName(name, categoryIsDefault)}
        </Text>
        <Text style={[styles.amount, { color: theme.textMuted }]}>
          {format(amountMinor)}
        </Text>
      </View>
      <Text style={[styles.pct, { color: theme.text }]}>{pct}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontSize: fontSize.caption,
  },
  name: {
    fontSize: fontSize.body,
    fontWeight: '600',
  },
  pct: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.h4,
  },
  row: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  swatch: {
    borderRadius: radius.sm,
    height: 36,
    width: 36,
  },
  text: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
});
