import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { radius, spacing } from '@/theme';

type CardProps = {
  children: ReactNode;
  /** Adds a soft shadow — used sparingly (Net Balance, Insight/Analysis callouts). */
  elevated?: boolean;
  style?: ViewStyle;
};

export function Card({ children, elevated = false, style }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface },
        elevated && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    gap: spacing.sm,
    padding: spacing.md,
  },
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: '#2d2b2b',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.14,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
});
