import { yupResolver } from '@hookform/resolvers/yup';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as yup from 'yup';

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

type CategoryFormValues = {
  name: string;
  color: string;
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

  const [prefilled, setPrefilled] = useState(false);

  const categorySchema = useMemo(
    () =>
      yup.object({
        name: yup.string().trim().required(t('categoryForm.missingName')),
        color: yup.string().required(),
      }),
    [t]
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
  } = useForm<CategoryFormValues>({
    resolver: yupResolver(categorySchema),
    defaultValues: { name: '', color: COLOR_SWATCHES[0] },
  });
  const color = watch('color');

  useEffect(() => {
    if (!isEditing || prefilled || !existing) {
      return;
    }
    setValue('name', categoryName(existing.name, existing.isDefault));
    setValue('color', existing.color);
    setPrefilled(true);
  }, [categoryName, existing, isEditing, prefilled, setValue]);

  const onSubmit = handleSubmit(() => {
    router.back();
  });

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
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField
              error={fieldState.error?.message}
              label={t('categoryForm.name')}
              onChangeText={field.onChange}
              placeholder={t('categoryForm.namePlaceholder')}
              value={field.value}
            />
          )}
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
                  onPress={() => setValue('color', swatch)}
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
        onPress={onSubmit}
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
