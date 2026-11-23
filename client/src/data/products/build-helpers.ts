import type {
  CategorySlug,
  Claim,
  ClaimType,
  Confidence,
  DataWarning,
  ScoreFactor,
  ScoreFactorKey,
  SourceReference,
  SourceType,
} from "@/types";
import { clamp, hash, round, seeded } from "@/lib/utils";
import { getCategory } from "./categories";

export const DEFAULT_WEIGHTS: Record<ScoreFactorKey, number> = {
  performance: 0.18,
  energy: 0.14,
  value: 0.14,
  reliability: 0.16,
  capacity: 0.12,
  space: 0.1,
  maintenance: 0.08,
  warranty: 0.08,
};

export const FACTOR_ORDER: ScoreFactorKey[] = ["performance", "energy", "value", "reliability", "capacity", "space", "maintenance", "warranty"];

export function confidenceFor(evidence: number, key: ScoreFactorKey, year: number): Confidence {
  if (key === "reliability" && year >= 2025 && evidence < 92) return evidence < 80 ? "low" : "moderate";
  if (evidence >= 90) return "high";
  if (evidence >= 78) return key === "reliability" || key === "maintenance" ? "moderate" : "high";
  return key === "performance" || key === "energy" ? "moderate" : "low";
}

export function buildFactors(
  category: CategorySlug,
  scores: Record<ScoreFactorKey, number>,
  explanations: Record<ScoreFactorKey, string>,
  evidence: number,
  year: number,
): ScoreFactor[] {
  const labels = getCategory(category).factorLabels;
  return FACTOR_ORDER.map((key) => ({
    key,
    label: labels[key],
    score: round(clamp(scores[key], 1.5, 9.8), 1),
    weight: DEFAULT_WEIGHTS[key],
    explanation: explanations[key],
    confidence: confidenceFor(evidence, key, year),
  }));
}

export function weightedScore(factors: ScoreFactor[]) {
  const total = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
  const weights = factors.reduce((sum, f) => sum + f.weight, 0);
  return round(total / weights, 1);
}

export function jitter(seed: string, spread: number) {
  const r = seeded(seed)();
  return (r - 0.5) * 2 * spread;
}

/* ------------------------------------------------------------- Sources */

export const PUBLISHERS: Record<CategorySlug, { lab: string; review: string }> = {
  refrigerators: { lab: "HomeLab Review", review: "The Measured Kitchen" },
  "washing-machines": { lab: "Laundry Lab", review: "HomeLab Review" },
  televisions: { lab: "Panel Report", review: "DisplayLab" },
  laptops: { lab: "Bench & Battery", review: "Portable Review" },
};

export type SourceKey = "manual" | "spec" | "lab" | "review" | "customers" | "maker" | "video" | "cert";

export function sourceId(productId: string, key: SourceKey) {
  return `${productId}:${key}`;
}

interface SourceContext {
  productId: string;
  brand: string;
  model: string;
  modelNumber: string;
  category: CategorySlug;
  year: number;
  reviews: number;
  lastVerified: string;
  facts: Partial<Record<SourceKey, string>>;
}

export function buildSources(ctx: SourceContext): SourceReference[] {
  const pub = PUBLISHERS[ctx.category];
  const h = hash(ctx.productId);
  const month = String((h % 9) + 1).padStart(2, "0");
  const published = `${ctx.year}-${month}-${String((h % 25) + 2).padStart(2, "0")}`;
  const mk = (key: SourceKey, type: SourceType, title: string, publisher: string, locator: string, reliability: number, excerpt: string): SourceReference => ({
    id: sourceId(ctx.productId, key),
    type,
    title,
    publisher,
    locator,
    excerpt: ctx.facts[key] ?? excerpt,
    publishedAt: published,
    retrievedAt: ctx.lastVerified,
    productIds: [ctx.productId],
    reliability,
  });
  const mins = String((h % 9) + 2).padStart(2, "0");
  const secs = String(h % 60).padStart(2, "0");
  return [
    mk("manual", "manual", `${ctx.brand} ${ctx.model} — Owner's manual`, ctx.brand, `Page ${(h % 30) + 8}`, 0.9, "Operating instructions and installation requirements."),
    mk("spec", "spec-sheet", `${ctx.modelNumber} technical specification sheet`, ctx.brand, `Section ${(h % 4) + 2}.${(h % 3) + 1}`, 0.88, "Published dimensions, capacity and energy data."),
    mk("lab", "independent-review", `${ctx.brand} ${ctx.model} lab test`, pub.lab, "Measured results table", 0.94, "Independent laboratory measurements."),
    mk("review", "independent-review", `${ctx.model} long-term review`, pub.review, `Verdict, para ${(h % 4) + 2}`, 0.86, "Hands-on assessment after several weeks of use."),
    mk("customers", "customer-review", `Aggregated owner reviews (${ctx.reviews.toLocaleString("en-US")})`, "Qeivo review analysis", `${ctx.reviews.toLocaleString("en-US")} reviews`, 0.72, "Themes extracted from verified owner reviews."),
    mk("maker", "manufacturer-statement", `${ctx.brand} product page claims`, ctx.brand, "Feature highlights", 0.55, "Marketing statements published by the manufacturer."),
    { ...mk("video", "video", `${ctx.model} — independent video review`, pub.review, `${mins}:${secs}`, 0.8, "Video review segment."), relatedEntity: undefined },
    mk("cert", "certification", `Energy label registration — ${ctx.modelNumber}`, "Energy label registry", "Label record", 0.95, "Registered energy class and declared consumption."),
  ];
}

export function claim(productId: string, idx: number, type: ClaimType, text: string, keys: SourceKey[]): Claim {
  return { id: `${productId}-c${idx}`, text, type, sourceIds: keys.map((k) => sourceId(productId, k)) };
}

/** Pick up to `max` candidate claims, preserving priority order but rotating ties deterministically. */
export function pickClaims<T extends { when: boolean }>(seed: string, candidates: T[], min: number, max: number): T[] {
  const valid = candidates.filter((c) => c.when);
  const offset = hash(seed) % Math.max(1, valid.length);
  const head = valid.slice(0, 2);
  const rest = valid.slice(2);
  const rotated = [...rest.slice(offset % Math.max(1, rest.length)), ...rest.slice(0, offset % Math.max(1, rest.length))];
  const result = [...head, ...rotated].slice(0, max);
  return result.length >= min ? result : valid.slice(0, Math.max(min, result.length));
}

export function freshnessWarnings(freshness: "current" | "aging" | "stale", lastVerified: string, evidence: number, productId: string): DataWarning[] {
  const w: DataWarning[] = [];
  if (freshness === "stale")
    w.push({ kind: "stale", title: "Some data may be outdated", detail: `Pricing and specifications were last verified on ${lastVerified}. The manufacturer may have revised this model since.`, sourceIds: [sourceId(productId, "spec")] });
  if (freshness === "aging")
    w.push({ kind: "stale", title: "Verification due", detail: `Specifications were last verified on ${lastVerified} and are scheduled for re-checking.`, sourceIds: [sourceId(productId, "spec")] });
  if (evidence < 75)
    w.push({ kind: "low-evidence", title: "Limited evidence", detail: `Only ${evidence}% of the data points we score are supported by independent or verified sources. Treat the score as provisional.` });
  return w;
}

export function ean13(seed: string) {
  const h = hash(seed).toString().padStart(10, "0");
  const base = `50${h.slice(0, 10)}`;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(base[i]) * (i % 2 === 0 ? 1 : 3);
  return `${base}${(10 - (sum % 10)) % 10}`;
}

export function verifiedDate(freshness: "current" | "aging" | "stale", seed: string) {
  const h = hash(seed);
  if (freshness === "current") return `2026-${String(9 + (h % 3)).padStart(2, "0")}-${String((h % 26) + 1).padStart(2, "0")}`;
  if (freshness === "aging") return `2026-${String(5 + (h % 3)).padStart(2, "0")}-${String((h % 26) + 1).padStart(2, "0")}`;
  return `2025-${String(8 + (h % 4)).padStart(2, "0")}-${String((h % 26) + 1).padStart(2, "0")}`;
}

export function fmtMoney(usd: number) {
  return `$${usd.toLocaleString("en-US")}`;
}
