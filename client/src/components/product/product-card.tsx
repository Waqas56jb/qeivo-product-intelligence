"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/types";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { personalScore, type Priorities } from "@/lib/scoring";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { EvidenceCoverage, ScorePill } from "@/components/analysis/score";
import { SponsoredTag } from "@/components/analysis/warnings";
import { BrandLabel, keySpecs, ProductPrice, ProductRating } from "./product-bits";
import { CompareToggle, SaveButton } from "./product-actions";

interface ProductCardProps {
  product: Product;
  priorities?: Priorities;
  variant?: "grid" | "list" | "compact";
  showActions?: boolean;
  href?: string;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, priorities, variant = "grid", showActions = true, href, className, priority }: ProductCardProps) {
  const link = href ?? routes.product(product.slug);
  const score = priorities ? personalScore(product, priorities) : product.suitabilityScore;
  const specs = keySpecs(product);

  if (variant === "compact")
    return (
      <Link href={link} className={cn("group flex items-center gap-3 rounded-[14px] border border-border bg-card p-2.5 pr-3.5 transition-all hover:border-border-strong hover:shadow-sm", className)}>
        <ImageWithFallback src={product.images[0]} alt={product.name} aspect="size-16 shrink-0 rounded-[10px] bg-gradient-to-b from-surface-2 to-surface-3/60" sizes="64px" className="p-1.5" />
        <div className="min-w-0 flex-1">
          <BrandLabel brandId={product.brandId} className="text-[10px]" />
          <p className="truncate text-[14px] font-semibold leading-tight">{product.model}</p>
          <ProductPrice product={product} size="sm" showSaving={false} className="mt-0.5" />
        </div>
        <ScorePill score={score} />
      </Link>
    );

  if (variant === "list")
    return (
      <motion.article layout="position" className={cn("group relative flex flex-col gap-4 rounded-[20px] border border-border bg-card p-3 shadow-xs transition-all hover:border-border-strong hover:shadow-md sm:flex-row sm:p-4", className)}>
        <Link href={link} className="absolute inset-0 z-0 rounded-[20px]" aria-label={product.name} />
        <ImageWithFallback src={product.images[0]} alt={product.name} aspect="aspect-[4/3] w-full shrink-0 rounded-[14px] bg-gradient-to-b from-surface-2 to-surface-3/50 sm:aspect-square sm:w-44" sizes="(max-width: 640px) 100vw, 176px" className="p-3 transition-transform duration-500 group-hover:scale-[1.04]" priority={priority} />
        <div className="relative z-10 pointer-events-none flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <BrandLabel brandId={product.brandId} />
                {product.sponsored && <SponsoredTag />}
              </div>
              <h3 className="mt-1 text-[17px] font-semibold leading-snug">{product.model}</h3>
              <p className="text-[13px] text-muted-foreground">{product.modelNumber} · {product.type}</p>
            </div>
            <ScorePill score={score} />
          </div>
          <dl className="grid grid-cols-3 gap-2">
            {specs.map((s) => (
              <div key={s.label} className="rounded-[10px] bg-surface-2 px-2.5 py-2">
                <dt className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">{s.label}</dt>
                <dd className="mt-0.5 truncate text-[13px] font-semibold tabular">{s.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <ProductPrice product={product} />
              <ProductRating rating={product.rating} count={product.reviewCount} />
            </div>
            <div className="pointer-events-auto flex items-center gap-3">
              <EvidenceCoverage coverage={product.evidenceCoverage} variant="pill" />
              {showActions && (
                <>
                  <CompareToggle productId={product.id} />
                  <SaveButton productId={product.id} />
                </>
              )}
            </div>
          </div>
        </div>
      </motion.article>
    );

  return (
    <motion.article layout="position" className={cn("group relative flex flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-xs transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md", className)}>
      <Link href={link} className="absolute inset-0 z-0" aria-label={product.name} />
      <div className="relative bg-gradient-to-b from-surface-2 via-surface-2/70 to-card">
        <ImageWithFallback src={product.images[0]} alt={product.name} aspect="aspect-[5/4]" sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" className="p-5 transition-transform duration-500 ease-out group-hover:scale-[1.05]" priority={priority} />
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {product.sponsored && <SponsoredTag />}
            {product.badges?.slice(0, 1).map((b) => (
              <Badge key={b} variant={b === "Price drop" ? "success" : b === "Energy leader" ? "lime" : "solid"} className="shadow-sm">
                {b}
              </Badge>
            ))}
          </div>
          {showActions && <SaveButton productId={product.id} variant="overlay" className="pointer-events-auto relative z-10" />}
        </div>
        <ScorePill score={score} className="absolute bottom-3 left-3" />
      </div>
      <div className="relative z-10 pointer-events-none flex flex-1 flex-col gap-3 p-4 pt-3">
        <div>
          <BrandLabel brandId={product.brandId} />
          <h3 className="mt-1 line-clamp-1 text-[16px] font-semibold leading-snug">{product.model}</h3>
          <p className="text-[12px] text-muted-foreground">{product.type} · {product.modelNumber}</p>
        </div>
        <dl className="grid grid-cols-3 divide-x divide-border rounded-[10px] border border-border">
          {specs.map((s) => (
            <div key={s.label} className="min-w-0 px-2 py-1.5 text-center">
              <dt className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">{s.label}</dt>
              <dd className="truncate text-[12px] font-semibold tabular">{s.value}</dd>
            </div>
          ))}
        </dl>
        <EvidenceCoverage coverage={product.evidenceCoverage} />
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="space-y-0.5">
            <ProductPrice product={product} size="md" />
            <ProductRating rating={product.rating} count={product.reviewCount} />
          </div>
          <ArrowUpRight className="size-5 text-subtle-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
        {showActions && (
          <div className="pointer-events-auto -mx-4 -mb-4 mt-1 flex items-center justify-between border-t border-border px-4 py-2.5">
            <CompareToggle productId={product.id} />
            <span className="text-[11px] text-subtle-foreground tabular">{product.capacity.label}: {product.capacity.value} {product.capacity.unit}</span>
          </div>
        )}
      </div>
    </motion.article>
  );
}

export function ProductGrid({ products, priorities, className, columns = "default" }: { products: Product[]; priorities?: Priorities; className?: string; columns?: "default" | "wide" }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", columns === "wide" ? "lg:grid-cols-3 2xl:grid-cols-4" : "xl:grid-cols-3", className)}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priorities={priorities} priority={i < 3} />
      ))}
    </div>
  );
}

export function ProductList({ products, priorities, className }: { products: Product[]; priorities?: Priorities; className?: string }) {
  return (
    <div className={cn("grid gap-3", className)}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priorities={priorities} variant="list" priority={i < 2} />
      ))}
    </div>
  );
}

/** Horizontally scrolling carousel on mobile, grid on desktop. */
export function ProductCarousel({ products, className }: { products: Product[]; className?: string }) {
  return (
    <div className={cn("scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4", className)}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} className="w-[78%] shrink-0 snap-start sm:w-[46%] md:w-auto" />
      ))}
    </div>
  );
}
