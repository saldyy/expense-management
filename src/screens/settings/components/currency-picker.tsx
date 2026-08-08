import { RadioList } from '@/components/radio-list';
import { SUPPORTED_CURRENCIES, type CurrencyCode } from '@/constants';
import { useCurrency, useSettingsStore } from '@/stores/use-settings-store';

const OPTIONS = SUPPORTED_CURRENCIES.map((currency) => ({
  value: currency.code,
  label: `${currency.code} — ${currency.name}`,
}));

export function CurrencyPicker() {
  const currency = useCurrency();
  const setCurrency = useSettingsStore((state) => state.setCurrency);

  return (
    <RadioList<CurrencyCode> onChange={setCurrency} options={OPTIONS} value={currency} />
  );
}
