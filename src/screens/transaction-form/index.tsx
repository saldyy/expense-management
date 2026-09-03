import { yupResolver } from '@hookform/resolvers/yup';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useRouter } from 'expo-router';
import { ChevronDown, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as yup from 'yup';

import { AmountInput } from './components/amount-input';
import { CategoryPicker } from './components/category-picker';
import { Button } from '@/components/button';
import { IconButton } from '@/components/icon-button';
import { ScreenContainer } from '@/components/screen-container';
import { SegmentedControl } from '@/components/segmented-control';
import { TextField } from '@/components/text-field';
import { listAccountsQuery } from '@/db/queries/accounts';
import { listCategoriesQuery } from '@/db/queries/categories';
import {
  createTransaction,
  softDeleteTransaction,
  transactionByIdQuery,
  updateTransaction,
} from '@/db/queries/transactions';
import type { TransactionType } from '@/db/schema';
import { useFormatCurrency } from '@/hooks/use-format-currency';
import { useTheme } from '@/hooks/use-theme';
import { useTransactionDraftStore } from '@/stores/use-transaction-draft-store';
import { accentRamp, fontFamily, fontSize, radius, spacing } from '@/theme';
import { formatFullDate } from '@/utils/date';
import { formatMinorForInput, parseAmountToMinor } from '@/utils/money';

type TransactionFormProps = {
  /** Present when editing an existing transaction. */
  transactionId?: string;
};

type TransactionFormValues = {
  type: TransactionType;
  amount: string;
  /** '' means "not selected yet" — matches yup's non-nullable string output, no null-juggling. */
  categoryId: string;
  occurredAt: number;
  note: string;
};

export function TransactionForm({ transactionId }: TransactionFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { currency, locale } = useFormatCurrency();

  const isEditing = Boolean(transactionId);

  // `type`/`categoryId`/`occurredAt` are bridged through this store (rather
  // than local state) because the Select Category / Select Date sheets are
  // separate routes — different mounted screens that can't reach this
  // component's `control`. They stay the source of truth; RHF mirrors them
  // via the sync effects below purely so `formState`/`handleSubmit` see them.
  const type = useTransactionDraftStore((state) => state.type);
  const categoryId = useTransactionDraftStore((state) => state.categoryId);
  const occurredAt = useTransactionDraftStore((state) => state.occurredAt);
  const setType = useTransactionDraftStore((state) => state.setType);
  const setCategoryId = useTransactionDraftStore((state) => state.setCategoryId);
  const setOccurredAt = useTransactionDraftStore((state) => state.setOccurredAt);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  const { data: categories } = useLiveQuery(listCategoriesQuery(type), [type]);
  const { data: accounts } = useLiveQuery(listAccountsQuery(), []);
  const { data: existing } = useLiveQuery(
    transactionByIdQuery(transactionId ?? ''),
    [transactionId]
  );

  const transactionSchema = useMemo(
    () =>
      yup.object({
        type: yup.mixed<TransactionType>().oneOf(['expense', 'income']).required(),
        amount: yup
          .string()
          .required(t('form.missingAmount'))
          .test(
            'positive-amount',
            t('form.missingAmount'),
            (value) => parseAmountToMinor(value ?? '', currency) > 0
          ),
        categoryId: yup.string().required(t('form.missingCategory')),
        occurredAt: yup.number().required(),
        note: yup.string().default(''),
      }),
    [currency, t]
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: yupResolver(transactionSchema),
    defaultValues: { type: 'expense', amount: '', categoryId: '', occurredAt: Date.now(), note: '' },
  });

  // Fresh "new" form: reset the shared draft rather than inheriting whatever
  // a previous Add/Edit session left behind.
  useEffect(() => {
    if (!isEditing) {
      setType('expense');
      setOccurredAt(Date.now());
    }
    // Only on mount — the draft store is the source of truth from here on.
  }, []);

  // Prefill once when editing; later live updates must not clobber user input.
  useEffect(() => {
    const row = existing[0];
    if (!isEditing || prefilled || !row) {
      return;
    }
    setType(row.type);
    setCategoryId(row.categoryId);
    setOccurredAt(row.occurredAt);
    setValue('amount', formatMinorForInput(row.amountMinor, currency));
    setValue('note', row.note ?? '');
    setPrefilled(true);
  }, [currency, existing, isEditing, prefilled, setCategoryId, setOccurredAt, setType, setValue]);

  // Keep a valid selection when the category list changes with the type.
  useEffect(() => {
    if (categories.length === 0) {
      return;
    }
    const stillValid = categories.some((category) => category.id === categoryId);
    if (!stillValid) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId, setCategoryId]);

  // Mirror the cross-route draft store into RHF so `formState`/`handleSubmit`
  // always see the current type/category/date.
  useEffect(() => {
    setValue('type', type);
  }, [type, setValue]);
  useEffect(() => {
    setValue('categoryId', categoryId ?? '');
  }, [categoryId, setValue]);
  useEffect(() => {
    setValue('occurredAt', occurredAt);
  }, [occurredAt, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    if (!data.categoryId) {
      return;
    }
    const amountMinor = parseAmountToMinor(data.amount, currency);
    const accountId = accounts[0]?.id;
    if (!accountId) {
      return;
    }

    setSaving(true);
    try {
      if (transactionId) {
        await updateTransaction(transactionId, {
          amountMinor,
          categoryId: data.categoryId,
          type: data.type,
          occurredAt: data.occurredAt,
          note: data.note.trim() || null,
        });
      } else {
        await createTransaction({
          accountId,
          categoryId: data.categoryId,
          amountMinor,
          type: data.type,
          occurredAt: data.occurredAt,
          note: data.note.trim() || null,
        });
      }
      router.back();
    } finally {
      setSaving(false);
    }
  });

  function confirmDelete() {
    Alert.alert(t('form.deleteConfirmTitle'), t('form.deleteConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: handleDelete },
    ]);
  }

  async function handleDelete() {
    if (!transactionId) {
      return;
    }
    setDeleting(true);
    try {
      await softDeleteTransaction(transactionId);
      router.back();
    } finally {
      setDeleting(false);
    }
  }

  const title = isEditing
    ? t('form.editTransaction')
    : type === 'income'
      ? t('form.addIncome')
      : t('form.addExpense');
  const saveLabel = type === 'income' ? t('form.saveIncome') : t('form.saveExpense');
  const errorMessage = errors.amount?.message ?? errors.categoryId?.message;

  return (
    <ScreenContainer edges={{ top: true, bottom: true }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <IconButton icon={X} label={t('common.cancel')} onPress={() => router.back()} />
          <Text style={[styles.heading, { color: theme.text }]}>{title}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SegmentedControl
            onChange={setType}
            options={[
              { value: 'expense', label: t('common.expense') },
              { value: 'income', label: t('common.income') },
            ]}
            value={type}
          />

          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <AmountInput currency={currency} onChangeText={field.onChange} value={field.value} />
            )}
          />

          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => {
              const selected = categories.find((category) => category.id === field.value) ?? null;
              return <CategoryPicker selected={selected} />;
            }}
          />

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textMuted }]}>
              {t('form.date')}
            </Text>
            <Pressable
              onPress={() => router.push('/transaction/select-date')}
              style={[
                styles.dateBox,
                { backgroundColor: theme.surface, borderColor: theme.divider },
              ]}
            >
              <Text style={[styles.dateValue, { color: theme.text }]}>
                {formatFullDate(occurredAt, locale)}
              </Text>
              <ChevronDown color={theme.textMuted} size={16} strokeWidth={2} />
            </Pressable>
          </View>

          <Controller
            control={control}
            name="note"
            render={({ field }) => (
              <TextField
                label={t('form.note')}
                onChangeText={field.onChange}
                placeholder={t('form.notePlaceholder')}
                value={field.value}
              />
            )}
          />

          {errorMessage ? (
            <Text style={[styles.error, { color: accentRamp[700] }]}>{errorMessage}</Text>
          ) : null}
        </ScrollView>

        <Button label={saveLabel} loading={saving} onPress={onSubmit} style={styles.save} />
        {isEditing ? (
          <Button
            label={t('common.delete')}
            loading={deleting}
            onPress={confirmDelete}
            style={styles.delete}
            variant="danger"
          />
        ) : null}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  dateBox: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dateValue: {
    fontSize: fontSize.body,
  },
  delete: {
    marginBottom: spacing.md,
  },
  error: {
    fontSize: fontSize.body,
  },
  field: {
    gap: 5,
  },
  flex: {
    flex: 1,
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
    marginBottom: spacing.md,
  },
});
