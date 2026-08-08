import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

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

      const file = new File(Paths.cache, `expense-export-${Date.now()}.csv`);
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

  return (
    <Button
      label={t('settings.exportCsv')}
      loading={exporting}
      onPress={handleExport}
      variant="secondary"
    />
  );
}
