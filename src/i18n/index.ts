import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import vi from './locales/vi.json';
import type { LocaleCode } from '@/constants';

export const resources = {
  en: { translation: en },
  vi: { translation: vi },
} as const;

/** The app always launches in English; users switch language from Settings. */
export const DEFAULT_LOCALE: LocaleCode = 'en';

i18n.use(initReactI18next).init({
  resources,
  // Overwritten on mount by the persisted preference in use-settings-store.
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
});

export default i18n;
