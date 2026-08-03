import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'expense.db';

/**
 * `enableChangeListener` is what makes `useLiveQuery` reactive — without it,
 * reads never refresh after a write.
 */
export const sqlite = openDatabaseSync(DATABASE_NAME, {
  enableChangeListener: true,
});

export const db = drizzle(sqlite, { schema });

export type Database = typeof db;
