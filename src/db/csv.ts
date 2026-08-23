import { format, isValid, parse as parseDate } from 'date-fns';

import { db } from './client';
import { listAccountsQuery } from './queries/accounts';
import { createCategory, listCategoriesQuery } from './queries/categories';
import { exportableTransactionsQuery } from './queries/transactions';
import { transactions, type CategoryKind, type NewTransaction } from './schema';
import { createId } from '@/utils/id';
import { formatMinorForInput, parseAmountToMinor } from '@/utils/money';
import { parseCsv, toCsvRow } from '@/utils/csv';

const CSV_HEADER = ['Date', 'Type', 'Category', 'Amount', 'Note'];
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
const INSERT_CHUNK_SIZE = 100;
const AUTO_CATEGORY_ICON = '💸';
const AUTO_CATEGORY_COLOR = '#8E8E93';

/** Thrown when the picked file doesn't look like a CSV this app produced. */
export class InvalidCsvFormatError extends Error {}

export async function buildTransactionsCsv(
  currency: string,
  resolveCategoryName: (name: string, isDefault: boolean) => string
): Promise<string> {
  const rows = await exportableTransactionsQuery();
  const lines = rows.map((row) =>
    toCsvRow([
      format(new Date(row.occurredAt), 'yyyy-MM-dd'),
      row.type,
      resolveCategoryName(row.categoryName, row.categoryIsDefault),
      formatMinorForInput(row.amountMinor, currency),
      row.note ?? '',
    ])
  );
  return [toCsvRow(CSV_HEADER), ...lines].join('\n');
}

export type ParsedImportRow = NewTransaction;
export type ImportParseResult = {
  rows: ParsedImportRow[];
  skipped: { row: number; reason: string }[];
};

/** Parses, validates, and resolves/creates categories — no transaction rows are written yet. */
export async function parseTransactionsCsv(
  csvText: string,
  currency: string,
  resolveCategoryName: (name: string, isDefault: boolean) => string
): Promise<ImportParseResult> {
  const table = parseCsv(csvText);
  const header = table[0];
  if (!header || header[0]?.trim().toLowerCase() !== 'date') {
    throw new InvalidCsvFormatError('First column of the header is not "Date".');
  }

  const accounts = await listAccountsQuery();
  const accountId = accounts[0]?.id;
  if (!accountId) {
    throw new Error('No account exists to attach imported transactions to.');
  }

  const existingCategories = await listCategoriesQuery();
  const categoryMap = new Map<string, { id: string; kind: CategoryKind }>();
  for (const category of existingCategories) {
    const display = resolveCategoryName(category.name, category.isDefault).trim().toLowerCase();
    categoryMap.set(display, { id: category.id, kind: category.kind });
  }

  const dataRows = table.slice(1);
  const rows: ParsedImportRow[] = [];
  const skipped: ImportParseResult['skipped'] = [];
  const now = Date.now();

  for (let i = 0; i < dataRows.length; i++) {
    const rowNumber = i + 2; // +1 for 0-index, +1 for the header row.
    const [dateStr, typeStr, categoryStr, amountStr, noteStr] = dataRows[i];

    if (dataRows[i].length < 5) {
      skipped.push({ row: rowNumber, reason: 'Wrong number of columns' });
      continue;
    }

    const parsedDate = parseDate(dateStr.trim(), 'yyyy-MM-dd', new Date());
    if (!isValid(parsedDate)) {
      skipped.push({ row: rowNumber, reason: `Invalid date "${dateStr}"` });
      continue;
    }
    const occurredAt = new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate(),
      12
    ).getTime();

    const type = typeStr.trim().toLowerCase();
    if (type !== 'expense' && type !== 'income') {
      skipped.push({ row: rowNumber, reason: `Invalid type "${typeStr}"` });
      continue;
    }

    const normalizedAmount = amountStr.trim().replace(',', '.');
    if (!AMOUNT_PATTERN.test(normalizedAmount)) {
      skipped.push({ row: rowNumber, reason: `Invalid amount "${amountStr}"` });
      continue;
    }

    const amountMinor = parseAmountToMinor(normalizedAmount, currency);

    const categoryDisplay = categoryStr.trim();
    let category = categoryMap.get(categoryDisplay.toLowerCase());
    if (!category) {
      const newCategoryId = await createCategory({
        name: categoryDisplay,
        icon: AUTO_CATEGORY_ICON,
        color: AUTO_CATEGORY_COLOR,
        kind: type,
      });
      category = { id: newCategoryId, kind: type };
      categoryMap.set(categoryDisplay.toLowerCase(), category);
    }

    rows.push({
      id: createId(),
      accountId,
      categoryId: category.id,
      amountMinor,
      type,
      occurredAt,
      note: noteStr?.trim() || null,
      createdAt: now,
      updatedAt: now,
    });
  }

  return { rows, skipped };
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/** The actual bulk insert — call only after the user has confirmed the parsed row count. */
export async function insertParsedTransactions(rows: ParsedImportRow[]): Promise<void> {
  for (const batch of chunk(rows, INSERT_CHUNK_SIZE)) {
    await db.insert(transactions).values(batch);
  }
}
