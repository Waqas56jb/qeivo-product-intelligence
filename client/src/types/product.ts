import type { Claim, Confidence, DataFreshness, DataWarning } from "./evidence";

export type CategorySlug = "refrigerators" | "washing-machines" | "televisions" | "laptops";

export type RegionCode = "US" | "UK" | "EU" | "AU" | "CA";

export interface Region {
  code: RegionCode;
  name: string;
  currency: "USD" | "GBP" | "EUR" | "AUD" | "CAD";
  locale: string;
  /** Multiplier applied to USD base prices for demo regional pricing */
  priceFactor: number;
  /** Default electricity tariff in local currency per kWh */
  tariff: number;
  flag: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  origin: string;
  founded: number;
  tagline: string;
  categories: CategorySlug[];
  /** Short monogram used in brand marks */
  mark: string;
  color: string;
  reliabilityIndex: number;
}

export interface Dimensions {
  /** millimetres */
  widthMm: number;
  heightMm: number;
  depthMm: number;
  weightKg: number;
}

export interface ProductVariant {
  id: string;
  label: string;
  modelNumber: string;
  priceDelta: number;
  finish?: string;
}

/** Score factors are category-agnostic keys with category-specific labels. */
export type ScoreFactorKey =
  | "performance"
  | "energy"
  | "value"
  | "reliability"
  | "capacity"
  | "space"
  | "maintenance"
  | "warranty";

export interface ScoreFactor {
  key: ScoreFactorKey;
  label: string;
  /** 0–10 */
  score: number;
  /** Default weight before personalisation, 0–1 (all weights sum to 1) */
  weight: number;
  explanation: string;
  confidence: Confidence;
}

export interface SpecItem {
  key: string;
  label: string;
  value: string | number | boolean;
  unit?: string;
  claimType: "manufacturer" | "measured" | "expert";
  sourceId?: string;
  /** Specs that should be compared numerically */
  numeric?: number;
  /** Higher is better? used for comparison highlighting */
  better?: "higher" | "lower";
}

export interface SpecGroup {
  id: string;
  label: string;
  items: SpecItem[];
}

export interface ProductFAQ {
  question: string;
  answer: string;
  sourceIds: string[];
}

export interface PricePoint {
  /** ISO date */
  date: string;
  price: number;
}

export interface EnergyInfo {
  rating: string;
  /** kWh per year (or equivalent annualised use) */
  annualKwh: number;
  label: string;
  standbyW?: number;
}

export interface Warranty {
  years: number;
  partsYears: number;
  /** e.g. "10-year compressor" */
  extended?: string;
  notes: string;
}

export interface Product {
  id: string;
  slug: string;
  brandId: string;
  name: string;
  model: string;
  modelNumber: string;
  category: CategorySlug;
  type: string;
  tagline: string;
  description: string;
  variants: ProductVariant[];
  regions: RegionCode[];
  /** USD base price */
  price: number;
  originalPrice?: number;
  dimensions: Dimensions;
  /** Headline capacity, category-specific unit (L, kg, inch, GB) */
  capacity: { value: number; unit: string; label: string };
  energy: EnergyInfo;
  features: string[];
  warranty: Warranty;
  images: string[];
  rating: number;
  reviewCount: number;
  suitabilityScore: number;
  evidenceCoverage: number;
  scoreFactors: ScoreFactor[];
  aiSummary: Claim[];
  strengths: Claim[];
  limitations: Claim[];
  bestFor: string[];
  notFor: string[];
  specs: SpecGroup[];
  faqs: ProductFAQ[];
  sourceIds: string[];
  warnings: DataWarning[];
  /** Installation constraints used by the compatibility checker */
  installation: {
    ventilationMm: { sides: number; top: number; back: number } | null;
    doorSwingMm: number | null;
    notes: string[];
  };
  barcode: string;
  releaseYear: number;
  lastUpdated: string;
  lastVerified: string;
  freshness: DataFreshness;
  sponsored?: boolean;
  badges?: string[];
}

export interface CategoryInfo {
  slug: CategorySlug;
  name: string;
  singular: string;
  description: string;
  heroImage: string;
  icon: "refrigerator" | "washing-machine" | "tv" | "laptop";
  considerations: { title: string; body: string }[];
  capacityLabel: string;
  types: string[];
  featureFilters: string[];
  factorLabels: Record<ScoreFactorKey, string>;
}
