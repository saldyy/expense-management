import { create } from 'zustand';

import type { TransactionType } from '@/db/schema';

type TransactionDraftState = {
  type: TransactionType;
  categoryId: string | null;
  occurredAt: number;
  setType: (type: TransactionType) => void;
  setCategoryId: (categoryId: string) => void;
  setOccurredAt: (occurredAt: number) => void;
};

/**
 * Transient UI state bridging the Add/Edit Expense form and the Select
 * Category / Select Date sheets across the route boundary between them —
 * each sheet needs to know the current value and hand a selection back. Not
 * persisted; the form resets it on open.
 */
export const useTransactionDraftStore = create<TransactionDraftState>()((set) => ({
  type: 'expense',
  categoryId: null,
  occurredAt: Date.now(),
  setType: (type) => set({ type }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setOccurredAt: (occurredAt) => set({ occurredAt }),
}));
