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
import { SegmentedControl } from '@/components/segmented-control';
import { TextField } from '@/components/text-field';
import { createCategory, listCategoriesQuery, updateCategory } from '@/db/queries/categories';
import type { CategoryKind } from '@/db/schema';
import { useCategoryName } from '@/hooks/use-category-name';
import { useTheme } from '@/hooks/use-theme';
import { accentRamp, fontFamily, fontSize, neutralRamp, radius, spacing } from '@/theme';

/** Schema default icon — this form has no icon picker. */
const DEFAULT_CATEGORY_ICON = '💸';

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
  /** Default kind for a new category, from the context it was opened from. */
  initialKind?: CategoryKind;
};

type CategoryFormValues = {
  name: string;
  color: string;
  kind: CategoryKind;
};

export function CategoryForm({ categoryId, initialKind }: CategoryFormProps) {
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
        kind: yup.string<CategoryKind>().oneOf(['expense', 'income']).required(),
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
    defaultValues: { name: '', color: COLOR_SWATCHES[0], kind: initialKind ?? 'expense' },
  });
  const color = watch('color');
  const kind = watch('kind');

  useEffect(() => {
    if (!isEditing || prefilled || !existing) {
      return;
    }
    setValue('name', categoryName(existing.name, existing.isDefault));
    setValue('color', existing.color);
    setValue('kind', existing.kind);
    setPrefilled(true);
  }, [categoryName, existing, isEditing, prefilled, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    if (isEditing && categoryId) {
      await updateCategory(categoryId, {
        name: values.name.trim(),
        color: values.color,
        kind: values.kind,
      });
    } else {
      await createCategory({
        name: values.name.trim(),
        icon: DEFAULT_CATEGORY_ICON,
        color: values.color,
        kind: values.kind,
      });
    }
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
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.textMuted }]}>
            {t('categoryForm.type')}
          </Text>
          <SegmentedControl
            onChange={(value) => setValue('kind', value)}
            options={[
              { value: 'expense', label: t('categoryForm.expense') },
              { value: 'income', label: t('categoryForm.income') },
            ]}
            value={kind}
          />
        </View>

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
