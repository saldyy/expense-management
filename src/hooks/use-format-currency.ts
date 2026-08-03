import { useCallback } from 'react';

import { useCurrency, useLocale } from '@/stores/use-settings-store';
import { formatMoney, formatSignedMoney } from '@/utils/money';
import type { TransactionType } from '@/db/schema';

/** Money formatters bound to the user's current locale and currency. */
export function useFormatCurrency() {
  const currency = useCurrency();
  const locale = useLocale();

  const format = useCallback(
    (amountMinor: number) => formatMoney(amountMinor, currency, locale),
    [currency, locale]
  );

  const formatSigned = useCallback(
    (amountMinor: number, type: TransactionType) =>
      formatSignedMoney(amountMinor, type, currency, locale),
    [currency, locale]
  );

  return { format, formatSigned, currency, locale };
}
