import type { DataRevision, Product } from "@/types";
import { hash } from "@/lib/utils";
import { products } from "../products";
import { specValue } from "../conversations/conversations";

/**
 * Hand-curated revisions plus a deterministic set of "price refresh" updates
 * derived from product data, so values always agree with the current catalogue.
 */
type Row = [productKey: string, field: string, previous: string, next: string, sourceKey: string, date: string, actor: string, kind: DataRevision["kind"]];

const curated: Row[] = [
  ["nordvik-ellipse-bf380", "Height", "2000 mm", "2010 mm", "spec", "2026-11-10T13:10:00Z", "Elin Sandberg (Nordvik)", "correction"],
  ["nordvik-column-c400", "Energy class", "B", "A", "cert", "2026-11-21T16:02:00Z", "System", "conflict"],
  ["nordvik-frostline-fd600", "Noise level", "38 dB(A)", "36 dB(A)", "spec", "2026-09-14T10:40:00Z", "Aisha Karimi (Nordvik)", "correction"],
  ["nordvik-frostline-fd540-cd", "Price", "$2,799", "$2,699", "spec", "2026-10-01T08:00:00Z", "System", "update"],
  ["nordvik-frostline-sbs630", "Water filter", "Not listed", "Included", "manual", "2026-08-22T09:30:00Z", "Lars Holmberg (Nordvik)", "update"],
  ["halden-pureclean-w9", "Capacity", "8 kg", "9 kg", "spec", "2026-08-05T09:50:00Z", "Katrin Vogel (Halden)", "conflict"],
  ["halden-precision-bf400", "Lab test", "—", "HomeLab Review Q4 results", "lab", "2026-11-14T10:25:00Z", "Daniel Okoye", "new-source"],
  ["kestrel-homebase-sbs650", "Noise level", "41 dB(A)", "42 dB(A)", "cert", "2026-06-11T16:30:00Z", "System", "conflict"],
  ["kestrel-everyday-fd580", "Measured consumption", "—", "Independent measurement added", "lab", "2026-10-03T12:00:00Z", "Daniel Okoye", "new-source"],
  ["tervo-air-14", "Weight", "1.29 kg", "1.21 kg", "spec", "2026-05-22T08:20:00Z", "Mei Tanaka", "correction"],
  ["solenne-portofino-r330", "Rated consumption", "270 kWh/yr", "248 kWh/yr", "cert", "2025-10-08T14:30:00Z", "System", "conflict"],
  ["solenne-portofino-r330", "Production status", "Current", "Unconfirmed — awaiting manufacturer", "maker", "2025-10-09T09:00:00Z", "Mei Tanaka", "update"],
  ["maru-smartview-fd620", "Energy saving claim", "—", "“Up to 15% with Smart Saving” (unverified)", "maker", "2026-10-28T11:10:00Z", "System", "new-source"],
  ["maru-flex-qd640", "Video review", "—", "Convertible zone tested (independent)", "video", "2026-09-30T18:00:00Z", "System", "new-source"],
  ["ovea-eco-bf370", "Evidence coverage", "91%", "95%", "lab", "2026-10-29T14:00:00Z", "Ovea data team", "update"],
  ["ovea-eco-fd520", "Noise level (measured)", "—", "34 dB(A)", "lab", "2026-11-21T10:00:00Z", "Daniel Okoye", "new-source"],
  ["brightwater-family-bf440", "Owner reviews", "3,398", "3,810", "customers", "2026-10-09T01:35:00Z", "System", "update"],
  ["corvane-pro-column-r480", "Warranty", "2 years", "3 years", "spec", "2026-07-17T15:00:00Z", "Daniel Okoye", "correction"],
  ["aurelle-maison-fd610", "Energy class", "D", "E", "cert", "2026-06-02T10:00:00Z", "System", "correction"],
  ["lumora-vivid-oled65", "Typical power", "112 W", "118 W", "manual", "2026-07-14T12:40:00Z", "Mei Tanaka", "conflict"],
  ["vireo-lumen-miniled65", "Peak brightness (measured)", "—", "Independent measurement added", "lab", "2026-10-30T16:50:00Z", "Mei Tanaka", "new-source"],
  ["arclight-forge-17", "Battery (measured)", "4.4 h", "3.9 h", "lab", "2026-10-17T11:10:00Z", "Mei Tanaka", "correction"],
  ["maru-twinload-t13", "Wi-Fi app", "Not listed", "Supported", "spec", "2026-09-12T08:15:00Z", "Min-jun Park (Maru)", "update"],
  ["brightwater-compact-w6", "Verification status", "Current", "Aging — re-check scheduled", "spec", "2026-06-20T09:00:00Z", "System", "update"],
];

const fromRow = ([key, field, previous, next, sourceKey, date, actor, kind]: Row, i: number): DataRevision => ({
  id: `rev-${String(i + 1).padStart(3, "0")}`,
  productId: `p-${key}`,
  field,
  previous,
  next,
  sourceId: `p-${key}:${sourceKey}`,
  date,
  actor,
  kind,
});

function measuredRevision(p: Product, i: number): DataRevision | null {
  const measured = specValue(p, "kwh-measured");
  if (typeof measured !== "number") return null;
  const day = String((hash(p.id) % 27) + 1).padStart(2, "0");
  const conflict = measured > p.energy.annualKwh * 1.08;
  return {
    id: `rev-m${String(i + 1).padStart(3, "0")}`,
    productId: p.id,
    field: "Measured consumption",
    previous: conflict ? `${p.energy.annualKwh} kWh/yr (label)` : "—",
    next: `${measured} kWh/yr`,
    sourceId: `${p.id}:lab`,
    date: `2026-${p.freshness === "current" ? "09" : "05"}-${day}T09:00:00Z`,
    actor: "HomeLab Review import",
    kind: conflict ? "conflict" : "new-source",
  };
}

export const revisions: DataRevision[] = [
  ...curated.map(fromRow),
  ...products
    .filter((p) => p.category === "refrigerators" && hash(p.id) % 3 === 0)
    .map(measuredRevision)
    .filter((r): r is DataRevision => r !== null),
].sort((a, b) => b.date.localeCompare(a.date));

export function revisionsForProduct(productId: string): DataRevision[] {
  return revisions.filter((r) => r.productId === productId);
}
