import type { Product, ScoreFactor, ScoreFactorKey } from "@/types";
import { clamp, round } from "./utils";

/** User priority levels for each factor (0 = not important … 4 = critical). */
export type PriorityLevel = 0 | 1 | 2 | 3 | 4;
export type Priorities = Partial<Record<ScoreFactorKey, PriorityLevel>>;

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  0: "Not important",
  1: "Minor",
  2: "Standard",
  3: "Important",
  4: "Critical",
};

const MULTIPLIER: Record<PriorityLevel, number> = { 0: 0.2, 1: 0.6, 2: 1, 3: 1.7, 4: 2.6 };

export interface PersonalisedFactor extends ScoreFactor {
  personalWeight: number;
  contribution: number;
}

/**
 * Re-weights factor scores by the user's priorities. Evidence coverage is
 * deliberately NOT an input: suitability and evidence remain separate metrics.
 * Sponsored status is never read here.
 */
export function personaliseFactors(product: Product, priorities: Priorities = {}): PersonalisedFactor[] {
  const raw = product.scoreFactors.map((f) => f.weight * MULTIPLIER[priorities[f.key] ?? 2]);
  const total = raw.reduce((a, b) => a + b, 0);
  return product.scoreFactors.map((f, i) => {
    const personalWeight = raw[i] / total;
    return { ...f, personalWeight, contribution: f.score * personalWeight };
  });
}

export function personalScore(product: Product, priorities: Priorities = {}): number {
  const factors = personaliseFactors(product, priorities);
  return round(clamp(factors.reduce((s, f) => s + f.contribution, 0), 0, 10), 1);
}

export function hasCustomPriorities(priorities: Priorities) {
  return Object.values(priorities).some((v) => v !== undefined && v !== 2);
}

export function scoreBand(score: number): { label: string; tone: "excellent" | "good" | "fair" | "weak" } {
  if (score >= 8.2) return { label: "Excellent fit", tone: "excellent" };
  if (score >= 7.2) return { label: "Good fit", tone: "good" };
  if (score >= 6) return { label: "Fair fit", tone: "fair" };
  return { label: "Weak fit", tone: "weak" };
}

export function evidenceBand(coverage: number): { label: string; tone: "high" | "moderate" | "low" } {
  if (coverage >= 88) return { label: "Strong evidence", tone: "high" };
  if (coverage >= 75) return { label: "Moderate evidence", tone: "moderate" };
  return { label: "Limited evidence", tone: "low" };
}

/** Data points that lower evidence coverage — shown on the score explanation screen. */
export function missingInformation(product: Product): string[] {
  const items: string[] = [];
  if (!product.installation.ventilationMm && product.category !== "laptops") items.push("Ventilation clearances not published by the manufacturer");
  if (product.evidenceCoverage < 90) items.push("Fewer than two independent lab measurements for energy use");
  if (product.releaseYear >= 2025 && product.evidenceCoverage < 92) items.push("Less than 12 months of owner reliability reports");
  if (product.freshness !== "current") items.push("Specification sheet not re-verified in the last 90 days");
  if (product.evidenceCoverage < 80) items.push("No independent noise measurement — manufacturer figure used");
  if (product.evidenceCoverage < 72) items.push("Warranty terms not confirmed against regional documentation");
  return items;
}
