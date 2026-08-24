import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useRouter } from 'expo-router';
import { SlidersVertical } from 'lucide-react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import { AddButton } from './components/add-button';
import { DayHeader } from './components/day-header';
import { TransactionRow } from './components/transaction-row';
import { EmptyState } from '@/components/empty-state';
import { IconButton } from '@/components/icon-button';
import { ScreenContainer } from '@/components/screen-container';
import { SegmentedControl } from '@/components/segmented-control';
import { Tag } from '@/components/tag';
import { listAccountsQuery } from '@/db/queries/accounts';
import { listCategoriesQuery } from '@/db/queries/categories';
import {
  listTransactionsQuery,
  softDeleteTransaction,
  type TransactionListItem,
} from '@/db/queries/transactions';
import { useCategoryName } from '@/hooks/use-category-name';
import { useTheme } from '@/hooks/use-theme';
import { useFilterStore } from '@/stores/use-filter-store';
import { useLocale } from '@/stores/use-settings-store';
import { fontFamily, fontSize, spacing } from '@/theme';
import { dayKey, formatMonthTitle, monthRange } from '@/utils/date';

type DaySection = {
  title: string;
  data: TransactionListItem[];
};

function groupByDay(rows: TransactionListItem[]): DaySection[] {
  const sections: DaySection[] = [];
  let currentKey: string | null = null;

  for (const row of rows) {
    const key = dayKey(row.occurredAt);
    if (key !== currentKey) {
      sections.push({ title: key, data: [row] });
      currentKey = key;
    } else {
      sections[sections.length - 1].data.push(row);
    }
  }

  return sections;
}

export function Transactions() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const locale = useLocale();
  const categoryName = useCategoryName();

  // No on-screen month switcher here (matches the mockup) — `monthCursor` is
  // shared Zustand state driven from Home, so this list stays live either way.
  const monthCursor = useFilterStore((state) => state.monthCursor);
  const categoryIds = useFilterStore((state) => state.categoryIds);
  const accountId = useFilterStore((state) => state.accountId);
  const type = useFilterStore((state) => state.type);
  const setType = useFilterStore((state) => state.setType);

  const filter = useMemo(() => {
    const range = monthRange(new Date(monthCursor));
    return { ...range, categoryIds, accountId, type };
  }, [accountId, categoryIds, monthCursor, type]);

  const { data } = useLiveQuery(listTransactionsQuery(filter), [filter]);
  const sections = useMemo(() => groupByDay(data), [data]);

  const { data: categories } = useLiveQuery(listCategoriesQuery(), []);
  const { data: accounts } = useLiveQuery(listAccountsQuery(), []);
  const selectedCategories = categories.filter((category) =>
    categoryIds.includes(category.id)
  );
  const selectedAccount = accountId
    ? accounts.find((account) => account.id === accountId)
    : undefined;

  const activeFilterCount = useMemo(() => {
    const isNonCurrentMonth = monthCursor !== monthRange(new Date()).start;
    return (
      (isNonCurrentMonth ? 1 : 0) +
      (categoryIds.length > 0 ? 1 : 0) +
      (accountId ? 1 : 0) +
      (type !== 'expense' ? 1 : 0)
    );
  }, [accountId, categoryIds, monthCursor, type]);

  return (
    <ScreenContainer edges={{ top: true }}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: theme.text }]}>
          {t('transactions.title')}
        </Text>
        <View style={styles.headerActions}>
          <IconButton
            badge={activeFilterCount}
            icon={SlidersVertical}
            label={t('transactions.filter')}
            onPress={() => router.push('/transaction/filter')}
          />
        </View>
      </View>

      <SegmentedControl
        onChange={setType}
        options={[
          { value: 'expense', label: t('common.expense') },
          { value: 'income', label: t('common.income') },
        ]}
        style={styles.segmented}
        value={type}
      />

      <View style={styles.filterChips}>
        <Tag label={formatMonthTitle(new Date(monthCursor), locale)} variant="accent" />
        {selectedCategories.map((category) => (
          <Tag
            key={category.id}
            label={categoryName(category.name, category.isDefault)}
          />
        ))}
        {selectedAccount ? <Tag label={selectedAccount.name} /> : null}
      </View>

      <SectionList
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <EmptyState
            hint={t('transactions.emptyHint')}
            icon="🧾"
            title={t('transactions.empty')}
          />
        }
        renderItem={({ item }) => (
          <TransactionRow
            item={item}
            onDelete={() => softDeleteTransaction(item.id)}
            onPress={() => router.push(`/transaction/${item.id}`)}
          />
        )}
        renderSectionHeader={({ section }) => <DayHeader dayKey={section.title} />}
        sections={sections}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />

      <AddButton
        label={t('transactions.add')}
        onPress={() => router.push('/transaction/new')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 96,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    paddingTop: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  heading: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.h4,
  },
  segmented: {
    marginBottom: spacing.md,
  },
});
