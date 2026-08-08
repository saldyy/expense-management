import { useTranslation } from 'react-i18next';

import { SegmentedControl } from '@/components/segmented-control';
import {
  useSettingsStore,
  useThemeMode,
  type ThemeMode,
} from '@/stores/use-settings-store';

export function ThemePicker() {
  const { t } = useTranslation();
  const themeMode = useThemeMode();
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);

  const options = [
    { value: 'system' as const, label: t('settings.theme.system') },
    { value: 'light' as const, label: t('settings.theme.light') },
    { value: 'dark' as const, label: t('settings.theme.dark') },
  ];

  return (
    <SegmentedControl<ThemeMode>
      onChange={setThemeMode}
      options={options}
      value={themeMode}
    />
  );
}
