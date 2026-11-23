/** Time-series and table shapes used by the manufacturer / supplier / creator dashboards. */

export interface WeeklyPoint {
  /** ISO date of the week start (Monday) */
  week: string;
  views: number;
  comparisons: number;
  questions: number;
  /** Average star rating of reviews posted that week */
  rating: number;
  /** Share of positive / mixed / negative review sentiment that week, 0–100 */
  positive: number;
  mixed: number;
  negative: number;
}

export interface ProductPerformanceRow {
  productId: string;
  views: number;
  viewsChange: number;
  comparisons: number;
  shortlisted: number;
  questions: number;
  unanswered: number;
  rating: number;
  evidenceCoverage: number;
  /** Share of comparisons where this product was chosen as the winner, 0–100 */
  winRate: number;
  topCompetitorId: string;
}

export interface ContentGap {
  id: string;
  productId: string;
  kind: "video" | "document" | "faq" | "specification" | "image" | "lab-data";
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  /** Estimated searches or views affected per month */
  impact: number;
}

export interface DailyPoint {
  date: string;
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface OfferPerformanceRow {
  offerId: string;
  productId: string;
  price: number;
  marketLow: number;
  rank: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  stock: "in-stock" | "low-stock" | "out-of-stock" | "preorder";
}

export interface CreatorWeeklyPoint {
  week: string;
  views: number;
  watchHours: number;
  engagement: number;
  followers: number;
}

export interface ContentPerformanceRow {
  submissionId: string;
  title: string;
  type: "video" | "review" | "diy-guide" | "article";
  views: number;
  engagement: number;
  avgWatchPct: number;
  productClicks: number;
  publishedAt: string;
}

export interface KpiStat {
  label: string;
  value: number;
  change: number;
  format: "number" | "percent" | "currency" | "rating" | "duration";
}
