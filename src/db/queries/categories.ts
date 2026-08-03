import { and, asc, eq, isNull } from 'drizzle-orm';

import { db } from '../client';
import { categories, type CategoryKind, type NewCategory } from '../schema';
import { createId } from '@/utils/id';

export function listCategoriesQuery(kind?: CategoryKind) {
  return db
    .select()
    .from(categories)
    .where(
      and(
        isNull(categories.deletedAt),
        kind ? eq(categories.kind, kind) : undefined
      )
    )
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function createCategory(input: {
  name: string;
  icon: string;
  color: string;
  kind: CategoryKind;
}): Promise<string> {
  const now = Date.now();
  const row: NewCategory = {
    id: createId(),
    name: input.name,
    icon: input.icon,
    color: input.color,
    kind: input.kind,
    sortOrder: 100,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(categories).values(row);
  return row.id;
}
