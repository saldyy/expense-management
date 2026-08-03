import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { Button } from '@/components/button';
import { eraseAllData } from '@/db/reset';

export function EraseDataButton() {
  const { t } = useTranslation();
  const [erasing, setErasing] = useState(false);

  function confirmErase() {
    Alert.alert(
      t('settings.eraseConfirmTitle'),
      t('settings.eraseConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.eraseConfirmAction'),
          style: 'destructive',
          onPress: handleErase,
        },
      ]
    );
  }

  async function handleErase() {
    setErasing(true);
    try {
      await eraseAllData();
    } catch (error) {
      console.error('Failed to erase all data', error);
      Alert.alert(
        t('settings.eraseFailedTitle'),
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setErasing(false);
    }
  }

  return (
    <Button
      label={t('settings.eraseAllData')}
      loading={erasing}
      onPress={confirmErase}
      variant="danger"
    />
  );
}
