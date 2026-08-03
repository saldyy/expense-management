import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import vi from './locales/vi.json';
import { SUPPORTED_LOCALES, type LocaleCode } from '@/constants';

export const resources = {
  en: { translation: en },
  vi: { translation: vi },
} as const;

export const FALLBACK_LOCALE: LocaleCode = 'en';

/** The device's preferred locale, narrowed to one this app actually ships. */
export function detectDeviceLocale(): LocaleCode {
  const languageCode = getLocales()[0]?.languageCode;
  const supported = SUPPORTED_LOCALES.find(
    (locale) => locale.code === languageCode
  );
  return supported?.code ?? FALLBACK_LOCALE;
}

i18n.use(initReactI18next).init({
  resources,
  // Overwritten on mount by the persisted preference in use-settings-store.
  lng: detectDeviceLocale(),
  fallbackLng: FALLBACK_LOCALE,
  interpolation: { escapeValue: false },
});

export default i18n;
