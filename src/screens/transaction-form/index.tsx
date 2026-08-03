import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useRouter } from 'expo-router';
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
import { TypeToggle } from './components/type-toggle';
import { Button } from '@/components/button';
import { ScreenContainer } from '@/components/screen-container';
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
import { fontSize, spacing } from '@/theme';
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

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
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
  }, [currency, existing, isEditing, prefilled]);

  // Keep a valid selection when the category list changes with the type.
  useEffect(() => {
    if (categories.length === 0) {
      return;
    }
    const stillValid = categories.some((category) => category.id === categoryId);
    if (!stillValid) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

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

  return (
    <ScreenContainer edges={{ top: true, bottom: true }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Text style={[styles.heading, { color: theme.text }]}>
            {isEditing ? t('form.editTitle') : t('form.newTitle')}
          </Text>
          <Button
            label={t('common.cancel')}
            onPress={() => router.back()}
            style={styles.cancel}
            variant="secondary"
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TypeToggle onChange={setType} value={type} />

          <AmountInput
            currency={currency}
            onChangeText={(next) => {
              setAmount(next);
              setError(null);
            }}
            type={type}
            value={amount}
          />

          <CategoryPicker
            categories={categories}
            onSelect={setCategoryId}
            selectedId={categoryId}
          />

          <View style={styles.dateRow}>
            <Text style={[styles.dateLabel, { color: theme.textMuted }]}>
              {t('form.date')}
            </Text>
            <Text style={[styles.dateValue, { color: theme.text }]}>
              {formatFullDate(occurredAt, locale)}
            </Text>
          </View>

          <TextField
            label={t('form.note')}
            onChangeText={setNote}
            placeholder={t('form.notePlaceholder')}
            value={note}
          />

          {error ? (
            <Text style={[styles.error, { color: theme.expense }]}>{error}</Text>
          ) : null}
        </ScrollView>

        <Button
          label={t('common.save')}
          loading={saving}
          onPress={handleSave}
          style={styles.save}
        />
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
  cancel: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  dateLabel: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateValue: {
    fontSize: fontSize.body,
    fontWeight: '600',
  },
  delete: {
    marginBottom: spacing.md,
  },
  error: {
    fontSize: fontSize.body,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  heading: {
    fontSize: fontSize.title,
    fontWeight: '700',
  },
  save: {
    marginBottom: spacing.md,
  },
});
