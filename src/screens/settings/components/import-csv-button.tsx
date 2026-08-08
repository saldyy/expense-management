import { File } from 'expo-file-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { Button } from '@/components/button';
import {
  InvalidCsvFormatError,
  insertParsedTransactions,
  parseTransactionsCsv,
  type ParsedImportRow,
} from '@/db/csv';
import { useCategoryName } from '@/hooks/use-category-name';
import { useCurrency } from '@/stores/use-settings-store';

export function ImportCsvButton() {
  const { t } = useTranslation();
  const currency = useCurrency();
  const categoryName = useCategoryName();
  const [importing, setImporting] = useState(false);

  async function handleImport() {
    setImporting(true);
    try {
      const pick = await File.pickFileAsync({
        mimeTypes: ['text/csv', 'text/comma-separated-values', 'text/plain'],
      });
      if (pick.canceled) {
        return;
      }

      const csvText = await pick.result.text();
      const { rows, skipped } = await parseTransactionsCsv(csvText, currency, categoryName);

      if (rows.length === 0) {
        Alert.alert(t('settings.importCsvEmptyTitle'), t('settings.importCsvEmptyMessage'));
        return;
      }

      confirmImport(rows, skipped.length);
    } catch (error) {
      if (error instanceof InvalidCsvFormatError) {
        Alert.alert(
          t('settings.importCsvInvalidFormatTitle'),
          t('settings.importCsvInvalidFormatMessage')
        );
        return;
      }
      console.error('Failed to read CSV', error);
      Alert.alert(
        t('settings.importCsvFailedTitle'),
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setImporting(false);
    }
  }

  function confirmImport(rows: ParsedImportRow[], skippedCount: number) {
    Alert.alert(
      t('settings.importCsvConfirmTitle', { count: rows.length }),
      t('settings.importCsvConfirmMessage', { count: rows.length }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.importCsvConfirmAction'),
          onPress: () => void runImport(rows, skippedCount),
        },
      ]
    );
  }

  async function runImport(rows: ParsedImportRow[], skippedCount: number) {
    setImporting(true);
    try {
      await insertParsedTransactions(rows);
      const message =
        t('settings.importCsvSuccessMessage', { count: rows.length }) +
        (skippedCount > 0 ? t('settings.importCsvSkippedSuffix', { count: skippedCount }) : '');
      Alert.alert(t('settings.importCsvSuccessTitle'), message);
    } catch (error) {
      console.error('Failed to import CSV', error);
      Alert.alert(
        t('settings.importCsvFailedTitle'),
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <Button
      label={t('settings.importCsv')}
      loading={importing}
      onPress={handleImport}
      variant="secondary"
    />
  );
}
