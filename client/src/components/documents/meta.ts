import type { LucideIcon } from "lucide-react";
import { BadgeCheck, BookOpen, CheckCircle2, FileSpreadsheet, Hammer, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import type { Confidence, DataRevision, DocumentExtraction, Product, ProductDocument } from "@/types";
import { specValue } from "@/data/conversations/conversations";
import { getSource } from "@/data/sources/sources";

export const DOC_KIND_META: Record<ProductDocument["kind"], { label: string; icon: LucideIcon; className: string }> = {
  manual: { label: "Manual", icon: BookOpen, className: "bg-info-soft text-info-foreground" },
  "spec-sheet": { label: "Spec sheet", icon: FileSpreadsheet, className: "bg-brand-soft text-brand-soft-foreground" },
  warranty: { label: "Warranty", icon: ShieldCheck, className: "bg-success-soft text-success" },
  certification: { label: "Certification", icon: BadgeCheck, className: "bg-claim-measured-soft text-claim-measured" },
  installation: { label: "Installation", icon: Hammer, className: "bg-claim-customer-soft text-claim-customer" },
};

export const DOC_STATUS_META: Record<ProductDocument["status"], { label: string; icon: LucideIcon; variant: "success" | "info" | "warning" }> = {
  processed: { label: "Processed", icon: CheckCircle2, variant: "success" },
  processing: { label: "Processing", icon: Loader2, variant: "info" },
  "needs-review": { label: "Needs review", icon: TriangleAlert, variant: "warning" },
};

export const EXTRACTION_STATUS_META: Record<DocumentExtraction["status"], { label: string; variant: "success" | "warning" | "danger" }> = {
  confirmed: { label: "Confirmed", variant: "success" },
  uncertain: { label: "Uncertain", variant: "warning" },
  contradiction: { label: "Contradiction", variant: "danger" },
};

export const REVISION_KIND_META: Record<DataRevision["kind"], { label: string; variant: "info" | "brand" | "warning" | "success" }> = {
  update: { label: "Update", variant: "info" },
  correction: { label: "Correction", variant: "brand" },
  conflict: { label: "Conflict", variant: "warning" },
  "new-source": { label: "New source", variant: "success" },
};

export function confidenceLevel(c: number): Confidence {
  if (c >= 0.9) return "high";
  if (c >= 0.7) return "moderate";
  return "low";
}

/** Best-effort lookup of the value currently held in the product record for an extracted field. */
export function recordValue(p: Product, field: string): string | null {
  const f = field.toLowerCase();
  if (f.startsWith("noise")) {
    const n = specValue(p, "noise");
    return n !== undefined ? `${n} dB(A)` : null;
  }
  if (f === "height") return `${p.dimensions.heightMm} mm`;
  if (f === "weight") return `${p.dimensions.weightKg} kg`;
  if (f === "capacity" || f === "gross capacity") return `${p.capacity.value} ${p.capacity.unit}`;
  if (f === "energy class") return p.energy.rating;
  if (f.startsWith("energy consumption") || f === "rated consumption") return `${p.energy.annualKwh} kWh/yr`;
  return null;
}

/** Source ids from the product record that exist in the local source registry. */
export function recordSourceIds(productId: string, keys: string[] = ["spec", "cert"]): string[] {
  return keys.map((k) => `${productId}:${k}`).filter((id) => Boolean(getSource(id)));
}

export function formatSize(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}
