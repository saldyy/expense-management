import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Category } from '@/db/schema';
import { useCategoryName } from '@/hooks/use-category-name';
import { useTheme } from '@/hooks/use-theme';
import { fontSize, radius, spacing } from '@/theme';

type CategoryPickerProps = {
  selected: Category | null;
};

/** A tappable input-styled row — taps through to the Select Category sheet. */
export function CategoryPicker({ selected }: CategoryPickerProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const categoryName = useCategoryName();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textMuted }]}>
        {t('form.category')}
      </Text>
      <Pressable
        onPress={() => router.push('/transaction/select-category')}
        style={[
          styles.row,
          { backgroundColor: theme.surface, borderColor: theme.divider },
        ]}
      >
        {selected ? (
          <View style={[styles.dot, { backgroundColor: selected.color }]} />
        ) : null}
        <Text style={[styles.name, { color: theme.text }]}>
          {selected
            ? categoryName(selected.name, selected.isDefault)
            : t('form.category')}
        </Text>
        <ChevronDown color={theme.textMuted} size={16} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 5,
  },
  dot: {
    borderRadius: 3,
    height: 10,
    width: 10,
  },
  label: {
    fontSize: 12,
  },
  name: {
    flex: 1,
    fontSize: fontSize.body,
  },
  row: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
