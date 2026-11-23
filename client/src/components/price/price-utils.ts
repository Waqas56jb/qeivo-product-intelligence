import type { RegionCode, RetailerOffer } from "@/types";
import { offersForProduct } from "@/data/offers/retailer-offers";
import { getProduct } from "@/data/products";
import { REGIONS } from "@/lib/format";

/** Offers observed in the region; falls back to every region with an honest flag. */
export function regionalOffers(productId: string, region: RegionCode): { offers: RetailerOffer[]; fallback: boolean } {
  const all = offersForProduct(productId);
  const local = all.filter((o) => o.region === region);
  return local.length ? { offers: local, fallback: false } : { offers: all, fallback: true };
}

/** Lowest observed USD-base price for a product in the region (falls back to the reference price). */
export function lowestPrice(productId: string, region: RegionCode): number {
  const { offers } = regionalOffers(productId, region);
  const inStock = offers.filter((o) => o.stock !== "out-of-stock");
  const pool = inStock.length ? inStock : offers;
  if (!pool.length) return getProduct(productId)?.price ?? 0;
  return Math.min(...pool.map((o) => o.price));
}

/** Convert an amount typed in the region's currency back to the USD base used by the store. */
export function toUsdBase(amount: number, region: RegionCode) {
  return Math.round(amount / REGIONS[region].priceFactor);
}

export const STOCK_META: Record<RetailerOffer["stock"], { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
  "in-stock": { label: "In stock", variant: "success" },
  "low-stock": { label: "Low stock", variant: "warning" },
  "out-of-stock": { label: "Out of stock", variant: "danger" },
  preorder: { label: "Pre-order", variant: "info" },
};
