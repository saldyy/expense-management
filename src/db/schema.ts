import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Offline-first schema notes:
 *
 * - Primary keys are client-generated UUIDs (see `@/utils/id`), so a record can
 *   be created with no network and keep its identity forever.
 * - Money is stored as an integer number of minor units (cents/xu) in
 *   `amountMinor`. Never store money as a float. See `@/utils/money`.
 * - Every row carries `updatedAt`, and deletable rows carry `deletedAt` for
 *   soft deletes. Nothing reads them yet, but they are what a future sync or
 *   backup layer needs, and adding them now is free.
 */

export const ACCOUNT_TYPES = ['cash', 'bank', 'card'] as const;
export const CATEGORY_KINDS = ['expense', 'income'] as const;
export const TRANSACTION_TYPES = ['expense', 'income'] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];
export type CategoryKind = (typeof CATEGORY_KINDS)[number];
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ACCOUNT_TYPES }).notNull().default('cash'),
  currency: text('currency').notNull().default('USD'),
  initialBalanceMinor: integer('initial_balance_minor').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
});

export const categories = sqliteTable(
  'categories',
  {
    id: text('id').primaryKey(),
    // For seeded categories this is an i18n key (e.g. `categories.food`);
    // user-created ones store the literal name. `isDefault` tells them apart.
    name: text('name').notNull(),
    icon: text('icon').notNull().default('💸'),
    color: text('color').notNull().default('#8E8E93'),
    kind: text('kind', { enum: CATEGORY_KINDS }).notNull().default('expense'),
    sortOrder: integer('sort_order').notNull().default(0),
    isDefault: integer('is_default', { mode: 'boolean' })
      .notNull()
      .default(false),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
  },
  (table) => [index('categories_kind_idx').on(table.kind)]
);

export const transactions = sqliteTable(
  'transactions',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id),
    // Always positive — `type` carries the sign.
    amountMinor: integer('amount_minor').notNull(),
    type: text('type', { enum: TRANSACTION_TYPES }).notNull(),
    // Unix epoch milliseconds.
    occurredAt: integer('occurred_at').notNull(),
    note: text('note'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
  },
  (table) => [
    index('transactions_occurred_at_idx').on(table.occurredAt),
    index('transactions_category_id_idx').on(table.categoryId),
    index('transactions_account_id_idx').on(table.accountId),
  ]
);

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
