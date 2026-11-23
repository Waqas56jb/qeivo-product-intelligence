import type { PricePoint } from "@/types";
import { hash } from "@/lib/utils";
import { getProduct } from "../products";

/**
 * 52 weekly observations ending 23 Nov 2026 per product. Deterministic:
 * gentle seasonal drift, promotional dips around Black Friday / Presidents' Day,
 * converging to the current reference price.
 */
export function priceHistory(productId: string): PricePoint[] {
  const p = getProduct(productId);
  if (!p) return [];
  const h = hash(productId);
  const start = new Date("2025-12-01T00:00:00Z").getTime();
  const base = p.originalPrice ?? p.price * 1.06;
  const points: PricePoint[] = [];
  for (let i = 0; i < 52; i++) {
    const date = new Date(start + i * 7 * 86_400_000);
    const t = i / 51;
    const drift = base + (p.price - base) * Math.pow(t, 1.6);
    const wave = Math.sin((i + (h % 9)) / 4.2) * p.price * 0.018;
    const promo = i === 11 || i === 12 || i === 26 || i === 50 ? -p.price * (0.05 + (h % 4) / 100) : 0;
    const noise = ((hash(`${productId}-${i}`) % 9) - 4) * p.price * 0.003;
    const value = i === 51 ? p.price : drift + wave + promo + noise;
    points.push({ date: date.toISOString().slice(0, 10), price: Math.round(value / 5) * 5 - (value > 100 ? 1 : 0) });
  }
  return points;
}

export function priceStats(productId: string) {
  const pts = priceHistory(productId);
  const prices = pts.map((p) => p.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const current = prices[prices.length - 1];
  return { low, high, avg, current, isLow: current <= low * 1.02 };
}
