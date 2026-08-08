import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { IconButton } from '@/components/icon-button';
import { ScreenContainer } from '@/components/screen-container';
import { TextField } from '@/components/text-field';
import { listCategoriesQuery } from '@/db/queries/categories';
import { useCategoryName } from '@/hooks/use-category-name';
import { useTheme } from '@/hooks/use-theme';
import { accentRamp, fontFamily, fontSize, neutralRamp, radius, spacing } from '@/theme';

const COLOR_SWATCHES = [
  accentRamp[500],
  neutralRamp.light[800],
  neutralRamp.light[500],
  neutralRamp.light[300],
  accentRamp[700],
  neutralRamp.light[600],
];

type CategoryFormProps = {
  /** Present when editing an existing category. */
  categoryId?: string;
};

/**
 * UI-only — Save/Delete both just navigate back. No `createCategory`/
 * `updateCategory`/`deleteCategory` call happens here, deliberately: category
 * CRUD wiring is a follow-up pass, this one is the visual flow only.
 */
export function CategoryForm({ categoryId }: CategoryFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const categoryName = useCategoryName();
  const isEditing = Boolean(categoryId);

  const { data: categories } = useLiveQuery(listCategoriesQuery(), []);
  const existing = categories.find((category) => category.id === categoryId);

  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(COLOR_SWATCHES[0]);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (!isEditing || prefilled || !existing) {
      return;
    }
    setName(categoryName(existing.name, existing.isDefault));
    setColor(existing.color);
    setPrefilled(true);
  }, [categoryName, existing, isEditing, prefilled]);

  return (
    <ScreenContainer edges={{ top: true, bottom: true }}>
      <View style={styles.header}>
        <IconButton icon={X} label={t('common.cancel')} onPress={() => router.back()} />
        <Text style={[styles.heading, { color: theme.text }]}>
          {isEditing ? t('categoryForm.editTitle') : t('categoryForm.addTitle')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextField
          label={t('categoryForm.name')}
          onChangeText={setName}
          placeholder={t('categoryForm.namePlaceholder')}
          value={name}
        />

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.textMuted }]}>
            {t('categoryForm.color')}
          </Text>
          <View style={styles.swatches}>
            {COLOR_SWATCHES.map((swatch) => {
              const selected = swatch === color;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  key={swatch}
                  onPress={() => setColor(swatch)}
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: swatch,
                      borderColor: selected ? theme.text : 'transparent',
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>

      <Button
        label={t('categoryForm.saveCategory')}
        onPress={() => router.back()}
        style={styles.save}
      />
      {isEditing ? (
        <Button
          label={t('categoryForm.deleteCategory')}
          onPress={() => router.push(`/category/${categoryId}/delete`)}
          style={styles.delete}
          variant="dangerOutline"
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  delete: {
    marginBottom: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  heading: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.h4,
  },
  label: {
    fontSize: 12,
  },
  save: {
    marginBottom: spacing.sm,
  },
  swatch: {
    borderRadius: radius.sm,
    borderWidth: 2,
    height: 36,
    width: 36,
  },
  swatches: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
  },
});
