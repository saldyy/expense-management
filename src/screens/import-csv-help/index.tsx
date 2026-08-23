import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Sheet } from '@/components/sheet';
import { useTheme } from '@/hooks/use-theme';
import { useCurrency, useSettingsStore } from '@/stores/use-settings-store';
import { fontFamily, fontSize, spacing } from '@/theme';

export function ImportCsvHelp() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const currency = useCurrency();
  const setHasSeenCsvImportInstructions = useSettingsStore(
    (state) => state.setHasSeenCsvImportInstructions
  );

  function handleContinue() {
    setHasSeenCsvImportInstructions(true);
    router.back();
  }

  return (
    <Sheet anchor="center">
      <Text style={[styles.title, { color: theme.text }]}>
        {t('importCsvHelpScreen.title')}
      </Text>
      <Text style={[styles.body, { color: theme.text }]}>{t('importCsvHelpScreen.intro')}</Text>
      <Text style={[styles.columns, { color: theme.accent }]}>
        {t('importCsvHelpScreen.columns')}
      </Text>

      <View style={styles.list}>
        <Text style={[styles.bullet, { color: theme.text }]}>
          • {t('importCsvHelpScreen.dateFormat')}
        </Text>
        <Text style={[styles.bullet, { color: theme.text }]}>
          • {t('importCsvHelpScreen.typeFormat')}
        </Text>
        <Text style={[styles.bullet, { color: theme.text }]}>
          • {t('importCsvHelpScreen.amountCurrencyNote', { currency })}
        </Text>
        <Text style={[styles.bullet, { color: theme.text }]}>
          • {t('importCsvHelpScreen.categoryFormat')}
        </Text>
      </View>

      <Text style={[styles.tip, { color: theme.textMuted }]}>{t('importCsvHelpScreen.tip')}</Text>

      <Button label={t('importCsvHelpScreen.action')} onPress={handleContinue} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: fontSize.body,
    marginTop: spacing.sm,
    opacity: 0.85,
  },
  bullet: {
    fontSize: fontSize.caption,
    lineHeight: 19,
  },
  columns: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.caption,
    marginTop: spacing.md,
  },
  list: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  tip: {
    fontSize: fontSize.caption,
    lineHeight: 19,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.h4,
  },
});
