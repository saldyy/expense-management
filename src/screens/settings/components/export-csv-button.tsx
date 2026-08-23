import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

import { Button } from '@/components/button';
import { buildTransactionsCsv } from '@/db/csv';
import { useCategoryName } from '@/hooks/use-category-name';
import { useCurrency } from '@/stores/use-settings-store';

export function ExportCsvButton() {
  const { t } = useTranslation();
  const currency = useCurrency();
  const categoryName = useCategoryName();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await buildTransactionsCsv(currency, categoryName);
      const lineCount = csv.split('\n').length - 1; // minus the header row
      if (lineCount <= 0) {
        Alert.alert(t('settings.exportCsvEmptyTitle'), t('settings.exportCsvEmptyMessage'));
        return;
      }

      const fileName = `expense-export-${Date.now()}.csv`;

      if (Platform.OS === 'android') {
        await saveToAndroidDownloads(csv, fileName);
        return;
      }

      const file = new File(Paths.cache, fileName);
      file.create({ overwrite: true });
      file.write(csv);

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(t('settings.exportCsvFailedTitle'));
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        dialogTitle: t('settings.exportCsv'),
      });
    } catch (error) {
      console.error('Failed to export CSV', error);
      Alert.alert(
        t('settings.exportCsvFailedTitle'),
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setExporting(false);
    }
  }

  /**
   * Writes straight into the public Downloads folder via MediaStore — no folder
   * picker. Android blocks granting SAF access to the Download directory itself
   * ("To protect your privacy, choose another folder"), so this bypasses SAF
   * entirely: write to the app's own cache, then hand that off to MediaStore.
   * The saved file is then opened directly from Downloads (via its content URI)
   * so the user lands on it immediately instead of just seeing a confirmation.
   */
  async function saveToAndroidDownloads(csv: string, fileName: string) {
    const cacheFile = new File(Paths.cache, fileName);
    cacheFile.create({ overwrite: true });
    cacheFile.write(csv);

    const contentUri = await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
      { name: fileName, parentFolder: '', mimeType: 'text/csv' },
      'Download',
      cacheFile.uri
    );

    try {
      await Linking.openURL(contentUri);
    } catch {
      // No app can open a CSV directly — fall back to a plain confirmation.
      Alert.alert(t('settings.exportCsvSavedTitle'), t('settings.exportCsvSavedMessage'));
    }
  }

  return (
    <Button
      label={t('settings.exportCsv')}
      loading={exporting}
      onPress={handleExport}
      variant="secondary"
    />
  );
}
