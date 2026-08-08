import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { spacing } from '@/theme';

type DividerProps = {
  style?: ViewStyle;
};

/** A 2px rule — the primary structural device between sections in this design. */
export function Divider({ style }: DividerProps) {
  const theme = useTheme();

  return <View style={[styles.rule, { backgroundColor: theme.divider }, style]} />;
}

const styles = StyleSheet.create({
  rule: {
    height: 2,
    marginVertical: spacing.md,
    width: '100%',
  },
});
