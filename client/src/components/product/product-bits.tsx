"use client";

import { Star } from "lucide-react";
import type { Product } from "@/types";
import { getBrand } from "@/data/products/brands";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CurrencyDisplay } from "@/components/common/display";

export function ProductPrice({ product, size = "md", className, showSaving = true }: { product: Product; size?: "sm" | "md" | "lg"; className?: string; showSaving?: boolean }) {
  const saving = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <CurrencyDisplay usd={product.price} className={cn("font-semibold tracking-tight", size === "lg" ? "text-[30px]" : size === "md" ? "text-[18px]" : "text-[15px]")} />
      {product.originalPrice && <CurrencyDisplay usd={product.originalPrice} strike className={size === "lg" ? "text-[15px]" : "text-[13px]"} />}
      {showSaving && saving > 0 && <span className="text-[12px] font-semibold text-success tabular">−{saving}%</span>}
    </div>
  );
}

export function ProductRating({ rating, count, size = "sm", className }: { rating: number; count?: number; size?: "sm" | "md"; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", size === "md" ? "text-[14px]" : "text-[12px]", className)} aria-label={`Rated ${rating} out of 5${count ? ` from ${count} reviews` : ""}`}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, rating - (i - 1)));
          return (
            <span key={i} className="relative">
              <Star className={cn("text-border-strong", size === "md" ? "size-4" : "size-3.5")} fill="currentColor" strokeWidth={0} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={cn("text-warning", size === "md" ? "size-4" : "size-3.5")} fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          );
        })}
      </span>
      <span className="font-semibold tabular">{rating.toFixed(1)}</span>
      {count !== undefined && <span className="text-muted-foreground tabular">({count.toLocaleString("en-US")})</span>}
    </span>
  );
}

export function ProductStatusBadge({ product, className }: { product: Product; className?: string }) {
  if (product.freshness === "stale") return <Badge variant="warning" className={className}>Data outdated</Badge>;
  if (product.freshness === "aging") return <Badge variant="info" className={className}>Verification due</Badge>;
  return <Badge variant="success" className={className}>Verified {product.lastVerified.slice(5).replace("-", "/")}</Badge>;
}

export function BrandLabel({ brandId, className, withMark }: { brandId: string; className?: string; withMark?: boolean }) {
  const b = getBrand(brandId);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground", className)}>
      {withMark && (
        <span className="grid size-5 place-items-center rounded-[6px] text-[9px] font-bold tracking-normal text-white" style={{ backgroundColor: b.color }} aria-hidden>
          {b.mark}
        </span>
      )}
      {b.name}
    </span>
  );
}

/** Key specs per category (category-agnostic caller). */
export function keySpecs(product: Product): { label: string; value: string }[] {
  const d = product.dimensions;
  switch (product.category) {
    case "refrigerators":
      return [
        { label: "Capacity", value: `${product.capacity.value} L` },
        { label: `Class ${product.energy.rating}`, value: `${product.energy.annualKwh} kWh` },
        { label: "W × D mm", value: `${d.widthMm}×${d.depthMm}` },
      ];
    case "washing-machines":
      return [
        { label: "Drum", value: `${product.capacity.value} kg` },
        { label: `Class ${product.energy.rating}`, value: `${product.energy.annualKwh} kWh` },
        { label: "Depth", value: `${d.depthMm} mm` },
      ];
    case "televisions":
      return [
        { label: "Screen", value: `${product.capacity.value}"` },
        { label: "Panel", value: product.type },
        { label: "Energy", value: product.energy.rating },
      ];
    default:
      return [
        { label: "Battery", value: product.energy.rating },
        { label: "Weight", value: `${d.weightKg} kg` },
        { label: "Storage", value: product.capacity.value >= 1000 ? `${product.capacity.value / 1000} TB` : `${product.capacity.value} GB` },
      ];
  }
}
