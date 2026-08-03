import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { fontSize, radius, spacing } from '@/theme';

export type Option<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

type OptionListProps<T extends string> = {
  options: readonly Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
};

/** Grouped list of single-choice rows, shared by every settings picker. */
export function OptionList<T extends string>({
  options,
  selected,
  onSelect,
}: OptionListProps<T>) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.group,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {options.map((option, index) => (
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ selected: option.value === selected }}
          key={option.value}
          onPress={() => onSelect(option.value)}
          style={({ pressed }) => [
            styles.row,
            index > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth },
            pressed && { backgroundColor: theme.surfaceAlt },
          ]}
        >
          <View style={styles.labels}>
            <Text style={[styles.label, { color: theme.text }]}>
              {option.label}
            </Text>
            {option.hint ? (
              <Text style={[styles.hint, { color: theme.textMuted }]}>
                {option.hint}
              </Text>
            ) : null}
          </View>
          {option.value === selected ? (
            <Text style={[styles.check, { color: theme.accent }]}>✓</Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  check: {
    fontSize: fontSize.subtitle,
    fontWeight: '700',
  },
  group: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  hint: {
    fontSize: fontSize.caption,
  },
  label: {
    fontSize: fontSize.body,
  },
  labels: {
    flex: 1,
    gap: 2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
