import { and, desc, eq, gte, isNull, lte, sql } from 'drizzle-orm';

import { db } from '../client';
import {
  categories,
  transactions,
  type NewTransaction,
  type TransactionType,
} from '../schema';
import { createId } from '@/utils/id';

export type TransactionFilter = {
  /** Epoch ms, inclusive. */
  start: number;
  /** Epoch ms, inclusive. */
  end: number;
  categoryId?: string | null;
  accountId?: string | null;
};

function filterConditions(filter: TransactionFilter) {
  return and(
    isNull(transactions.deletedAt),
    gte(transactions.occurredAt, filter.start),
    lte(transactions.occurredAt, filter.end),
    filter.categoryId ? eq(transactions.categoryId, filter.categoryId) : undefined,
    filter.accountId ? eq(transactions.accountId, filter.accountId) : undefined
  );
}

/**
 * Query objects (not promises) so screens can hand them to `useLiveQuery` and
 * re-render automatically whenever the underlying tables change.
 */
export function listTransactionsQuery(filter: TransactionFilter) {
  return db
    .select({
      id: transactions.id,
      amountMinor: transactions.amountMinor,
      type: transactions.type,
      occurredAt: transactions.occurredAt,
      note: transactions.note,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
      categoryIsDefault: categories.isDefault,
    })
    .from(transactions)
    .innerJoin(categories, eq(categories.id, transactions.categoryId))
    .where(filterConditions(filter))
    .orderBy(desc(transactions.occurredAt), desc(transactions.createdAt));
}

export type TransactionListItem = Awaited<
  ReturnType<typeof listTransactionsQuery>
>[number];

export function transactionByIdQuery(id: string) {
  return db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), isNull(transactions.deletedAt)))
    .limit(1);
}

/** Totals for the filtered range, one row per transaction type. */
export function totalsByTypeQuery(filter: TransactionFilter) {
  return db
    .select({
      type: transactions.type,
      totalMinor: sql<number>`sum(${transactions.amountMinor})`.as('total_minor'),
    })
    .from(transactions)
    .where(filterConditions(filter))
    .groupBy(transactions.type);
}

/** Expense totals per category for the filtered range, biggest first. */
export function spendingByCategoryQuery(filter: TransactionFilter) {
  return db
    .select({
      categoryId: categories.id,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
      categoryIsDefault: categories.isDefault,
      totalMinor: sql<number>`sum(${transactions.amountMinor})`.as('total_minor'),
    })
    .from(transactions)
    .innerJoin(categories, eq(categories.id, transactions.categoryId))
    .where(and(filterConditions(filter), eq(transactions.type, 'expense')))
    .groupBy(categories.id)
    .orderBy(desc(sql`total_minor`));
}

/** Raw rows for client-side month bucketing (see chart-geometry's month trend math). */
export function transactionAmountsQuery(filter: TransactionFilter) {
  return db
    .select({
      occurredAt: transactions.occurredAt,
      type: transactions.type,
      amountMinor: transactions.amountMinor,
    })
    .from(transactions)
    .where(filterConditions(filter));
}

export type TransactionAmountRow = Awaited<
  ReturnType<typeof transactionAmountsQuery>
>[number];

/** Lifetime net of every non-deleted transaction, used for current balance. */
export function netBalanceQuery() {
  return db
    .select({
      netMinor: sql<number>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amountMinor} else -${transactions.amountMinor} end), 0)`.as(
        'net_minor'
      ),
    })
    .from(transactions)
    .where(isNull(transactions.deletedAt));
}

export type CreateTransactionInput = {
  accountId: string;
  categoryId: string;
  amountMinor: number;
  type: TransactionType;
  occurredAt: number;
  note?: string | null;
};

export async function createTransaction(
  input: CreateTransactionInput
): Promise<string> {
  const now = Date.now();
  const row: NewTransaction = {
    id: createId(),
    accountId: input.accountId,
    categoryId: input.categoryId,
    amountMinor: input.amountMinor,
    type: input.type,
    occurredAt: input.occurredAt,
    note: input.note ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(transactions).values(row);
  return row.id;
}

export async function updateTransaction(
  id: string,
  input: Partial<CreateTransactionInput>
): Promise<void> {
  await db
    .update(transactions)
    .set({ ...input, updatedAt: Date.now() })
    .where(eq(transactions.id, id));
}

/** Soft delete — the row stays put so a future sync can propagate the tombstone. */
export async function softDeleteTransaction(id: string): Promise<void> {
  const now = Date.now();
  await db
    .update(transactions)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(transactions.id, id));
}
