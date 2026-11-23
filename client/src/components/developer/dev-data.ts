/**
 * Derived, deterministic developer-platform data built from `src/data/api`.
 * No randomness: everything is seeded from `hash()` so server and client render identically.
 */
import type { ApiKey, ApiUsageDay } from "@/types";
import { apiKeys } from "@/data/api/keys";
import { apiUsage, endpointUsage, errorDistribution } from "@/data/api/usage";
import { DEMO_NOW, hash } from "@/lib/utils";

export const API_BASE = "https://api.qeivo.example/v1";
export const ORG_MONTHLY_QUOTA = 50_000;

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

/** Never a real secret: a fixed run of bullets plus 4 hex characters derived from the seed. */
export function maskedKey(env: ApiKey["environment"], seed: string) {
  const tail = hash(seed).toString(16).padStart(8, "0").slice(-4);
  return { full: `qv_${env}_••••••••••••${tail}`, prefix: `qv_${env}_…${tail}`, tail };
}

/** Displayable identifier for a key: seeded keys store a short prefix, new keys a short suffix. */
export function keyLabel(k: ApiKey) {
  return k.prefix.endsWith("…") ? `${k.prefix.slice(0, -1)}••••` : k.prefix.replace("…", "••••");
}

// ---------------------------------------------------------------- usage slicing

export type RangeDays = 7 | 30 | 90;

export function sliceUsage(days: RangeDays): ApiUsageDay[] {
  return apiUsage.slice(-days);
}

export function summarise(rows: ApiUsageDay[]) {
  const requests = rows.reduce((s, d) => s + d.requests, 0);
  const errors = rows.reduce((s, d) => s + d.errors, 0);
  const p95 = rows.length ? Math.round(rows.reduce((s, d) => s + d.p95Ms, 0) / rows.length) : 0;
  const peak = rows.reduce((m, d) => (d.requests > m.requests ? d : m), rows[0] ?? { date: "", requests: 0, errors: 0, p95Ms: 0 });
  return { requests, errors, errorRate: requests ? errors / requests : 0, p95, peak };
}

/** Previous period of equal length, for deltas. Only available while the 90-day window allows. */
export function previousPeriod(days: RangeDays): ApiUsageDay[] | null {
  if (days * 2 > apiUsage.length) return null;
  return apiUsage.slice(-days * 2, -days);
}

const ENDPOINT_TOTAL = endpointUsage.reduce((s, e) => s + e.requests, 0);

/** Endpoint mix re-scaled so totals match the selected range. */
export function endpointsForRange(rows: ApiUsageDay[]) {
  const total = rows.reduce((s, d) => s + d.requests, 0);
  return endpointUsage.map((e) => ({ ...e, requests: Math.round((e.requests / ENDPOINT_TOTAL) * total) }));
}

const INCIDENT_DATE = "2026-10-14";

/** Error codes re-sliced for the range; 503s only appear when the 14 Oct incident is inside it. */
export function errorsForRange(rows: ApiUsageDay[]) {
  const incident = rows.find((d) => d.date === INCIDENT_DATE);
  const incidentErrors = incident ? incident.errors : 0;
  const baseline = rows.reduce((s, d) => s + d.errors, 0) - incidentErrors;
  const nonIncident = errorDistribution.filter((e) => e.code !== 503);
  const nonTotal = nonIncident.reduce((s, e) => s + e.count, 0);
  return errorDistribution.map((e) => ({
    ...e,
    count: e.code === 503 ? incidentErrors : Math.round((e.count / nonTotal) * baseline),
  }));
}

export const ERROR_GROUPS: { name: string; codes: number[]; color: number }[] = [
  { name: "Client errors (400, 404, 422)", codes: [400, 404, 422], color: 0 },
  { name: "Auth & scope (401, 403)", codes: [401, 403], color: 1 },
  { name: "Rate limited (429)", codes: [429], color: 2 },
  { name: "Server errors (500, 503)", codes: [500, 503], color: 3 },
];

export const MONTH_TO_DATE = apiUsage.filter((d) => d.date >= "2026-11-01");
export const MTD_REQUESTS = MONTH_TO_DATE.reduce((s, d) => s + d.requests, 0);
export const PROJECTED_MONTH = Math.round((MTD_REQUESTS / MONTH_TO_DATE.length) * 30);

// ------------------------------------------------------------------ request log

export interface RequestLogEntry {
  id: string;
  time: string;
  method: HttpMethod;
  path: string;
  status: number;
  latencyMs: number;
  keyName: string;
  environment: ApiKey["environment"];
}

const SAMPLE_IDS = ["p-nordvik-frostline-fd600", "p-brightwater-family-bf440", "p-halden-pureclean-w9", "p-ovea-eco-c160", "p-vireo-meridian-14", "p-nordvik-ellipse-bf380", "p-kestrel-homebase-bf420"];
const DOC_IDS = ["doc-001", "doc-003"];

function weightedEndpoint(r: number) {
  let acc = 0;
  for (const e of endpointUsage) {
    acc += e.requests / ENDPOINT_TOTAL;
    if (r <= acc) return e;
  }
  return endpointUsage[0];
}

export function requestLog(count = 24): RequestLogEntry[] {
  const active = apiKeys.filter((k) => k.status === "active");
  let t = DEMO_NOW.getTime() - 4 * 60_000;
  return Array.from({ length: count }, (_, i) => {
    const h = hash(`req-${i}`);
    const e = weightedEndpoint((h % 1000) / 1000);
    const id = e.endpoint.includes("documents") ? DOC_IDS[h % DOC_IDS.length] : SAMPLE_IDS[(h >>> 3) % SAMPLE_IDS.length];
    const path = e.endpoint.replace("{id}", id) + (e.endpoint === "/v1/products" ? `?category=${["refrigerators", "washing-machines", "laptops"][h % 3]}&limit=20` : "");
    const roll = (h >>> 7) % 100;
    const status = roll < 3 ? 404 : roll === 3 ? 429 : roll === 4 ? 422 : roll === 5 ? 401 : e.method === "POST" && roll < 40 ? 201 : 200;
    const latencyMs = status === 429 || status === 401 ? 8 + (h % 14) : Math.round(e.p95Ms * (0.35 + ((h >>> 11) % 60) / 100));
    const key = active[(h >>> 5) % active.length];
    const entry: RequestLogEntry = { id: `req_${(h >>> 0).toString(36)}`, time: new Date(t).toISOString(), method: e.method, path, status, latencyMs, keyName: key.name, environment: key.environment };
    t -= (17 + ((h >>> 9) % 140)) * 1000;
    return entry;
  });
}

// ------------------------------------------------------------- formatting utils

export const shortDate = (iso: string) => {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
};

export const compact = (v: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v);
export const pct = (v: number, digits = 2) => `${(v * 100).toFixed(digits)}%`;

/**
 * Seed `ApiKey.used` values for live keys add up to more than the org's month-to-date total in
 * `apiUsage`. To keep every page internally consistent, live-key usage is scaled so live keys sum
 * to the month-to-date total (test keys don't count toward the org quota and are shown as seeded).
 */
const SEED_LIVE_USED = apiKeys.filter((k) => k.status === "active" && k.environment === "live").reduce((s, k) => s + k.used, 0);
export function keyUsage(k: ApiKey) {
  if (k.environment === "test" || !SEED_LIVE_USED) return k.used;
  return Math.round((k.used / SEED_LIVE_USED) * MTD_REQUESTS);
}
