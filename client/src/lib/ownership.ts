import type { Product } from "@/types";

export interface OwnershipInputs {
  purchasePrice: number;
  tariff: number;
  /** Fraction of rated annual consumption the household expects (0.5–1.5) */
  usageFactor: number;
  years: number;
  accessories: number;
  maintenancePerYear: number;
}

export interface OwnershipBreakdown {
  purchase: number;
  energy: number;
  maintenance: number;
  accessories: number;
  total: number;
  perYear: number;
  annualKwh: number;
  yearly: { year: number; purchase: number; energy: number; maintenance: number; accessories: number; cumulative: number }[];
}

/** Default maintenance cost per year by category (filters, descaling, cleaning products). */
export function defaultMaintenance(product: Product): number {
  if (product.category === "refrigerators") return product.features.some((f) => /filter|dispenser|ice maker/i.test(f)) ? 65 : 15;
  if (product.category === "washing-machines") return 28;
  if (product.category === "televisions") return 0;
  return 20;
}

export function defaultAnnualKwh(product: Product): number {
  const measured = product.specs.flatMap((g) => g.items).find((i) => i.key === "kwh-measured");
  return typeof measured?.numeric === "number" ? measured.numeric : product.energy.annualKwh;
}

export function ownershipCost(product: Product, input: OwnershipInputs): OwnershipBreakdown {
  const annualKwh = Math.round(defaultAnnualKwh(product) * input.usageFactor);
  const energyPerYear = annualKwh * input.tariff;
  const yearly: OwnershipBreakdown["yearly"] = [];
  let cumulative = input.purchasePrice + input.accessories;
  for (let y = 1; y <= input.years; y++) {
    // Assume 2.5% annual tariff inflation for a realistic projection.
    const energy = energyPerYear * Math.pow(1.025, y - 1);
    cumulative += energy + input.maintenancePerYear;
    yearly.push({
      year: y,
      purchase: y === 1 ? input.purchasePrice : 0,
      energy: Math.round(energy),
      maintenance: Math.round(input.maintenancePerYear),
      accessories: y === 1 ? input.accessories : 0,
      cumulative: Math.round(cumulative),
    });
  }
  const energy = yearly.reduce((s, y) => s + y.energy, 0);
  const maintenance = input.maintenancePerYear * input.years;
  const total = input.purchasePrice + input.accessories + energy + maintenance;
  return {
    purchase: input.purchasePrice,
    energy: Math.round(energy),
    maintenance: Math.round(maintenance),
    accessories: input.accessories,
    total: Math.round(total),
    perYear: Math.round(total / input.years),
    annualKwh,
    yearly,
  };
}
