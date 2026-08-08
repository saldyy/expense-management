import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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

export function TransactionForm({ transactionId }: TransactionFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { currency, locale } = useFormatCurrency();

  const isEditing = Boolean(transactionId);

  const type = useTransactionDraftStore((state) => state.type);
  const categoryId = useTransactionDraftStore((state) => state.categoryId);
  const setType = useTransactionDraftStore((state) => state.setType);
  const setCategoryId = useTransactionDraftStore((state) => state.setCategoryId);

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [occurredAt, setOccurredAt] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  const { data: categories } = useLiveQuery(listCategoriesQuery(type), [type]);
  const { data: accounts } = useLiveQuery(listAccountsQuery(), []);
  const { data: existing } = useLiveQuery(
    transactionByIdQuery(transactionId ?? ''),
    [transactionId]
  );

  // Fresh "new" form: reset the shared draft rather than inheriting whatever
  // a previous Add/Edit session left behind.
  useEffect(() => {
    if (!isEditing) {
      setType('expense');
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
    setAmount(formatMinorForInput(row.amountMinor, currency));
    setCategoryId(row.categoryId);
    setNote(row.note ?? '');
    setOccurredAt(row.occurredAt);
    setPrefilled(true);
  }, [currency, existing, isEditing, prefilled, setCategoryId, setType]);

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

  const selectedCategory = categories.find((category) => category.id === categoryId) ?? null;

  async function handleSave() {
    const amountMinor = parseAmountToMinor(amount, currency);
    if (amountMinor <= 0) {
      setError(t('form.missingAmount'));
      return;
    }
    if (!categoryId) {
      setError(t('form.missingCategory'));
      return;
    }
    const accountId = accounts[0]?.id;
    if (!accountId) {
      return;
    }

    setSaving(true);
    try {
      if (transactionId) {
        await updateTransaction(transactionId, {
          amountMinor,
          categoryId,
          type,
          occurredAt,
          note: note.trim() || null,
        });
      } else {
        await createTransaction({
          accountId,
          categoryId,
          amountMinor,
          type,
          occurredAt,
          note: note.trim() || null,
        });
      }
      router.back();
    } finally {
      setSaving(false);
    }
  }

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

          <AmountInput currency={currency} onChangeText={(next) => {
            setAmount(next);
            setError(null);
          }} value={amount} />

          <CategoryPicker selected={selectedCategory} />

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textMuted }]}>
              {t('form.date')}
            </Text>
            <View
              style={[
                styles.dateBox,
                { backgroundColor: theme.surface, borderColor: theme.divider },
              ]}
            >
              <Text style={[styles.dateValue, { color: theme.text }]}>
                {formatFullDate(occurredAt, locale)}
              </Text>
            </View>
          </View>

          <TextField
            label={t('form.note')}
            onChangeText={setNote}
            placeholder={t('form.notePlaceholder')}
            value={note}
          />

          {error ? (
            <Text style={[styles.error, { color: accentRamp[700] }]}>{error}</Text>
          ) : null}
        </ScrollView>

        <Button label={saveLabel} loading={saving} onPress={handleSave} style={styles.save} />
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
    borderRadius: radius.md,
    borderWidth: 1,
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
