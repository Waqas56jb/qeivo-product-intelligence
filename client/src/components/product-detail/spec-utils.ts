import type { Product, SpecItem } from "@/types";
import { products } from "@/data/products";

/** Static params for every /app/products/[slug]/** route. */
export function productStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function allSpecItems(product: Product): SpecItem[] {
  return product.specs.flatMap((g) => g.items);
}

export function getSpecItem(product: Product, key: string): SpecItem | undefined {
  return allSpecItems(product).find((i) => i.key === key);
}

/** Human-readable spec value. Booleans are rendered by the caller as check / cross. */
export function formatSpecValue(item: SpecItem): string {
  if (typeof item.value === "boolean") return item.value ? "Yes" : "No";
  const v = typeof item.value === "number" ? item.value.toLocaleString("en-US") : item.value;
  if (!item.unit) return String(v);
  if (item.unit === "/10" || item.unit === "%" || item.unit === "°C") return `${v}${item.unit === "°C" ? " °C" : item.unit}`;
  return `${v} ${item.unit}`;
}

/** Energy ratings on the A–G label scale (laptops use measured battery hours instead). */
export const ENERGY_SCALE = ["A", "B", "C", "D", "E", "F", "G"] as const;
export function isLabelRating(rating: string): rating is (typeof ENERGY_SCALE)[number] {
  return (ENERGY_SCALE as readonly string[]).includes(rating);
}

/** Category average of a numeric accessor — used for "vs category average" notes. */
export function categoryAverage(product: Product, pick: (p: Product) => number): number {
  const peers = products.filter((p) => p.category === product.category);
  return peers.reduce((s, p) => s + pick(p), 0) / Math.max(1, peers.length);
}

export function relatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .map((p) => ({ p, d: Math.abs(p.price - product.price) / product.price + (p.type === product.type ? 0 : 0.35) }))
    .sort((a, b) => a.d - b.d || b.p.suitabilityScore - a.p.suitabilityScore)
    .slice(0, limit)
    .map((x) => x.p);
}
