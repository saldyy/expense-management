export const DEFAULT_CURRENCY = 'USD';

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
] as const;

export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Tiếng Việt' },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]['code'];
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code'];
