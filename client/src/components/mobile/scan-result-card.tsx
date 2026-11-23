"use client";

import Link from "next/link";
import { useId } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, MessageSquareText, PackageSearch, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { EvidenceCoverage, SuitabilityScore } from "@/components/analysis/score";
import { SponsoredTag } from "@/components/analysis/warnings";
import { BrandLabel, ProductPrice, ProductRating, ProductStatusBadge } from "@/components/product/product-bits";
import { CompareToggle, SaveButton } from "@/components/product/product-actions";

export function ScanMatchCard({ product, code, confidence, method, onReset, className }: { product: Product; code: string; confidence: number; method: "camera" | "manual"; onReset: () => void; className?: string }) {
  const tid = useId();
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      aria-labelledby={tid}
      className={cn("overflow-hidden rounded-[24px] border border-border bg-card shadow-lg", className)}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border bg-success-soft/50 px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-success">
          <BadgeCheck className="size-4" /> {method === "manual" ? "Exact EAN-13 match" : "Barcode matched"}
        </span>
        <span className="text-[12px] text-muted-foreground">
          Match confidence <strong className="tabular text-foreground">{confidence.toFixed(1)}%</strong>
        </span>
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex gap-4">
          <ImageWithFallback src={product.images[0]} alt={product.name} aspect="size-28 shrink-0 rounded-[16px] bg-gradient-to-b from-surface-2 to-surface-3/60" sizes="112px" className="p-2" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <BrandLabel brandId={product.brandId} />
              {product.sponsored && <SponsoredTag />}
            </div>
            <h2 id={tid} className="mt-0.5 text-[18px] font-semibold leading-snug">
              {product.model}
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Model <span className="font-medium text-foreground">{product.modelNumber}</span> · EAN <span className="tabular">{code}</span>
            </p>
            <ProductPrice product={product} size="md" className="mt-1.5" />
            <ProductRating rating={product.rating} count={product.reviewCount} className="mt-0.5" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-4 rounded-[16px] bg-surface-2/70 p-3">
          <SuitabilityScore score={product.suitabilityScore} size="sm" label={false} />
          <div className="min-w-0">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Suitability · typical priorities</p>
            <EvidenceCoverage coverage={product.evidenceCoverage} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
          <ProductStatusBadge product={product} />
          <span>{product.tagline}</span>
        </div>
        <div className="mt-4 grid gap-2">
          <Button asChild variant="brand" size="lg" className="w-full">
            <Link href={routes.productAnalysis(product.slug)}>
              Continue to analysis <ArrowRight />
            </Link>
          </Button>
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <CompareToggle productId={product.id} variant="button" className="h-11" />
            <Button asChild variant="outline" className="h-11">
              <Link href={`${routes.ask}?product=${product.slug}`}>
                <MessageSquareText /> Ask
              </Link>
            </Button>
            <SaveButton productId={product.id} className="size-11 rounded-[10px] border border-border-strong" />
          </div>
          <Button variant="ghost" className="h-11" onClick={onReset}>
            <RotateCcw /> Scan another
          </Button>
        </div>
      </div>
    </motion.section>
  );
}

export function ScanNotFoundCard({ code, onReset, className }: { code: string; onReset: () => void; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      role="alert"
      className={cn("rounded-[24px] border border-warning/35 bg-card p-5 shadow-lg", className)}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-warning-soft text-warning-foreground">
          <PackageSearch className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold">We don&apos;t have this product yet</h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
            <span className="tabular font-medium text-foreground">{code}</span> is a valid EAN-13 code, but it doesn&apos;t match any of the products Qeivo has analysed. We won&apos;t guess a near match.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button asChild variant="outline" className="h-11">
          <Link href={routes.products}>
            <Search /> Search by name
          </Link>
        </Button>
        <Button variant="outline" className="h-11" onClick={() => toast.success("Request noted", { description: "Demo only — in the full product this queues the barcode for our research team." })}>
          <PackageSearch /> Request analysis
        </Button>
      </div>
      <Button variant="ghost" className="mt-2 h-11 w-full" onClick={onReset}>
        <RotateCcw /> Try another barcode
      </Button>
    </motion.section>
  );
}
