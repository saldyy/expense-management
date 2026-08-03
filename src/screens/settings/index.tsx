import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CurrencyPicker } from './components/currency-picker';
import { EraseDataButton } from './components/erase-data-button';
import { LocalePicker } from './components/locale-picker';
import { ThemePicker } from './components/theme-picker';
import { Card } from '@/components/card';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/hooks/use-theme';
import { fontSize, spacing } from '@/theme';

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

        <Section title={t('settings.language')}>
          <LocalePicker />
        </Section>

        <Section title={t('settings.currency')}>
          <CurrencyPicker />
        </Section>

        <Section title={t('settings.appearance')}>
          <ThemePicker />
        </Section>

        <Section title={t('settings.data')}>
          <Card>
            <Text style={[styles.notice, { color: theme.textMuted }]}>
              {t('settings.offlineNotice')}
            </Text>
          </Card>
          <EraseDataButton />
        </Section>
      </ScrollView>
    </ScreenContainer>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  heading: {
    fontSize: fontSize.display,
    fontWeight: '700',
  },
  notice: {
    fontSize: fontSize.body,
    lineHeight: 21,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeading: {
    fontSize: fontSize.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
