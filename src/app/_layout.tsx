import 'react-native-gesture-handler';
import '@/i18n';

import {
  Archivo_400Regular,
  Archivo_600SemiBold,
  Archivo_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/archivo';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { db } from '@/db/client';
import migrations from '@/db/migrations/migrations';
import { seedIfEmpty } from '@/db/seed';
import { useColorSchemeName, useTheme } from '@/hooks/use-theme';
import { fontSize, spacing } from '@/theme';

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);
  const [fontsLoaded] = useFonts({
    Archivo_400Regular,
    Archivo_600SemiBold,
    Archivo_800ExtraBold,
  });

  useEffect(() => {
    if (!success) {
      return;
    }
    seedIfEmpty()
      .catch((seedError) => console.error('Seeding failed', seedError))
      .finally(() => setSeeded(true));
  }, [success]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppChrome />
        {error ? (
          <MigrationError message={error.message} />
        ) : !success || !seeded || !fontsLoaded ? (
          <Loading />
        ) : (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="transaction/new"
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="transaction/[id]"
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="transaction/select-category"
              options={{ presentation: 'transparentModal', animation: 'fade' }}
            />
            <Stack.Screen
              name="transaction/filter"
              options={{ presentation: 'transparentModal', animation: 'fade' }}
            />
            <Stack.Screen
              name="category/new"
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="category/[id]"
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="category/[id]/delete"
              options={{ presentation: 'transparentModal', animation: 'fade' }}
            />
            <Stack.Screen
              name="settings/import-csv-help"
              options={{ presentation: 'transparentModal', animation: 'fade' }}
            />
          </Stack>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppChrome() {
  const scheme = useColorSchemeName();
  return <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />;
}

function Loading() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.centered, { backgroundColor: theme.background }]}>
      <ActivityIndicator color={theme.accent} />
      <Text style={[styles.message, { color: theme.textMuted }]}>
        {t('migration.preparing')}
      </Text>
    </View>
  );
}

function MigrationError({ message }: { message: string }) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.centered, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        {t('migration.failedTitle')}
      </Text>
      <Text style={[styles.message, { color: theme.textMuted }]}>
        {t('migration.failedHint')}
      </Text>
      <Text style={[styles.detail, { color: theme.textMuted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  detail: {
    fontSize: fontSize.caption,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.body,
    textAlign: 'center',
  },
  root: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.h3,
    fontWeight: '700',
    textAlign: 'center',
  },
});
