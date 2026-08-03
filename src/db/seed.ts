import { sql } from 'drizzle-orm';

import { db } from './client';
import { accounts, categories, type NewCategory } from './schema';
import { DEFAULT_CURRENCY } from '@/constants';
import { createId } from '@/utils/id';

/**
 * Default category names are i18n keys, resolved at render time via
 * `resolveCategoryName`. User-created categories store a literal name instead.
 */
const DEFAULT_CATEGORIES: Array<Omit<NewCategory, 'createdAt' | 'updatedAt' | 'id'>> = [
  // Expense
  { name: 'categories.food', icon: '🍽️', color: '#FF9F0A', kind: 'expense', sortOrder: 10, isDefault: true },
  { name: 'categories.beverage', icon: '☕', color: '#A2845E', kind: 'expense', sortOrder: 20, isDefault: true },
  { name: 'categories.transport', icon: '🚌', color: '#0A84FF', kind: 'expense', sortOrder: 30, isDefault: true },
  { name: 'categories.housing', icon: '🏠', color: '#5E5CE6', kind: 'expense', sortOrder: 40, isDefault: true },
  { name: 'categories.utilities', icon: '💡', color: '#FFD60A', kind: 'expense', sortOrder: 50, isDefault: true },
  { name: 'categories.entertainment', icon: '🎬', color: '#BF5AF2', kind: 'expense', sortOrder: 60, isDefault: true },
  { name: 'categories.clothing', icon: '👕', color: '#FF375F', kind: 'expense', sortOrder: 70, isDefault: true },
  { name: 'categories.education', icon: '🎓', color: '#64D2FF', kind: 'expense', sortOrder: 80, isDefault: true },
  { name: 'categories.health', icon: '💪', color: '#30D158', kind: 'expense', sortOrder: 90, isDefault: true },
  { name: 'categories.other', icon: '💸', color: '#8E8E93', kind: 'expense', sortOrder: 100, isDefault: true },
  // Income
  { name: 'categories.salary', icon: '💼', color: '#30D158', kind: 'income', sortOrder: 10, isDefault: true },
  { name: 'categories.sideJob', icon: '🧑‍💻', color: '#0A84FF', kind: 'income', sortOrder: 20, isDefault: true },
  { name: 'categories.investment', icon: '📈', color: '#FF9F0A', kind: 'income', sortOrder: 30, isDefault: true },
  { name: 'categories.refund', icon: '↩️', color: '#64D2FF', kind: 'income', sortOrder: 40, isDefault: true },
  { name: 'categories.otherIncome', icon: '💰', color: '#8E8E93', kind: 'income', sortOrder: 50, isDefault: true },
];

/**
 * Idempotent: safe to call on every launch. Runs once after migrations succeed.
 */
export async function seedIfEmpty(): Promise<void> {
  const now = Date.now();

  const [{ count: categoryCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(categories);

  if (categoryCount === 0) {
    await db.insert(categories).values(
      DEFAULT_CATEGORIES.map((category) => ({
        ...category,
        id: createId(),
        createdAt: now,
        updatedAt: now,
      }))
    );
  }

  const [{ count: accountCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(accounts);

  if (accountCount === 0) {
    await db.insert(accounts).values({
      id: createId(),
      name: 'accounts.cash',
      type: 'cash',
      currency: DEFAULT_CURRENCY,
      initialBalanceMinor: 0,
      createdAt: now,
      updatedAt: now,
    });
  }
}
