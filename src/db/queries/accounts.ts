import { asc, isNull } from 'drizzle-orm';

import { db } from '../client';
import { accounts, type AccountType, type NewAccount } from '../schema';
import { createId } from '@/utils/id';

export function listAccountsQuery() {
  return db
    .select()
    .from(accounts)
    .where(isNull(accounts.deletedAt))
    .orderBy(asc(accounts.createdAt));
}

export async function createAccount(input: {
  name: string;
  type: AccountType;
  currency: string;
  initialBalanceMinor?: number;
}): Promise<string> {
  const now = Date.now();
  const row: NewAccount = {
    id: createId(),
    name: input.name,
    type: input.type,
    currency: input.currency,
    initialBalanceMinor: input.initialBalanceMinor ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(accounts).values(row);
  return row.id;
}
