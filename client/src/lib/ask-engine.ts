/**
 * Ask Qeivo — deterministic local answer engine.
 *
 * Given a question and the product(s) in context, it classifies the intent and
 * composes an answer from that product's real seed data only (specs, claims,
 * reviews, offers, installation data). Every block carries a claim type and
 * valid local source ids. Same input → same output. Missing data is stated,
 * never assumed.
 */
import type { CategorySlug, ClaimType, Product, RegionCode, SpecItem } from "@/types";
import { products, getProduct } from "@/data/products";
import { getBrand } from "@/data/products/brands";
import { getSource } from "@/data/sources/sources";
import { reviewsForProduct, sentimentSummary } from "@/data/reviews";
import { offersForProduct } from "@/data/offers/retailer-offers";
import { priceStats } from "@/data/offers/price-history";
import { REGIONS, formatCurrency, formatPrice } from "./format";
import { idealCapacity } from "./recommend";
import { checkCompatibility, overallFit, type SpaceInput } from "./compatibility";
import { defaultAnnualKwh, defaultMaintenance } from "./ownership";
import { evidenceBand, scoreBand } from "./scoring";
import { hash } from "./utils";

/* ------------------------------------------------------------------ Types */

export type AskIntent =
  | "compare"
  | "fit"
  | "household"
  | "energy"
  | "complaints"
  | "weaknesses"
  | "noise"
  | "warranty"
  | "capacity"
  | "features"
  | "reliability"
  | "maintenance"
  | "price"
  | "summary"
  | "discover"
  | "needs-product";

export const INTENT_LABELS: Record<AskIntent, string> = {
  compare: "Comparison",
  fit: "Fit & dimensions",
  household: "Household suitability",
  energy: "Running cost",
  complaints: "Owner complaints",
  weaknesses: "Weaknesses",
  noise: "Noise",
  warranty: "Warranty",
  capacity: "Capacity",
  features: "Features",
  reliability: "Reliability",
  maintenance: "Maintenance",
  price: "Price & deals",
  summary: "Overview",
  discover: "Shortlist",
  "needs-product": "Choose a product",
};

export interface AnswerBlock {
  text: string;
  claimType: ClaimType;
  sourceIds: string[];
}

export interface AskAnswer {
  intent: AskIntent;
  intentLabel: string;
  blocks: AnswerBlock[];
  /** Products referenced by the answer (subject first). */
  productIds: string[];
  /** Unique, valid source ids in citation order. */
  sourceIds: string[];
  followUps: string[];
  /** Honest notes about data that was unavailable for this answer. */
  gaps: string[];
}

export interface AskContext {
  /** Products selected in the chat context (first is the subject). */
  productIds: string[];
  region: RegionCode;
  /** Saved kitchen/room measurements, used when the question doesn't give any. */
  space?: { widthMm: number; heightMm: number; depthMm: number } | null;
  /** Default household size from the user's profile. */
  householdSize?: number;
}

/* ---------------------------------------------------------------- Helpers */

const src = (p: Product, key: string) => `${p.id}:${key}`;
const valid = (ids: string[]) => Array.from(new Set(ids.filter((id) => Boolean(getSource(id)))));
const n = (v: number) => v.toLocaleString("en-US");
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const stripDot = (s: string) => s.replace(/[.\s]+$/, "");
const brandName = (p: Product) => getBrand(p.brandId).name;

function spec(p: Product, key: string): SpecItem | undefined {
  for (const g of p.specs) {
    const item = g.items.find((i) => i.key === key);
    if (item) return item;
  }
  return undefined;
}

function specNum(p: Product, key: string): number | undefined {
  const s = spec(p, key);
  if (!s) return undefined;
  if (typeof s.numeric === "number") return s.numeric;
  return typeof s.value === "number" ? s.value : undefined;
}

function block(text: string, claimType: ClaimType, sourceIds: string[]): AnswerBlock {
  return { text, claimType, sourceIds: valid(sourceIds) };
}

function factor(p: Product, key: Product["scoreFactors"][number]["key"]) {
  return p.scoreFactors.find((f) => f.key === key)!;
}

const WORD_NUM: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, single: 1, couple: 2 };
const num = (s: string) => (/^\d+$/.test(s) ? Number(s) : WORD_NUM[s.toLowerCase()]);

/** "family of five", "4 people", "2 adults and 3 kids" → household size. */
export function parseHousehold(q: string): number | null {
  const t = q.toLowerCase();
  const direct = t.match(/(?:family|household|home|house)\s+of\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/);
  if (direct) return num(direct[1]) ?? null;
  const parts = [...t.matchAll(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(adults?|kids?|children|teens?|teenagers?|people|persons|of us)\b/g)];
  if (parts.length) return parts.reduce((s, m) => s + (num(m[1]) ?? 0), 0) || null;
  const forN = t.match(/\bfor\s+(\d+|two|three|four|five|six|seven|eight)\b(?!\s*(?:mm|cm|kwh|years?|\$|dollars|%))/);
  if (forN && /(family|household|people|enough|suitable|big)/.test(t)) return num(forN[1]) ?? null;
  if (/\b(just me|single person|living alone|on my own)\b/.test(t)) return 1;
  if (/\bcouple\b/.test(t)) return 2;
  return null;
}

/** Extract a space from text: "920 x 1800 x 720", "900 mm gap", "70 cm deep". Missing parts stay null. */
export function parseSpace(q: string): { widthMm: number | null; heightMm: number | null; depthMm: number | null } | null {
  const t = q.toLowerCase().replace(/,(?=\d{3})/g, "");
  const triple = t.match(/(\d{2,4})\s*(mm|cm)?\s*(?:x|×|by|\*)\s*(\d{2,4})\s*(mm|cm)?\s*(?:x|×|by|\*)\s*(\d{2,4})\s*(mm|cm)?/);
  if (triple) {
    const unit = triple[6] ?? triple[4] ?? triple[2] ?? (Number(triple[1]) < 300 ? "cm" : "mm");
    const f = unit === "cm" ? 10 : 1;
    return { widthMm: Number(triple[1]) * f, heightMm: Number(triple[3]) * f, depthMm: Number(triple[5]) * f };
  }
  const out = { widthMm: null as number | null, heightMm: null as number | null, depthMm: null as number | null };
  let found = false;
  for (const m of t.matchAll(/(\d{2,4}(?:\.\d)?)\s*(mm|cm|millimet(?:er|re)s?|centimet(?:er|re)s?)\b([^.,;?]{0,24})/g)) {
    const value = Math.round(Number(m[1]) * (m[2].startsWith("c") ? 10 : 1));
    const before = t.slice(Math.max(0, (m.index ?? 0) - 24), m.index ?? 0);
    const ctx = `${before} ${m[3]}`;
    if (/deep|depth/.test(ctx)) out.depthMm = value;
    else if (/tall|high|height/.test(ctx)) out.heightMm = value;
    else out.widthMm = value;
    found = true;
  }
  return found ? out : null;
}

/** Find products mentioned by name or model number, best match first. */
export function resolveMentionedProducts(q: string, exclude: string[] = []): Product[] {
  const t = ` ${q.toLowerCase().replace(/[^a-z0-9\s-]/g, " ")} `;
  const compact = t.replace(/[\s-]/g, "");
  const scored: { p: Product; s: number }[] = [];
  for (const p of products) {
    if (exclude.includes(p.id)) continue;
    const brand = brandName(p).toLowerCase();
    const model = p.model.toLowerCase();
    const mn = p.modelNumber.toLowerCase().replace(/[\s-]/g, "");
    const codes = model.split(/[\s-]+/).filter((w) => /[a-z]/.test(w) && /\d/.test(w) && w.length >= 3);
    let s = 0;
    if (compact.includes(mn)) s = Math.max(s, 12);
    if (t.includes(` ${brand} ${model}`)) s = Math.max(s, 10);
    if (t.includes(model)) s = Math.max(s, 8);
    const codeHit = codes.some((c) => new RegExp(`\\b${c}\\b`).test(t));
    if (codeHit && t.includes(brand)) s = Math.max(s, 7);
    else if (codeHit) s = Math.max(s, 5);
    const series = model.split(" ")[0];
    if (s === 0 && t.includes(` ${brand} `) && series.length > 3 && t.includes(` ${series} `)) s = 2;
    if (s > 0) scored.push({ p, s });
  }
  return scored.sort((a, b) => b.s - a.s || b.p.suitabilityScore - a.p.suitabilityScore || a.p.id.localeCompare(b.p.id)).map((x) => x.p);
}

/** Closest alternative in the same category: nearest price among comparable capacity. */
export function closestAlternative(p: Product): Product | undefined {
  return products
    .filter((x) => x.category === p.category && x.id !== p.id)
    .map((x) => ({ x, d: Math.abs(x.price - p.price) / p.price + Math.abs(x.capacity.value - p.capacity.value) / Math.max(1, p.capacity.value) - x.suitabilityScore / 40 }))
    .sort((a, b) => a.d - b.d || a.x.id.localeCompare(b.x.id))[0]?.x;
}

function detectCategory(q: string): CategorySlug | null {
  const t = q.toLowerCase();
  if (/fridge|refrigerator|freezer|ice maker/.test(t)) return "refrigerators";
  if (/wash|laundry|washer|spin/.test(t)) return "washing-machines";
  if (/\btv\b|television|oled|mini-led|qled|screen for/.test(t)) return "televisions";
  if (/laptop|notebook|ultrabook|battery life/.test(t)) return "laptops";
  return null;
}

const INTENT_RULES: { intent: AskIntent; re: RegExp }[] = [
  { intent: "energy", re: /electric|energy|power (use|draw|consumption)|kwh|running cost|cost(s)? to run|run(ning)? (it|cost)|bill|tariff|consum|efficien|battery/ },
  { intent: "fit", re: /\bfit|fits|opening|alcove|\bgap\b|cavity|recess|dimension|measure|how (wide|tall|deep)|\bwidth\b|\bdepth\b|\bheight\b|doorway|clearance|ventilat|\d{3,4}\s*mm|\d{2,3}\s*cm/ },
  { intent: "complaints", re: /complain|owners? (say|think|report|hate|dislike|mention)|reviews?|what do (people|owners|buyers)|common (problem|issue)s?|issues? (do|have)|negative/ },
  { intent: "household", re: /family|household|people|persons|adults|kids|children|enough for|suitable for|big enough|of us/ },
  { intent: "weaknesses", re: /weakness|weak spot|downside|\bcons\b|drawback|worst|limitation|disadvantage|trade-?off|anything bad|catch\b|problems?/ },
  { intent: "noise", re: /noise|noisy|quiet|loud|decibel|\bdb\b|hum\b|buzz/ },
  { intent: "warranty", re: /warrant|guarantee|cover(ed|age)?\b|compressor (cover|year)/ },
  { intent: "capacity", re: /capacity|litre|liter|\bhow (big|large)\b|storage|volume|usable|space inside|room inside|drum size|\bkg\b/ },
  { intent: "features", re: /\bice\b|dispenser|\bwater\b|plumb|feature|wi-?fi|\bapp\b|smart|convertible|door-in-door|crisper|humidity|dolby|hdmi|thunderbolt|upgradeable|ram\b|oled display/ },
  { intent: "reliability", re: /reliab|last(s)? (long|years)|durab|break|fail|longevity|how long will/ },
  { intent: "maintenance", re: /maintain|maintenance|clean|descal|filter change|service/ },
  { intent: "price", re: /price|deal|cheap|discount|offer|retailer|on sale|\bsale\b|worth (it|the money)|where (to|can i) buy|how much (is|does it cost)|\bcost\b|budget|lowest/ },
  { intent: "summary", re: /summar|overview|tell me about|what is|good (choice|buy)|should i buy|recommend|verdict|pros/ },
];

export function classifyIntent(q: string): AskIntent {
  const t = q.toLowerCase();
  if (/\b(compare|comparison|vs\.?|versus|against|difference between|better than|or the)\b/.test(t)) return "compare";
  for (const r of INTENT_RULES) if (r.re.test(t)) return r.intent;
  return "summary";
}

/* -------------------------------------------------------- Intent composers */

interface Ctx {
  p: Product;
  q: string;
  region: RegionCode;
  ask: AskContext;
  gaps: string[];
}

function household(c: Ctx): AnswerBlock[] {
  const { p } = c;
  const size = parseHousehold(c.q) ?? c.ask.householdSize ?? null;
  if (p.category === "televisions" || p.category === "laptops") {
    c.gaps.push("Household size is not a scored factor for this category");
    return [
      block(`Household size doesn't change much for a ${p.category === "televisions" ? "TV" : "laptop"} — Qeivo doesn't score it. What matters more is ${p.category === "televisions" ? "viewing distance and room brightness" : "workload, weight and battery life"}.`, "ai", [src(p, "spec")]),
      ...summaryCore(c).slice(0, 2),
    ];
  }
  if (!size) {
    c.gaps.push("No household size given or saved in your profile");
    return [block(`Tell me how many people live with you and I'll check the ${p.model}'s ${p.capacity.value} ${p.capacity.unit} against what that household typically needs.`, "ai", [src(p, "spec")])];
  }
  const ideal = idealCapacity(p.category, size);
  const blocks: AnswerBlock[] = [];
  if (p.category === "refrigerators") {
    const usable = specNum(p, "usable");
    const freezer = specNum(p, "freezer");
    const gross = p.capacity.value;
    const ratio = gross / ideal.min;
    const verdict = ratio >= 1.08 ? "Yes, comfortably" : ratio >= 1 ? "Yes, but without much headroom" : ratio >= 0.9 ? "It will be tight" : "Probably not";
    blocks.push(
      block(`${verdict}. For a household of ${size}, Qeivo suggests about ${n(ideal.min)} L of gross capacity; the ${p.model} offers ${n(gross)} L${ratio >= 1 ? `, ${n(gross - ideal.min)} L above that guide` : `, ${n(ideal.min - gross)} L short of it`}.`, "ai", [src(p, "spec")]),
    );
    if (usable)
      blocks.push(block(`Independent testing measured ${n(usable)} L of usable space after shelving and fittings — ${Math.round((usable / gross) * 100)}% of the quoted figure, or about ${Math.round(usable / size)} L per person.`, "measured", [src(p, "lab")]));
    else c.gaps.push("No measured usable capacity");
    if (freezer !== undefined)
      blocks.push(
        block(
          freezer > 0
            ? `The freezer is ${n(freezer)} L (${Math.round((freezer / gross) * 100)}% of the total)${freezer < size * 35 ? ", which is small if you batch-cook or buy frozen in bulk" : ", enough for a weekly shop for this household"}.`
            : "There is no freezer compartment, so you would need a separate freezer.",
          "manufacturer",
          [src(p, "spec")],
        ),
      );
  } else {
    const kg = p.capacity.value;
    const ok = kg >= ideal.min;
    blocks.push(block(`${ok ? "Yes" : "It may be undersized"}. For ${size} people Qeivo suggests a drum of ${ideal.label}; the ${p.model} takes ${kg} kg.`, "ai", [src(p, "spec")]));
    const water = specNum(p, "water");
    if (water) blocks.push(block(`It used ${water} L of water per standard cycle in independent testing.`, "measured", [src(p, "lab")]));
  }
  const FAMILY = /famil|\bkids\b|children|teenager|household|of (?:four|five|six)\b/i;
  const familyReview = reviewsForProduct(p.id).find((r) => FAMILY.test(r.body));
  if (familyReview) {
    const sentence = familyReview.body.split(/(?<=[.!?])\s+/).find((s) => FAMILY.test(s)) ?? familyReview.body.split(/(?<=[.!?])\s+/)[0];
    blocks.push(block(`An owner in a family household (${familyReview.rating}/5, owned ${familyReview.ownedFor}) wrote: “${stripDot(sentence)}.”`, "customer", [src(p, "customers")]));
  }
  if (p.bestFor.length) blocks.push(block(`Qeivo's analysis lists it as best for: ${p.bestFor.slice(0, 3).map(lower).join("; ")}.${p.notFor.length ? ` Less suited to: ${p.notFor.slice(0, 2).map(lower).join("; ")}.` : ""}`, "ai", [src(p, "spec"), src(p, "review")]));
  return blocks;
}

function energy(c: Ctx): AnswerBlock[] {
  const { p, region } = c;
  const r = REGIONS[region];
  if (p.category === "laptops") {
    const claimed = specNum(p, "claimed");
    const measured = specNum(p, "measured");
    const wh = specNum(p, "wh");
    const blocks = [block(`${brandName(p)} claims ${claimed ?? "an unpublished number of"} hours of battery life.`, "manufacturer", [src(p, "maker")])];
    if (measured) blocks.push(block(`In an independent 150-nit web-browsing loop it lasted ${measured} h${claimed ? ` — ${Math.round((1 - measured / claimed) * 100)}% less than claimed` : ""}.`, "measured", [src(p, "lab")]));
    if (wh) {
      const yearly = Math.round(wh * 0.25 * 3.65);
      blocks.push(block(`Charging a ${wh} Wh battery daily uses roughly ${yearly} kWh a year — about ${formatCurrency(yearly * r.tariff, region, { decimals: 0 })} at ${formatCurrency(r.tariff, region, { decimals: 2 })}/kWh, so running cost is negligible.`, "ai", [src(p, "spec")]));
    }
    return blocks;
  }
  const rated = p.energy.annualKwh;
  const measured = specNum(p, "kwh-measured");
  const used = defaultAnnualKwh(p);
  const yearly = used * r.tariff;
  const blocks: AnswerBlock[] = [
    block(`It is energy class ${p.energy.rating}, with a declared consumption of ${n(rated)} kWh per year on the energy label.`, "manufacturer", [src(p, "cert")]),
  ];
  if (measured) {
    const diff = Math.round((measured / rated - 1) * 100);
    blocks.push(block(`Independent lab testing measured ${n(measured)} kWh per year${diff > 0 ? ` — ${diff}% above the label figure` : diff < 0 ? ` — ${Math.abs(diff)}% below the label figure` : ", in line with the label"}.`, "measured", [src(p, "lab")]));
  } else {
    const watts = specNum(p, "watts");
    if (watts) blocks.push(block(`Typical power draw was measured at ${watts} W in SDR viewing.`, "measured", [src(p, "lab")]));
    c.gaps.push("No independent annual consumption measurement — label figure used");
  }
  blocks.push(
    block(
      `At the ${r.name} demo tariff of ${formatCurrency(r.tariff, region, { decimals: 2 })}/kWh, that is roughly ${formatCurrency(yearly, region)} a year, or about ${formatCurrency(yearly * 10 * 1.12, region)} over ten years allowing for 2.5% annual tariff rises.`,
      "ai",
      [measured ? src(p, "lab") : src(p, "cert")],
    ),
  );
  const peers = products.filter((x) => x.category === p.category && x.type === p.type).map(defaultAnnualKwh).sort((a, b) => a - b);
  if (peers.length >= 3) {
    const median = peers[Math.floor(peers.length / 2)];
    const rank = peers.indexOf(used) + 1;
    blocks.push(block(`Among ${peers.length} ${p.type.toLowerCase()} models Qeivo tracks, the median is ${n(median)} kWh/yr; this one ranks ${rank} of ${peers.length} from most efficient.`, "ai", [src(p, measured ? "lab" : "cert")]));
  }
  const conflict = p.warnings.find((w) => w.kind === "conflict");
  if (conflict) blocks.push(block(`Note: ${lower(stripDot(conflict.detail))}.`, "measured", conflict.sourceIds ?? [src(p, "lab")]));
  const unverified = p.warnings.find((w) => w.kind === "unverified");
  if (unverified) blocks.push(block(`${stripDot(unverified.detail)} — treat any app-based savings as unproven.`, "manufacturer", unverified.sourceIds ?? [src(p, "maker")]));
  return blocks;
}

function fit(c: Ctx): AnswerBlock[] {
  const { p } = c;
  const { widthMm: w, heightMm: h, depthMm: d } = p.dimensions;
  const parsed = parseSpace(c.q);
  const saved = c.ask.space ?? null;
  const space = parsed ?? (saved ? { ...saved } : null);
  const fromProfile = !parsed && Boolean(saved);
  const blocks: AnswerBlock[] = [block(`The ${p.model} measures ${n(w)} mm wide, ${n(h)} mm high and ${n(d)} mm deep${p.dimensions.weightKg ? `, and weighs ${p.dimensions.weightKg} kg` : ""}.`, "manufacturer", [src(p, "spec")])];
  if (p.category === "laptops" || p.category === "televisions") {
    if (p.category === "televisions") blocks.push(block(`It needs a wall or stand at least ${n(w)} mm wide; depth without the stand is ${n(d)} mm.`, "manufacturer", [src(p, "spec")]));
    return blocks;
  }
  if (!space) {
    c.gaps.push("No measurements provided — fit cannot be checked");
    blocks.push(block("I don't have your measurements yet, so I can't confirm a fit. Give me the opening's width, height and depth (for example “920 × 1800 × 720 mm”), or save them in your profile.", "ai", [src(p, "spec")]));
  } else {
    const input: SpaceInput = { widthMm: space.widthMm, heightMm: space.heightMm, depthMm: space.depthMm, doorClearanceMm: null, accessWidthMm: null, hasWaterSupply: null };
    const checks = checkCompatibility(p, input).filter((x) => ["width", "height", "depth"].includes(x.id));
    const given = [space.widthMm && `${n(space.widthMm)} mm wide`, space.heightMm && `${n(space.heightMm)} mm high`, space.depthMm && `${n(space.depthMm)} mm deep`].filter(Boolean).join(", ");
    const verdict = overallFit(checks);
    const lead =
      verdict === "fits"
        ? "Yes — it fits, including the ventilation gaps the manual asks for."
        : verdict === "no-fit"
          ? "No, not as specified."
          : "Possibly, but I can't confirm it.";
    blocks.push(block(`${lead} I checked it against ${fromProfile ? "the space saved in your profile" : "your measurements"}: ${given}.`, "ai", [src(p, "spec"), src(p, "manual")]));
    for (const ch of checks) {
      if (ch.status === "unknown" && ch.available === "Not provided") continue;
      blocks.push(block(`${ch.label}: ${ch.status === "fits" ? "fits" : ch.status === "no-fit" ? "does not fit" : "unconfirmed"} — needs ${ch.required}, you have ${ch.available}. ${ch.detail}`, ch.status === "unknown" ? "ai" : "manufacturer", [src(p, "spec"), src(p, "manual")]));
    }
    const missing = checks.filter((x) => x.available === "Not provided").map((x) => x.label.toLowerCase());
    if (missing.length) {
      c.gaps.push(`Missing ${missing.join(" and ")} measurement`);
      blocks.push(block(`I couldn't check ${missing.join(" or ")} because ${missing.length === 1 ? "that measurement wasn't" : "those measurements weren't"} given — unknown is not the same as compatible.`, "ai", [src(p, "spec")]));
    }
  }
  const v = p.installation.ventilationMm;
  if (!v) {
    c.gaps.push("Ventilation clearances not published");
    blocks.push(block(`${brandName(p)} has not published ventilation clearances for this model, so Qeivo treats them as unknown rather than assuming a fit.`, "ai", [src(p, "manual")]));
  } else if (!space) {
    blocks.push(block(`Allow ${v.sides} mm at each side, ${v.top} mm above and ${v.back} mm behind for ventilation — about ${n(w + v.sides * 2)} × ${n(h + v.top)} × ${n(d + v.back)} mm in total.`, "manufacturer", [src(p, "manual")]));
  }
  if (p.installation.doorSwingMm) blocks.push(block(`Doors need about ${n(p.installation.doorSwingMm)} mm of clearance in front to open fully so drawers can slide out.`, "manufacturer", [src(p, "manual")]));
  const water = p.installation.notes.find((x) => /water/i.test(x));
  if (water) blocks.push(block(water, "manufacturer", [src(p, "manual")]));
  return blocks;
}

function compare(c: Ctx, other: Product | undefined): AnswerBlock[] {
  const { p, region } = c;
  if (!other) {
    const alt = closestAlternative(p);
    c.gaps.push("Couldn't identify the second product");
    return [
      block(`I couldn't tell which model you'd like to compare with the ${p.model}. Try a full name or model number${alt ? ` — for example “Compare it with ${brandName(alt)} ${alt.model}”` : ""}.`, "ai", [src(p, "spec")]),
    ];
  }
  const q = other;
  const blocks: AnswerBlock[] = [];
  const sameCat = p.category === q.category;
  blocks.push(
    block(
      `Suitability: ${p.model} scores ${p.suitabilityScore.toFixed(1)}/10 and ${q.model} ${q.suitabilityScore.toFixed(1)}/10 for typical priorities. Evidence coverage is reported separately: ${p.evidenceCoverage}% vs ${q.evidenceCoverage}%.`,
      "ai",
      [src(p, "lab"), src(q, "lab")],
    ),
  );
  if (!sameCat) {
    c.gaps.push("Products are in different categories");
    blocks.push(block("These are different product categories, so most specifications can't be compared like-for-like.", "ai", [src(p, "spec"), src(q, "spec")]));
    return blocks;
  }
  const pu = specNum(p, "usable");
  const qu = specNum(q, "usable");
  blocks.push(
    block(
      `Capacity: ${n(p.capacity.value)} ${p.capacity.unit} vs ${n(q.capacity.value)} ${q.capacity.unit} quoted${pu && qu ? `, with ${n(pu)} L vs ${n(qu)} L of usable space measured` : ""}.`,
      pu && qu ? "measured" : "manufacturer",
      pu && qu ? [src(p, "lab"), src(q, "lab")] : [src(p, "spec"), src(q, "spec")],
    ),
  );
  const pk = defaultAnnualKwh(p);
  const qk = defaultAnnualKwh(q);
  const tariff = REGIONS[region].tariff;
  if (p.category !== "laptops")
    blocks.push(
      block(
        `Energy: ${n(pk)} vs ${n(qk)} kWh/yr${specNum(p, "kwh-measured") ? " measured" : " declared"} — the ${pk <= qk ? p.model : q.model} costs about ${formatCurrency(Math.abs(pk - qk) * tariff, region)} less a year to run.`,
        specNum(p, "kwh-measured") ? "measured" : "manufacturer",
        specNum(p, "kwh-measured") ? [src(p, "lab"), src(q, "lab")] : [src(p, "cert"), src(q, "cert")],
      ),
    );
  else {
    const pm = specNum(p, "measured");
    const qm = specNum(q, "measured");
    if (pm && qm) blocks.push(block(`Battery: ${pm} h vs ${qm} h in the same independent browsing test.`, "measured", [src(p, "lab"), src(q, "lab")]));
  }
  if (p.category === "refrigerators" || p.category === "washing-machines")
    blocks.push(
      block(
        `Size: ${n(p.dimensions.widthMm)} × ${n(p.dimensions.heightMm)} × ${n(p.dimensions.depthMm)} mm vs ${n(q.dimensions.widthMm)} × ${n(q.dimensions.heightMm)} × ${n(q.dimensions.depthMm)} mm (W × H × D). ${p.dimensions.depthMm === q.dimensions.depthMm ? "Both have the same depth." : `The ${p.dimensions.depthMm < q.dimensions.depthMm ? p.model : q.model} is ${Math.abs(p.dimensions.depthMm - q.dimensions.depthMm)} mm shallower.`}`,
        "manufacturer",
        [src(p, "spec"), src(q, "spec")],
      ),
    );
  const pn = specNum(p, "noise");
  const qn = specNum(q, "noise");
  if (pn && qn) blocks.push(block(`Noise: ${pn} vs ${qn} dB(A).`, spec(p, "noise")?.claimType === "measured" ? "measured" : "manufacturer", [spec(p, "noise")?.sourceId ?? src(p, "spec"), spec(q, "noise")?.sourceId ?? src(q, "spec")]));
  blocks.push(
    block(
      `Warranty: ${p.warranty.years} vs ${q.warranty.years} years parts and labour${p.warranty.extended || q.warranty.extended ? ` (${p.warranty.extended ?? "no extended cover"} vs ${q.warranty.extended ?? "no extended cover"})` : ""}.`,
      "manufacturer",
      [src(p, "spec"), src(q, "spec")],
    ),
  );
  blocks.push(block(`Price: ${formatPrice(p.price, region)} vs ${formatPrice(q.price, region)} reference price; owners rate them ${p.rating}/5 and ${q.rating}/5.`, "customer", [src(p, "customers"), src(q, "customers")]));
  // verdict
  const wins: string[] = [];
  const losses: string[] = [];
  if (p.capacity.value > q.capacity.value * 1.03) wins.push("more space");
  else if (q.capacity.value > p.capacity.value * 1.03) losses.push("less space");
  if (pk < qk * 0.97) wins.push("lower running costs");
  else if (qk < pk * 0.97) losses.push("higher running costs");
  if (p.price < q.price * 0.97) wins.push("a lower price");
  else if (q.price < p.price * 0.97) losses.push("a higher price");
  if (p.warranty.years > q.warranty.years) wins.push("a longer warranty");
  else if (q.warranty.years > p.warranty.years) losses.push("a shorter warranty");
  const lead = p.suitabilityScore === q.suitabilityScore ? "They are evenly matched overall." : `The ${p.suitabilityScore > q.suitabilityScore ? p.model : q.model} is the stronger all-rounder on our scoring.`;
  blocks.push(block(`${lead} The ${p.model} offers ${wins.length ? wins.join(", ") : "no clear advantage on the headline numbers"}${losses.length ? `, at the cost of ${losses.join(", ")}` : ""}. Your priorities and space should decide between them.`, "ai", [src(p, "spec"), src(q, "spec")]));
  return blocks;
}

function complaints(c: Ctx): AnswerBlock[] {
  const { p } = c;
  const s = sentimentSummary(p.id);
  const reviews = reviewsForProduct(p.id);
  const blocks: AnswerBlock[] = [
    block(`Across ${n(p.reviewCount)} owner reviews (average ${p.rating}/5), ${s.positive}% are positive, ${s.mixed}% mixed and ${s.negative}% negative.`, "customer", [src(p, "customers")]),
  ];
  const negAspects = s.aspects.filter((a) => a.negative > 0).sort((a, b) => b.negative - a.negative || a.label.localeCompare(b.label)).slice(0, 3);
  if (negAspects.length)
    blocks.push(
      block(`In the ${reviews.length} detailed reviews Qeivo analysed, the most-criticised aspects are ${negAspects.map((a) => `${lower(a.label)} (${a.negative} ${a.negative === 1 ? "mention" : "mentions"})`).join(", ")}.`, "customer", [src(p, "customers")]),
    );
  else c.gaps.push("No negative aspects in the detailed review sample");
  const critical = [...reviews].sort((a, b) => a.rating - b.rating || b.helpful - a.helpful)[0];
  if (critical && critical.rating <= 4) {
    const first = critical.body.split(/(?<=[.!?])\s+/)[0];
    blocks.push(block(`A ${critical.rating}-star review titled “${critical.title}” (owned ${critical.ownedFor}) says: “${stripDot(first)}.”`, "customer", [src(p, "customers")]));
    if (critical.manufacturerReply) blocks.push(block(`${critical.manufacturerReply.author} replied publicly to that review.`, "manufacturer", [src(p, "customers")]));
  }
  const ownerLimits = p.limitations.filter((l) => l.type === "customer");
  for (const l of ownerLimits.slice(0, 2)) blocks.push(block(`${l.text}.`, "customer", l.sourceIds));
  const praised = s.aspects.filter((a) => a.positive > a.negative).slice(0, 2);
  if (praised.length) blocks.push(block(`For balance, owners most often praise ${praised.map((a) => lower(a.label)).join(" and ")}.`, "customer", [src(p, "customers")]));
  return blocks;
}

function weaknesses(c: Ctx): AnswerBlock[] {
  const { p } = c;
  const blocks: AnswerBlock[] = [];
  const weakest = [...p.scoreFactors].sort((a, b) => a.score - b.score).slice(0, 2);
  blocks.push(
    block(
      `Its lowest-scoring factors are ${weakest.map((f) => `${lower(f.label)} (${f.score.toFixed(1)}/10)`).join(" and ")}. ${weakest[0].explanation}`,
      "ai",
      [src(p, "spec"), src(p, "lab")],
    ),
  );
  for (const l of p.limitations.slice(0, 4)) blocks.push(block(`${l.text}.`, l.type, l.sourceIds));
  for (const w of p.warnings.filter((x) => x.kind === "conflict" || x.kind === "missing" || x.kind === "low-evidence").slice(0, 2))
    blocks.push(block(`${w.title}: ${lower(stripDot(w.detail))}.`, w.kind === "conflict" ? "measured" : "ai", w.sourceIds?.length ? w.sourceIds : [src(p, "spec")]));
  if (p.notFor.length) blocks.push(block(`It's a weaker choice for: ${p.notFor.slice(0, 3).map(lower).join("; ")}.`, "ai", [src(p, "spec"), src(p, "review")]));
  return blocks;
}

function noise(c: Ctx): AnswerBlock[] {
  const { p } = c;
  const item = spec(p, "noise");
  const blocks: AnswerBlock[] = [];
  if (!item) {
    c.gaps.push("No noise figure published");
    blocks.push(block(`Qeivo doesn't have a noise figure for the ${p.model}${p.category === "laptops" ? `; the closest data point is a surface temperature of ${specNum(p, "temp") ?? "unknown"} °C under load` : ""}.`, "ai", [src(p, "spec")]));
    return blocks;
  }
  const db = Number(item.numeric ?? item.value);
  const fridge = p.category === "refrigerators";
  const band = fridge ? (db <= 35 ? "quieter than a typical library — fine for open-plan living" : db <= 38 ? "comparable to a quiet conversation in the next room" : "noticeable in a quiet room, especially when the compressor starts") : db <= 72 ? "quiet for a spin cycle" : db <= 75 ? "average for a spin cycle" : "on the loud side during spin";
  blocks.push(block(`It's ${item.claimType === "measured" ? "measured" : "rated"} at ${db} dB(A) — ${band}.`, item.claimType, [item.sourceId ?? src(p, "spec")]));
  if (fridge && item.claimType !== "measured") blocks.push(block("That figure comes from the manufacturer's specification sheet rather than an independent measurement.", "ai", [src(p, "spec")]));
  if (fridge) blocks.push(block("Research on perceived loudness found compressor start-up transients more annoying than steady running noise; models below 36 dB(A) were rarely noticed during conversation.", "measured", ["src-fridge-noise-study"]));
  const quietAspect = sentimentSummary(p.id).aspects.find((a) => /quiet|noise|loud/i.test(a.label));
  if (quietAspect) blocks.push(block(`In detailed owner reviews, “${lower(quietAspect.label)}” comes up ${quietAspect.positive} times positively and ${quietAspect.negative} times negatively.`, "customer", [src(p, "customers")]));
  if (p.features.includes("Quiet mode")) blocks.push(block("It has a quiet mode that reduces fan and compressor speed overnight.", "manufacturer", [src(p, "spec")]));
  return blocks;
}

function warranty(c: Ctx): AnswerBlock[] {
  const { p } = c;
  const f = factor(p, "warranty");
  const blocks = [
    block(`${brandName(p)} includes ${p.warranty.years} ${p.warranty.years === 1 ? "year" : "years"} of parts and labour cover${p.warranty.extended ? `, plus a ${p.warranty.extended} warranty` : ""}.`, "manufacturer", [src(p, "spec")]),
    block(p.warranty.notes, "manufacturer", [src(p, "spec"), src(p, "manual")]),
    block(`Qeivo scores the warranty ${f.score.toFixed(1)}/10 against other ${p.category.replace("-", " ")}.`, "ai", [src(p, "spec")]),
  ];
  const brand = getBrand(p.brandId);
  blocks.push(block(`${brand.name}'s reliability index from owner-reported faults is ${brand.reliabilityIndex}/10 — warranty length and real-world reliability are separate questions.`, "customer", [src(p, "customers")]));
  if (c.p.evidenceCoverage < 72) c.gaps.push("Warranty terms not confirmed against regional documentation");
  return blocks;
}

function capacity(c: Ctx): AnswerBlock[] {
  const { p } = c;
  const blocks = [block(`${p.capacity.label}: ${n(p.capacity.value)} ${p.capacity.unit}.`, "manufacturer", [src(p, "spec")])];
  if (p.category === "refrigerators") {
    const usable = specNum(p, "usable");
    const fridge = specNum(p, "fridge");
    const freezer = specNum(p, "freezer");
    if (fridge !== undefined && freezer !== undefined) blocks.push(block(`That splits into ${n(fridge)} L of fridge and ${n(freezer)} L of freezer space.`, "manufacturer", [src(p, "spec")]));
    if (usable) blocks.push(block(`Independent testing measured ${n(usable)} L usable — ${n(p.capacity.value - usable)} L less than quoted once shelves, bins and fittings are in place.`, "measured", [src(p, "lab")]));
    const shelves = spec(p, "shelves");
    if (shelves) blocks.push(block(`It has ${shelves.value} adjustable shelves.`, "manufacturer", [shelves.sourceId ?? src(p, "manual")]));
  }
  const f = factor(p, "capacity");
  blocks.push(block(`${f.label} scores ${f.score.toFixed(1)}/10. ${f.explanation}`, "ai", [src(p, "spec"), src(p, "lab")]));
  if (p.bestFor[0]) blocks.push(block(`It's sized for ${lower(p.bestFor[0])}.`, "ai", [src(p, "spec")]));
  return blocks;
}

function features(c: Ctx): AnswerBlock[] {
  const { p, q } = c;
  const t = q.toLowerCase();
  const blocks: AnswerBlock[] = [];
  if (/\bice\b|dispenser|water/.test(t) && p.category === "refrigerators") {
    const ice = p.features.find((f) => /ice maker/i.test(f));
    const disp = p.features.find((f) => /dispenser/i.test(f));
    if (!ice && !disp) {
      blocks.push(block(`No — the ${p.model} has neither an ice maker nor a water dispenser, so it doesn't need a water connection.`, "manufacturer", [src(p, "spec")]));
      return blocks;
    }
    blocks.push(block(`Yes — it has ${[ice, disp].filter(Boolean).map((x) => `a ${lower(x!)}`).join(" and ")}.`, "manufacturer", [src(p, "spec")]));
    const note = p.installation.notes.find((x) => /water/i.test(x));
    if (note) blocks.push(block(note, "manufacturer", [src(p, "manual")]));
    const iceLimit = p.limitations.find((l) => /ice/i.test(l.text));
    if (iceLimit) blocks.push(block(`${iceLimit.text}.`, iceLimit.type, iceLimit.sourceIds));
    blocks.push(block("Across the industry, ice makers and dispensers account for 31% of refrigerator service calls in the first five years.", "expert", ["src-ice-maker-reliability"]));
    return blocks;
  }
  blocks.push(block(`Listed features: ${p.features.join(", ")}.`, "manufacturer", [src(p, "spec")]));
  const verified = p.strengths.filter((s) => s.type !== "manufacturer").slice(0, 2);
  for (const s of verified) blocks.push(block(`${s.text}.`, s.type, s.sourceIds));
  const unverified = p.warnings.find((w) => w.kind === "unverified");
  if (unverified) blocks.push(block(`${stripDot(unverified.detail)}.`, "manufacturer", unverified.sourceIds ?? [src(p, "maker")]));
  return blocks;
}

function reliability(c: Ctx): AnswerBlock[] {
  const { p } = c;
  const f = factor(p, "reliability");
  const blocks = [
    block(`Reliability scores ${f.score.toFixed(1)}/10 with ${f.confidence} confidence. ${f.explanation}`, "ai", [src(p, "customers"), src(p, "review")]),
  ];
  if (f.confidence !== "high") c.gaps.push("Limited long-term owner data");
  const risk = p.limitations.find((l) => /ice|reliab|fail|jam|app/i.test(l.text));
  if (risk) blocks.push(block(`${risk.text}.`, risk.type, risk.sourceIds));
  if (p.releaseYear >= 2025) blocks.push(block(`It was released in ${p.releaseYear}, so there are fewer than two years of owner reports — long-term reliability is still uncertain.`, "ai", [src(p, "customers")]));
  if (p.category === "refrigerators" && p.features.some((x) => /dispenser/i.test(x)))
    blocks.push(block("Models with through-door dispensers were 1.6× more likely to need a repair in the 2026 owner reliability survey.", "expert", ["src-appliance-reliability-survey-2026"]));
  blocks.push(block(`Warranty backs this up with ${p.warranty.years} years of cover${p.warranty.extended ? ` and a ${p.warranty.extended}` : ""}.`, "manufacturer", [src(p, "spec")]));
  return blocks;
}

function maintenance(c: Ctx): AnswerBlock[] {
  const { p, region } = c;
  const f = factor(p, "maintenance");
  const yearly = defaultMaintenance(p) * REGIONS[region].priceFactor;
  return [
    block(f.explanation, "ai", [src(p, "manual")]),
    block(`Budget around ${formatCurrency(yearly, region)} a year for consumables such as filters and cleaning products.`, "ai", [src(p, "manual")]),
    block(`Maintenance scores ${f.score.toFixed(1)}/10 for this model.`, "ai", [src(p, "manual"), src(p, "review")]),
  ];
}

function price(c: Ctx): AnswerBlock[] {
  const { p, region } = c;
  const offers = offersForProduct(p.id);
  const stats = priceStats(p.id);
  const blocks: AnswerBlock[] = [];
  const regional = offers.filter((o) => o.region === region && o.stock !== "out-of-stock");
  if (regional.length) {
    const best = regional[0];
    blocks.push(
      block(
        `The lowest in-stock offer Qeivo found in ${REGIONS[region].name} is ${formatPrice(best.price, region)} at ${best.retailer} (${best.delivery.toLowerCase()}), observed ${best.observedAt.slice(0, 10)}. ${regional.length > 1 ? `${regional.length} retailers in total.` : ""}`.trim(),
        "ai",
        [],
      ),
    );
  } else {
    c.gaps.push(`No in-stock offers tracked in ${REGIONS[region].name}`);
    blocks.push(block(`Qeivo isn't tracking an in-stock offer in ${REGIONS[region].name} right now${p.regions.includes(region) ? "" : " — this model isn't sold in that region"}.`, "ai", []));
  }
  blocks.push(
    block(
      `Over the past 52 weeks the reference price ranged from ${formatPrice(stats.low, region)} to ${formatPrice(stats.high, region)} (average ${formatPrice(stats.avg, region)}). ${stats.isLow ? "Today's price is at or near the 52-week low." : `Today's ${formatPrice(stats.current, region)} is ${Math.round((stats.current / stats.low - 1) * 100)}% above that low.`}`,
      "ai",
      [],
    ),
  );
  if (p.originalPrice) blocks.push(block(`The list price was ${formatPrice(p.originalPrice, region)}, so the current reference price is ${Math.round((1 - p.price / p.originalPrice) * 100)}% lower.`, "manufacturer", [src(p, "spec")]));
  const value = factor(p, "value");
  blocks.push(block(`Value for money scores ${value.score.toFixed(1)}/10. ${value.explanation}`, "ai", [src(p, "spec"), src(p, "lab")]));
  blocks.push(block("Some retailer links are affiliate links. Commissions and sponsored placements never affect Qeivo's answers, scores or rankings.", "ai", []));
  return blocks;
}

function summaryCore(c: Ctx): AnswerBlock[] {
  const { p } = c;
  const band = scoreBand(p.suitabilityScore);
  const ev = evidenceBand(p.evidenceCoverage);
  return [
    block(`The ${brandName(p)} ${p.model} scores ${p.suitabilityScore.toFixed(1)}/10 for typical priorities (${band.label.toLowerCase()}). Separately, ${p.evidenceCoverage}% of its scored data points are backed by independent or verified sources (${ev.label.toLowerCase()}).`, "ai", [src(p, "spec"), src(p, "lab")]),
    ...p.aiSummary.slice(1, 4).map((cl) => block(cl.text.replace(/\.?$/, "."), cl.type, cl.sourceIds)),
  ];
}

function summary(c: Ctx): AnswerBlock[] {
  const { p } = c;
  const blocks = summaryCore(c);
  const s = p.strengths.find((x) => x.type !== "manufacturer");
  const l = p.limitations[0];
  if (s) blocks.push(block(`Biggest strength: ${lower(stripDot(s.text))}.`, s.type, s.sourceIds));
  if (l) blocks.push(block(`Main caution: ${lower(stripDot(l.text))}.`, l.type, l.sourceIds));
  return blocks;
}

/* ------------------------------------------------------------ Follow-ups */

function followUpsFor(intent: AskIntent, p: Product, other?: Product): string[] {
  const alt = other ?? closestAlternative(p);
  const altName = alt ? `${brandName(alt)} ${alt.model}` : null;
  const fridge = p.category === "refrigerators";
  const pool: Record<AskIntent, string[]> = {
    household: ["How much electricity could it use?", "Does it fit my kitchen?", altName ? `Compare it with ${altName}` : "What are its biggest weaknesses?"],
    energy: [altName ? `Compare it with ${altName}` : "What are its biggest weaknesses?", "Is the price likely to drop?", "What do owners complain about?"],
    fit: ["Does it need a water connection?", "How much ventilation space does it need?", "How noisy is it?"],
    compare: ["Which one is more reliable?", "What do owners complain about?", "Does it fit my kitchen?"],
    complaints: ["How reliable is it long term?", "What does the warranty cover?", altName ? `Compare it with ${altName}` : "Is it worth the price?"],
    weaknesses: ["What do owners complain about?", "How much electricity could it use?", altName ? `Compare it with ${altName}` : "Does it fit my kitchen?"],
    noise: ["Is it suitable for a family of four?", "What are its biggest weaknesses?", "How much electricity could it use?"],
    warranty: ["How reliable is it long term?", "What maintenance does it need?", "What do owners complain about?"],
    capacity: ["Is this refrigerator suitable for a family of five?".replace("refrigerator", fridge ? "refrigerator" : p.category === "washing-machines" ? "washer" : "product"), "Does it fit my kitchen?", "How much electricity could it use?"],
    features: ["How reliable is it long term?", "What maintenance does it need?", "Does it fit my kitchen?"],
    reliability: ["What does the warranty cover?", "What do owners complain about?", altName ? `Compare it with ${altName}` : "Is it worth the price?"],
    maintenance: ["How reliable is it long term?", "What does the warranty cover?", "How much electricity could it use?"],
    price: ["Is it worth the price?", altName ? `Compare it with ${altName}` : "What are its biggest weaknesses?", "How much electricity could it use?"],
    summary: ["What are its biggest weaknesses?", "How much electricity could it use?", altName ? `Compare it with ${altName}` : "What do owners complain about?"],
    discover: [],
    "needs-product": [],
  };
  const list = pool[intent];
  if (!fridge) return list.map((x) => x.replace("Does it fit my kitchen?", p.category === "washing-machines" ? "Does it fit a 600 mm space?" : "What are its biggest weaknesses?").replace("Does it need a water connection?", "What are its biggest weaknesses?").replace("How much ventilation space does it need?", "What do owners complain about?"));
  return list;
}

/* ----------------------------------------------------------- Entry point */

/** Compose a deterministic, cited answer. */
export function answerQuestion(question: string, ctx: AskContext): AskAnswer {
  const q = question.trim();
  const gaps: string[] = [];
  const contextProducts = ctx.productIds.map((id) => getProduct(id)).filter((p): p is Product => Boolean(p));
  let intent = classifyIntent(q);
  const mentioned = resolveMentionedProducts(q, contextProducts.map((p) => p.id));

  let subject = contextProducts[0];
  let other: Product | undefined = contextProducts[1];
  if (!subject && mentioned[0]) {
    subject = mentioned[0];
    other = mentioned[1];
  } else if (subject && mentioned[0] && intent === "compare") {
    other = mentioned[0];
  } else if (subject && mentioned[0] && intent !== "compare") {
    // The user named a different product explicitly — answer about that one.
    subject = mentioned[0];
  }

  if (!subject) {
    const category = detectCategory(q);
    if (!category) {
      return {
        intent: "needs-product",
        intentLabel: INTENT_LABELS["needs-product"],
        blocks: [block("Which product should I research? Pick one with the product selector above, or name a model — for example “Is the Nordvik Frostline FD600 quiet?”. Answers are built only from that product's manuals, lab tests and owner reviews.", "ai", [])],
        productIds: [],
        sourceIds: [],
        followUps: ["Is the Nordvik Frostline FD600 suitable for a family of five?", "How much electricity could the Ovea Eco BF370 use?", "Compare Halden Precision FD590 with Maru SmartView FD620"],
        gaps: ["No product selected"],
      };
    }
    const size = parseHousehold(q) ?? ctx.householdSize ?? 4;
    const ideal = idealCapacity(category, size);
    const pool = products.filter((p) => p.category === category && p.regions.includes(ctx.region) && (category === "televisions" || category === "laptops" || p.capacity.value >= ideal.min));
    const top = [...pool].sort((a, b) => b.suitabilityScore - a.suitabilityScore || b.evidenceCoverage - a.evidenceCoverage || a.id.localeCompare(b.id)).slice(0, 3);
    const blocks: AnswerBlock[] = [
      block(`I haven't got a specific product in context, so here is a starting shortlist from ${pool.length} ${category.replace("-", " ")} available in ${REGIONS[ctx.region].name}${category === "refrigerators" || category === "washing-machines" ? ` with at least ${ideal.label} for a household of ${size}` : ""}, ranked on evidence only.`, "ai", []),
      ...top.map((p, i) => block(`${i + 1}. ${brandName(p)} ${p.model} — ${p.suitabilityScore.toFixed(1)}/10 suitability, ${p.evidenceCoverage}% evidence coverage, ${n(p.capacity.value)} ${p.capacity.unit}, ${formatPrice(p.price, ctx.region)}.`, "ai", [src(p, "spec"), src(p, "lab")])),
      block("Select one of them to ask about fit, running costs or owner complaints in detail.", "ai", []),
    ];
    return {
      intent: "discover",
      intentLabel: INTENT_LABELS.discover,
      blocks,
      productIds: top.map((p) => p.id),
      sourceIds: valid(blocks.flatMap((b) => b.sourceIds)),
      followUps: top.slice(0, 3).map((p) => `What do owners complain about on the ${brandName(p)} ${p.model}?`),
      gaps: [],
    };
  }

  if (intent === "compare" && !other && mentioned.length === 0) {
    // "compare it" without a target: propose the closest alternative honestly.
    other = undefined;
  }

  const c: Ctx = { p: subject, q, region: ctx.region, ask: ctx, gaps };
  let blocks: AnswerBlock[];
  switch (intent) {
    case "compare":
      blocks = compare(c, other);
      break;
    case "fit":
      blocks = fit(c);
      break;
    case "household":
      blocks = household(c);
      break;
    case "energy":
      blocks = energy(c);
      break;
    case "complaints":
      blocks = complaints(c);
      break;
    case "weaknesses":
      blocks = weaknesses(c);
      break;
    case "noise":
      blocks = noise(c);
      break;
    case "warranty":
      blocks = warranty(c);
      break;
    case "capacity":
      blocks = capacity(c);
      break;
    case "features":
      blocks = features(c);
      break;
    case "reliability":
      blocks = reliability(c);
      break;
    case "maintenance":
      blocks = maintenance(c);
      break;
    case "price":
      blocks = price(c);
      break;
    default:
      intent = "summary";
      blocks = summary(c);
  }

  const productIds = [subject.id, ...(intent === "compare" && other ? [other.id] : [])];
  return {
    intent,
    intentLabel: INTENT_LABELS[intent],
    blocks,
    productIds,
    sourceIds: valid(blocks.flatMap((b) => b.sourceIds)),
    followUps: followUpsFor(intent, subject, intent === "compare" ? other : undefined)
      .filter((f) => f.toLowerCase() !== q.toLowerCase())
      .slice(0, 3),
    gaps: Array.from(new Set(gaps)),
  };
}

/** Example questions tailored to the product in context. */
export function suggestedQuestionsFor(p: Product | undefined): string[] {
  if (!p) return ["Which fridge suits a family of five?", "Is the Nordvik Frostline FD600 quiet?", "How much electricity could the Ovea Eco BF370 use?", "Compare Halden Precision FD590 with Maru SmartView FD620"];
  const alt = closestAlternative(p);
  const altName = alt ? `${brandName(alt)} ${alt.model}` : "a similar model";
  if (p.category === "refrigerators")
    return ["Is this refrigerator suitable for a family of five?", "What are its biggest weaknesses?", "How much electricity could it use?", "Does it fit my kitchen?", `Compare it with ${p.id === "p-halden-precision-fd590" ? "Nordvik Frostline FD600" : "Halden Precision FD590"}`, "What do owners complain about?"];
  if (p.category === "washing-machines")
    return ["Is it big enough for a family of four?", "What are its biggest weaknesses?", "How much electricity could it use?", "How noisy is the spin cycle?", `Compare it with ${altName}`, "What do owners complain about?"];
  return ["What are its biggest weaknesses?", "How much electricity could it use?", "What does the warranty cover?", `Compare it with ${altName}`, "What do owners complain about?", "Is it worth the price?"];
}

/** Deterministic "thinking" delay in ms for the typing indicator. */
export function answerDelay(question: string) {
  return 1100 + (hash(question) % 5) * 140;
}
