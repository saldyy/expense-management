import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { spacing } from '@/theme';

type ScreenContainerProps = {
  children: ReactNode;
  /** Skip the top inset when a navigation header already provides it. */
  edges?: { top?: boolean; bottom?: boolean };
  style?: ViewStyle;
};

export function ScreenContainer({
  children,
  edges = { top: false, bottom: false },
  style,
}: ScreenContainerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: edges.top ? insets.top : 0,
          paddingBottom: edges.bottom ? insets.bottom : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
