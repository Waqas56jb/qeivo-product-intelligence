"use client";

import Link from "next/link";
import { Plus, X } from "lucide-react";
import type { Product } from "@/types";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { SponsoredTag } from "@/components/analysis/warnings";
import { BrandLabel, ProductPrice } from "@/components/product/product-bits";

/** Product column header: image, identity, price and a remove control. */
export function ComparisonProductHeader({ product, onRemove, badge, compact, className }: { product: Product; onRemove: () => void; badge?: React.ReactNode; compact?: boolean; className?: string }) {
  return (
    <div className={cn("relative flex min-w-0 flex-col", compact ? "gap-2" : "gap-3", className)}>
      <div className={cn("relative rounded-[14px] bg-gradient-to-b from-surface-2 to-surface-3/50", compact ? "flex items-center gap-3 p-1.5 pr-11" : "p-3")}>
        <ImageWithFallback src={product.images[0]} alt={product.name} aspect={compact ? "size-14 shrink-0" : "aspect-[4/3] w-full"} sizes={compact ? "56px" : "(max-width: 1280px) 22vw, 260px"} className={compact ? "p-1" : "p-2"} />
        {compact && (
          <div className="min-w-0">
            <BrandLabel brandId={product.brandId} className="text-[10px]" />
            <Link href={routes.product(product.slug)} className="block truncate text-[14px] font-semibold leading-tight hover:underline">
              {product.model}
            </Link>
            <ProductPrice product={product} size="sm" showSaving={false} />
          </div>
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${product.name} from comparison`}
          className={cn("absolute grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground", compact ? "right-0 top-1/2 -translate-y-1/2" : "right-0 top-0")}
        >
          <span className="grid size-8 place-items-center rounded-full border border-border bg-surface/90 shadow-xs backdrop-blur">
            <X className="size-4" />
          </span>
        </button>
        {!compact && (badge || product.sponsored) && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {product.sponsored && <SponsoredTag />}
            {badge}
          </div>
        )}
      </div>
      {!compact && (
        <div className="min-w-0">
          <BrandLabel brandId={product.brandId} />
          <Link href={routes.product(product.slug)} className="mt-0.5 block truncate text-[15px] font-semibold leading-snug hover:underline">
            {product.model}
          </Link>
          <p className="truncate text-[12px] text-muted-foreground">
            {product.type} · {product.modelNumber}
          </p>
        </div>
      )}
    </div>
  );
}

/** Empty slot inviting the user to add another product. */
export function ComparisonAddSlot({ onAdd, remaining, className }: { onAdd: () => void; remaining: number; className?: string }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className={cn("group flex min-h-[44px] w-full flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-border-strong bg-surface/60 p-4 text-center transition-colors hover:border-brand/60 hover:bg-brand-soft/30", className)}
    >
      <span className="grid size-10 place-items-center rounded-full bg-brand-soft text-brand-soft-foreground transition-transform group-hover:scale-105">
        <Plus className="size-5" />
      </span>
      <span className="text-[13px] font-semibold">Add product</span>
      <span className="text-[12px] text-muted-foreground tabular">{remaining} slot{remaining === 1 ? "" : "s"} left</span>
    </button>
  );
}
