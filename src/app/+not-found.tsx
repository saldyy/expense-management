import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { fontSize, spacing } from '@/theme';

export default function NotFoundScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          {t('common.notFound')}
        </Text>
        <Link href="/" style={[styles.link, { color: theme.accent }]}>
          {t('common.goHome')}
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  link: {
    fontSize: fontSize.body,
    fontWeight: '600',
  },
  title: {
    fontSize: fontSize.subtitle,
    fontWeight: '600',
  },
});
