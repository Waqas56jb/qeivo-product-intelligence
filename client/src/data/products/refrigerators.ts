import type { Product, SourceReference, SpecGroup } from "@/types";
import { clamp, hash, round } from "@/lib/utils";
import { images, pick } from "../images";
import { fridgeRows, type FridgeRow } from "./catalog-specs";
import { getBrand } from "./brands";
import {
  buildFactors,
  buildSources,
  claim,
  ean13,
  fmtMoney,
  freshnessWarnings,
  jitter,
  pickClaims,
  sourceId,
  verifiedDate,
  weightedScore,
} from "./build-helpers";

const FEATURE_NAMES: Record<string, string> = {
  W: "Water & ice dispenser",
  I: "Plumbed ice maker",
  V: "Inverter compressor",
  S: "Wi-Fi app control",
  C: "Convertible zone",
  D: "Dual cooling",
  R: "Door-in-door",
  H: "Humidity crispers",
  N: "Water filter (non-plumbed)",
  Q: "Quiet mode",
  X: "Reversible doors",
  L: "LED lighting",
  Z: "Fast freeze",
};

const FINISH_LABEL: Record<string, string> = {
  stainless: "Stainless steel",
  black: "Black stainless",
  white: "Gloss white",
  graphite: "Matte graphite",
  sage: "Sage green",
  navy: "Midnight navy",
  cream: "Cream",
  silver: "Silver",
  panel: "Panel-ready",
};

function household(cap: number) {
  if (cap >= 600) return "households of four to six";
  if (cap >= 450) return "families of three to five";
  if (cap >= 330) return "couples and families of up to four";
  if (cap >= 200) return "one or two people";
  return "studios, offices or as a second fridge";
}

const RATING_SCORE: Record<string, number> = { A: 9.6, B: 8.6, C: 7.5, D: 6.4, E: 5.3, F: 4.2, G: 3.1 };

export const fridgeSources: SourceReference[] = [];

function buildFridge(row: FridgeRow, index: number): Product {
  const [key, brandId, name, modelNumber, type, finish, cap, freezerL, w, h, d, price, orig, kwh, rating, db, wy, cy, stars, reviews, feat, evidence, year, freshness] = row;
  const brand = getBrand(brandId);
  const id = `p-${key}`;
  const has = (c: string) => feat.includes(c);
  const features = feat.split("").map((c) => FEATURE_NAMES[c]).filter(Boolean);
  if (!has("X") && type !== "Compact") features.push("Frost-free");

  // ---- derived measurements (deterministic)
  const usableShare = 0.86 + ((hash(key) % 7) / 100) - (has("I") ? 0.02 : 0) - (has("W") ? 0.02 : 0);
  const usable = Math.round(cap * usableShare);
  const kwhMeasured = Math.round(kwh * (0.95 + (hash(`${key}-kwh`) % 16) / 100));
  const energyConflict = kwhMeasured > kwh * 1.08;
  const tempVariance = round(has("V") ? 0.6 + (hash(key) % 5) / 10 : 1.2 + (hash(key) % 6) / 10, 1);
  const weightKg = Math.round(cap * 0.14 + 24 + (has("I") ? 6 : 0));
  const pullDownHours = round(type === "Compact" ? 3.2 : 4.5 + (hash(key) % 20) / 10, 1);
  const lastVerified = verifiedDate(freshness, key);

  // ---- scores
  const effPer100 = kwh / (cap / 100);
  const s = {
    performance: 6.3 + (brand.reliabilityIndex - 7.5) * 0.4 + (has("V") ? 0.8 : 0) + (has("D") ? 0.6 : 0) + (39 - db) * 0.16 + jitter(`${key}p`, 0.3),
    energy: 0.5 * clamp(type === "Compact" ? 10.6 - (effPer100 - 60) / 14 : 10.6 - (effPer100 - 30) / 9, 1.5, 9.8) + 0.5 * (RATING_SCORE[rating] ?? 5) + (energyConflict ? -0.4 : 0),
    value: 0.55 * clamp(5 + 3 * Math.log2((usable / price) / 0.22), 2.5, 9.8) + 0.45 * (stars * 2),
    reliability: brand.reliabilityIndex - (has("I") ? 0.5 : 0) - (has("W") ? 0.3 : 0) - (has("R") ? 0.2 : 0) + jitter(`${key}r`, 0.3),
    capacity: 3 + (usable / 100) * 1.1 + (type === "Four-door" || type === "French door" ? 0.3 : 0),
    space: 11.6 - (d - 560) / 45 - Math.max(0, w - 600) / 160 - (h > 1900 ? 0.4 : 0),
    maintenance: 7.6 - (has("W") ? 0.8 : 0) - (has("I") ? 0.6 : 0) - (has("N") ? 0.3 : 0) + (has("H") ? 0.3 : 0) + jitter(`${key}m`, 0.3),
    warranty: 4 + wy * 1.2 + cy * 0.25,
  };
  const ex = {
    performance: `${has("V") ? "Inverter compressor held" : "Conventional compressor held"} cabinet temperature within ±${tempVariance}°C in independent door-opening tests; recovery after loading took ${pullDownHours} h.`,
    energy: `Rated at ${kwh} kWh/yr (class ${rating}); independently measured at ${kwhMeasured} kWh/yr — ${round(effPer100, 0)} kWh per 100 L of capacity.`,
    value: `${usable} L of usable space for ${fmtMoney(price)} (${fmtMoney(Math.round(price / usable * 100) / 100)} per litre), weighted with an owner satisfaction of ${stars}/5.`,
    reliability: `${brand.name} carries a reliability index of ${brand.reliabilityIndex}/10 from owner-reported faults.${has("I") ? " Plumbed ice makers add a known failure point." : ""}`,
    capacity: `${cap} L quoted gross capacity, ${usable} L measured usable (${Math.round(usableShare * 100)}%), freezer ${freezerL ? `${freezerL} L` : "not included"}.`,
    space: `${w} × ${h} × ${d} mm. ${d <= 640 ? "Near-flush with standard worktops." : `Protrudes ~${d - 600} mm beyond a 600 mm worktop.`}`,
    maintenance: `${has("W") || has("I") ? "Water filter replacement every 6 months and periodic ice-maker descaling. " : "No water filter to replace. "}Frost-free operation ${type === "Compact" ? "is not included — manual defrost required" : "removes the need to defrost"}.`,
    warranty: `${wy}-year parts and labour warranty${cy > wy ? ` with ${cy}-year compressor cover` : ""}.`,
  };
  const scoreFactors = buildFactors("refrigerators", s, ex, evidence, year);
  const suitabilityScore = weightedScore(scoreFactors);
  const energyScore = scoreFactors.find((f) => f.key === "energy")!.score;

  // ---- claims
  const strengths = pickClaims(`${key}-s`, [
    { when: energyScore >= 7.8, type: "measured" as const, text: `Measured energy use of ${kwhMeasured} kWh/yr is among the lowest for a ${type.toLowerCase()} of this size`, keys: ["lab" as const] },
    { when: db <= 35, type: "measured" as const, text: `Runs at ${db} dB(A) — quiet enough for open-plan living spaces`, keys: ["lab" as const] },
    { when: usable >= 520, type: "measured" as const, text: `Generous ${usable} L of usable storage after shelving and fittings`, keys: ["lab" as const, "spec" as const] },
    { when: has("D"), type: "expert" as const, text: "Separate cooling circuits kept fridge and freezer odours apart throughout testing", keys: ["review" as const] },
    { when: has("V"), type: "expert" as const, text: `Inverter compressor held temperatures within ±${tempVariance}°C during repeated door openings`, keys: ["lab" as const] },
    { when: stars >= 4.5, type: "customer" as const, text: `Owners rate it ${stars}/5 across ${reviews.toLocaleString("en-US")} reviews, frequently praising its build quality`, keys: ["customers" as const] },
    { when: cy >= 10, type: "manufacturer" as const, text: `${cy}-year compressor warranty from ${brand.name}`, keys: ["spec" as const] },
    { when: d <= 640, type: "measured" as const, text: `${d} mm depth sits almost flush with standard kitchen worktops`, keys: ["spec" as const] },
    { when: has("C"), type: "manufacturer" as const, text: "Convertible zone switches between chilled, soft-freeze and freezer modes", keys: ["manual" as const] },
    { when: has("H"), type: "customer" as const, text: "Owners report salad and herbs lasting noticeably longer in the humidity-controlled crispers", keys: ["customers" as const] },
    { when: price / usable < 2.6, type: "ai" as const, text: `Low cost per litre: ${fmtMoney(Math.round(price / usable * 100) / 100)} for each litre of usable space`, keys: ["spec" as const, "lab" as const] },
    { when: type === "Compact", type: "measured" as const, text: `Compact ${w} mm footprint fits under most worktops and in tight alcoves`, keys: ["spec" as const] },
    { when: has("X"), type: "manufacturer" as const, text: "Reversible door hinges suit left- or right-hand layouts", keys: ["manual" as const] },
    { when: true, type: "customer" as const, text: "Owners describe the interior layout as easy to organise", keys: ["customers" as const] },
    { when: true, type: "expert" as const, text: "Solid build quality with smooth-running drawers and well-damped doors", keys: ["review" as const] },
  ], 3, 4).map((c, i) => claim(id, i, c.type, c.text, c.keys));

  const limitations = pickClaims(`${key}-l`, [
    { when: energyScore < 6, type: "measured" as const, text: `Measured ${kwhMeasured} kWh/yr is above average for a ${type.toLowerCase()}`, keys: ["lab" as const] },
    { when: energyConflict, type: "measured" as const, text: `Independent testing measured ${Math.round((kwhMeasured / kwh - 1) * 100)}% higher energy use than the label figure`, keys: ["lab" as const, "cert" as const] },
    { when: db >= 39, type: "measured" as const, text: `Compressor noise of ${db} dB(A) is noticeable in quiet rooms`, keys: ["lab" as const] },
    { when: has("I"), type: "customer" as const, text: "Ice maker jams are the most frequently reported owner issue", keys: ["customers" as const] },
    { when: has("W"), type: "expert" as const, text: "Through-door dispenser takes space from the door shelving", keys: ["review" as const] },
    { when: d >= 730, type: "measured" as const, text: `${d} mm depth protrudes well beyond standard 600 mm worktops`, keys: ["spec" as const] },
    { when: wy <= 1, type: "manufacturer" as const, text: `Only ${wy}-year parts and labour warranty as standard`, keys: ["spec" as const] },
    { when: evidence < 80, type: "ai" as const, text: "Limited long-term reliability data — fewer than two years of owner reports", keys: ["customers" as const] },
    { when: price >= 3500, type: "ai" as const, text: "Premium price — comparable capacity is available for considerably less", keys: ["spec" as const] },
    { when: !has("V"), type: "expert" as const, text: "Single-speed compressor cycles on and off more audibly than inverter designs", keys: ["review" as const] },
    { when: finish === "black" || finish === "graphite", type: "customer" as const, text: "Owners note the dark finish shows fingerprints and smudges", keys: ["customers" as const] },
    { when: type === "Compact" || freezerL < 30, type: "measured" as const, text: freezerL ? `Small ${freezerL} L freezer compartment suits ice trays only` : "No freezer compartment", keys: ["spec" as const] },
    { when: has("S"), type: "customer" as const, text: "Some owners report the companion app disconnecting after router changes", keys: ["customers" as const] },
    { when: !has("H"), type: "expert" as const, text: "Crisper drawers lack adjustable humidity control", keys: ["review" as const] },
    { when: true, type: "customer" as const, text: "Door bins are shallow for tall bottles and cartons", keys: ["customers" as const] },
    { when: true, type: "expert" as const, text: "Freezer drawers do not extend fully, making the back harder to reach", keys: ["review" as const] },
  ], 2, 4).map((c, i) => claim(id, 10 + i, c.type, c.text, c.keys));

  const praise = strengths.find((c) => c.type !== "manufacturer")?.text.toLowerCase() ?? "reliable cooling";
  const complaint = limitations[0]?.text.toLowerCase() ?? "minor fit and finish issues";

  const aiSummary = [
    claim(id, 20, "ai", `The ${brand.name} ${name} is a ${cap} L ${type.toLowerCase()} refrigerator best suited to ${household(cap)}, scoring ${suitabilityScore}/10 for typical priorities.`, ["spec"]),
    claim(id, 21, "measured", `Independent testing measured ${kwhMeasured} kWh per year against a rated ${kwh} kWh, with ${usable} L of usable space.`, ["lab", "cert"]),
    claim(id, 22, "customer", `Across ${reviews.toLocaleString("en-US")} owner reviews, the most common theme is that it ${stars >= 4.4 ? "holds temperature well and looks premium" : "does the job but has a few rough edges"}; the most common complaint concerns ${complaint.replace(/\.$/, "")}.`, ["customers"]),
    claim(id, 23, "expert", `${energyScore >= 7.5 ? "Reviewers highlight efficiency as a standout" : "Reviewers consider efficiency average for the class"}, and rate ${has("V") ? "temperature stability as excellent" : "temperature stability as adequate"}.`, ["review"]),
  ];

  const bestFor = [
    household(cap).replace(/^\w/, (c) => c.toUpperCase()),
    ...(energyScore >= 7.5 ? ["Buyers prioritising low running costs"] : []),
    ...(d <= 640 ? ["Kitchens needing a flush, built-in look"] : []),
    ...(db <= 35 ? ["Open-plan homes where noise matters"] : []),
    ...(has("W") ? ["Households that want filtered water on tap"] : []),
    ...(price < 1000 ? ["Budget-conscious buyers"] : []),
  ].slice(0, 4);

  const notFor = [
    ...(d >= 730 ? ["Shallow alcoves or galley kitchens"] : []),
    ...(w > 900 ? [`Openings narrower than ${w + 20} mm`] : []),
    ...(cap < 250 ? ["Families doing a weekly shop"] : []),
    ...(cap > 600 ? ["Single-person households"] : []),
    ...(has("I") ? ["Homes without a nearby water supply"] : []),
    ...(price > 3000 ? ["Tight budgets"] : []),
    ...(energyScore < 6 ? ["Buyers focused on energy bills"] : []),
  ].slice(0, 4);

  const src = (k: Parameters<typeof sourceId>[1]) => sourceId(id, k);
  const specs: SpecGroup[] = [
    {
      id: "capacity",
      label: "Capacity",
      items: [
        { key: "total", label: "Total capacity (gross)", value: cap, unit: "L", claimType: "manufacturer", sourceId: src("spec"), numeric: cap, better: "higher" },
        { key: "usable", label: "Usable capacity (measured)", value: usable, unit: "L", claimType: "measured", sourceId: src("lab"), numeric: usable, better: "higher" },
        { key: "fridge", label: "Fridge compartment", value: cap - freezerL, unit: "L", claimType: "manufacturer", sourceId: src("spec"), numeric: cap - freezerL, better: "higher" },
        { key: "freezer", label: "Freezer compartment", value: freezerL, unit: "L", claimType: "manufacturer", sourceId: src("spec"), numeric: freezerL, better: "higher" },
        { key: "shelves", label: "Adjustable shelves", value: 3 + (hash(key) % 3), claimType: "manufacturer", sourceId: src("manual") },
      ],
    },
    {
      id: "dimensions",
      label: "Dimensions",
      items: [
        { key: "width", label: "Width", value: w, unit: "mm", claimType: "manufacturer", sourceId: src("spec"), numeric: w, better: "lower" },
        { key: "height", label: "Height", value: h, unit: "mm", claimType: "manufacturer", sourceId: src("spec"), numeric: h, better: "lower" },
        { key: "depth", label: "Depth (excl. handles)", value: d, unit: "mm", claimType: "manufacturer", sourceId: src("spec"), numeric: d, better: "lower" },
        { key: "weight", label: "Net weight", value: weightKg, unit: "kg", claimType: "manufacturer", sourceId: src("spec"), numeric: weightKg },
        { key: "door-swing", label: "Door swing clearance", value: type === "Compact" ? 520 : Math.round(w / (type === "French door" || type === "Four-door" || type === "Counter-depth" || type === "Side-by-side" ? 2 : 1) + 40), unit: "mm", claimType: "manufacturer", sourceId: src("manual") },
      ],
    },
    {
      id: "energy",
      label: "Energy & noise",
      items: [
        { key: "energy-class", label: "Energy class", value: rating, claimType: "manufacturer", sourceId: src("cert") },
        { key: "kwh-rated", label: "Rated consumption", value: kwh, unit: "kWh/yr", claimType: "manufacturer", sourceId: src("cert"), numeric: kwh, better: "lower" },
        { key: "kwh-measured", label: "Measured consumption", value: kwhMeasured, unit: "kWh/yr", claimType: "measured", sourceId: src("lab"), numeric: kwhMeasured, better: "lower" },
        { key: "noise", label: "Noise level", value: db, unit: "dB(A)", claimType: "manufacturer", sourceId: src("spec"), numeric: db, better: "lower" },
        { key: "temp-variance", label: "Temperature stability", value: `±${tempVariance}`, unit: "°C", claimType: "measured", sourceId: src("lab"), numeric: tempVariance, better: "lower" },
      ],
    },
    {
      id: "features",
      label: "Features",
      items: Object.entries(FEATURE_NAMES).filter(([c]) => c !== "L").map(([c, label]) => ({
        key: `f-${c}`,
        label,
        value: has(c),
        claimType: "manufacturer" as const,
        sourceId: src("spec"),
      })),
    },
    {
      id: "warranty",
      label: "Warranty & support",
      items: [
        { key: "warranty", label: "Parts & labour", value: wy, unit: wy === 1 ? "year" : "years", claimType: "manufacturer", sourceId: src("spec"), numeric: wy, better: "higher" },
        { key: "compressor", label: "Compressor", value: cy, unit: cy === 1 ? "year" : "years", claimType: "manufacturer", sourceId: src("spec"), numeric: cy, better: "higher" },
        { key: "finish", label: "Finish", value: FINISH_LABEL[finish], claimType: "manufacturer", sourceId: src("spec") },
      ],
    },
  ];

  const ventilation = hash(`${key}-vent`) % 9 === 0 ? null : { sides: type === "Compact" ? 20 : 10 + (hash(key) % 3) * 5, top: 25 + (hash(key) % 2) * 25, back: 25 + (hash(key) % 3) * 12 };
  const doorSwing = specs[1].items.find((i) => i.key === "door-swing")!.value as number;

  const warnings = [
    ...freshnessWarnings(freshness, lastVerified, evidence, id),
    ...(energyConflict
      ? [{ kind: "conflict" as const, title: "Conflicting energy figures", detail: `The energy label declares ${kwh} kWh/yr, but ${"independent lab testing"} measured ${kwhMeasured} kWh/yr. Qeivo scores use the measured figure.`, sourceIds: [src("cert"), src("lab")] }]
      : []),
    ...(ventilation === null
      ? [{ kind: "missing" as const, title: "Ventilation clearance not published", detail: "The manufacturer has not published minimum ventilation gaps. Compatibility checks will show these as unknown.", sourceIds: [src("manual")] }]
      : []),
    ...(has("S") && evidence < 90
      ? [{ kind: "unverified" as const, title: "Unverified manufacturer claim", detail: `${brand.name} claims the app can "reduce energy use by up to 15%". This has not been independently tested.`, sourceIds: [src("maker")] }]
      : []),
  ];

  const faqs = [
    { question: `Will the ${name} fit through a standard doorway?`, answer: `With doors and handles removed the cabinet depth is ${d - 40} mm, which passes through most 762 mm (30") doorways. Check hallway turns as well.`, sourceIds: [src("manual"), src("spec")] },
    { question: "How much will it cost to run?", answer: `At the measured ${kwhMeasured} kWh/yr and a tariff of $0.17/kWh, expect around $${Math.round(kwhMeasured * 0.17)} per year.`, sourceIds: [src("lab")] },
    { question: "How much space does it need around it?", answer: ventilation ? `Allow ${ventilation.sides} mm at each side, ${ventilation.top} mm above and ${ventilation.back} mm behind for ventilation.` : "The manufacturer has not published ventilation clearances. We recommend at least 25 mm on all sides until confirmed.", sourceIds: [src("manual")] },
    { question: "Is it noisy?", answer: `It is rated at ${db} dB(A). ${db <= 35 ? "That is quieter than a typical library." : db <= 38 ? "Comparable to a quiet conversation in the next room." : "Noticeable in a quiet room, particularly when the compressor starts."}`, sourceIds: [src("spec"), src("lab")] },
    ...(has("I") ? [{ question: "Does the ice maker need a water connection?", answer: "Yes — the ice maker requires a plumbed 1/4\" water supply within 2 m of the installation position.", sourceIds: [src("manual")] }] : []),
  ];

  const sources = buildSources({
    productId: id,
    brand: brand.name,
    model: name,
    modelNumber,
    category: "refrigerators",
    year,
    reviews,
    lastVerified,
    facts: {
      lab: `Measured annual consumption ${kwhMeasured} kWh. Usable volume ${usable} L. Temperature variance ±${tempVariance}°C. Noise ${db} dB(A) at 1 m.`,
      spec: `Gross volume ${cap} L (fridge ${cap - freezerL} L / freezer ${freezerL} L). Dimensions ${w} × ${h} × ${d} mm. Warranty ${wy} yr, compressor ${cy} yr.`,
      cert: `Energy class ${rating}. Declared consumption ${kwh} kWh/annum.`,
      customers: `Positive themes: ${praise}. Negative themes: ${complaint}.`,
      maker: `"${brand.tagline}." Feature highlights: ${features.slice(0, 3).join(", ")}.`,
      manual: ventilation ? `Installation: leave ${ventilation.sides} mm at the sides, ${ventilation.top} mm above and ${ventilation.back} mm at the rear for air circulation.` : "Installation: ensure adequate airflow around the appliance.",
    },
  });
  fridgeSources.push(...sources);

  const variants = [
    { id: `${id}-v1`, label: FINISH_LABEL[finish], modelNumber, priceDelta: 0, finish: FINISH_LABEL[finish] },
    ...(finish === "stainless" ? [{ id: `${id}-v2`, label: "Black stainless", modelNumber: modelNumber.replace(/[A-Z]{2}$/, "BK"), priceDelta: 150, finish: "Black stainless" }] : []),
    ...(finish === "white" ? [{ id: `${id}-v2`, label: "Silver", modelNumber: modelNumber.replace(/W$/, "S"), priceDelta: 80, finish: "Silver" }] : []),
  ];

  return {
    id,
    slug: key,
    brandId,
    name: `${brand.name} ${name}`,
    model: name,
    modelNumber,
    category: "refrigerators",
    type,
    tagline: `${cap} L ${type.toLowerCase()} · ${rating}-rated · ${db} dB`,
    description: `The ${name} is ${brand.name}'s ${cap >= 600 ? "large-capacity" : cap >= 350 ? "mid-size" : "compact"} ${type.toLowerCase()} refrigerator, offering ${cap} litres of gross capacity in a ${FINISH_LABEL[finish].toLowerCase()} finish. ${features.slice(0, 3).join(", ")} ${features.length > 3 ? "and more " : ""}make it a candidate for ${household(cap)}.`,
    variants,
    regions: hash(key) % 4 === 0 ? ["US", "CA"] : hash(key) % 4 === 1 ? ["UK", "EU", "AU"] : ["US", "UK", "EU", "AU", "CA"],
    price,
    originalPrice: orig || undefined,
    dimensions: { widthMm: w, heightMm: h, depthMm: d, weightKg },
    capacity: { value: cap, unit: "L", label: "Total capacity" },
    energy: { rating, annualKwh: kwh, label: `Class ${rating}` },
    features,
    warranty: { years: wy, partsYears: wy, extended: cy > wy ? `${cy}-year compressor` : undefined, notes: `Registration within 90 days required for extended compressor cover.` },
    images: [`/images/products/${key}.svg`, pick(images.fridgeInSitu, index), pick(images.kitchens, index * 3 + 1), pick(images.kitchens, index * 5 + 2)],
    rating: stars,
    reviewCount: reviews,
    suitabilityScore,
    evidenceCoverage: evidence,
    scoreFactors,
    aiSummary,
    strengths,
    limitations,
    bestFor,
    notFor,
    specs,
    faqs,
    sourceIds: sources.map((s) => s.id),
    warnings,
    installation: {
      ventilationMm: ventilation,
      doorSwingMm: doorSwing,
      notes: [
        has("I") || has("W") ? "Requires a 1/4\" plumbed water supply within 2 m." : "No water connection required.",
        "Requires a standard grounded 230 V / 120 V outlet within 1.5 m.",
        ...(has("X") ? ["Door hinges are reversible."] : ["Door hinges are fixed."]),
      ],
    },
    barcode: ean13(key),
    releaseYear: year,
    lastUpdated: lastVerified,
    lastVerified,
    freshness,
    sponsored: key === "maru-smartview-fd620" || key === "corvane-chef-sbs700",
    badges: [
      ...(suitabilityScore >= 8.3 ? ["Top rated"] : []),
      ...(energyScore >= 8.5 ? ["Energy leader"] : []),
      ...(orig ? ["Price drop"] : []),
    ],
  };
}

export const refrigerators: Product[] = fridgeRows.map(buildFridge);
