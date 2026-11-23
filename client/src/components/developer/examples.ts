/**
 * Illustrative request/response examples for the API preview, built from the real seed data so
 * shapes match what the app shows. Suitability and evidence coverage are always separate fields.
 */
import type { Product } from "@/types";
import { getBrand, getProduct } from "@/data/products";
import { sourcesForProduct } from "@/data/sources/sources";
import { API_BASE, type HttpMethod } from "./dev-data";
import type { CodeExample } from "./code-block";

const KEY_ENV = "QEIVO_API_KEY";

export function requestExamples(method: HttpMethod, path: string, body?: Record<string, unknown>): CodeExample[] {
  const url = `${API_BASE}${path}`;
  const json = body ? JSON.stringify(body, null, 2) : undefined;
  const curl = [`curl -X ${method} "${url}"`, `  -H "Authorization: Bearer $${KEY_ENV}"`, ...(json ? [`  -H "Content-Type: application/json"`, `  -d '${json.replace(/\n/g, "\n  ")}'`] : [])].join(" \\\n");
  const js = [
    `const res = await fetch("${url}", {`,
    `  method: "${method}",`,
    `  headers: {`,
    `    Authorization: \`Bearer \${process.env.${KEY_ENV}}\`,`,
    ...(json ? [`    "Content-Type": "application/json",`] : []),
    `  },`,
    ...(json ? [`  body: JSON.stringify(${json.replace(/\n/g, "\n  ")}),`] : []),
    `});`,
    ``,
    `if (!res.ok) throw new Error(\`Qeivo API \${res.status}\`);`,
    `const data = await res.json();`,
  ].join("\n");
  const py = [
    `import os`,
    `import requests`,
    ``,
    `res = requests.${method.toLowerCase()}(`,
    `    "${url}",`,
    `    headers={"Authorization": f"Bearer {os.environ['${KEY_ENV}']}"},`,
    ...(json ? [`    json=${json.replace(/true/g, "True").replace(/false/g, "False").replace(/null/g, "None").replace(/\n/g, "\n    ")},`] : []),
    `    timeout=10,`,
    `)`,
    `res.raise_for_status()`,
    `data = res.json()`,
  ].join("\n");
  return [
    { label: "cURL", language: "bash", code: curl },
    { label: "JavaScript", language: "javascript", code: js },
    { label: "Python", language: "python", code: py },
  ];
}

function sourceRefs(p: Product, limit = 4) {
  return sourcesForProduct(p.id)
    .slice(0, limit)
    .map((s) => ({ id: s.id, type: s.type, title: s.title, publisher: s.publisher, locator: s.locator, retrieved_at: s.retrievedAt.slice(0, 10) }));
}

export function productResource(p: Product) {
  return {
    id: p.id,
    object: "product",
    slug: p.slug,
    brand: getBrand(p.brandId)?.name ?? p.brandId,
    name: p.name,
    model_number: p.modelNumber,
    category: p.category,
    type: p.type,
    price: { amount: p.price, currency: "USD", region: "US" },
    dimensions_mm: { width: p.dimensions.widthMm, height: p.dimensions.heightMm, depth: p.dimensions.depthMm },
    capacity: { value: p.capacity.value, unit: p.capacity.unit },
    energy: { rating: p.energy.rating, annual_kwh: p.energy.annualKwh },
    warranty: { years: p.warranty.years, extended: p.warranty.extended ?? null },
    suitability: {
      score: p.suitabilityScore,
      scale: 10,
      factors: p.scoreFactors.slice(0, 3).map((f) => ({ key: f.key, label: f.label, score: f.score, weight: f.weight, confidence: f.confidence })),
    },
    evidence: {
      coverage: p.evidenceCoverage / 100,
      freshness: p.freshness,
      last_verified: p.lastVerified,
      warnings: p.warnings.map((w) => ({ kind: w.kind, title: w.title })),
    },
    sources: sourceRefs(p),
    sponsored: Boolean(p.sponsored),
  };
}

export const SAMPLE_PRODUCT_ID = "p-nordvik-frostline-fd600";

export function sampleProduct(): Product {
  const p = getProduct(SAMPLE_PRODUCT_ID);
  if (!p) throw new Error("Sample product missing from seed data");
  return p;
}

export function analysisResource(p: Product) {
  const claims = [...p.strengths.slice(0, 2), ...p.limitations.slice(0, 1)];
  return {
    product_id: p.id,
    object: "analysis",
    generated_at: p.lastUpdated,
    claims: claims.map((c) => ({ id: c.id, text: c.text, claim_type: c.type, source_ids: c.sourceIds })),
    sources: sourceRefs(p, 3),
  };
}

export function compareResource(ids: string[]) {
  const ps = ids.map((id) => getProduct(id)).filter((x): x is Product => Boolean(x));
  return {
    object: "comparison",
    products: ps.map((p) => ({ id: p.id, name: p.name, price: { amount: p.price, currency: "USD" }, suitability: { score: p.suitabilityScore, scale: 10 }, evidence: { coverage: p.evidenceCoverage / 100 } })),
    differences: [
      { field: "energy.annual_kwh", values: Object.fromEntries(ps.map((p) => [p.id, p.energy.annualKwh])), better: "lower" },
      { field: "dimensions_mm.width", values: Object.fromEntries(ps.map((p) => [p.id, p.dimensions.widthMm])), better: null },
    ],
    note: "Suitability and evidence coverage are reported separately and are never combined.",
  };
}

export const json = (v: unknown) => JSON.stringify(v, null, 2);
