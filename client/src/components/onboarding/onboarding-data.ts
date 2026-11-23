import { Laptop, Refrigerator, Tv, WashingMachine } from "lucide-react";
import type { CategorySlug, RegionCode, ScoreFactorKey } from "@/types";
import type { PriorityLevel } from "@/lib/scoring";

export const CATEGORY_ICON = { refrigerator: Refrigerator, "washing-machine": WashingMachine, tv: Tv, laptop: Laptop } as const;

export const FACTORS: { key: ScoreFactorKey; label: string; hint: string }[] = [
  { key: "performance", label: "Performance", hint: "Cooling, washing, picture or speed — measured where possible" },
  { key: "energy", label: "Energy efficiency", hint: "Measured running cost, not just the label" },
  { key: "value", label: "Value for money", hint: "Price against what you actually get" },
  { key: "reliability", label: "Reliability", hint: "Owner-reported faults and brand track record" },
  { key: "capacity", label: "Capacity & layout", hint: "Usable space for your household" },
  { key: "space", label: "Space compatibility", hint: "Fit, clearances and installation" },
  { key: "maintenance", label: "Maintenance", hint: "Cleaning, filters and running upkeep" },
  { key: "warranty", label: "Warranty", hint: "Length and what's actually covered" },
];

export const LEVELS: { value: Exclude<PriorityLevel, 0>; label: string }[] = [
  { value: 1, label: "Minor" },
  { value: 2, label: "Standard" },
  { value: 3, label: "Important" },
  { value: 4, label: "Critical" },
];

export type WaterSupply = "plumbed" | "none" | "unsure";

export interface OnboardingDraft {
  interests: CategorySlug[];
  household: number;
  budget: [number, number];
  space: { width: string; height: string; depth: string; door: string; water: WaterSupply };
  spaceSkipped: boolean;
  brands: string[];
  energy: "low" | "balanced" | "high";
  region: RegionCode;
  review: "verified-only" | "all";
  priorities: Record<ScoreFactorKey, Exclude<PriorityLevel, 0>>;
}

export const BUDGET_MIN = 200;
export const BUDGET_MAX = 6000;

export const BUDGET_PRESETS: { label: string; range: [number, number] }[] = [
  { label: "Under $800", range: [200, 800] },
  { label: "$800 – $1,500", range: [800, 1500] },
  { label: "$1,500 – $3,000", range: [1500, 3000] },
  { label: "$3,000+", range: [3000, 6000] },
];

export const initialDraft = (): OnboardingDraft => ({
  interests: [],
  household: 2,
  budget: [800, 2500],
  space: { width: "", height: "", depth: "", door: "", water: "unsure" },
  spaceSkipped: false,
  brands: [],
  energy: "balanced",
  region: "US",
  review: "verified-only",
  priorities: { performance: 2, energy: 2, value: 2, reliability: 3, capacity: 2, space: 2, maintenance: 2, warranty: 2 },
});
