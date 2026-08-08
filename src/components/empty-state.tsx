import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { fontSize, spacing } from '@/theme';

type EmptyStateProps = {
  icon: string;
  title: string;
  hint?: string;
};

export function EmptyState({ icon, title, hint }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {hint ? (
        <Text style={[styles.hint, { color: theme.textMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  hint: {
    fontSize: fontSize.body,
    textAlign: 'center',
  },
  icon: {
    fontSize: 44,
  },
  title: {
    fontSize: fontSize.h5,
    fontWeight: '600',
  },
});
