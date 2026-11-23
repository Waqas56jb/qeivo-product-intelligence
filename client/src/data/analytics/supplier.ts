import type { DailyPoint, KpiStat, OfferPerformanceRow } from "@/types";
import { hash, round } from "@/lib/utils";
import { retailerOffers } from "../offers/retailer-offers";

/** Analytics for the demo supplier co-larder (Larder & Co). */
export const SUPPLIER_ID = "co-larder";

const END = Date.UTC(2026, 10, 23);
const DAY = 86_400_000;

export const supplierDaily: DailyPoint[] = Array.from({ length: 30 }, (_, i) => {
  const t = END - (29 - i) * DAY;
  const date = new Date(t).toISOString().slice(0, 10);
  const dow = new Date(t).getUTCDay();
  const h = hash(`larder-${date}`);
  const weekendBoost = dow === 0 || dow === 6 ? 1.22 : 1;
  const preBlackFriday = i >= 24 ? 1 + (i - 23) * 0.09 : 1;
  const views = Math.round((5200 + (h % 900)) * weekendBoost * preBlackFriday);
  const clicks = Math.round(views * (0.071 + (h % 15) / 1000));
  const conversions = Math.round(clicks * (0.034 + (h % 9) / 1000));
  return { date, views, clicks, conversions, revenue: conversions * (1280 + (h % 600)) };
});

const larderOffers = retailerOffers.filter((o) => o.supplierId === SUPPLIER_ID);

export const offerPerformance: OfferPerformanceRow[] = larderOffers
  .map((o) => {
    const all = retailerOffers.filter((x) => x.productId === o.productId);
    const marketLow = Math.min(...all.map((x) => x.price));
    const rank = all.filter((x) => x.price < o.price).length + 1;
    const h = hash(`op-${o.id}`);
    const clicks = o.clicks ?? 60 + (h % 400);
    const impressions = clicks * (9 + (h % 12));
    return {
      offerId: o.id,
      productId: o.productId,
      price: o.price,
      marketLow,
      rank,
      impressions,
      clicks,
      ctr: round((clicks / impressions) * 100, 1),
      conversions: Math.round(clicks * (rank === 1 ? 0.052 : 0.027)),
      stock: o.stock,
    };
  })
  .sort((a, b) => b.clicks - a.clicks);

const sum = (k: "views" | "clicks" | "conversions" | "revenue", from: number, to: number) => supplierDaily.slice(from, to).reduce((s, d) => s + d[k], 0);

export const supplierKpis: KpiStat[] = [
  { label: "Offer views (7 days)", value: sum("views", 23, 30), change: round((sum("views", 23, 30) / sum("views", 16, 23) - 1) * 100, 1), format: "number" },
  { label: "Click-throughs", value: sum("clicks", 23, 30), change: round((sum("clicks", 23, 30) / sum("clicks", 16, 23) - 1) * 100, 1), format: "number" },
  { label: "Attributed sales", value: sum("conversions", 23, 30), change: round((sum("conversions", 23, 30) / Math.max(1, sum("conversions", 16, 23)) - 1) * 100, 1), format: "number" },
  { label: "Lowest-price share", value: Math.round((offerPerformance.filter((o) => o.rank === 1).length / Math.max(1, offerPerformance.length)) * 100), change: -3, format: "percent" },
];
