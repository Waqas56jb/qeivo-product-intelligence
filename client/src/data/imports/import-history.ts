import type { ImportRecord } from "@/types";

export const importHistory: ImportRecord[] = [
  { id: "imp-014", name: "Nordvik 2027 refrigeration line — spec feed", source: "Nordvik PIM (CSV)", date: "2026-11-21T15:40:00Z", rows: 48, created: 6, updated: 39, failed: 3, status: "partial", actor: "Lars Holmberg" },
  { id: "imp-013", name: "Weekly retailer price crawl", source: "Retailer feeds (6)", date: "2026-11-20T03:00:00Z", rows: 412, created: 0, updated: 409, failed: 3, status: "partial", actor: "System" },
  { id: "imp-012", name: "Energy label registry sync", source: "Energy label registry API", date: "2026-11-18T02:15:00Z", rows: 69, created: 0, updated: 12, failed: 0, status: "completed", actor: "System" },
  { id: "imp-011", name: "HomeLab Review — Q4 fridge lab results", source: "HomeLab Review (XLSX)", date: "2026-11-14T10:22:00Z", rows: 18, created: 4, updated: 14, failed: 0, status: "completed", actor: "Daniel Okoye" },
  { id: "imp-010", name: "Larder & Co offer catalogue", source: "Larder & Co supplier portal", date: "2026-11-12T09:10:00Z", rows: 226, created: 31, updated: 188, failed: 7, status: "partial", actor: "Imogen Price" },
  { id: "imp-009", name: "Halden laundry spec update", source: "Halden PIM (JSON)", date: "2026-11-05T07:30:00Z", rows: 24, created: 0, updated: 24, failed: 0, status: "completed", actor: "Katrin Vogel" },
  { id: "imp-008", name: "Panel Report TV measurements", source: "Panel Report (CSV)", date: "2026-10-30T16:45:00Z", rows: 9, created: 0, updated: 9, failed: 0, status: "completed", actor: "Mei Tanaka" },
  { id: "imp-007", name: "Maru connected-appliance feed", source: "Maru partner API", date: "2026-10-22T04:00:00Z", rows: 0, created: 0, updated: 0, failed: 0, status: "failed", actor: "System" },
  { id: "imp-006", name: "Bench & Battery laptop battery tests", source: "Bench & Battery (CSV)", date: "2026-10-17T11:05:00Z", rows: 9, created: 0, updated: 9, failed: 0, status: "completed", actor: "Mei Tanaka" },
  { id: "imp-005", name: "Owner review backfill — Brightwater", source: "Review syndication feed", date: "2026-10-09T01:30:00Z", rows: 3810, created: 412, updated: 0, failed: 18, status: "partial", actor: "System" },
  { id: "imp-004", name: "Nordvik manuals batch upload", source: "Manual upload (PDF × 12)", date: "2026-09-14T10:20:00Z", rows: 12, created: 12, updated: 0, failed: 0, status: "completed", actor: "Elin Sandberg" },
  { id: "imp-003", name: "Kestrel price list Q4", source: "Kestrel trade portal (XLSX)", date: "2026-09-02T14:00:00Z", rows: 15, created: 0, updated: 11, failed: 4, status: "partial", actor: "Daniel Okoye" },
];

export const importErrors: { importId: string; row: number; field: string; message: string }[] = [
  { importId: "imp-014", row: 12, field: "depth_mm", message: "Value '6 25' is not a number" },
  { importId: "imp-014", row: 31, field: "energy_class", message: "Class 'A+++' is not valid under the current label scale" },
  { importId: "imp-014", row: 44, field: "model_number", message: "Duplicate of NV-FD600SS (row 3)" },
  { importId: "imp-013", row: 208, field: "price", message: "Price change of −62% exceeds the anomaly threshold; held for review" },
  { importId: "imp-010", row: 77, field: "gtin", message: "GTIN does not match any known product" },
  { importId: "imp-007", row: 0, field: "—", message: "Authentication failed: partner token expired on 2026-10-21" },
];
