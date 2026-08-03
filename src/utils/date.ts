import { endOfMonth, format, startOfMonth } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';

const DATE_FNS_LOCALES = { en: enUS, vi } as const;

export type SupportedLocale = keyof typeof DATE_FNS_LOCALES;

function localeFor(locale: string) {
  return DATE_FNS_LOCALES[locale as SupportedLocale] ?? enUS;
}

/** Inclusive-exclusive epoch-ms bounds for the month containing `date`. */
export function monthRange(date: Date): { start: number; end: number } {
  return {
    start: startOfMonth(date).getTime(),
    end: endOfMonth(date).getTime(),
  };
}

export function addMonths(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

/** 'August 2026' */
export function formatMonthTitle(date: Date, locale: string): string {
  return format(date, 'LLLL yyyy', { locale: localeFor(locale) });
}

/** 'Mon, 3 Aug' — used as the day separator in the transaction list. */
export function formatDayHeading(timestamp: number, locale: string): string {
  return format(new Date(timestamp), 'EEE, d MMM', { locale: localeFor(locale) });
}

/** '3 Aug 2026' */
export function formatFullDate(timestamp: number, locale: string): string {
  return format(new Date(timestamp), 'd MMM yyyy', { locale: localeFor(locale) });
}

/** Stable key for grouping transactions by calendar day. */
export function dayKey(timestamp: number): string {
  return format(new Date(timestamp), 'yyyy-MM-dd');
}
