import 'i18next';

import type en from './locales/en.json';

/** Makes every `t('…')` key checked against en.json at compile time. */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
    };
  }
}
