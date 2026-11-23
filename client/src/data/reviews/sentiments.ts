import { getProduct } from "@/data/products";
import { ratingDistribution, reviewsForProduct } from "./reviews";

export interface SentimentAspect {
  label: string;
  positive: number;
  negative: number;
}

export interface SentimentSummary {
  /** Integer percentages of all owner reviews; positive + mixed + negative = 100 */
  positive: number;
  mixed: number;
  negative: number;
  /** Most frequently praised themes (short labels first, then evidence-backed strengths) */
  topPositive: string[];
  /** Most frequently criticised themes */
  topNegative: string[];
  /** Aspect mention counts across displayed reviews, most mentioned first */
  aspects: SentimentAspect[];
}

function shortClaim(text: string): string {
  const first = text.split(/ — |; |, (?=which|while|making)/)[0];
  return first.length > 90 ? `${first.slice(0, 87).trimEnd()}…` : first;
}

/** Owner sentiment for a product, derived from the star distribution, review aspects and evidence-backed claims. */
export function sentimentSummary(productId: string): SentimentSummary {
  const product = getProduct(productId);
  const dist = ratingDistribution(productId);
  const total = dist.reduce((s, b) => s + b.count, 0) || 1;
  const count = (stars: number[]) => dist.filter((b) => stars.includes(b.stars)).reduce((s, b) => s + b.count, 0);
  const positive = Math.round((count([5, 4]) / total) * 100);
  const negative = Math.round((count([2, 1]) / total) * 100);
  const mixed = Math.max(0, 100 - positive - negative);

  const tally = new Map<string, SentimentAspect>();
  for (const review of reviewsForProduct(productId)) {
    for (const a of review.aspects) {
      const entry = tally.get(a.label) ?? { label: a.label, positive: 0, negative: 0 };
      if (a.sentiment === "positive") entry.positive++;
      else entry.negative++;
      tally.set(a.label, entry);
    }
  }
  const aspects = [...tally.values()].sort((a, b) => b.positive + b.negative - (a.positive + a.negative) || a.label.localeCompare(b.label));

  const praised = aspects.filter((a) => a.positive > a.negative).sort((a, b) => b.positive - a.positive).map((a) => a.label);
  const criticised = aspects.filter((a) => a.negative >= a.positive && a.negative > 0).sort((a, b) => b.negative - a.negative).map((a) => a.label);

  const strengths = (product?.strengths ?? []).filter((c) => c.type !== "manufacturer").map((c) => shortClaim(c.text));
  const limitations = (product?.limitations ?? []).map((c) => shortClaim(c.text));

  const topPositive = [...praised.slice(0, 4), ...strengths].slice(0, Math.max(4, Math.min(praised.length, 4) + 2));
  const topNegative = [...criticised.slice(0, 3), ...limitations].slice(0, Math.max(3, Math.min(criticised.length, 3) + 2));

  return { positive, mixed, negative, topPositive, topNegative, aspects };
}
