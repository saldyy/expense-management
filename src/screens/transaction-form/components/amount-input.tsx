import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { fontFamily, fontSize, radius, spacing } from '@/theme';

type AmountInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  currency: string;
};

export function AmountInput({ value, onChangeText, currency }: AmountInputProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textMuted }]}>
        {t('form.amount')}
      </Text>
      <View
        style={[
          styles.box,
          { backgroundColor: theme.surface, borderColor: theme.divider },
        ]}
      >
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
          style={[styles.input, { color: theme.text }]}
          value={value}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'baseline',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  container: {
    gap: 5,
  },
  currency: {
    fontSize: fontSize.body,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.h4,
    padding: 0,
  },
  label: {
    fontSize: 12,
  },
});
