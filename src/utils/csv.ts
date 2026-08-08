/**
 * Minimal RFC 4180 CSV helpers. No external dependency — this app only needs
 * to round-trip its own small, well-defined export format (plus whatever a
 * user hand-edits in a spreadsheet), which doesn't justify a CSV library.
 */

function escapeField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsvRow(fields: string[]): string {
  return fields.map(escapeField).join(',');
}

/** Parses CSV text into rows of string fields, honoring quoted fields with embedded commas/newlines/escaped quotes. */
export function parseCsv(text: string): string[][] {
  const normalized = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  function endField() {
    row.push(field);
    field = '';
  }

  function endRow() {
    endField();
    rows.push(row);
    row = [];
  }

  while (i < normalized.length) {
    const char = normalized[i];

    if (inQuotes) {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (char === ',') {
      endField();
      i += 1;
      continue;
    }
    if (char === '\r') {
      i += 1;
      continue;
    }
    if (char === '\n') {
      endRow();
      i += 1;
      continue;
    }
    field += char;
    i += 1;
  }

  if (field.length > 0 || row.length > 0) {
    endRow();
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}
