import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Sheet } from '@/components/sheet';
import { listCategoriesQuery } from '@/db/queries/categories';
import { useCategoryName } from '@/hooks/use-category-name';
import { useTheme } from '@/hooks/use-theme';
import { useTransactionDraftStore } from '@/stores/use-transaction-draft-store';
import { fontFamily, fontSize, spacing } from '@/theme';

const BODY_HEIGHT = Dimensions.get('window').height * 0.68;

export function SelectCategory() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const categoryName = useCategoryName();

  const type = useTransactionDraftStore((state) => state.type);
  const categoryId = useTransactionDraftStore((state) => state.categoryId);
  const setCategoryId = useTransactionDraftStore((state) => state.setCategoryId);

  const { data: categories } = useLiveQuery(listCategoriesQuery(type), [type]);

  return (
    <Sheet anchor="bottom">
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.text }]}>
          {t('selectCategory.title')}
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {categories.map((category, index) => {
            const selected = category.id === categoryId;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={category.id}
                onPress={() => setCategoryId(category.id)}
                style={[
                  styles.row,
                  index > 0 && { borderTopWidth: 1, borderTopColor: theme.divider },
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      borderColor: selected ? theme.accent : theme.divider,
                      backgroundColor: selected ? theme.accent : 'transparent',
                    },
                  ]}
                />
                <View style={[styles.swatch, { backgroundColor: category.color }]} />
                <Text style={[styles.name, { color: theme.text }]}>
                  {categoryName(category.name, category.isDefault)}
                </Text>
              </Pressable>
            );
          })}

          <Pressable
            onPress={() => router.push('/category/new')}
            style={styles.newCategory}
          >
            <Plus color={theme.accent} size={16} strokeWidth={2} />
            <Text style={[styles.newCategoryLabel, { color: theme.accent }]}>
              {t('selectCategory.newCategory')}
            </Text>
          </Pressable>
        </ScrollView>

        <Button
          label={t('selectCategory.done')}
          onPress={() => router.back()}
          style={styles.done}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: {
    height: BODY_HEIGHT,
  },
  done: {
    marginTop: spacing.md,
  },
  dot: {
    borderRadius: 8,
    borderWidth: 1.5,
    height: 16,
    width: 16,
  },
  name: {
    flex: 1,
    fontSize: fontSize.body,
  },
  newCategory: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
  },
  newCategoryLabel: {
    fontSize: fontSize.body,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
  },
  scroll: {
    flex: 1,
  },
  swatch: {
    borderRadius: 3,
    height: 12,
    width: 12,
  },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.h4,
    marginBottom: spacing.sm,
  },
});
