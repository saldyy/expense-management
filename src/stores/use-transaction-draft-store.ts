import { create } from 'zustand';

import type { TransactionType } from '@/db/schema';

type TransactionDraftState = {
  type: TransactionType;
  categoryId: string | null;
  setType: (type: TransactionType) => void;
  setCategoryId: (categoryId: string) => void;
};

/**
 * Transient UI state bridging the Add/Edit Expense form and the Select
 * Category sheet across the route boundary between them — the sheet needs to
 * know which type to list, and needs to hand a selection back. Not persisted;
 * the form resets it on open.
 */
export const useTransactionDraftStore = create<TransactionDraftState>()((set) => ({
  type: 'expense',
  categoryId: null,
  setType: (type) => set({ type }),
  setCategoryId: (categoryId) => set({ categoryId }),
}));
