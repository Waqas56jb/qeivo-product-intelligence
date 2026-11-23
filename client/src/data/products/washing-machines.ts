import type { Product, SourceReference } from "@/types";
import { clamp, hash, round } from "@/lib/utils";
import { images, pick } from "../images";
import { washerRows, type WasherRow } from "./catalog-specs";
import { getBrand } from "./brands";
import { buildFactors, buildSources, claim, ean13, fmtMoney, freshnessWarnings, jitter, pickClaims, sourceId, verifiedDate, weightedScore } from "./build-helpers";

const FEATURES: Record<string, string> = {
  S: "Steam refresh",
  D: "Auto-dosing",
  I: "Inverter motor",
  W: "Wi-Fi app control",
  A: "Allergy cycle",
  Q: "Quick wash",
};

export const washerSources: SourceReference[] = [];

function build(row: WasherRow, index: number): Product {
  const [key, brandId, name, modelNumber, type, finish, kg, w, h, d, price, orig, kwh, rating, db, wy, my, stars, reviews, feat, evidence, year, freshness, rpm, water] = row;
  const brand = getBrand(brandId);
  const id = `p-${key}`;
  const has = (c: string) => feat.includes(c);
  const features = feat.split("").map((c) => FEATURES[c]).filter(Boolean);
  const lastVerified = verifiedDate(freshness, key);
  const residual = Math.round(rpm >= 1600 ? 44 : rpm >= 1400 ? 52 : rpm >= 1200 ? 57 : 65);
  const stainRemoval = round(clamp(6.2 + (brand.reliabilityIndex - 7.5) * 0.5 + (has("S") ? 0.5 : 0) + (type === "Top load" ? -0.8 : 0) + jitter(key, 0.4), 4, 9.6), 1);
  const kwhMeasured = Math.round(kwh * (0.96 + (hash(`${key}k`) % 12) / 100));
  const weightKg = Math.round(58 + kg * 2.4 + (type === "Washer-dryer" ? 9 : 0));

  const s = {
    performance: stainRemoval + (rpm >= 1400 ? 0.3 : -0.2),
    energy: 15.5 - (kwh / kg) * 0.45 - water / 22,
    value: 0.55 * clamp(5 + 3 * Math.log2((kg / price) / 0.009), 2.5, 9.8) + 0.45 * stars * 2,
    reliability: brand.reliabilityIndex + (has("I") ? 0.3 : -0.2) - (type === "Washer-dryer" ? 0.6 : 0) + jitter(`${key}r`, 0.3),
    capacity: 2.5 + kg * 0.6,
    space: 11 - (d - 450) / 40 - (h > 900 ? 1.4 : 0),
    maintenance: 7.4 + (has("D") ? 0.6 : 0) - (type === "Washer-dryer" ? 0.8 : 0) + (type === "Top load" ? 0.4 : 0),
    warranty: 4 + wy * 1.2 + my * 0.22,
  };
  const ex = {
    performance: `Removed ${Math.round(stainRemoval * 10)}% of standard test stains on the 40°C cotton cycle; ${rpm} rpm spin left ${residual}% residual moisture.`,
    energy: `${kwh} kWh/yr rated (class ${rating}), ${kwhMeasured} kWh/yr measured; ${water} L of water per standard cycle.`,
    value: `${kg} kg capacity for ${fmtMoney(price)}, weighted with owner satisfaction of ${stars}/5.`,
    reliability: `${brand.name} reliability index ${brand.reliabilityIndex}/10.${type === "Washer-dryer" ? " Combined washer-dryers report more heating-element faults." : ""}`,
    capacity: `${kg} kg drum — ${kg >= 10 ? "suits large families and bulky bedding" : kg >= 8 ? "suits families of three to four" : "best for one or two people"}.`,
    space: `${w} × ${h} × ${d} mm${type === "Top load" ? "; top-loading lid needs ~500 mm clearance above." : "."}`,
    maintenance: `${has("D") ? "Auto-dosing reservoir needs monthly cleaning. " : ""}Drum-clean cycle recommended every 30 washes; filter accessible from the front.`,
    warranty: `${wy}-year parts and labour${my > wy ? `, ${my}-year motor warranty` : ""}.`,
  };
  const scoreFactors = buildFactors("washing-machines", s, ex, evidence, year);
  const suitabilityScore = weightedScore(scoreFactors);
  const energyScore = scoreFactors[1].score;

  const strengths = pickClaims(`${key}s`, [
    { when: stainRemoval >= 7.5, type: "measured" as const, text: `Removed ${Math.round(stainRemoval * 10)}% of test stains at 40°C — top-tier wash performance`, keys: ["lab" as const] },
    { when: energyScore >= 7.5, type: "measured" as const, text: `Uses only ${water} L of water per standard cycle`, keys: ["lab" as const] },
    { when: rpm >= 1400, type: "measured" as const, text: `${rpm} rpm spin leaves just ${residual}% residual moisture, shortening drying time`, keys: ["lab" as const] },
    { when: db <= 73, type: "measured" as const, text: `Quiet ${db} dB(A) spin suits apartments and open-plan homes`, keys: ["lab" as const] },
    { when: has("D"), type: "expert" as const, text: "Auto-dosing measured detergent accurately across load sizes", keys: ["review" as const] },
    { when: stars >= 4.4, type: "customer" as const, text: `Rated ${stars}/5 by ${reviews.toLocaleString("en-US")} owners, who praise how gentle it is on clothes`, keys: ["customers" as const] },
    { when: my >= 10, type: "manufacturer" as const, text: `${my}-year inverter motor warranty`, keys: ["spec" as const] },
    { when: price < 600, type: "ai" as const, text: `Strong value at ${fmtMoney(price)} for a ${kg} kg drum`, keys: ["spec" as const] },
    { when: has("Q"), type: "manufacturer" as const, text: "15-minute quick wash for lightly soiled loads", keys: ["manual" as const] },
    { when: true, type: "expert" as const, text: "Clear, logical controls with a well-organised programme dial", keys: ["review" as const] },
    { when: true, type: "customer" as const, text: "Owners find the detergent drawer easy to remove and clean", keys: ["customers" as const] },
  ], 3, 4).map((c, i) => claim(id, i, c.type, c.text, c.keys));
  const limitations = pickClaims(`${key}l`, [
    { when: type === "Top load", type: "measured" as const, text: `High water use at ${water} L per cycle`, keys: ["lab" as const] },
    { when: db >= 76, type: "measured" as const, text: `Spin noise of ${db} dB(A) is noticeable through walls`, keys: ["lab" as const] },
    { when: type === "Washer-dryer", type: "expert" as const, text: "Drying capacity is roughly 60% of the wash capacity, so large loads need splitting", keys: ["review" as const] },
    { when: wy <= 1, type: "manufacturer" as const, text: `Only ${wy}-year standard warranty`, keys: ["spec" as const] },
    { when: has("W"), type: "customer" as const, text: "Owners describe the app pairing process as fiddly", keys: ["customers" as const] },
    { when: evidence < 85, type: "ai" as const, text: "Long-term reliability data is still limited for this model", keys: ["customers" as const] },
    { when: rpm < 1200, type: "measured" as const, text: `Slower ${rpm} rpm spin leaves clothes wetter (${residual}% residual moisture)`, keys: ["lab" as const] },
    { when: true, type: "customer" as const, text: "Door seal needs regular wiping to prevent odours", keys: ["customers" as const] },
    { when: true, type: "expert" as const, text: "Eco programme takes over three hours to complete a full load", keys: ["review" as const] },
  ], 2, 3).map((c, i) => claim(id, 10 + i, c.type, c.text, c.keys));

  const src = (k: Parameters<typeof sourceId>[1]) => sourceId(id, k);
  const sources = buildSources({
    productId: id, brand: brand.name, model: name, modelNumber, category: "washing-machines", year, reviews, lastVerified,
    facts: {
      lab: `Stain removal ${Math.round(stainRemoval * 10)}%. Residual moisture ${residual}% at ${rpm} rpm. Measured ${kwhMeasured} kWh/yr. Spin noise ${db} dB(A).`,
      spec: `Capacity ${kg} kg. Dimensions ${w} × ${h} × ${d} mm. Water ${water} L/cycle. Warranty ${wy} yr; motor ${my} yr.`,
      cert: `Energy class ${rating}. Declared ${kwh} kWh/annum.`,
    },
  });
  washerSources.push(...sources);

  return {
    id, slug: key, brandId, name: `${brand.name} ${name}`, model: name, modelNumber, category: "washing-machines", type,
    tagline: `${kg} kg ${type.toLowerCase()} · ${rpm} rpm · class ${rating}`,
    description: `The ${name} is a ${kg} kg ${type.toLowerCase()} ${type === "Washer-dryer" ? "washer-dryer" : "washing machine"} from ${brand.name} with a ${rpm} rpm spin and ${features.length ? features.slice(0, 3).join(", ").toLowerCase() : "a straightforward programme set"}.`,
    variants: [{ id: `${id}-v1`, label: finish === "white" ? "White" : finish === "graphite" ? "Graphite" : finish === "black" ? "Black" : "Silver", modelNumber, priceDelta: 0 }],
    regions: ["US", "UK", "EU", "AU", "CA"],
    price, originalPrice: orig || undefined,
    dimensions: { widthMm: w, heightMm: h, depthMm: d, weightKg },
    capacity: { value: kg, unit: "kg", label: "Drum capacity" },
    energy: { rating, annualKwh: kwh, label: `Class ${rating}` },
    features,
    warranty: { years: wy, partsYears: wy, extended: my > wy ? `${my}-year motor` : undefined, notes: "Motor warranty covers parts only after the standard period." },
    images: [`/images/products/${key}.svg`, pick(images.laundry, index), pick(images.laundry, index + 3), pick(images.interiors, index + 2)],
    rating: stars, reviewCount: reviews, suitabilityScore, evidenceCoverage: evidence, scoreFactors,
    aiSummary: [
      claim(id, 20, "ai", `The ${brand.name} ${name} is a ${kg} kg ${type.toLowerCase()} machine scoring ${suitabilityScore}/10 for typical priorities.`, ["spec"]),
      claim(id, 21, "measured", `Lab testing found ${Math.round(stainRemoval * 10)}% stain removal and ${water} L water use per cycle.`, ["lab"]),
      claim(id, 22, "customer", `Owners ${stars >= 4.4 ? "consistently praise wash results and quietness" : "find it dependable but mention some noise and long cycle times"}.`, ["customers"]),
    ],
    strengths, limitations,
    bestFor: [kg >= 10 ? "Large families" : kg >= 8 ? "Families of three to four" : "Couples and small flats", ...(energyScore >= 7.5 ? ["Low running costs"] : []), ...(db <= 73 ? ["Apartments"] : [])],
    notFor: [...(type === "Top load" ? ["Water-metered homes"] : []), ...(d > 600 ? ["Shallow utility spaces"] : []), ...(kg < 8 ? ["Large households"] : [])],
    specs: [
      { id: "capacity", label: "Capacity & performance", items: [
        { key: "kg", label: "Drum capacity", value: kg, unit: "kg", claimType: "manufacturer", sourceId: src("spec"), numeric: kg, better: "higher" },
        { key: "rpm", label: "Max spin speed", value: rpm, unit: "rpm", claimType: "manufacturer", sourceId: src("spec"), numeric: rpm, better: "higher" },
        { key: "stain", label: "Stain removal (measured)", value: Math.round(stainRemoval * 10), unit: "%", claimType: "measured", sourceId: src("lab"), numeric: stainRemoval, better: "higher" },
        { key: "residual", label: "Residual moisture", value: residual, unit: "%", claimType: "measured", sourceId: src("lab"), numeric: residual, better: "lower" },
      ] },
      { id: "dimensions", label: "Dimensions", items: [
        { key: "width", label: "Width", value: w, unit: "mm", claimType: "manufacturer", sourceId: src("spec"), numeric: w, better: "lower" },
        { key: "height", label: "Height", value: h, unit: "mm", claimType: "manufacturer", sourceId: src("spec"), numeric: h, better: "lower" },
        { key: "depth", label: "Depth", value: d, unit: "mm", claimType: "manufacturer", sourceId: src("spec"), numeric: d, better: "lower" },
        { key: "weight", label: "Weight", value: weightKg, unit: "kg", claimType: "manufacturer", sourceId: src("spec") },
      ] },
      { id: "energy", label: "Energy, water & noise", items: [
        { key: "energy-class", label: "Energy class", value: rating, claimType: "manufacturer", sourceId: src("cert") },
        { key: "kwh-rated", label: "Rated consumption", value: kwh, unit: "kWh/yr", claimType: "manufacturer", sourceId: src("cert"), numeric: kwh, better: "lower" },
        { key: "kwh-measured", label: "Measured consumption", value: kwhMeasured, unit: "kWh/yr", claimType: "measured", sourceId: src("lab"), numeric: kwhMeasured, better: "lower" },
        { key: "water", label: "Water per cycle", value: water, unit: "L", claimType: "measured", sourceId: src("lab"), numeric: water, better: "lower" },
        { key: "noise", label: "Spin noise", value: db, unit: "dB(A)", claimType: "measured", sourceId: src("lab"), numeric: db, better: "lower" },
      ] },
      { id: "features", label: "Features", items: Object.entries(FEATURES).map(([c, label]) => ({ key: `f-${c}`, label, value: has(c), claimType: "manufacturer" as const, sourceId: src("spec") })) },
      { id: "warranty", label: "Warranty", items: [
        { key: "warranty", label: "Parts & labour", value: wy, unit: "years", claimType: "manufacturer", sourceId: src("spec"), numeric: wy, better: "higher" },
        { key: "motor", label: "Motor", value: my, unit: "years", claimType: "manufacturer", sourceId: src("spec"), numeric: my, better: "higher" },
      ] },
    ],
    faqs: [
      { question: "How long does the standard cotton cycle take?", answer: `The 40°C cotton cycle takes about ${type === "Top load" ? "58" : "3 h 15"} ${type === "Top load" ? "minutes" : "min"} in eco mode; the quick wash completes in ${has("Q") ? "15" : "30"} minutes.`, sourceIds: [src("manual")] },
      { question: "What does it cost to run per year?", answer: `About $${Math.round(kwhMeasured * 0.17)} in electricity at $0.17/kWh, plus water.`, sourceIds: [src("lab")] },
      { question: "Can it be stacked with a dryer?", answer: type === "Front load" ? "Yes, with the manufacturer's stacking kit." : "No — this model is not designed for stacking.", sourceIds: [src("manual")] },
    ],
    sourceIds: sources.map((x) => x.id),
    warnings: freshnessWarnings(freshness, lastVerified, evidence, id),
    installation: { ventilationMm: { sides: 10, top: type === "Top load" ? 500 : 20, back: 50 }, doorSwingMm: type === "Top load" ? null : 480, notes: ["Requires cold water connection and standpipe drain.", "Remove transit bolts before first use."] },
    barcode: ean13(key), releaseYear: year, lastUpdated: lastVerified, lastVerified, freshness,
    badges: [...(suitabilityScore >= 8.2 ? ["Top rated"] : []), ...(orig ? ["Price drop"] : [])],
  };
}

export const washingMachines: Product[] = washerRows.map(build);
