import { products } from "@/data/products";
import { manufacturerWeekly } from "@/data/analytics/manufacturer";

export const NORDVIK_BRAND = "b-nordvik";
export const nordvikProducts = products.filter((p) => p.brandId === NORDVIK_BRAND);

export type Range = "4w" | "12w" | "26w";
export const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: "4w", label: "4 weeks" },
  { value: "12w", label: "12 weeks" },
  { value: "26w", label: "26 weeks" },
];

export function weeksFor(range: Range) {
  const n = range === "4w" ? 4 : range === "12w" ? 12 : 26;
  return manufacturerWeekly.slice(-n).map((w) => ({ ...w }) as typeof w & Record<string, string | number>);
}

/** Totals for the selected window and the equivalent previous window. */
export function windowTotals(range: Range) {
  const n = range === "4w" ? 4 : range === "12w" ? 12 : 13;
  const cur = manufacturerWeekly.slice(-n);
  const prev = manufacturerWeekly.slice(-2 * n, -n);
  const sum = (rows: typeof cur, k: "views" | "comparisons" | "questions") => rows.reduce((s, r) => s + r[k], 0);
  const change = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 1000) / 10 : 0);
  const avgRating = (rows: typeof cur) => (rows.length ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : 0);
  const pos = (rows: typeof cur) => (rows.length ? rows.reduce((s, r) => s + r.positive, 0) / rows.length : 0);
  return {
    views: sum(cur, "views"),
    viewsChange: change(sum(cur, "views"), sum(prev, "views")),
    comparisons: sum(cur, "comparisons"),
    comparisonsChange: change(sum(cur, "comparisons"), sum(prev, "comparisons")),
    questions: sum(cur, "questions"),
    questionsChange: change(sum(cur, "questions"), sum(prev, "questions")),
    rating: Math.round(avgRating(cur) * 100) / 100,
    ratingChange: Math.round((avgRating(cur) - avgRating(prev)) * 100) / 100,
    positive: Math.round(pos(cur)),
    positiveChange: Math.round((pos(cur) - pos(prev)) * 10) / 10,
  };
}
