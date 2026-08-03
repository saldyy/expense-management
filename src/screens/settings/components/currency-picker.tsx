import { OptionList } from './option-row';
import { SUPPORTED_CURRENCIES, type CurrencyCode } from '@/constants';
import { useCurrency, useSettingsStore } from '@/stores/use-settings-store';

const OPTIONS = SUPPORTED_CURRENCIES.map((currency) => ({
  value: currency.code,
  label: `${currency.symbol}  ${currency.code}`,
}));

export function CurrencyPicker() {
  const currency = useCurrency();
  const setCurrency = useSettingsStore((state) => state.setCurrency);

  return (
    <OptionList<CurrencyCode>
      onSelect={setCurrency}
      options={OPTIONS}
      selected={currency}
    />
  );
}
