import type { Claim, ClaimType, Product, SpecItem } from "@/types";
import { getBrand } from "@/data/products";
import { getCategory } from "@/data/products/categories";
import { formatSpecValue } from "@/components/product-detail/spec-utils";

/* ------------------------------------------------------------------ rows */

export interface CompareCell {
  productId: string;
  /** Display text (already normalised). null = not published */
  text: string | null;
  bool?: boolean;
  numeric: number | null;
  claimType?: SpecItem["claimType"];
  sourceId?: string;
  best: boolean;
  worst: boolean;
}

export interface CompareRow {
  id: string;
  label: string;
  better?: "higher" | "lower";
  cells: CompareCell[];
  differs: boolean;
}

export interface CompareGroup {
  id: string;
  label: string;
  rows: CompareRow[];
}

/** Unit families: values are converted into the unit used by the first product that publishes the key. */
const UNIT_FACTORS: Record<string, Record<string, number>> = {
  length: { mm: 1, cm: 10, m: 1000 },
  mass: { g: 0.001, kg: 1 },
  storage: { GB: 1, TB: 1000 },
  years: { year: 1, years: 1 },
};

function unitFamily(unit?: string) {
  if (!unit) return null;
  return Object.entries(UNIT_FACTORS).find(([, f]) => unit in f) ?? null;
}

function normaliseItem(item: SpecItem, targetUnit?: string): { text: string; numeric: number | null } {
  const raw = item.numeric ?? (typeof item.value === "number" ? item.value : null);
  const fam = unitFamily(item.unit);
  if (fam && targetUnit && item.unit !== targetUnit && targetUnit in fam[1] && typeof item.value === "number") {
    const converted = Math.round(((item.value * fam[1][item.unit!]) / fam[1][targetUnit]) * 100) / 100;
    return { text: formatSpecValue({ ...item, value: converted, unit: targetUnit }), numeric: converted };
  }
  if (fam?.[0] === "years" && typeof item.value === "number") {
    return { text: `${item.value} ${item.value === 1 ? "year" : "years"}`, numeric: raw };
  }
  return { text: formatSpecValue(item), numeric: raw };
}

/** Row identity: feature flags are matched by label (codes differ between categories). */
const rowKey = (item: SpecItem) => (item.key.startsWith("f-") ? `f:${item.label.toLowerCase()}` : item.key);

export function isMixedCategories(items: Product[]) {
  return new Set(items.map((p) => p.category)).size > 1;
}

/**
 * Builds normalised specification groups across products. A row is shown when at least two
 * products publish it (or, for mixed categories, when every product does). Missing values are
 * returned as `text: null` and rendered as "Not published" — never blank.
 */
export function buildSpecGroups(items: Product[]): CompareGroup[] {
  const mixed = isMixedCategories(items);
  const minCount = mixed ? items.length : Math.min(2, items.length);
  const order: { key: string; groupId: string; groupLabel: string; label: string }[] = [];
  const seen = new Set<string>();
  const index = new Map<string, Map<string, SpecItem>>();

  for (const p of items) {
    const map = new Map<string, SpecItem>();
    for (const g of p.specs)
      for (const item of g.items) {
        const k = rowKey(item);
        map.set(k, item);
        if (!seen.has(k)) {
          seen.add(k);
          order.push({ key: k, groupId: g.id, groupLabel: g.label, label: item.label });
        }
      }
    index.set(p.id, map);
  }

  const groups = new Map<string, CompareGroup>();
  for (const o of order) {
    const present = items.filter((p) => index.get(p.id)!.has(o.key));
    if (present.length < minCount) continue;
    const first = index.get(present[0].id)!.get(o.key)!;
    const better = present.map((p) => index.get(p.id)!.get(o.key)!.better).find(Boolean);
    const cells: CompareCell[] = items.map((p) => {
      const item = index.get(p.id)!.get(o.key);
      if (!item) return { productId: p.id, text: null, numeric: null, best: false, worst: false };
      if (typeof item.value === "boolean") return { productId: p.id, text: item.value ? "Yes" : "No", bool: item.value, numeric: item.value ? 1 : 0, claimType: item.claimType, sourceId: item.sourceId, best: false, worst: false };
      const n = normaliseItem(item, first.unit);
      return { productId: p.id, text: n.text, numeric: n.numeric, claimType: item.claimType, sourceId: item.sourceId, best: false, worst: false };
    });
    markBest(cells, better);
    const row: CompareRow = { id: o.key, label: o.label, better, cells, differs: new Set(cells.map((c) => c.text ?? "—")).size > 1 };
    const gid = mixed ? "shared" : o.groupId;
    const g = groups.get(gid) ?? { id: gid, label: mixed ? "Shared specifications" : o.groupLabel, rows: [] };
    g.rows.push(row);
    groups.set(gid, g);
  }
  return [...groups.values()];
}

/** Highlights best (and worst) numeric values. Ties are all highlighted; equal rows get no highlight. */
export function markBest(cells: CompareCell[], better?: "higher" | "lower") {
  if (!better) return;
  const vals = cells.map((c) => c.numeric).filter((v): v is number => v !== null);
  if (vals.length < 2) return;
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  if (max === min) return;
  const bestV = better === "higher" ? max : min;
  const worstV = better === "higher" ? min : max;
  for (const c of cells) {
    if (c.numeric === null) continue;
    c.best = c.numeric === bestV;
    c.worst = c.numeric === worstV;
  }
}

/* ------------------------------------------------------- derived insights */

const src = (p: Product, k: "lab" | "review" | "customers" | "spec") => `${p.id}:${k}`;
const name = (p: Product) => `${getBrand(p.brandId).name} ${p.model}`;
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const mk = (id: string, type: ClaimType, text: string, sourceIds: string[]): Claim => ({ id, type, text, sourceIds });

/** Lower-cases the first letter unless the word is an acronym ("PC gaming"). */
function lowerFirst(s: string) {
  return /^[A-Z]{2}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1);
}

function specNum(p: Product, key: string): number | null {
  for (const g of p.specs) for (const i of g.items) if (i.key === key) return i.numeric ?? (typeof i.value === "number" ? i.value : null);
  return null;
}

function factor(p: Product, key: string) {
  return p.scoreFactors.find((f) => f.key === key);
}

/** Price (USD base) per suitability point — lower is better value. */
export function valueIndex(p: Product, score: number) {
  return p.price / Math.max(0.1, score);
}

export function bestValue(items: Product[], scores: Record<string, number>): Product | undefined {
  return [...items].sort((a, b) => valueIndex(a, scores[a.id]) - valueIndex(b, scores[b.id]))[0];
}

/** Deterministic verdict built only from product data — never from sponsored status or offers. */
export function buildVerdict(items: Product[], scores: Record<string, number>): { verdict: Claim[]; tradeOffs: Claim[] } {
  const verdict: Claim[] = [];
  const tradeOffs: Claim[] = [];
  if (items.length < 2) return { verdict, tradeOffs };
  const byScore = [...items].sort((a, b) => scores[b.id] - scores[a.id]);
  const top = byScore[0];
  const second = byScore[1];
  const mixed = isMixedCategories(items);

  verdict.push(
    mk("v-top", "ai", `${name(top)} has the highest suitability for your current priorities at ${scores[top.id].toFixed(1)}/10, ahead of ${name(second)} at ${scores[second.id].toFixed(1)}/10.${mixed ? " Because these products are in different categories, treat this ranking as indicative only." : ""}`, [src(top, "spec"), src(top, "review"), src(second, "review")]),
  );

  const value = bestValue(items, scores)!;
  verdict.push(
    mk("v-value", "ai", `${name(value)} is the best value: ${usd(valueIndex(value, scores[value.id]))} per suitability point${value.id === top.id ? ", so the top pick is also the most cost-effective" : `, against ${usd(valueIndex(top, scores[top.id]))} for ${top.model}`}.`, [src(value, "spec"), src(value, "customers")]),
  );

  if (!mixed) {
    const energyKey = items.every((p) => specNum(p, "kwh-measured") !== null) ? "kwh-measured" : items.every((p) => specNum(p, "measured") !== null) ? "measured" : null;
    if (energyKey === "kwh-measured") {
      const sorted = [...items].sort((a, b) => specNum(a, energyKey)! - specNum(b, energyKey)!);
      const lo = sorted[0];
      const hi = sorted[sorted.length - 1];
      const diff = specNum(hi, energyKey)! - specNum(lo, energyKey)!;
      if (diff > 0) verdict.push(mk("v-energy", "measured", `${name(lo)} used the least energy in independent testing at ${specNum(lo, energyKey)} kWh/yr — ${diff} kWh/yr less than ${hi.model}, roughly ${usd(diff * 0.17)} a year at $0.17/kWh.`, [src(lo, "lab"), src(hi, "lab")]));
    } else if (energyKey === "measured") {
      const sorted = [...items].sort((a, b) => specNum(b, energyKey)! - specNum(a, energyKey)!);
      verdict.push(mk("v-battery", "measured", `${name(sorted[0])} lasted longest in the battery rundown test at ${specNum(sorted[0], energyKey)} h, versus ${specNum(sorted[sorted.length - 1], energyKey)} h for ${sorted[sorted.length - 1].model}.`, [src(sorted[0], "lab"), src(sorted[sorted.length - 1], "lab")]));
    }
  }

  const rated = [...items].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)[0];
  verdict.push(mk("v-owners", "customer", `Owners rate ${name(rated)} highest at ${rated.rating.toFixed(1)}/5 across ${rated.reviewCount.toLocaleString("en-US")} reviews.`, [src(rated, "customers")]));

  const rel = [...items].sort((a, b) => (factor(b, "reliability")?.score ?? 0) - (factor(a, "reliability")?.score ?? 0))[0];
  const relF = factor(rel, "reliability");
  if (relF) verdict.push(mk("v-rel", "expert", `Reliability evidence favours ${name(rel)} (${relF.score.toFixed(1)}/10, ${relF.confidence} confidence).`, [src(rel, "review"), src(rel, "customers")]));

  for (const p of byScore) {
    const fit = p.bestFor[0];
    if (fit) verdict.push(mk(`v-pick-${p.id}`, "ai", `Choose ${p.model} for ${lowerFirst(fit)}${p.notFor[0] ? `; it is less suited to ${lowerFirst(p.notFor[0])}` : ""}.`, [src(p, "spec"), src(p, "review")]));
  }

  const weak = items.filter((p) => p.evidenceCoverage < 80);
  for (const p of weak) verdict.push(mk(`v-ev-${p.id}`, "ai", `Treat conclusions about ${p.model} as provisional: only ${p.evidenceCoverage}% of its scored data points are independently evidenced.`, [src(p, "customers")]));

  // ---- trade-offs (pairwise, top vs others)
  for (const other of byScore.slice(1)) {
    const priceDiff = top.price - other.price;
    const scoreDiff = scores[top.id] - scores[other.id];
    if (priceDiff > 0)
      tradeOffs.push(mk(`t-price-${other.id}`, "ai", `${top.model} costs ${usd(priceDiff)} more than ${other.model} for ${scoreDiff.toFixed(1)} more suitability points.`, [src(top, "spec"), src(other, "spec")]));
    else if (priceDiff < 0)
      tradeOffs.push(mk(`t-price-${other.id}`, "ai", `${top.model} is both cheaper (by ${usd(-priceDiff)}) and higher scoring than ${other.model}.`, [src(top, "spec"), src(other, "spec")]));
    if (!mixed && top.capacity.value !== other.capacity.value) {
      const bigger = top.capacity.value > other.capacity.value ? top : other;
      const smaller = bigger === top ? other : top;
      const depthDiff = bigger.dimensions.depthMm - smaller.dimensions.depthMm;
      tradeOffs.push(
        mk(
          `t-cap-${other.id}`,
          "manufacturer",
          `${bigger.model} offers ${bigger.capacity.value - smaller.capacity.value} ${bigger.capacity.unit} more ${getCategory(bigger.category).capacityLabel.toLowerCase()} than ${smaller.model}${depthDiff > 0 && bigger.category !== "laptops" ? `, but is ${depthDiff} mm deeper` : ""}.`,
          [src(bigger, "spec"), src(smaller, "spec")],
        ),
      );
    }
  }
  const quiet = items.map((p) => ({ p, n: specNum(p, "noise") })).filter((x) => x.n !== null) as { p: Product; n: number }[];
  if (!mixed && quiet.length >= 2) {
    quiet.sort((a, b) => a.n - b.n);
    const lo = quiet[0];
    const hi = quiet[quiet.length - 1];
    if (hi.n > lo.n) tradeOffs.push(mk("t-noise", "measured", `${lo.p.model} is the quietest at ${lo.n} dB(A); ${hi.p.model} is ${hi.n - lo.n} dB louder, which is noticeable in open-plan rooms.`, [src(lo.p, "lab"), src(hi.p, "lab")]));
  }
  return { verdict, tradeOffs };
}

export interface Highlight {
  text: string;
  claimType?: SpecItem["claimType"];
  sourceId?: string;
}

/** Advantages and disadvantages per product from row wins/losses. */
export function rowHighlights(productId: string, groups: CompareGroup[]) {
  const wins: Highlight[] = [];
  const losses: Highlight[] = [];
  for (const g of groups)
    for (const r of g.rows) {
      if (!r.better || !r.differs) continue;
      const c = r.cells.find((x) => x.productId === productId)!;
      const base = { claimType: c.claimType, sourceId: c.sourceId };
      if (c.best) wins.push({ ...base, text: `Best ${r.label.toLowerCase()} (${c.text})` });
      else if (c.worst) losses.push({ ...base, text: `Weakest ${r.label.toLowerCase()} (${c.text})` });
    }
  return { wins, losses };
}
