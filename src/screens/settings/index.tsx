import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CurrencyPicker } from './components/currency-picker';
import { EraseDataButton } from './components/erase-data-button';
import { LocalePicker } from './components/locale-picker';
import { ThemePicker } from './components/theme-picker';
import { Divider } from '@/components/divider';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/hooks/use-theme';
import { fontFamily, fontSize, spacing } from '@/theme';

export function Settings() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ScreenContainer edges={{ top: true }}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: theme.text }]}>
          {t('settings.title')}
        </Text>

        <Section title={t('settings.appearance')}>
          <ThemePicker />
        </Section>

        <Divider />

        <Section title={t('settings.language')}>
          <LocalePicker />
        </Section>

        <Divider />

        <Section title={t('settings.currency')}>
          <CurrencyPicker />
        </Section>

        <Divider />

        <Section title={t('settings.data')}>
          <Text style={[styles.notice, { color: theme.textMuted }]}>
            {t('settings.offlineNotice')}
          </Text>
          <EraseDataButton />
        </Section>
      </ScrollView>
    </ScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  heading: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.h4,
    marginBottom: spacing.md,
  },
  notice: {
    fontSize: fontSize.caption,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeading: {
    fontSize: fontSize.h6,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
});
