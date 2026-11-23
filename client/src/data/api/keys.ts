import type { ApiKey } from "@/types";

/** Keys are shown masked: only a short prefix is ever stored client-side. */
export const apiKeys: ApiKey[] = [
  { id: "key-1", name: "Production — tenant portal", prefix: "qv_live_7Hk2…", scopes: ["products:read", "prices:read", "reviews:read"], createdAt: "2026-03-02T10:00:00Z", lastUsed: "2026-11-23T10:14:00Z", environment: "live", monthlyLimit: 50000, used: 38412, status: "active" },
  { id: "key-2", name: "Procurement spreadsheet sync", prefix: "qv_live_Rm9w…", scopes: ["products:read", "prices:read"], createdAt: "2026-05-19T08:30:00Z", lastUsed: "2026-11-23T06:00:00Z", environment: "live", monthlyLimit: 10000, used: 6120, status: "active" },
  { id: "key-3", name: "Maintenance scheduler", prefix: "qv_live_c4Px…", scopes: ["products:read", "documents:read"], createdAt: "2026-07-11T14:12:00Z", lastUsed: "2026-11-22T22:41:00Z", environment: "live", monthlyLimit: 10000, used: 2870, status: "active" },
  { id: "key-4", name: "Staging", prefix: "qv_test_Lq3e…", scopes: ["products:read", "prices:read", "reviews:read", "compare:write"], createdAt: "2026-02-20T09:00:00Z", lastUsed: "2026-11-21T16:05:00Z", environment: "test", monthlyLimit: 5000, used: 1944, status: "active" },
  { id: "key-5", name: "Local development (Carlos)", prefix: "qv_test_9Zd1…", scopes: ["products:read"], createdAt: "2026-09-08T11:45:00Z", lastUsed: "2026-11-18T13:27:00Z", environment: "test", monthlyLimit: 1000, used: 212, status: "active" },
  { id: "key-6", name: "Old tenant portal (v0)", prefix: "qv_live_Ft6b…", scopes: ["products:read", "prices:read"], createdAt: "2025-11-14T10:00:00Z", lastUsed: "2026-03-01T23:59:00Z", environment: "live", monthlyLimit: 25000, used: 0, status: "revoked" },
  { id: "key-7", name: "Contractor integration — leaked, rotated", prefix: "qv_live_Kv8n…", scopes: ["products:read"], createdAt: "2026-06-01T12:00:00Z", lastUsed: null, environment: "live", monthlyLimit: 5000, used: 0, status: "revoked" },
];

export const apiScopes: { scope: string; description: string }[] = [
  { scope: "products:read", description: "Product records, specifications, scores and evidence" },
  { scope: "prices:read", description: "Retailer offers and 52-week price history" },
  { scope: "reviews:read", description: "Review summaries, sentiment and rating distributions" },
  { scope: "documents:read", description: "Manuals, spec sheets and structured extractions" },
  { scope: "compare:write", description: "Create comparisons and compatibility checks" },
];
