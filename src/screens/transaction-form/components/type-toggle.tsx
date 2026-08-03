import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { TRANSACTION_TYPES, type TransactionType } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';
import { fontSize, radius, spacing } from '@/theme';

type TypeToggleProps = {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
};

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceAlt }]}>
      {TRANSACTION_TYPES.map((type) => {
        const selected = type === value;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={type}
            onPress={() => onChange(type)}
            style={styles.option}
          >
            {selected ? (
              <Animated.View
                layout={LinearTransition.springify().damping(18)}
                style={[
                  styles.indicator,
                  {
                    backgroundColor:
                      type === 'expense' ? theme.expense : theme.income,
                  },
                ]}
              />
            ) : null}
            <Text
              style={[
                styles.label,
                { color: selected ? '#FFFFFF' : theme.textMuted },
              ]}
            >
              {t(type === 'expense' ? 'common.expense' : 'common.income')}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    flexDirection: 'row',
    padding: spacing.xs,
  },
  indicator: {
    borderRadius: radius.sm,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: '600',
  },
  option: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
});
