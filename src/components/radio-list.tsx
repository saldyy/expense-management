import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { fontSize, spacing } from '@/theme';

export type RadioOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

type RadioListProps<T extends string> = {
  options: readonly RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Flush, divider-separated rows with a circular dot marker. */
export function RadioList<T extends string>({
  options,
  value,
  onChange,
}: RadioListProps<T>) {
  const theme = useTheme();

  return (
    <View>
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.row,
              index > 0 && { borderTopWidth: 1, borderTopColor: theme.divider },
            ]}
          >
            <View
              style={[
                styles.dot,
                {
                  borderColor: selected ? theme.accent : theme.divider,
                  backgroundColor: selected ? theme.accent : 'transparent',
                },
              ]}
            />
            <View style={styles.text}>
              <Text style={[styles.label, { color: theme.text }]}>
                {option.label}
              </Text>
              {option.hint ? (
                <Text style={[styles.hint, { color: theme.textMuted }]}>
                  {option.hint}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    borderRadius: 8,
    borderWidth: 1.5,
    height: 16,
    width: 16,
  },
  hint: {
    fontSize: fontSize.caption,
  },
  label: {
    fontSize: fontSize.body,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
