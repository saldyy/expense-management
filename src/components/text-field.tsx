import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { accentRamp, fontSize, radius, spacing } from '@/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
};

export function TextField({ label, error, style, ...inputProps }: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: error ? accentRamp[700] : theme.divider,
            color: theme.text,
          },
          style,
        ]}
        {...inputProps}
      />
      {error ? (
        <Text style={[styles.error, { color: accentRamp[700] }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 5,
  },
  error: {
    fontSize: fontSize.caption,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: fontSize.body,
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
  },
});
