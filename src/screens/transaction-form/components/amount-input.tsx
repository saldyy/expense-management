import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import type { TransactionType } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';
import { fontSize, spacing } from '@/theme';

type AmountInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  currency: string;
  type: TransactionType;
};

export function AmountInput({
  value,
  onChangeText,
  currency,
  type,
}: AmountInputProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const accentColor = type === 'expense' ? theme.expense : theme.income;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textMuted }]}>
        {t('form.amount')}
      </Text>
      <View style={styles.row}>
        <Text style={[styles.currency, { color: theme.textMuted }]}>
          {currency}
        </Text>
        <TextInput
          autoFocus
          inputMode="decimal"
          keyboardType="decimal-pad"
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { color: accentColor }]}
          value={value}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  currency: {
    fontSize: fontSize.subtitle,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 44,
    fontWeight: '700',
    padding: 0,
  },
  label: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
