import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Sheet } from '@/components/sheet';
import { listCategoriesQuery } from '@/db/queries/categories';
import { useCategoryName } from '@/hooks/use-category-name';
import { useTheme } from '@/hooks/use-theme';
import { fontFamily, fontSize, spacing } from '@/theme';

type DeleteCategoryProps = {
  categoryId: string;
};

/** UI-only — Delete just navigates back, no `deleteCategory` call. */
export function DeleteCategory({ categoryId }: DeleteCategoryProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const categoryName = useCategoryName();

  const { data: categories } = useLiveQuery(listCategoriesQuery(), []);
  const category = categories.find((c) => c.id === categoryId);
  const name = category ? categoryName(category.name, category.isDefault) : '';

  return (
    <Sheet anchor="center">
      <Text style={[styles.title, { color: theme.text }]}>
        {t('deleteCategoryScreen.titleTemplate', { name })}
      </Text>
      <Text style={[styles.body, { color: theme.text }]}>
        {t('deleteCategoryScreen.body')}
      </Text>
      <View style={styles.actions}>
        <Button
          label={t('common.cancel')}
          onPress={() => router.back()}
          style={styles.cancel}
          variant="secondary"
        />
        <Button
          label={t('common.delete')}
          onPress={() => router.back()}
          variant="danger"
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  body: {
    fontSize: fontSize.body,
    marginTop: spacing.sm,
    opacity: 0.85,
  },
  cancel: {
    minHeight: 0,
  },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.h4,
  },
});
