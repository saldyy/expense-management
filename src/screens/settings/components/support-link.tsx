import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { fontFamily, fontSize, spacing } from '@/theme';

// TODO: replace with your actual Ko-fi page URL.
const KOFI_URL = 'https://ko-fi.com/saldyy';

export function SupportLink() {
  const { t } = useTranslation();
  const theme = useTheme();

  async function handlePress() {
    try {
      await Linking.openURL(KOFI_URL);
    } catch (error) {
      console.error('Failed to open Ko-fi link', error);
    }
  }

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Text style={[styles.text, { color: theme.textMuted }]}>{t('settings.supportMessage')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    padding: spacing.sm,
  },
  text: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.caption,
    lineHeight: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
