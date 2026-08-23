import { create } from 'zustand';

import { addMonths, monthRange } from '@/utils/date';

type FilterState = {
  /** First day of the month currently in view, as epoch ms. */
  monthCursor: number;
  categoryId: string | null;
  accountId: string | null;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
  setMonthCursor: (dateMs: number) => void;
  setCategoryId: (categoryId: string | null) => void;
  setAccountId: (accountId: string | null) => void;
};

function startOfMonthMs(date: Date): number {
  return monthRange(date).start;
}

/**
 * Holds the *inputs* to `listTransactionsQuery` — never the resulting rows.
 * Deliberately not persisted: reopening the app should land on today.
 */
export const useFilterStore = create<FilterState>()((set, get) => ({
  monthCursor: startOfMonthMs(new Date()),
  categoryId: null,
  accountId: null,

  goToPreviousMonth: () =>
    set({ monthCursor: startOfMonthMs(addMonths(new Date(get().monthCursor), -1)) }),

  goToNextMonth: () =>
    set({ monthCursor: startOfMonthMs(addMonths(new Date(get().monthCursor), 1)) }),

  goToCurrentMonth: () => set({ monthCursor: startOfMonthMs(new Date()) }),

  setMonthCursor: (dateMs) => set({ monthCursor: startOfMonthMs(new Date(dateMs)) }),

  setCategoryId: (categoryId) => set({ categoryId }),

  setAccountId: (accountId) => set({ accountId }),
}));

export const useMonthCursor = () => useFilterStore((state) => state.monthCursor);
