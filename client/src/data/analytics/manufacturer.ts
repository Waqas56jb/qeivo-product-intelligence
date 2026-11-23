import type { ContentGap, KpiStat, ProductPerformanceRow, WeeklyPoint } from "@/types";
import { hash, round } from "@/lib/utils";
import { products } from "../products";
import { questions } from "../community/questions";

/** Analytics for the demo manufacturer co-nordvik (brand b-nordvik). */
export const MANUFACTURER_ID = "co-nordvik";

const nordvikProducts = products.filter((p) => p.brandId === "b-nordvik");

const WEEK = 7 * 86_400_000;
const FIRST_WEEK = Date.UTC(2026, 4, 25); // Monday 25 May 2026 → 26 weeks to 16 Nov

/** 26 weekly points ending the week of 16 Nov 2026. Includes a Black-Friday-lead-in surge. */
export const manufacturerWeekly: WeeklyPoint[] = Array.from({ length: 26 }, (_, i) => {
  const week = new Date(FIRST_WEEK + i * WEEK).toISOString().slice(0, 10);
  const h = hash(`nv-${week}`);
  const trend = 1 + i * 0.018;
  const surge = i >= 23 ? 1 + (i - 22) * 0.14 : 1;
  const dip = i === 9 || i === 10 ? 0.86 : 1; // summer holiday lull
  const views = Math.round((38_000 + (h % 4200)) * trend * surge * dip);
  const comparisons = Math.round(views * (0.112 + (h % 13) / 1000));
  const questionsCount = 38 + (h % 21) + (i === 16 ? 34 : 0); // spike after ice-maker filter firmware issue
  const negative = i === 16 || i === 17 ? 14 + (h % 3) : 6 + (h % 4);
  const mixed = 13 + (h % 6);
  const positive = 100 - negative - mixed;
  const rating = round(4.42 + (h % 17) / 100 - (i === 16 || i === 17 ? 0.21 : 0) + i * 0.002, 2);
  return { week, views, comparisons, questions: questionsCount, rating, positive, mixed, negative };
});

const COMPETITOR: Record<string, string> = {
  "p-nordvik-frostline-fd600": "p-maru-smartview-fd620",
  "p-nordvik-frostline-fd540-cd": "p-maru-smartview-cd540",
  "p-nordvik-ellipse-bf380": "p-halden-precision-bf400",
  "p-nordvik-column-c400": "p-brightwater-larder-c385",
  "p-nordvik-frostline-sbs630": "p-kestrel-homebase-sbs650",
  "p-nordvik-silkwash-w8": "p-halden-pureclean-w9",
};

export const productPerformance: ProductPerformanceRow[] = nordvikProducts.map((p) => {
  const h = hash(`perf-${p.id}`);
  const views = Math.round(p.reviewCount * 38 + (h % 9000));
  const qs = questions.filter((q) => q.productIds.includes(p.id));
  return {
    productId: p.id,
    views,
    viewsChange: round(((h % 41) - 12) / 1, 0),
    comparisons: Math.round(views * (0.09 + (h % 7) / 100)),
    shortlisted: Math.round(views * (0.031 + (h % 5) / 1000)),
    questions: qs.length + 12 + (h % 30),
    unanswered: p.id === "p-nordvik-column-c400" ? 9 : h % 5,
    rating: p.rating,
    evidenceCoverage: p.evidenceCoverage,
    winRate: Math.round(32 + (p.suitabilityScore - 7) * 14 + (h % 9)),
    topCompetitorId: COMPETITOR[p.id] ?? "p-halden-precision-bf400",
  };
});

export const contentGaps: ContentGap[] = [
  { id: "gap-1", productId: "p-nordvik-column-c400", kind: "video", severity: "high", title: "No installation video for NV-C400IX", detail: "Integrated columns generate the most installation questions in the category. 9 open questions concern niche preparation and furniture-door fitting.", impact: 4200 },
  { id: "gap-2", productId: "p-nordvik-column-c400", kind: "specification", severity: "high", title: "Energy class conflict on NV-C400IX", detail: "The draft installation guide says class B, but the registered label says class A. Shoppers see a conflict warning until this is resolved.", impact: 3100 },
  { id: "gap-3", productId: "p-nordvik-frostline-sbs630", kind: "lab-data", severity: "medium", title: "No independent noise measurement for Frostline SBS630", detail: "Noise is the third most compared attribute for side-by-sides. Only the manufacturer's figure is available.", impact: 2600 },
  { id: "gap-4", productId: "p-nordvik-frostline-fd600", kind: "faq", severity: "medium", title: "Water filter compatibility FAQ missing", detail: "38 community questions in the past 90 days asked which filter cartridges fit the FD600 dispenser.", impact: 1900 },
  { id: "gap-5", productId: "p-nordvik-silkwash-w8", kind: "document", severity: "medium", title: "No installation guide uploaded for SilkWash W8", detail: "Only the warranty terms are on file. Upload the installation guide so stacking and drain-height questions can be answered.", impact: 1400 },
  { id: "gap-6", productId: "p-nordvik-ellipse-bf380", kind: "image", severity: "low", title: "No interior photography for Ellipse BF380", detail: "Products with interior shots get 18% more shortlist adds in this category.", impact: 900 },
  { id: "gap-7", productId: "p-nordvik-frostline-fd540-cd", kind: "video", severity: "low", title: "No manufacturer walkthrough for FD540 Counter-Depth", detail: "The only video coverage is an independent comparison. A short official walkthrough would answer recurring questions about the flush fit.", impact: 750 },
];

const last = manufacturerWeekly[manufacturerWeekly.length - 1];
const prev = manufacturerWeekly[manufacturerWeekly.length - 2];
const pct = (a: number, b: number) => round(((a - b) / b) * 100, 1);

export const manufacturerKpis: KpiStat[] = [
  { label: "Product views (7 days)", value: last.views, change: pct(last.views, prev.views), format: "number" },
  { label: "Comparisons", value: last.comparisons, change: pct(last.comparisons, prev.comparisons), format: "number" },
  { label: "Average rating", value: last.rating, change: round(last.rating - prev.rating, 2), format: "rating" },
  { label: "Evidence coverage", value: Math.round(nordvikProducts.reduce((s, p) => s + p.evidenceCoverage, 0) / nordvikProducts.length), change: 2, format: "percent" },
];
