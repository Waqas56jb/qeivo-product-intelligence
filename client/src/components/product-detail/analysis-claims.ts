import type { Claim, ClaimType, Product } from "@/types";
import { getBrand } from "@/data/products/brands";
import { sentimentSummary } from "@/data/reviews";
import { offersForProduct } from "@/data/offers/retailer-offers";
import { priceStats } from "@/data/offers/price-history";
import { categoryAverage, getSpecItem } from "./spec-utils";

type Key = "manual" | "spec" | "lab" | "review" | "customers" | "maker" | "video" | "cert";

function make(p: Product, n: number, type: ClaimType, text: string, keys: Key[]): Claim {
  return { id: `${p.id}-an${n}`, type, text, sourceIds: keys.map((k) => `${p.id}:${k}`) };
}

const f = (p: Product, k: string) => p.scoreFactors.find((x) => x.key === k)!;

/** Deterministic, sourced analysis sections derived from a product's seed data. */
export function buildAnalysis(p: Product) {
  const brand = getBrand(p.brandId);
  const sentiment = sentimentSummary(p.id);
  const stats = priceStats(p.id);
  const offers = offersForProduct(p.id);
  const measuredKwh = getSpecItem(p, "kwh-measured");
  const avgPrice = Math.round(categoryAverage(p, (x) => x.price));
  const avgKwh = Math.round(categoryAverage(p, (x) => x.energy.annualKwh));
  const perf = f(p, "performance");
  const value = f(p, "value");
  const energy = f(p, "energy");
  const rel = f(p, "reliability");
  const lowestOffer = offers.length ? Math.min(...offers.map((o) => o.price)) : p.price;

  const performance: Claim[] = [
    make(p, 1, "measured", perf.explanation, ["lab"]),
    make(p, 2, "expert", `Reviewers rate ${perf.label.toLowerCase()} at ${perf.score.toFixed(1)}/10, ${perf.score >= 8 ? "among the best in its class" : perf.score >= 6.5 ? "competitive for its class" : "behind most rivals"}.`, ["review"]),
    ...(sentiment.topPositive[0] ? [make(p, 3, "customer" as const, `Owners most often praise: ${sentiment.topPositive.slice(0, 2).join("; ").toLowerCase()}.`, ["customers" as const])] : []),
  ];

  const valueClaims: Claim[] = [
    make(p, 4, "measured", `The reference price of $${p.price.toLocaleString("en-US")} is ${p.price > avgPrice ? `${Math.round((p.price / avgPrice - 1) * 100)}% above` : `${Math.round((1 - p.price / avgPrice) * 100)}% below`} the category average of $${avgPrice.toLocaleString("en-US")}.`, ["spec"]),
    make(p, 5, "measured", `Over the last 12 months the observed price ranged from $${stats.low.toLocaleString("en-US")} to $${stats.high.toLocaleString("en-US")}; the lowest current retailer offer is $${lowestOffer.toLocaleString("en-US")}.`, ["spec"]),
    make(p, 6, "ai", `${value.label} scores ${value.score.toFixed(1)}/10. ${value.score >= 7.5 ? "It delivers strong capability for the money." : value.score >= 6 ? "Fair value — you pay a little for the brand or features." : "You pay a premium relative to what independent tests show."}`, ["spec", "lab"]),
  ];

  const energyClaims: Claim[] = [
    make(p, 7, "manufacturer", `${brand.name} declares ${p.energy.annualKwh} kWh per year (${p.energy.label}).`, ["cert"]),
    ...(measuredKwh ? [make(p, 8, "measured" as const, `Independent testing measured ${String(measuredKwh.value)} kWh per year — about $${Math.round(Number(measuredKwh.numeric ?? measuredKwh.value) * 0.17)} annually at $0.17/kWh.`, ["lab" as const])] : []),
    make(p, 9, "ai", `That is ${p.energy.annualKwh <= avgKwh ? `${Math.round((1 - p.energy.annualKwh / avgKwh) * 100)}% less` : `${Math.round((p.energy.annualKwh / avgKwh - 1) * 100)}% more`} than the category average of ${avgKwh} kWh, giving an energy factor of ${energy.score.toFixed(1)}/10.`, ["cert", "lab"]),
  ];

  const reliability: Claim[] = [
    make(p, 10, "expert", rel.explanation, ["review", "customers"]),
    make(p, 11, "manufacturer", `Warranty: ${p.warranty.years} year${p.warranty.years > 1 ? "s" : ""} parts and labour${p.warranty.extended ? `, ${p.warranty.extended}` : ""}.`, ["spec"]),
    make(p, 12, "ai", `Reliability confidence is ${rel.confidence}. ${rel.confidence === "high" ? "Long-term owner data is plentiful." : "Owner data covers a shorter period, so treat this factor as provisional."}`, ["customers"]),
  ];

  const concerns: Claim[] = [
    ...p.limitations.slice(0, 3),
    ...sentiment.topNegative.slice(0, 2).map((t, i) => make(p, 13 + i, "customer", `Recurring owner complaint: ${t.charAt(0).toLowerCase() + t.slice(1)}.`, ["customers"])),
  ];

  const who: Claim[] = p.bestFor.map((b, i) => make(p, 20 + i, "ai", b, ["spec", "lab"]));
  const avoid: Claim[] = p.notFor.map((b, i) => make(p, 30 + i, "ai", b, ["spec", "lab"]));

  return { performance, valueClaims, energyClaims, reliability, concerns, who, avoid, sentiment };
}
