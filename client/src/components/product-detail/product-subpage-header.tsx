import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Product } from "@/types";
import { routes } from "@/config/routes";
import { Breadcrumbs } from "@/components/layout/page";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { BrandLabel } from "@/components/product/product-bits";
import { EvidenceCoverage, ScorePill } from "@/components/analysis/score";
import { ProductSubnav } from "./product-subnav";

/**
 * Shared header for every product research sub-page (analysis, score, reviews,
 * ownership cost, compatibility): product identity, page title and sub-navigation.
 */
export function ProductSubpageHeader({
  product,
  eyebrow,
  title,
  description,
  actions,
}: {
  product: Product;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 space-y-5 sm:mb-8">
      <Breadcrumbs className="hidden sm:block" />
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-3">
          <Link href={routes.product(product.slug)} className="group inline-flex max-w-full items-center gap-3 rounded-[14px] border border-border bg-card py-1.5 pl-1.5 pr-3.5 shadow-xs transition-colors hover:border-border-strong">
            <ImageWithFallback src={product.images[0]} alt="" aspect="size-11 shrink-0 rounded-[10px] bg-gradient-to-b from-surface-2 to-surface-3/60" sizes="44px" className="p-1" />
            <span className="min-w-0">
              <BrandLabel brandId={product.brandId} className="text-[10px]" />
              <span className="flex items-center gap-1.5 truncate text-[14px] font-semibold leading-tight">
                {product.model}
                <ArrowLeft className="size-3.5 shrink-0 text-subtle-foreground transition-transform group-hover:-translate-x-0.5" aria-hidden />
                <span className="sr-only">Back to product overview</span>
              </span>
            </span>
          </Link>
          <div className="space-y-1.5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-soft-foreground">{eyebrow}</p>
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[32px]">{title}</h1>
            {description && <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ScorePill score={product.suitabilityScore} />
          <EvidenceCoverage coverage={product.evidenceCoverage} variant="pill" />
          {actions}
        </div>
      </div>
      <ProductSubnav slug={product.slug} />
    </header>
  );
}
