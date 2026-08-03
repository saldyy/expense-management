/**
 * All money in this app is an integer number of minor units (cents, xu, …).
 * Nothing outside this module should divide or multiply by 100.
 */

/** Currencies whose smallest unit is the unit itself (no decimal part). */
const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'KRW', 'VND', 'CLP', 'ISK']);

export function minorUnitsPerUnit(currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100;
}

/** '12.34' → 1234. Returns 0 for anything unparseable. */
export function parseAmountToMinor(input: string, currency: string): number {
  const normalized = input.replace(',', '.').trim();
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.round(parsed * minorUnitsPerUnit(currency));
}

/** 1234 → '12.34', for prefilling an editable input (never for display). */
export function formatMinorForInput(
  amountMinor: number,
  currency: string
): string {
  const factor = minorUnitsPerUnit(currency);
  if (factor === 1) {
    return String(amountMinor);
  }
  return (amountMinor / factor).toFixed(2);
}

/** Localized display string, e.g. '$12.34' or '12.345 ₫'. */
export function formatMoney(
  amountMinor: number,
  currency: string,
  locale: string
): string {
  const factor = minorUnitsPerUnit(currency);
  const fractionDigits = factor === 1 ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amountMinor / factor);
}

/** Signed display string — expenses render negative. */
export function formatSignedMoney(
  amountMinor: number,
  type: 'expense' | 'income',
  currency: string,
  locale: string
): string {
  const signed = type === 'expense' ? -amountMinor : amountMinor;
  return formatMoney(signed, currency, locale);
}
