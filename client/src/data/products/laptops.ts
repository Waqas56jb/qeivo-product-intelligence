import type { Product, SourceReference } from "@/types";
import { clamp, hash } from "@/lib/utils";
import { images, pick } from "../images";
import { laptopRows, type LaptopRow } from "./catalog-specs";
import { getBrand } from "./brands";
import { buildFactors, buildSources, claim, ean13, fmtMoney, freshnessWarnings, jitter, pickClaims, sourceId, verifiedDate, weightedScore } from "./build-helpers";

const FEATURES: Record<string, string> = { O: "OLED display", T: "Thunderbolt 4", B: "Backlit keyboard", F: "Fingerprint reader", U: "Upgradeable RAM" };

export const laptopSources: SourceReference[] = [];

function build(row: LaptopRow, index: number): Product {
  const [key, brandId, name, modelNumber, type, finish, storage, screen, w, t, d, kg, price, orig, claimed, measured, cpu, ram, stars, reviews, feat, evidence, year, freshness, wy] = row;
  const brand = getBrand(brandId);
  const id = `p-${key}`;
  const has = (c: string) => feat.includes(c);
  const features = feat.split("").map((c) => FEATURES[c]);
  const lastVerified = verifiedDate(freshness, key);
  const cores = Number(cpu.split("-")[0]);
  const gpu = cpu.includes("GPU");
  const benchmark = Math.round(cores * 1150 + (gpu ? 2400 : 0) + (hash(key) % 900));
  const surfaceTemp = Math.round(gpu ? 47 + (hash(key) % 5) : 39 + (hash(key) % 5));
  const repairability = brandId === "b-tervo" ? 8.4 : has("U") ? 6.8 : 4.6;
  const batteryWh = Math.round(claimed * 4.1 + (gpu ? 50 : 20));

  const s = {
    performance: 4 + cores * 0.22 + (gpu ? 1.4 : 0) + (ram >= 32 ? 0.4 : ram <= 8 ? -0.8 : 0) + jitter(key, 0.2),
    energy: 1.2 + measured * 0.62,
    value: 0.55 * clamp(5 + 3 * Math.log2(((benchmark / 100 + ram) / price) / 0.08), 2.5, 9.8) + 0.45 * stars * 2,
    reliability: brand.reliabilityIndex + jitter(`${key}r`, 0.3),
    capacity: 2.8 + Math.log2(ram) * 0.8 + Math.log2(storage / 128) * 0.7,
    space: 11.2 - kg * 2.6,
    maintenance: repairability,
    warranty: 4.5 + wy * 1.5,
  };
  const ex = {
    performance: `${cpu}, ${ram} GB RAM. Multi-core benchmark ${benchmark.toLocaleString("en-US")}; surface temperature ${surfaceTemp}°C under sustained load.`,
    energy: `Claimed ${claimed} h; measured ${measured} h in a 150-nit web-browsing loop (${batteryWh} Wh battery).`,
    value: `${fmtMoney(price)} for this performance tier, weighted with owner satisfaction of ${stars}/5.`,
    reliability: `${brand.name} reliability index ${brand.reliabilityIndex}/10.`,
    capacity: `${ram} GB memory and ${storage >= 1000 ? `${storage / 1000} TB` : `${storage} GB`} SSD.`,
    space: `${kg} kg, ${t} mm thick, ${screen}" display.`,
    maintenance: `Repairability ${repairability}/10 — ${has("U") ? "socketed RAM and SSD" : "soldered RAM, replaceable SSD"}.`,
    warranty: `${wy}-year limited warranty.`,
  };
  const scoreFactors = buildFactors("laptops", s, ex, evidence, year);
  const suitabilityScore = weightedScore(scoreFactors);

  const strengths = pickClaims(`${key}s`, [
    { when: measured >= 11, type: "measured" as const, text: `${measured} h of measured battery life — a full working day and more`, keys: ["lab" as const] },
    { when: kg <= 1.3, type: "measured" as const, text: `Light at ${kg} kg and ${t} mm thin`, keys: ["spec" as const] },
    { when: gpu, type: "measured" as const, text: `Discrete graphics sustain high frame rates; benchmark ${benchmark.toLocaleString("en-US")}`, keys: ["lab" as const] },
    { when: has("O"), type: "expert" as const, text: "OLED panel covers the full DCI-P3 gamut with excellent accuracy", keys: ["review" as const] },
    { when: repairability >= 8, type: "expert" as const, text: "Excellent repairability — battery, SSD and keyboard are user-replaceable", keys: ["review" as const] },
    { when: stars >= 4.5, type: "customer" as const, text: `Owners love the keyboard and build (${stars}/5 from ${reviews.toLocaleString("en-US")} reviews)`, keys: ["customers" as const] },
    { when: wy >= 3, type: "manufacturer" as const, text: `${wy}-year warranty as standard`, keys: ["spec" as const] },
    { when: price < 1000, type: "ai" as const, text: `Capable everyday performance for ${fmtMoney(price)}`, keys: ["spec" as const] },
    { when: has("B"), type: "customer" as const, text: "Comfortable backlit keyboard that owners rate highly for long typing sessions", keys: ["customers" as const] },
    { when: true, type: "expert" as const, text: "Precise, glass-topped trackpad with reliable palm rejection", keys: ["review" as const] },
  ], 3, 4).map((c, i) => claim(id, i, c.type, c.text, c.keys));
  const limitations = pickClaims(`${key}l`, [
    { when: measured / claimed < 0.7, type: "measured" as const, text: `Measured battery life (${measured} h) is well below the claimed ${claimed} h`, keys: ["lab" as const, "maker" as const] },
    { when: kg >= 2, type: "measured" as const, text: `Heavy at ${kg} kg — not ideal for daily commuting`, keys: ["spec" as const] },
    { when: surfaceTemp >= 46, type: "measured" as const, text: `Surface reaches ${surfaceTemp}°C under load; fans are audible`, keys: ["lab" as const] },
    { when: ram <= 8, type: "expert" as const, text: "8 GB soldered memory will feel limiting within a couple of years", keys: ["review" as const] },
    { when: !has("U"), type: "expert" as const, text: "Soldered memory cannot be upgraded later", keys: ["review" as const] },
    { when: wy <= 1, type: "manufacturer" as const, text: "Only a 1-year standard warranty", keys: ["spec" as const] },
    { when: true, type: "customer" as const, text: "Some owners report a glossy screen that reflects overhead lighting", keys: ["customers" as const] },
    { when: true, type: "expert" as const, text: "Webcam image is soft and noisy in low light", keys: ["review" as const] },
  ], 2, 3).map((c, i) => claim(id, 10 + i, c.type, c.text, c.keys));

  const src = (k: Parameters<typeof sourceId>[1]) => sourceId(id, k);
  const sources = buildSources({
    productId: id, brand: brand.name, model: name, modelNumber, category: "laptops", year, reviews, lastVerified,
    facts: {
      lab: `Battery ${measured} h (150-nit browsing). Multi-core ${benchmark}. Surface ${surfaceTemp}°C.`,
      spec: `${cpu}; ${ram} GB; ${storage} GB SSD; ${screen}"; ${kg} kg; ${batteryWh} Wh.`,
      maker: `Claimed "up to ${claimed} hours" battery life.`,
      cert: "Energy Star equivalent registration.",
    },
  });
  laptopSources.push(...sources);

  return {
    id, slug: key, brandId, name: `${brand.name} ${name}`, model: name, modelNumber, category: "laptops", type,
    tagline: `${screen}" ${type.toLowerCase()} · ${ram} GB · ${measured} h measured`,
    description: `The ${brand.name} ${name} is a ${screen}-inch ${type.toLowerCase()} laptop with a ${cpu} processor, ${ram} GB of memory and ${features.slice(0, 2).join(" and ").toLowerCase() || "a no-nonsense design"}.`,
    variants: [
      { id: `${id}-v1`, label: `${ram} GB / ${storage >= 1000 ? `${storage / 1000} TB` : `${storage} GB`}`, modelNumber, priceDelta: 0 },
      { id: `${id}-v2`, label: `${ram * 2} GB / ${storage * 2 >= 1000 ? `${(storage * 2) / 1000} TB` : `${storage * 2} GB`}`, modelNumber: `${modelNumber}X`, priceDelta: 300 },
    ],
    regions: ["US", "UK", "EU", "AU", "CA"],
    price, originalPrice: orig || undefined,
    dimensions: { widthMm: w, heightMm: t, depthMm: d, weightKg: kg },
    capacity: { value: storage, unit: "GB", label: "Storage" },
    energy: { rating: `${measured} h`, annualKwh: Math.round(batteryWh * 0.25 * 3.65), label: `${measured} h measured battery` },
    features: [...features, finish === "silver" ? "Aluminium chassis" : "Magnesium chassis"],
    warranty: { years: wy, partsYears: wy, notes: "Battery covered for 1 year or 300 cycles." },
    images: [`/images/products/${key}.svg`, pick(images.laptops, index), pick(images.laptops, index + 4), pick(images.business, index + 6)],
    rating: stars, reviewCount: reviews, suitabilityScore, evidenceCoverage: evidence, scoreFactors,
    aiSummary: [
      claim(id, 20, "ai", `The ${brand.name} ${name} is a ${type.toLowerCase()} laptop scoring ${suitabilityScore}/10 for typical priorities.`, ["spec"]),
      claim(id, 21, "measured", `Measured battery life is ${measured} h against a claimed ${claimed} h.`, ["lab", "maker"]),
      claim(id, 22, "customer", `Owners ${stars >= 4.4 ? "praise its keyboard and build" : "like the price but note battery and screen compromises"}.`, ["customers"]),
    ],
    strengths, limitations,
    bestFor: [type === "Gaming" ? "PC gaming" : type === "Creator" ? "Photo & video editing" : type === "Business" ? "Office & travel" : "Students & everyday use", ...(kg <= 1.3 ? ["Frequent travellers"] : [])],
    notFor: [...(kg >= 2 ? ["Daily commuting"] : []), ...(!gpu ? ["Modern AAA gaming"] : []), ...(ram <= 8 ? ["Heavy multitasking"] : [])],
    specs: [
      { id: "performance", label: "Performance", items: [
        { key: "cpu", label: "Processor", value: cpu, claimType: "manufacturer", sourceId: src("spec") },
        { key: "ram", label: "Memory", value: ram, unit: "GB", claimType: "manufacturer", sourceId: src("spec"), numeric: ram, better: "higher" },
        { key: "storage", label: "Storage", value: storage, unit: "GB", claimType: "manufacturer", sourceId: src("spec"), numeric: storage, better: "higher" },
        { key: "bench", label: "Multi-core benchmark", value: benchmark, claimType: "measured", sourceId: src("lab"), numeric: benchmark, better: "higher" },
      ] },
      { id: "battery", label: "Battery", items: [
        { key: "claimed", label: "Claimed battery life", value: claimed, unit: "h", claimType: "manufacturer", sourceId: src("maker"), numeric: claimed, better: "higher" },
        { key: "measured", label: "Measured battery life", value: measured, unit: "h", claimType: "measured", sourceId: src("lab"), numeric: measured, better: "higher" },
        { key: "wh", label: "Battery capacity", value: batteryWh, unit: "Wh", claimType: "manufacturer", sourceId: src("spec"), numeric: batteryWh, better: "higher" },
      ] },
      { id: "dimensions", label: "Size & weight", items: [
        { key: "screen", label: "Screen", value: screen, unit: "in", claimType: "manufacturer", sourceId: src("spec"), numeric: screen },
        { key: "weight", label: "Weight", value: kg, unit: "kg", claimType: "measured", sourceId: src("lab"), numeric: kg, better: "lower" },
        { key: "thickness", label: "Thickness", value: t, unit: "mm", claimType: "manufacturer", sourceId: src("spec"), numeric: t, better: "lower" },
        { key: "temp", label: "Surface temp under load", value: surfaceTemp, unit: "°C", claimType: "measured", sourceId: src("lab"), numeric: surfaceTemp, better: "lower" },
      ] },
      { id: "features", label: "Features", items: Object.entries(FEATURES).map(([c, label]) => ({ key: `f-${c}`, label, value: has(c), claimType: "manufacturer" as const, sourceId: src("spec") })) },
      { id: "warranty", label: "Warranty & repair", items: [
        { key: "warranty", label: "Warranty", value: wy, unit: "years", claimType: "manufacturer", sourceId: src("spec"), numeric: wy, better: "higher" },
        { key: "repair", label: "Repairability", value: repairability, unit: "/10", claimType: "expert", sourceId: src("review"), numeric: repairability, better: "higher" },
      ] },
    ],
    faqs: [
      { question: "How long does the battery really last?", answer: `${measured} h in our partner lab's 150-nit browsing test, versus the claimed ${claimed} h.`, sourceIds: [src("lab"), src("maker")] },
      { question: "Can I upgrade the memory?", answer: has("U") ? "Yes — two SO-DIMM slots support up to 64 GB." : "No — memory is soldered to the motherboard.", sourceIds: [src("manual")] },
      { question: "Does it charge over USB-C?", answer: `Yes, ${gpu ? "for light use; full performance needs the barrel charger" : "with a 65 W or higher USB-C PD charger"}.`, sourceIds: [src("manual")] },
    ],
    sourceIds: sources.map((x) => x.id),
    warnings: [
      ...freshnessWarnings(freshness, lastVerified, evidence, id),
      ...(measured / claimed < 0.7 ? [{ kind: "unverified" as const, title: "Battery claim not supported", detail: `${brand.name} claims up to ${claimed} h; independent testing measured ${measured} h.`, sourceIds: [src("maker"), src("lab")] }] : []),
    ],
    installation: { ventilationMm: null, doorSwingMm: null, notes: ["Keep vents unobstructed on soft surfaces."] },
    barcode: ean13(key), releaseYear: year, lastUpdated: lastVerified, lastVerified, freshness,
    badges: [...(suitabilityScore >= 8.2 ? ["Top rated"] : []), ...(orig ? ["Price drop"] : [])],
  };
}

export const laptops: Product[] = laptopRows.map(build);
