import { StyleSheet, Text, View } from 'react-native';

import { useCategoryName } from '@/hooks/use-category-name';
import { useTheme } from '@/hooks/use-theme';
import { fontFamily, fontSize, radius, spacing } from '@/theme';

type CategoryShiftRowProps = {
  categoryName: string;
  categoryIsDefault: boolean;
  categoryColor: string;
  deltaLabel: string;
  deltaColor: string;
};

export function CategoryShiftRow({
  categoryName: name,
  categoryIsDefault,
  categoryColor,
  deltaLabel,
  deltaColor,
}: CategoryShiftRowProps) {
  const theme = useTheme();
  const resolveName = useCategoryName();

  return (
    <View style={[styles.row, { borderBottomColor: theme.divider }]}>
      <View style={[styles.dot, { backgroundColor: categoryColor }]} />
      <Text style={[styles.name, { color: theme.text }]}>
        {resolveName(name, categoryIsDefault)}
      </Text>
      <Text style={[styles.delta, { color: deltaColor }]}>{deltaLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  delta: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.caption,
  },
  dot: {
    borderRadius: radius.sm - 3,
    height: 10,
    width: 10,
  },
  name: {
    flex: 1,
    fontSize: fontSize.caption + 1,
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 9,
  },
});
