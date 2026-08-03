import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Category } from '@/db/schema';
import { useCategoryName } from '@/hooks/use-category-name';
import { useTheme } from '@/hooks/use-theme';
import { fontSize, radius, spacing } from '@/theme';

type CategoryPickerProps = {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function CategoryPicker({
  categories,
  selectedId,
  onSelect,
}: CategoryPickerProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const categoryName = useCategoryName();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textMuted }]}>
        {t('form.category')}
      </Text>
      <ScrollView
        contentContainerStyle={styles.list}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {categories.map((category) => {
          const selected = category.id === selectedId;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={category.id}
              onPress={() => onSelect(category.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? category.color : theme.surface,
                  borderColor: selected ? category.color : theme.border,
                },
              ]}
            >
              <Text style={styles.icon}>{category.icon}</Text>
              <Text
                style={[
                  styles.name,
                  { color: selected ? '#FFFFFF' : theme.text },
                ]}
              >
                {categoryName(category.name, category.isDefault)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  container: {
    gap: spacing.xs,
  },
  icon: {
    fontSize: fontSize.body,
  },
  label: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  list: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  name: {
    fontSize: fontSize.body,
    fontWeight: '600',
  },
});
