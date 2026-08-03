import { OptionList } from './option-row';
import { SUPPORTED_LOCALES, type LocaleCode } from '@/constants';
import { useLocale, useSettingsStore } from '@/stores/use-settings-store';

const OPTIONS = SUPPORTED_LOCALES.map((locale) => ({
  value: locale.code,
  label: locale.label,
}));

export function LocalePicker() {
  const locale = useLocale();
  const setLocale = useSettingsStore((state) => state.setLocale);

  return (
    <OptionList<LocaleCode>
      onSelect={setLocale}
      options={OPTIONS}
      selected={locale}
    />
  );
}
