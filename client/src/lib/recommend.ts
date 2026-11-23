import type { CategorySlug, Product, RegionCode, ScoreFactorKey } from "@/types";
import { getBrand } from "@/data/products/brands";
import { physicallyFits } from "./compatibility";
import { personalScore, type PriorityLevel, type Priorities } from "./scoring";
import { round } from "./utils";

export interface RecommendationInput {
  category: CategorySlug;
  budgetMin: number;
  budgetMax: number;
  householdSize: number;
  space: { widthMm: number; heightMm: number; depthMm: number } | null;
  noWaterSupply: boolean;
  features: string[];
  energyPriority: "low" | "balanced" | "high";
  region: RegionCode;
  brandIds: string[];
  priorities: Priorities;
}

export interface Recommendation {
  product: Product;
  matchScore: number;
  personalScore: number;
  reasons: string[];
  tradeoffs: string[];
  fit: "fits" | "unknown" | "no-fit";
}

/** Recommended capacity for the household, per category. */
export function idealCapacity(category: CategorySlug, household: number): { min: number; label: string } {
  switch (category) {
    case "refrigerators":
      return { min: 150 + household * 85, label: `${150 + household * 85} L+` };
    case "washing-machines":
      return { min: household <= 2 ? 7 : household <= 4 ? 8 : 10, label: `${household <= 2 ? 7 : household <= 4 ? 8 : 10} kg+` };
    case "televisions":
      return { min: 50, label: '50"+' };
    default:
      return { min: 256, label: "256 GB+" };
  }
}

/** Translate questionnaire answers into factor priorities (explicit priorities win). */
export function derivePriorities(input: RecommendationInput): Priorities {
  const derived: Priorities = {
    energy: input.energyPriority === "high" ? 4 : input.energyPriority === "low" ? 1 : 2,
    capacity: (input.householdSize >= 5 ? 4 : input.householdSize >= 3 ? 3 : 1) as PriorityLevel,
    space: input.space ? 3 : 2,
    value: input.budgetMax <= 1500 ? 3 : 2,
  };
  return { ...derived, ...input.priorities };
}

/**
 * Deterministic recommendation ranking from local seed data.
 * Sponsored placement is never read — rankings are based on evidence only.
 */
export function recommend(products: Product[], input: RecommendationInput, limit = 3): { results: Recommendation[]; excluded: number; considered: number } {
  const priorities = derivePriorities(input);
  const ideal = idealCapacity(input.category, input.householdSize);
  const inCategory = products.filter((p) => p.category === input.category);
  const scored: Recommendation[] = [];
  let excluded = 0;

  for (const p of inCategory) {
    const fit = input.category === "refrigerators" || input.category === "washing-machines" ? physicallyFits(p, input.space) : "fits";
    const needsWater = p.features.some((f) => /ice maker|dispenser/i.test(f));
    if (!p.regions.includes(input.region) || p.price > input.budgetMax * 1.08 || p.price < input.budgetMin * 0.6 || fit === "no-fit" || (input.noWaterSupply && needsWater)) {
      excluded++;
      continue;
    }
    const ps = personalScore(p, priorities);
    const featureHits = input.features.filter((f) => p.features.includes(f));
    const brandHit = input.brandIds.includes(p.brandId);
    const capacityGap = p.capacity.value < ideal.min ? (ideal.min - p.capacity.value) / ideal.min : 0;
    const overBudget = p.price > input.budgetMax;
    const match = round(ps + Math.min(featureHits.length * 0.18, 0.7) + (brandHit ? 0.25 : 0) - capacityGap * 3 - (overBudget ? 0.35 : 0) - (fit === "unknown" && input.space ? 0.15 : 0), 2);

    const factor = (k: ScoreFactorKey) => p.scoreFactors.find((f) => f.key === k)!;
    const reasons: string[] = [];
    const top = [...p.scoreFactors].sort((a, b) => b.score * ((priorities[b.key] ?? 2) + 1) - a.score * ((priorities[a.key] ?? 2) + 1)).slice(0, 2);
    top.forEach((f) => reasons.push(`${f.label} scores ${f.score.toFixed(1)}/10 — ${f.explanation.split(/[.;—]/)[0].trim()}`));
    if (p.capacity.value >= ideal.min) reasons.push(`${p.capacity.value} ${p.capacity.unit} meets the ${ideal.label} we suggest for a household of ${input.householdSize}`);
    if (featureHits.length) reasons.push(`Has ${featureHits.length === 1 ? "your requested feature" : `${featureHits.length} of your requested features`}: ${featureHits.join(", ")}`);
    if (brandHit) reasons.push(`From a preferred brand (${getBrand(p.brandId).name})`);
    if (input.space && fit === "fits") reasons.push("Fits your measured space including ventilation clearance");

    const tradeoffs: string[] = [];
    if (overBudget) tradeoffs.push(`About ${Math.round((p.price / input.budgetMax - 1) * 100)}% over your maximum budget`);
    if (capacityGap > 0) tradeoffs.push(`${p.capacity.value} ${p.capacity.unit} is below the ${ideal.label} suggested for your household`);
    if (fit === "unknown" && input.space) tradeoffs.push("Ventilation clearance unpublished — fit cannot be fully confirmed");
    const missing = input.features.filter((f) => !p.features.includes(f));
    if (missing.length) tradeoffs.push(`Missing: ${missing.slice(0, 3).join(", ")}`);
    const weakest = [...p.scoreFactors].sort((a, b) => a.score - b.score)[0];
    if (weakest.score < 6.5) tradeoffs.push(`${weakest.label} is a relative weakness (${weakest.score.toFixed(1)}/10)`);
    if (p.evidenceCoverage < 80) tradeoffs.push(`Evidence coverage is ${p.evidenceCoverage}% — score is provisional`);
    if (factor("energy").score < 6 && (priorities.energy ?? 2) >= 3) tradeoffs.push("Higher running costs than you'd prefer");

    scored.push({ product: p, matchScore: match, personalScore: ps, reasons: reasons.slice(0, 4), tradeoffs: tradeoffs.slice(0, 3), fit });
  }

  scored.sort((a, b) => b.matchScore - a.matchScore || b.product.evidenceCoverage - a.product.evidenceCoverage || a.product.price - b.product.price);
  return { results: scored.slice(0, limit), excluded, considered: inCategory.length };
}
