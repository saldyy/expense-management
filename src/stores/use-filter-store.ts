import { create } from 'zustand';

import type { TransactionType } from '@/db/schema';
import { addMonths, monthRange } from '@/utils/date';

type FilterState = {
  /** First day of the month currently in view, as epoch ms. */
  monthCursor: number;
  /** Empty means every category. */
  categoryIds: string[];
  accountId: string | null;
  type: TransactionType;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
  setMonthCursor: (dateMs: number) => void;
  setCategoryIds: (categoryIds: string[]) => void;
  setAccountId: (accountId: string | null) => void;
  setType: (type: TransactionType) => void;
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
  categoryIds: [],
  accountId: null,
  type: 'expense',

  goToPreviousMonth: () =>
    set({ monthCursor: startOfMonthMs(addMonths(new Date(get().monthCursor), -1)) }),

  goToNextMonth: () =>
    set({ monthCursor: startOfMonthMs(addMonths(new Date(get().monthCursor), 1)) }),

  goToCurrentMonth: () => set({ monthCursor: startOfMonthMs(new Date()) }),

  setMonthCursor: (dateMs) => set({ monthCursor: startOfMonthMs(new Date(dateMs)) }),

  setCategoryIds: (categoryIds) => set({ categoryIds }),

  setAccountId: (accountId) => set({ accountId }),

  setType: (type) => set({ type }),
}));

export const useMonthCursor = () => useFilterStore((state) => state.monthCursor);
