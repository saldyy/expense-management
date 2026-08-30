import { isNotNull } from 'drizzle-orm';

import { db } from './client';
import { accounts, categories, transactions } from './schema';
import { seedIfEmpty } from './seed';

/**
 * Deletes every row across all tables and reseeds the default categories and
 * cash account, as if the app were freshly installed. Children are deleted
 * before the tables they reference.
 *
 * Each delete carries an always-true WHERE clause on purpose: a bare
 * `DELETE FROM table` triggers SQLite's truncate optimization, which skips
 * the row-level update hook `enableChangeListener` depends on — so
 * `useLiveQuery` screens would never see the rows disappear even though the
 * DB was actually wiped.
 */
export async function eraseAllData(): Promise<void> {
  await db.delete(transactions).where(isNotNull(transactions.id));
  await db.delete(categories).where(isNotNull(categories.id));
  await db.delete(accounts).where(isNotNull(accounts.id));
  await seedIfEmpty();
}
