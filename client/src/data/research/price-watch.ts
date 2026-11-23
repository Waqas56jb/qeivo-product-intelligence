import type { PriceWatch } from "@/types";

export const priceWatches: PriceWatch[] = [
  { productId: "p-nordvik-frostline-fd540-cd", targetPrice: 2399, createdAt: "2026-10-03T18:02:00Z" },
  { productId: "p-ovea-eco-fd520", targetPrice: 1899, createdAt: "2026-10-05T10:15:00Z" },
  { productId: "p-brightwater-family-fd560", targetPrice: 1749, createdAt: "2026-10-10T20:40:00Z" },
  { productId: "p-halden-pureclean-w9", targetPrice: 899, createdAt: "2026-10-15T08:00:00Z" },
  { productId: "p-tervo-air-14", targetPrice: 1149, createdAt: "2026-11-13T07:45:00Z" },
  { productId: "p-lumora-vivid-oled65", targetPrice: 1899, createdAt: "2026-11-18T21:20:00Z" },
];

export function watchForProduct(productId: string): PriceWatch | undefined {
  return priceWatches.find((w) => w.productId === productId);
}
