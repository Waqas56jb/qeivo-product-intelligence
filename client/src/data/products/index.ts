import type { CategorySlug, Product, SourceReference } from "@/types";
import { refrigerators, fridgeSources } from "./refrigerators";
import { washingMachines, washerSources } from "./washing-machines";
import { televisions, tvSources } from "./televisions";
import { laptops, laptopSources } from "./laptops";

export { brands, brandById, getBrand } from "./brands";
export { categories, categoryBySlug, getCategory } from "./categories";
export { refrigerators, washingMachines, televisions, laptops };

export const products: Product[] = [...refrigerators, ...washingMachines, ...televisions, ...laptops];

export const productById = new Map(products.map((p) => [p.id, p]));
export const productBySlug = new Map(products.map((p) => [p.slug, p]));

export function getProduct(idOrSlug: string): Product | undefined {
  return productById.get(idOrSlug) ?? productBySlug.get(idOrSlug);
}

/** Use only where the id is guaranteed by seed relationships. */
export function requireProduct(idOrSlug: string): Product {
  const p = getProduct(idOrSlug);
  if (!p) throw new Error(`Unknown product ${idOrSlug}`);
  return p;
}

export function productsByCategory(category: CategorySlug): Product[] {
  return products.filter((p) => p.category === category);
}

export const productSources: SourceReference[] = [...fridgeSources, ...washerSources, ...tvSources, ...laptopSources];
