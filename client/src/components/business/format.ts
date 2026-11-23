import type { KpiStat } from "@/types";
import { formatDate } from "@/lib/format";
import { compactNumber } from "@/lib/utils";

/** Format a KPI value according to its declared format. */
export function formatKpi(stat: Pick<KpiStat, "value" | "format">): string {
  switch (stat.format) {
    case "percent":
      return `${stat.value}%`;
    case "rating":
      return stat.value.toFixed(2);
    case "currency":
      return `$${compactNumber(stat.value)}`;
    case "duration":
      return `${stat.value} h`;
    default:
      return stat.value >= 100_000 ? compactNumber(stat.value) : stat.value.toLocaleString("en-US");
  }
}

/** "25 May" style label for ISO week starts / days. */
export const shortDate = (iso: string) => formatDate(iso, "d MMM");

export const fmtNumber = (v: number) => v.toLocaleString("en-US");
export const fmtCompact = (v: number) => compactNumber(v);
export const fmtPct = (v: number) => `${v}%`;

/** Percentage change between two totals, one decimal. */
export function pctChange(current: number, previous: number): number {
  if (!previous) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function sum<T>(rows: T[], pick: (r: T) => number): number {
  return rows.reduce((s, r) => s + pick(r), 0);
}

export function avg<T>(rows: T[], pick: (r: T) => number): number {
  return rows.length ? sum(rows, pick) / rows.length : 0;
}

/** Human-readable file size. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
