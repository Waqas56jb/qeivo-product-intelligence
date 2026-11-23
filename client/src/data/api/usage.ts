import type { ApiUsageDay } from "@/types";
import { hash } from "@/lib/utils";

const END = Date.UTC(2026, 10, 23);
const DAY = 86_400_000;

/** 90 days of API usage ending 2026-11-23. Weekday/weekend rhythm, gentle growth and one incident. */
export const apiUsage: ApiUsageDay[] = Array.from({ length: 90 }, (_, i) => {
  const t = END - (89 - i) * DAY;
  const date = new Date(t).toISOString().slice(0, 10);
  const dow = new Date(t).getUTCDay();
  const weekend = dow === 0 || dow === 6;
  const h = hash(`api-${date}`);
  const base = 1050 + i * 9;
  const requests = Math.round(base * (weekend ? 0.46 : 1) + (h % 260) - 130);
  const incident = date === "2026-10-14";
  const errors = incident ? Math.round(requests * 0.068) : Math.round(requests * (0.004 + (h % 9) / 1000));
  const p95Ms = incident ? 1840 : 182 + (h % 70) + (weekend ? -15 : 0);
  return { date, requests, errors, p95Ms };
});

export const endpointUsage: { endpoint: string; method: "GET" | "POST"; requests: number; p95Ms: number; errorRate: number }[] = [
  { endpoint: "/v1/products", method: "GET", requests: 31840, p95Ms: 164, errorRate: 0.003 },
  { endpoint: "/v1/products/{id}", method: "GET", requests: 22410, p95Ms: 121, errorRate: 0.002 },
  { endpoint: "/v1/products/{id}/offers", method: "GET", requests: 14980, p95Ms: 238, errorRate: 0.006 },
  { endpoint: "/v1/products/{id}/price-history", method: "GET", requests: 8760, p95Ms: 196, errorRate: 0.004 },
  { endpoint: "/v1/products/{id}/reviews/summary", method: "GET", requests: 6230, p95Ms: 288, errorRate: 0.005 },
  { endpoint: "/v1/compare", method: "POST", requests: 4120, p95Ms: 412, errorRate: 0.011 },
  { endpoint: "/v1/compatibility/check", method: "POST", requests: 2980, p95Ms: 356, errorRate: 0.019 },
  { endpoint: "/v1/documents/{id}/extractions", method: "GET", requests: 1140, p95Ms: 521, errorRate: 0.008 },
];

export const errorDistribution: { code: number; label: string; count: number }[] = [
  { code: 400, label: "Bad request — invalid parameters", count: 214 },
  { code: 401, label: "Unauthorised — missing or revoked key", count: 96 },
  { code: 403, label: "Forbidden — scope not granted", count: 41 },
  { code: 404, label: "Not found — unknown product id", count: 188 },
  { code: 422, label: "Unprocessable — dimensions out of range", count: 63 },
  { code: 429, label: "Rate limited", count: 132 },
  { code: 500, label: "Internal error", count: 27 },
  { code: 503, label: "Service unavailable (14 Oct incident)", count: 71 },
];

export const apiUsageTotals = {
  requests: apiUsage.reduce((s, d) => s + d.requests, 0),
  errors: apiUsage.reduce((s, d) => s + d.errors, 0),
  last30Requests: apiUsage.slice(-30).reduce((s, d) => s + d.requests, 0),
};
