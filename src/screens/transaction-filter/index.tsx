import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { IconButton } from '@/components/icon-button';
import { Sheet } from '@/components/sheet';
import { Tag } from '@/components/tag';
import { listCategoriesQuery } from '@/db/queries/categories';
import type { TransactionType } from '@/db/schema';
import { useCategoryName } from '@/hooks/use-category-name';
import { useTheme } from '@/hooks/use-theme';
import { useFilterStore } from '@/stores/use-filter-store';
import { fontFamily, fontSize, spacing } from '@/theme';

const BODY_HEIGHT = Dimensions.get('window').height * 0.68;

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export function TransactionFilter() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const categoryName = useCategoryName();
  const monthCursor = useFilterStore((state) => state.monthCursor);
  const storedCategoryIds = useFilterStore((state) => state.categoryIds);
  const storedType = useFilterStore((state) => state.type);

  const initialDate = new Date(monthCursor);
  const [year, setYear] = useState(initialDate.getFullYear());
  const [monthIndex, setMonthIndex] = useState(initialDate.getMonth());
  const [type, setType] = useState<TransactionType>(storedType);
  const [categoryIds, setCategoryIds] = useState<string[]>(storedCategoryIds);

  const { data: categories } = useLiveQuery(listCategoriesQuery(type), [type]);

  function selectType(nextType: TransactionType) {
    setType(nextType);
    // The category list is scoped to the selected type, so categories picked
    // under a different type would silently disappear from the list.
    setCategoryIds([]);
  }

  function toggleCategory(categoryId: string) {
    setCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  }

  function close() {
    router.back();
  }

  function reset() {
    const store = useFilterStore.getState();
    store.goToCurrentMonth();
    store.setCategoryIds([]);
    store.setType('expense');
    close();
  }

  function apply() {
    const store = useFilterStore.getState();
    store.setMonthCursor(new Date(year, monthIndex, 1).getTime());
    store.setCategoryIds(categoryIds);
    store.setType(type);
    close();
  }

  return (
    <Sheet anchor="bottom">
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.text }]}>
          {t('transactionFilter.title')}
        </Text>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <View style={styles.section}>
            <View style={styles.monthHeader}>
              <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
                {t('transactionFilter.month')}
              </Text>
              <View style={styles.yearPager}>
                <IconButton
                  icon={ChevronLeft}
                  label={t('transactionFilter.previousYear')}
                  onPress={() => setYear((y) => y - 1)}
                  size={26}
                  variant="ghost"
                />
                <Text style={[styles.year, { color: theme.text }]}>{year}</Text>
                <IconButton
                  icon={ChevronRight}
                  label={t('transactionFilter.nextYear')}
                  onPress={() => setYear((y) => y + 1)}
                  size={26}
                  variant="ghost"
                />
              </View>
            </View>
            <View style={styles.monthGrid}>
              {MONTH_LABELS.map((label, index) => {
                const selected = index === monthIndex;
                return (
                  <Pressable
                    key={label}
                    onPress={() => setMonthIndex(index)}
                    style={[
                      styles.monthCell,
                      { backgroundColor: selected ? theme.text : theme.surfaceAlt },
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthLabel,
                        { color: selected ? theme.background : theme.text },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
              {t('transactionFilter.type')}
            </Text>
            <View style={styles.tagRow}>
              <Pressable onPress={() => selectType('expense')}>
                <Tag label={t('common.expense')} selected={type === 'expense'} />
              </Pressable>
              <Pressable onPress={() => selectType('income')}>
                <Tag label={t('common.income')} selected={type === 'income'} />
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
              {t('transactionFilter.category')}
            </Text>
            <View style={styles.tagRow}>
              <Pressable onPress={() => setCategoryIds([])}>
                <Tag label={t('transactionFilter.all')} selected={categoryIds.length === 0} />
              </Pressable>
              {categories.map((category) => (
                <Pressable key={category.id} onPress={() => toggleCategory(category.id)}>
                  <Tag
                    label={categoryName(category.name, category.isDefault)}
                    selected={categoryIds.includes(category.id)}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <Button
            label={t('transactionFilter.reset')}
            onPress={reset}
            style={styles.reset}
            variant="ghost"
          />
          <Button
            label={t('transactionFilter.apply')}
            onPress={apply}
            style={styles.apply}
          />
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  apply: {
    flex: 1,
  },
  body: {
    height: BODY_HEIGHT,
  },
  monthCell: {
    borderRadius: 6,
    paddingVertical: 9,
    width: '23%',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '2.66%',
  },
  monthHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  monthLabel: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  reset: {
    minHeight: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.sm,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionHeading: {
    fontSize: fontSize.h6,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.h4,
    marginBottom: spacing.xs,
  },
  year: {
    fontSize: fontSize.body,
    fontWeight: '600',
  },
  yearPager: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
});
