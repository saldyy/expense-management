import type { TransactionAmountRow } from '@/db/queries/transactions';

import { monthKey } from './date';

//#region Donut

export type DonutSlice = { key: string; value: number; color: string };
export type DonutArc = DonutSlice & { share: number; path: string };

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function donutSlicePath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number
): string {
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
  const oStart = polarToCartesian(cx, cy, rOuter, startAngle);
  const oEnd = polarToCartesian(cx, cy, rOuter, endAngle);
  const iStart = polarToCartesian(cx, cy, rInner, startAngle);
  const iEnd = polarToCartesian(cx, cy, rInner, endAngle);
  return [
    `M ${oStart.x} ${oStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${oEnd.x} ${oEnd.y}`,
    `L ${iEnd.x} ${iEnd.y}`,
    `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${iStart.x} ${iStart.y}`,
    'Z',
  ].join(' ');
}

/**
 * Full annulus for the degenerate case (exactly one slice is 100%) — the `A`
 * command degenerates to nothing when start === end, so this needs its own path.
 * Render with fillRule="evenodd".
 */
function fullRingPath(cx: number, cy: number, rOuter: number, rInner: number): string {
  return [
    `M ${cx} ${cy - rOuter}`,
    `A ${rOuter} ${rOuter} 0 1 1 ${cx} ${cy + rOuter}`,
    `A ${rOuter} ${rOuter} 0 1 1 ${cx} ${cy - rOuter}`,
    `M ${cx} ${cy - rInner}`,
    `A ${rInner} ${rInner} 0 1 0 ${cx} ${cy + rInner}`,
    `A ${rInner} ${rInner} 0 1 0 ${cx} ${cy - rInner}`,
    'Z',
  ].join(' ');
}

export function buildDonutArcs(
  slices: DonutSlice[],
  opts: { cx: number; cy: number; outerRadius: number; innerRadius: number }
): DonutArc[] {
  const { cx, cy, outerRadius, innerRadius } = opts;
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) {
    return [];
  }

  const nonZero = slices.filter((s) => s.value > 0);
  if (nonZero.length === 1) {
    const only = nonZero[0];
    return [{ ...only, share: 1, path: fullRingPath(cx, cy, outerRadius, innerRadius) }];
  }

  let angle = -Math.PI / 2; // 12 o'clock start; SVG's y-down axis sweeps clockwise for free
  return nonZero.map((slice) => {
    const share = slice.value / total;
    const next = angle + share * Math.PI * 2;
    const path = donutSlicePath(cx, cy, outerRadius, innerRadius, angle, next);
    angle = next;
    return { ...slice, share, path };
  });
}

//#endregion

//#region Trend

export type MonthPoint = { monthKey: string; expenseMinor: number; incomeMinor: number };
export type BarLayout = { x: number; y: number; width: number; height: number };

/**
 * Buckets raw rows into the expected month keys, zero-filling gaps. Bucketing
 * is local-time via `monthKey()`, matching every other date boundary in this
 * app (`monthRange`, `dayKey`) — deliberately not SQL `strftime`, which buckets
 * in UTC and would disagree with the rest of the app near a month boundary.
 */
export function reconcileMonthlySeries(
  monthKeys: string[],
  rows: TransactionAmountRow[]
): MonthPoint[] {
  const byMonth = new Map<string, { expenseMinor: number; incomeMinor: number }>();
  for (const row of rows) {
    const key = monthKey(row.occurredAt);
    const entry = byMonth.get(key) ?? { expenseMinor: 0, incomeMinor: 0 };
    if (row.type === 'expense') {
      entry.expenseMinor += row.amountMinor;
    } else {
      entry.incomeMinor += row.amountMinor;
    }
    byMonth.set(key, entry);
  }
  return monthKeys.map((key) => ({
    monthKey: key,
    expenseMinor: byMonth.get(key)?.expenseMinor ?? 0,
    incomeMinor: byMonth.get(key)?.incomeMinor ?? 0,
  }));
}

/** "Nice" ceiling — 1/2/5 × 10^n ≥ value (Heckbert's algorithm). */
function niceCeil(value: number): number {
  if (value <= 0) {
    return 0;
  }
  const exp = Math.floor(Math.log10(value));
  const fraction = value / 10 ** exp;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * 10 ** exp;
}

/** Clean 0..max tick values (still minor units). */
export function buildYAxisTicks(maxValueMinor: number, tickCount = 4): number[] {
  if (maxValueMinor <= 0) {
    return [0];
  }
  const niceMax = niceCeil(maxValueMinor);
  const step = niceMax / tickCount;
  return Array.from({ length: tickCount + 1 }, (_, i) => Math.round(i * step));
}

const BAR_MAX_THICKNESS = 24; // dataviz spec: bar/column ≤24px
const BAR_GAP = 2; // surface-gap spacer between adjacent bars

/**
 * Flat-bottom, rounded-top bar — `Rect`'s `rx` rounds all 4 corners, which
 * violates "square at the baseline", so bars are a hand-built `Path`.
 */
export function roundedTopRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): string {
  if (height <= 0) {
    return '';
  }
  const r = Math.min(radius, width / 2, height);
  return [
    `M ${x} ${y + height}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + width - r} ${y}`,
    `Q ${x + width} ${y} ${x + width} ${y + r}`,
    `L ${x + width} ${y + height}`,
    'Z',
  ].join(' ');
}

export type MonthColumn = { monthKey: string; centerX: number; bar: BarLayout };

/** Single bar per month — used by the Trends screen's total-spend chart. */
export function buildColumns(
  points: Array<{ monthKey: string; valueMinor: number }>,
  opts: { width: number; height: number; maxValueMinor: number }
): MonthColumn[] {
  const { width, height, maxValueMinor } = opts;
  if (points.length === 0 || width <= 0) {
    return [];
  }
  const slotWidth = width / points.length;
  const barWidth = Math.max(4, Math.min(BAR_MAX_THICKNESS * 1.25, slotWidth - spacingBetweenBars(slotWidth)));
  const scaleH = (v: number) => (maxValueMinor > 0 ? (v / maxValueMinor) * height : 0);

  return points.map((point, i) => {
    const barH = scaleH(point.valueMinor);
    const x = i * slotWidth + (slotWidth - barWidth) / 2;
    return {
      monthKey: point.monthKey,
      centerX: x + barWidth / 2,
      bar: { x, y: height - barH, width: barWidth, height: barH },
    };
  });
}

function spacingBetweenBars(slotWidth: number): number {
  return Math.min(BAR_GAP * 4, slotWidth * 0.3);
}

//#endregion
