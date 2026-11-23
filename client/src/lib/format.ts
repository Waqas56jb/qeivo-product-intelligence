import { format, formatDistanceStrict, parseISO } from "date-fns";
import type { Region, RegionCode } from "@/types";
import { DEMO_NOW } from "./utils";

export const REGIONS: Record<RegionCode, Region> = {
  US: { code: "US", name: "United States", currency: "USD", locale: "en-US", priceFactor: 1, tariff: 0.17, flag: "🇺🇸" },
  UK: { code: "UK", name: "United Kingdom", currency: "GBP", locale: "en-GB", priceFactor: 0.86, tariff: 0.27, flag: "🇬🇧" },
  EU: { code: "EU", name: "European Union", currency: "EUR", locale: "de-DE", priceFactor: 0.98, tariff: 0.31, flag: "🇪🇺" },
  AU: { code: "AU", name: "Australia", currency: "AUD", locale: "en-AU", priceFactor: 1.58, tariff: 0.33, flag: "🇦🇺" },
  CA: { code: "CA", name: "Canada", currency: "CAD", locale: "en-CA", priceFactor: 1.39, tariff: 0.14, flag: "🇨🇦" },
};

export const REGION_LIST = Object.values(REGIONS);

/** Convert a USD base price to a region's demo price (rounded to a retail-style figure). */
export function regionalPrice(usd: number, region: RegionCode = "US") {
  const r = REGIONS[region];
  const raw = usd * r.priceFactor;
  if (raw < 100) return Math.round(raw);
  return Math.round(raw / 10) * 10 - 1;
}

export function formatCurrency(value: number, region: RegionCode = "US", opts: { decimals?: number } = {}) {
  const r = REGIONS[region];
  return new Intl.NumberFormat(r.locale, {
    style: "currency",
    currency: r.currency,
    minimumFractionDigits: opts.decimals ?? 0,
    maximumFractionDigits: opts.decimals ?? 0,
  }).format(value);
}

export function formatPrice(usd: number, region: RegionCode = "US") {
  return formatCurrency(regionalPrice(usd, region), region);
}

/**
 * Parse an ISO string to a Date whose local wall-clock equals the UTC wall-clock.
 * Keeps server (UTC) and browser (any timezone) output identical — no hydration mismatches.
 */
function wallClock(iso: string) {
  const d = parseISO(iso);
  return /T.*(Z|[+-]\d\d:?\d\d)$/.test(iso) ? new Date(d.getTime() + d.getTimezoneOffset() * 60_000) : d;
}

export function formatDate(iso: string, pattern = "d MMM yyyy") {
  return format(wallClock(iso), pattern);
}

export function formatDateTime(iso: string) {
  return `${format(wallClock(iso), "d MMM yyyy, HH:mm")} UTC`;
}

export function formatRelative(iso: string) {
  // Native Date parses date-only strings as UTC midnight (parseISO uses local time),
  // so the result is identical on the server and in every browser timezone.
  const d = new Date(iso);
  const diffDays = (DEMO_NOW.getTime() - d.getTime()) / 86_400_000;
  if (diffDays < 0) return `in ${formatDistanceStrict(DEMO_NOW, d)}`;
  if (diffDays < 1 / 24) return "just now";
  return `${formatDistanceStrict(d, DEMO_NOW)} ago`;
}

export function formatNumber(value: number, decimals = 0) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

export function formatScore(score: number) {
  return score.toFixed(1);
}

export function formatDimensions(w: number, h: number, d: number, unit: "mm" | "cm" | "in" = "cm") {
  const conv = (v: number) => (unit === "mm" ? v : unit === "cm" ? Math.round(v / 10 * 10) / 10 : Math.round((v / 25.4) * 10) / 10);
  return `${conv(w)} × ${conv(h)} × ${conv(d)} ${unit}`;
}
