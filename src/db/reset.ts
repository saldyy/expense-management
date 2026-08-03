import { db } from './client';
import { accounts, categories, transactions } from './schema';
import { seedIfEmpty } from './seed';

/**
 * Deletes every row across all tables and reseeds the default categories and
 * cash account, as if the app were freshly installed. Children are deleted
 * before the tables they reference.
 */
export async function eraseAllData(): Promise<void> {
  await db.delete(transactions);
  await db.delete(categories);
  await db.delete(accounts);
  await seedIfEmpty();
}
