import type { Product, SourceReference } from "@/types";
import { clamp, hash } from "@/lib/utils";
import { images, pick } from "../images";
import { tvRows, type TvRow } from "./catalog-specs";
import { getBrand } from "./brands";
import { buildFactors, buildSources, claim, ean13, fmtMoney, freshnessWarnings, jitter, pickClaims, sourceId, verifiedDate, weightedScore } from "./build-helpers";

const FEATURES: Record<string, string> = { R: "120 Hz panel", V: "Dolby Vision", H: "HDMI 2.1", M: "Hands-free voice", G: "Anti-glare" };

export const tvSources: SourceReference[] = [];

function build(row: TvRow, index: number): Product {
  const [key, brandId, name, modelNumber, type, inches, w, h, d, price, orig, kwh, rating, nits, hz, stars, reviews, feat, evidence, year, freshness, updateYears, wy] = row;
  const brand = getBrand(brandId);
  const id = `p-${key}`;
  const has = (c: string) => feat.includes(c);
  const features = feat.split("").map((c) => FEATURES[c]);
  features.push(`${hz} Hz refresh`);
  const lastVerified = verifiedDate(freshness, key);
  const contrast = type === "OLED" ? "Infinite (per-pixel)" : type === "Mini-LED" ? "~25,000:1 with local dimming" : type === "QLED" ? "~6,500:1" : "~4,200:1";
  const lag = type === "LED" ? 18.4 : has("H") ? 9.6 + (hash(key) % 10) / 10 : 13.1;
  const watts = Math.round(kwh / 1.46);
  const weightKg = Math.round(inches * 0.36 + (type === "OLED" ? -2 : 3));
  const typeBase = type === "OLED" ? 8.9 : type === "Mini-LED" ? 8.5 : type === "QLED" ? 7.2 : 5.6;

  const s = {
    performance: typeBase + (nits > 1500 ? 0.3 : 0) + (hz >= 120 ? 0.3 : -0.3) + jitter(key, 0.2),
    energy: 12 - (kwh / (inches * inches)) * 150 + (type === "OLED" ? 0.4 : 0),
    value: 0.55 * clamp(5 + 3 * Math.log2(((inches * inches) / price) / 2.2), 2.5, 9.8) + 0.45 * stars * 2,
    reliability: brand.reliabilityIndex + jitter(`${key}r`, 0.3),
    capacity: 2 + (inches - 40) * 0.2,
    space: 9.6 - Math.max(0, inches - 55) * 0.12 - (d > 70 ? 0.6 : 0),
    maintenance: 4 + updateYears * 1.1,
    warranty: 4.5 + wy * 1.6,
  };
  const ex = {
    performance: `${type} panel, ${nits.toLocaleString("en-US")} nits peak (HDR, 10% window), contrast ${contrast}, input lag ${lag.toFixed(1)} ms.`,
    energy: `${kwh} kWh/yr declared (class ${rating}), ~${watts} W typical in SDR.`,
    value: `${inches}" for ${fmtMoney(price)}, weighted with owner satisfaction of ${stars}/5.`,
    reliability: `${brand.name} reliability index ${brand.reliabilityIndex}/10 from owner-reported faults.`,
    capacity: `${inches}" diagonal — ideal viewing distance ${(inches * 0.0254 * 1.2).toFixed(1)}–${(inches * 0.0254 * 1.5).toFixed(1)} m.`,
    space: `${w} × ${h} × ${d} mm without stand; ${weightKg} kg.`,
    maintenance: `${updateYears} years of committed platform and security updates.`,
    warranty: `${wy}-year manufacturer warranty${type === "OLED" ? " including burn-in" : ""}.`,
  };
  const scoreFactors = buildFactors("televisions", s, ex, evidence, year);
  const suitabilityScore = weightedScore(scoreFactors);

  const strengths = pickClaims(`${key}s`, [
    { when: type === "OLED", type: "measured" as const, text: "Per-pixel lighting delivers perfect blacks and no blooming", keys: ["lab" as const] },
    { when: nits >= 2000, type: "measured" as const, text: `Measured ${nits.toLocaleString("en-US")} nits peak brightness copes easily with sunlit rooms`, keys: ["lab" as const] },
    { when: has("H"), type: "measured" as const, text: `${lag.toFixed(1)} ms input lag with HDMI 2.1 — excellent for gaming`, keys: ["lab" as const] },
    { when: updateYears >= 5, type: "manufacturer" as const, text: `${updateYears} years of committed software updates`, keys: ["spec" as const] },
    { when: stars >= 4.5, type: "customer" as const, text: `Owners rate picture quality highly (${stars}/5 across ${reviews.toLocaleString("en-US")} reviews)`, keys: ["customers" as const] },
    { when: price < 700, type: "ai" as const, text: `Very low price for a ${inches}" screen`, keys: ["spec" as const] },
    { when: has("V"), type: "expert" as const, text: "Accurate out-of-the-box colour in Filmmaker mode", keys: ["review" as const] },
    { when: has("G"), type: "expert" as const, text: "Anti-glare coating handles reflections better than most rivals", keys: ["review" as const] },
    { when: has("M"), type: "manufacturer" as const, text: "Hands-free voice control built in", keys: ["spec" as const] },
    { when: true, type: "customer" as const, text: "Owners find the smart platform quick and easy to navigate", keys: ["customers" as const] },
    { when: true, type: "expert" as const, text: "Natural, well-balanced colour in standard mode", keys: ["review" as const] },
  ], 3, 4).map((c, i) => claim(id, i, c.type, c.text, c.keys));
  const limitations = pickClaims(`${key}l`, [
    { when: type === "OLED" && nits < 1400, type: "expert" as const, text: "Less punchy than Mini-LED in very bright rooms", keys: ["review" as const] },
    { when: hz <= 60, type: "measured" as const, text: "60 Hz panel shows judder in fast sport and limits gaming", keys: ["lab" as const] },
    { when: type === "LED" || type === "QLED", type: "measured" as const, text: `Limited contrast (${contrast}) — blacks look grey in a dark room`, keys: ["lab" as const] },
    { when: updateYears <= 2, type: "manufacturer" as const, text: `Only ${updateYears} years of software updates committed`, keys: ["spec" as const] },
    { when: !has("V"), type: "manufacturer" as const, text: "No Dolby Vision support", keys: ["spec" as const] },
    { when: type === "Mini-LED", type: "measured" as const, text: "Some blooming around bright objects on dark backgrounds", keys: ["lab" as const] },
    { when: true, type: "customer" as const, text: "Built-in speakers lack bass — owners recommend a soundbar", keys: ["customers" as const] },
  ], 2, 3).map((c, i) => claim(id, 10 + i, c.type, c.text, c.keys));

  const src = (k: Parameters<typeof sourceId>[1]) => sourceId(id, k);
  const sources = buildSources({
    productId: id, brand: brand.name, model: name, modelNumber, category: "televisions", year, reviews, lastVerified,
    facts: {
      lab: `Peak brightness ${nits} nits. Contrast ${contrast}. Input lag ${lag.toFixed(1)} ms. Typical power ${watts} W.`,
      spec: `${inches}" ${type}. ${hz} Hz. ${w} × ${h} × ${d} mm. ${updateYears} years of updates.`,
      cert: `Energy class ${rating}. Declared ${kwh} kWh/1000h equivalent annualised.`,
    },
  });
  tvSources.push(...sources);

  return {
    id, slug: key, brandId, name: `${brand.name} ${name}`, model: name, modelNumber, category: "televisions", type,
    tagline: `${inches}" ${type} · ${hz} Hz · ${nits.toLocaleString("en-US")} nits`,
    description: `${brand.name}'s ${inches}-inch ${type} television with ${features.slice(0, 3).join(", ")}. ${type === "OLED" ? "Self-lit pixels deliver true blacks." : type === "Mini-LED" ? "Thousands of local-dimming zones push brightness high." : "A sensible everyday set for mixed viewing."}`,
    variants: [{ id: `${id}-v1`, label: `${inches}"`, modelNumber, priceDelta: 0 }],
    regions: ["US", "UK", "EU", "AU", "CA"],
    price, originalPrice: orig || undefined,
    dimensions: { widthMm: w, heightMm: h, depthMm: d, weightKg },
    capacity: { value: inches, unit: "in", label: "Screen size" },
    energy: { rating, annualKwh: kwh, label: `Class ${rating}`, standbyW: 0.5 },
    features,
    warranty: { years: wy, partsYears: wy, extended: type === "OLED" ? "Burn-in covered" : undefined, notes: "Panel defects covered under standard warranty." },
    images: [`/images/products/${key}.svg`, pick(images.tvs, index), pick(images.interiors, index * 2 + 3), pick(images.tvs, index + 2)],
    rating: stars, reviewCount: reviews, suitabilityScore, evidenceCoverage: evidence, scoreFactors,
    aiSummary: [
      claim(id, 20, "ai", `The ${brand.name} ${name} is a ${inches}" ${type} TV scoring ${suitabilityScore}/10 for typical priorities.`, ["spec"]),
      claim(id, 21, "measured", `Measured ${nits.toLocaleString("en-US")} nits peak and ${lag.toFixed(1)} ms input lag.`, ["lab"]),
      claim(id, 22, "customer", `Owners ${stars >= 4.5 ? "rave about picture quality" : "like the value but mention sound and viewing angles"}.`, ["customers"]),
    ],
    strengths, limitations,
    bestFor: [type === "OLED" ? "Film lovers in dim rooms" : type === "Mini-LED" ? "Bright living rooms" : "Everyday viewing", ...(has("H") ? ["Console gaming"] : []), ...(price < 700 ? ["Tight budgets"] : [])],
    notFor: [...(hz <= 60 ? ["Competitive gamers"] : []), ...(inches >= 75 ? ["Small rooms"] : []), ...(type === "OLED" ? ["Static news tickers all day"] : [])],
    specs: [
      { id: "display", label: "Display", items: [
        { key: "size", label: "Screen size", value: inches, unit: "in", claimType: "manufacturer", sourceId: src("spec"), numeric: inches, better: "higher" },
        { key: "panel", label: "Panel type", value: type, claimType: "manufacturer", sourceId: src("spec") },
        { key: "nits", label: "Peak brightness (measured)", value: nits, unit: "nits", claimType: "measured", sourceId: src("lab"), numeric: nits, better: "higher" },
        { key: "refresh", label: "Refresh rate", value: hz, unit: "Hz", claimType: "manufacturer", sourceId: src("spec"), numeric: hz, better: "higher" },
        { key: "lag", label: "Input lag (measured)", value: Number(lag.toFixed(1)), unit: "ms", claimType: "measured", sourceId: src("lab"), numeric: lag, better: "lower" },
        { key: "contrast", label: "Contrast", value: contrast, claimType: "measured", sourceId: src("lab") },
      ] },
      { id: "dimensions", label: "Dimensions", items: [
        { key: "width", label: "Width", value: w, unit: "mm", claimType: "manufacturer", sourceId: src("spec"), numeric: w },
        { key: "height", label: "Height (no stand)", value: h, unit: "mm", claimType: "manufacturer", sourceId: src("spec"), numeric: h },
        { key: "depth", label: "Depth", value: d, unit: "mm", claimType: "manufacturer", sourceId: src("spec"), numeric: d, better: "lower" },
        { key: "weight", label: "Weight", value: weightKg, unit: "kg", claimType: "manufacturer", sourceId: src("spec"), numeric: weightKg, better: "lower" },
      ] },
      { id: "energy", label: "Energy", items: [
        { key: "energy-class", label: "Energy class", value: rating, claimType: "manufacturer", sourceId: src("cert") },
        { key: "kwh-rated", label: "Annual consumption", value: kwh, unit: "kWh/yr", claimType: "manufacturer", sourceId: src("cert"), numeric: kwh, better: "lower" },
        { key: "watts", label: "Typical power (SDR)", value: watts, unit: "W", claimType: "measured", sourceId: src("lab"), numeric: watts, better: "lower" },
      ] },
      { id: "features", label: "Features", items: Object.entries(FEATURES).map(([c, label]) => ({ key: `f-${c}`, label, value: has(c), claimType: "manufacturer" as const, sourceId: src("spec") })) },
      { id: "warranty", label: "Warranty & support", items: [
        { key: "warranty", label: "Warranty", value: wy, unit: "years", claimType: "manufacturer", sourceId: src("spec"), numeric: wy, better: "higher" },
        { key: "updates", label: "Software updates", value: updateYears, unit: "years", claimType: "manufacturer", sourceId: src("spec"), numeric: updateYears, better: "higher" },
      ] },
    ],
    faqs: [
      { question: "How far should I sit from it?", answer: `For 4K content, about ${(inches * 0.0254 * 1.2).toFixed(1)}–${(inches * 0.0254 * 1.5).toFixed(1)} m.`, sourceIds: [src("review")] },
      { question: "Is it good for gaming?", answer: has("H") ? `Yes — HDMI 2.1, ${hz} Hz and ${lag.toFixed(1)} ms input lag.` : `It is fine for casual gaming, but ${hz} Hz and ${lag.toFixed(1)} ms input lag limit fast-paced titles.`, sourceIds: [src("lab")] },
      { question: "Can it be wall-mounted?", answer: `Yes, with a VESA ${inches >= 65 ? "400 × 400" : "300 × 300"} bracket.`, sourceIds: [src("manual")] },
    ],
    sourceIds: sources.map((x) => x.id),
    warnings: freshnessWarnings(freshness, lastVerified, evidence, id),
    installation: { ventilationMm: { sides: 50, top: 100, back: 30 }, doorSwingMm: null, notes: [`VESA ${inches >= 65 ? "400 × 400" : "300 × 300"} mount pattern.`, `Stand footprint ${Math.round(w * (type === "OLED" || type === "Mini-LED" ? 0.3 : 0.85))} mm wide.`] },
    barcode: ean13(key), releaseYear: year, lastUpdated: lastVerified, lastVerified, freshness,
    badges: [...(suitabilityScore >= 8.2 ? ["Top rated"] : []), ...(orig ? ["Price drop"] : [])],
  };
}

export const televisions: Product[] = tvRows.map(build);
