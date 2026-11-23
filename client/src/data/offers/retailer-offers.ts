import type { RetailerOffer } from "@/types";
import { hash } from "@/lib/utils";
import { products } from "../products";
import { retailers } from "./retailers";

const STOCK: RetailerOffer["stock"][] = ["in-stock", "in-stock", "in-stock", "low-stock", "in-stock", "out-of-stock", "in-stock", "preorder"];
const DELIVERY = ["Free delivery in 2–4 days", "Next-day delivery $29", "Free delivery & installation", "Click & collect today", "Delivery in 5–7 days", "Free delivery, old appliance removal $25"];

/** 3–4 offers per product, deterministic. Prices vary ±6% around the reference price. */
export const retailerOffers: RetailerOffer[] = products.flatMap((p) => {
  const h = hash(p.id);
  const count = 3 + (h % 2);
  return Array.from({ length: count }, (_, i) => {
    const r = retailers[(h + i * 2) % retailers.length];
    const delta = ((hash(`${p.id}-${i}`) % 13) - 6) / 100;
    const price = Math.round((p.price * (1 + delta)) / 10) * 10 - 1;
    const hour = String(6 + ((h + i) % 14)).padStart(2, "0");
    const day = String(20 + ((h + i) % 3)).padStart(2, "0");
    return {
      id: `of-${p.slug}-${i}`,
      productId: p.id,
      retailer: r.name,
      retailerLogo: r.short,
      region: p.regions[i % p.regions.length],
      price,
      stock: STOCK[(h + i * 3) % STOCK.length],
      delivery: DELIVERY[(h + i) % DELIVERY.length],
      observedAt: `2026-11-${day}T${hour}:${String((h * (i + 1)) % 60).padStart(2, "0")}:00Z`,
      validUntil: `2026-12-${String(5 + ((h + i) % 20)).padStart(2, "0")}`,
      affiliate: i !== 2,
      sponsored: i === 0 && h % 5 === 0,
      supplierId: r.supplierId,
      clicks: 40 + (hash(`${p.id}-c${i}`) % 900),
    } satisfies RetailerOffer;
  }).sort((a, b) => a.price - b.price);
});

export function offersForProduct(productId: string) {
  return retailerOffers.filter((o) => o.productId === productId);
}
