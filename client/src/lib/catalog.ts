import type { CategorySlug, Product } from "@/types";
import { getBrand } from "@/data/products/brands";
import { personalScore, type Priorities } from "./scoring";

export type SortKey = "relevance" | "score" | "price-asc" | "price-desc" | "rating" | "evidence" | "energy" | "newest";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Best match" },
  { value: "score", label: "Suitability score" },
  { value: "evidence", label: "Evidence coverage" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Owner rating" },
  { value: "energy", label: "Lowest energy use" },
  { value: "newest", label: "Newest" },
];

export interface CatalogFilters {
  query: string;
  category: CategorySlug | "all";
  brands: string[];
  types: string[];
  features: string[];
  energyRatings: string[];
  priceMin: number | null;
  priceMax: number | null;
  capacityMin: number | null;
  capacityMax: number | null;
  maxWidth: number | null;
  maxHeight: number | null;
  maxDepth: number | null;
  minScore: number | null;
}

export const EMPTY_FILTERS: CatalogFilters = {
  query: "",
  category: "all",
  brands: [],
  types: [],
  features: [],
  energyRatings: [],
  priceMin: null,
  priceMax: null,
  capacityMin: null,
  capacityMax: null,
  maxWidth: null,
  maxHeight: null,
  maxDepth: null,
  minScore: null,
};

/** Lightweight relevance scoring over brand, model, type, features and tagline. */
export function matchScore(product: Product, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const brand = getBrand(product.brandId).name.toLowerCase();
  const hay = `${brand} ${product.model} ${product.modelNumber} ${product.type} ${product.category} ${product.features.join(" ")} ${product.tagline}`.toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const t of terms) {
    if (!hay.includes(t)) return 0;
    score += 1;
    if (brand.startsWith(t)) score += 2;
    if (product.model.toLowerCase().includes(t)) score += 1.5;
    if (product.modelNumber.toLowerCase().includes(t)) score += 3;
  }
  return score;
}

export function searchProducts(products: Product[], query: string, limit = 8): Product[] {
  return products
    .map((p) => ({ p, s: matchScore(p, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || b.p.suitabilityScore - a.p.suitabilityScore)
    .slice(0, limit)
    .map((x) => x.p);
}

export function filterProducts(products: Product[], f: CatalogFilters): Product[] {
  return products.filter((p) => {
    if (f.category !== "all" && p.category !== f.category) return false;
    if (f.query && matchScore(p, f.query) === 0) return false;
    if (f.brands.length && !f.brands.includes(p.brandId)) return false;
    if (f.types.length && !f.types.includes(p.type)) return false;
    if (f.features.length && !f.features.every((feat) => p.features.includes(feat))) return false;
    if (f.energyRatings.length && !f.energyRatings.includes(p.energy.rating)) return false;
    if (f.priceMin !== null && p.price < f.priceMin) return false;
    if (f.priceMax !== null && p.price > f.priceMax) return false;
    if (f.capacityMin !== null && p.capacity.value < f.capacityMin) return false;
    if (f.capacityMax !== null && p.capacity.value > f.capacityMax) return false;
    if (f.maxWidth !== null && p.dimensions.widthMm > f.maxWidth) return false;
    if (f.maxHeight !== null && p.dimensions.heightMm > f.maxHeight) return false;
    if (f.maxDepth !== null && p.dimensions.depthMm > f.maxDepth) return false;
    if (f.minScore !== null && p.suitabilityScore < f.minScore) return false;
    return true;
  });
}

export function sortProducts(products: Product[], sort: SortKey, query = "", priorities: Priorities = {}): Product[] {
  const list = [...products];
  switch (sort) {
    case "score":
      return list.sort((a, b) => personalScore(b, priorities) - personalScore(a, priorities));
    case "evidence":
      return list.sort((a, b) => b.evidenceCoverage - a.evidenceCoverage);
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "rating":
      return list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "energy":
      return list.sort((a, b) => a.energy.annualKwh - b.energy.annualKwh);
    case "newest":
      return list.sort((a, b) => b.releaseYear - a.releaseYear || b.lastVerified.localeCompare(a.lastVerified));
    default:
      return list.sort((a, b) => matchScore(b, query) - matchScore(a, query) || personalScore(b, priorities) - personalScore(a, priorities));
  }
}

export function activeFilterCount(f: CatalogFilters) {
  return (
    f.brands.length +
    f.types.length +
    f.features.length +
    f.energyRatings.length +
    (f.priceMin !== null || f.priceMax !== null ? 1 : 0) +
    (f.capacityMin !== null || f.capacityMax !== null ? 1 : 0) +
    (f.maxWidth !== null ? 1 : 0) +
    (f.maxHeight !== null ? 1 : 0) +
    (f.maxDepth !== null ? 1 : 0) +
    (f.minScore !== null ? 1 : 0)
  );
}
