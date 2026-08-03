import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_CURRENCY, type CurrencyCode, type LocaleCode } from '@/constants';
import i18n, { detectDeviceLocale } from '@/i18n';

export type ThemeMode = 'system' | 'light' | 'dark';

type SettingsState = {
  locale: LocaleCode;
  /** True once the user has picked a language explicitly. */
  localeIsExplicit: boolean;
  currency: CurrencyCode;
  themeMode: ThemeMode;
  hydrated: boolean;
  setLocale: (locale: LocaleCode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setThemeMode: (mode: ThemeMode) => void;
  /** Re-reads the device locale — only applies if the user never chose one. */
  syncWithDeviceLocale: () => void;
};

/**
 * UI/session preferences only. Domain data lives in SQLite — never mirror rows
 * into a store.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      locale: detectDeviceLocale(),
      localeIsExplicit: false,
      currency: DEFAULT_CURRENCY,
      themeMode: 'system',
      hydrated: false,

      setLocale: (locale) => {
        i18n.changeLanguage(locale);
        set({ locale, localeIsExplicit: true });
      },

      setCurrency: (currency) => set({ currency }),

      setThemeMode: (themeMode) => set({ themeMode }),

      syncWithDeviceLocale: () => {
        if (get().localeIsExplicit) {
          return;
        }
        const deviceLocale = detectDeviceLocale();
        if (deviceLocale !== get().locale) {
          i18n.changeLanguage(deviceLocale);
          set({ locale: deviceLocale });
        }
      },
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ locale, localeIsExplicit, currency, themeMode }) => ({
        locale,
        localeIsExplicit,
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
