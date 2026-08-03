import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_CURRENCY, type CurrencyCode, type LocaleCode } from '@/constants';
import i18n, { DEFAULT_LOCALE } from '@/i18n';

export type ThemeMode = 'system' | 'light' | 'dark';

type SettingsState = {
  locale: LocaleCode;
  currency: CurrencyCode;
  themeMode: ThemeMode;
  hydrated: boolean;
  setLocale: (locale: LocaleCode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setThemeMode: (mode: ThemeMode) => void;
};

/**
 * UI/session preferences only. Domain data lives in SQLite — never mirror rows
 * into a store.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      currency: DEFAULT_CURRENCY,
      themeMode: 'system',
      hydrated: false,

      setLocale: (locale) => {
        i18n.changeLanguage(locale);
        set({ locale });
      },

      setCurrency: (currency) => set({ currency }),

      setThemeMode: (themeMode) => set({ themeMode }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ locale, currency, themeMode }) => ({
        locale,
        currency,
        themeMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          i18n.changeLanguage(state.locale);
        }
        useSettingsStore.setState({ hydrated: true });
      },
    }
  )
);

// Granular selectors so a currency change doesn't re-render language UI.
export const useLocale = () => useSettingsStore((state) => state.locale);
export const useCurrency = () => useSettingsStore((state) => state.currency);
export const useThemeMode = () => useSettingsStore((state) => state.themeMode);
export const useSettingsHydrated = () =>
  useSettingsStore((state) => state.hydrated);
