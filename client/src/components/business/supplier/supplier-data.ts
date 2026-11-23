import type { RegionCode, RetailerOffer } from "@/types";
import { retailerOffers } from "@/data/offers/retailer-offers";
import { SUPPLIER_ID, offerPerformance } from "@/data/analytics/supplier";
import { getProduct } from "@/data/products";
import { formatCurrency, regionalPrice } from "@/lib/format";
import { DEMO_NOW, hash } from "@/lib/utils";
import type { Tone } from "../primitives";

export type StockState = RetailerOffer["stock"];

export const STOCK_META: Record<StockState, { label: string; tone: Tone }> = {
  "in-stock": { label: "In stock", tone: "success" },
  "low-stock": { label: "Low stock", tone: "warning" },
  "out-of-stock": { label: "Out of stock", tone: "danger" },
  preorder: { label: "Pre-order", tone: "info" },
};

export const RETAILER_DOMAIN = "larderandco.example";

/** Supplier-managed offer. `price` is the local retail price in the region's currency. */
export interface SupplierOffer {
  id: string;
  productId: string;
  region: RegionCode;
  price: number;
  stock: StockState;
  delivery: string;
  validFrom: string;
  validUntil: string;
  urlPath: string;
  affiliate: boolean;
  sponsored: boolean;
  clicks: number;
  impressions: number;
  /** Seeded offers came from the catalogue; created ones are local demo drafts */
  origin: "catalogue" | "demo";
}

const perfById = new Map(offerPerformance.map((o) => [o.offerId, o]));

export const seededOffers: SupplierOffer[] = retailerOffers
  .filter((o) => o.supplierId === SUPPLIER_ID)
  .map((o): SupplierOffer => {
    const p = getProduct(o.productId);
    const h = hash(o.id);
    const perf = perfById.get(o.id);
    return {
      id: o.id,
      productId: o.productId,
      region: o.region,
      price: regionalPrice(o.price, o.region),
      stock: o.stock,
      delivery: o.delivery,
      validFrom: `2026-11-${String(1 + (h % 18)).padStart(2, "0")}`,
      validUntil: o.validUntil,
      urlPath: `p/${p?.slug ?? o.productId}`,
      affiliate: o.affiliate,
      sponsored: o.sponsored,
      clicks: perf?.clicks ?? o.clicks ?? 0,
      impressions: perf?.impressions ?? 0,
      origin: "catalogue",
    };
  })
  .sort((a, b) => b.clicks - a.clicks);

/** Lowest competing price for a product, converted to the offer's region. */
export function marketLow(productId: string, region: RegionCode): number {
  const others = retailerOffers.filter((o) => o.productId === productId && o.supplierId !== SUPPLIER_ID);
  if (!others.length) return 0;
  return Math.min(...others.map((o) => regionalPrice(o.price, region)));
}

/** 1 = cheapest among all retailers for this product (in this region's currency). */
export function priceRank(offer: Pick<SupplierOffer, "productId" | "region" | "price">): { rank: number; of: number } {
  const others = retailerOffers.filter((o) => o.productId === offer.productId && o.supplierId !== SUPPLIER_ID);
  const rank = others.filter((o) => regionalPrice(o.price, offer.region) < offer.price).length + 1;
  return { rank, of: others.length + 1 };
}

export const money = (value: number, region: RegionCode) => formatCurrency(value, region);

export function daysUntil(iso: string): number {
  return Math.ceil((new Date(`${iso}T23:59:59Z`).getTime() - DEMO_NOW.getTime()) / 86_400_000);
}

export type OfferStatus = "live" | "scheduled" | "expiring" | "expired";

export function offerStatus(o: Pick<SupplierOffer, "validFrom" | "validUntil">): OfferStatus {
  const left = daysUntil(o.validUntil);
  if (left < 0) return "expired";
  if (new Date(`${o.validFrom}T00:00:00Z`) > DEMO_NOW) return "scheduled";
  return left <= 14 ? "expiring" : "live";
}

export const OFFER_STATUS_META: Record<OfferStatus, { label: string; tone: Tone }> = {
  live: { label: "Live", tone: "success" },
  scheduled: { label: "Scheduled", tone: "info" },
  expiring: { label: "Expiring soon", tone: "warning" },
  expired: { label: "Expired", tone: "neutral" },
};
