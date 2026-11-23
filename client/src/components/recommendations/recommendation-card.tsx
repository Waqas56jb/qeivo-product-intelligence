"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, CircleHelp, Minus, MessageSquareText, Ruler } from "lucide-react";
import type { RegionCode } from "@/types";
import type { Recommendation } from "@/lib/recommend";
import { routes } from "@/config/routes";
import { scoreBand } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/common/display";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { EvidenceCoverage, SuitabilityScore } from "@/components/analysis/score";
import { SponsoredTag } from "@/components/analysis/warnings";
import { BrandLabel, ProductRating } from "@/components/product/product-bits";
import { CompareToggle, SaveButton } from "@/components/product/product-actions";

const FIT = {
  fits: { label: "Fits your space", icon: Check, className: "bg-success-soft text-success" },
  unknown: { label: "Fit unconfirmed", icon: CircleHelp, className: "bg-surface-2 text-muted-foreground" },
  "no-fit": { label: "Doesn't fit", icon: Minus, className: "bg-danger-soft text-danger-foreground" },
} as const;

export function RecommendationCard({ rec, rank, region, spaceGiven }: { rec: Recommendation; rank: number; region: RegionCode; spaceGiven: boolean }) {
  const p = rec.product;
  const band = scoreBand(rec.personalScore);
  const fit = FIT[rec.fit];
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby={`rec-${p.id}`}
      className={cn("relative overflow-hidden rounded-[20px] border bg-card shadow-xs", rank === 1 ? "border-brand/40 ring-1 ring-brand/15" : "border-border")}
    >
      {rank === 1 && <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-brand/10 blur-3xl" />}
      <div className="relative p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", rank === 1 ? "bg-brand text-brand-foreground" : "bg-surface-2 text-muted-foreground")}>{rank === 1 ? "Best match" : `#${rank} match`}</span>
          <div className="flex items-center gap-1.5">
            {p.sponsored && <SponsoredTag />}
            <SaveButton productId={p.id} />
          </div>
        </div>

        <div className="mt-3 flex gap-4">
          <ImageWithFallback src={p.images[0]} alt={p.name} aspect="size-24 shrink-0 rounded-[14px] bg-gradient-to-b from-surface-2 to-surface-3/60 sm:size-28" sizes="112px" className="p-2" />
          <div className="min-w-0 flex-1">
            <BrandLabel brandId={p.brandId} />
            <h3 id={`rec-${p.id}`} className="mt-0.5 text-[17px] font-semibold leading-snug">
              {p.model}
            </h3>
            <p className="truncate text-[12px] text-muted-foreground">
              {p.type} · {p.modelNumber}
            </p>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
              <CurrencyDisplay usd={p.price} region={region} className="text-[18px] font-semibold tracking-tight" />
              {p.originalPrice && <CurrencyDisplay usd={p.originalPrice} region={region} strike className="text-[12px]" />}
            </div>
            <ProductRating rating={p.rating} count={p.reviewCount} className="mt-0.5" />
          </div>
        </div>

        {/* Suitability and evidence are separate metrics — shown side by side, never combined. */}
        <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-4 rounded-[14px] bg-surface-2/70 p-3">
          <div className="flex items-center gap-2.5">
            <SuitabilityScore score={rec.personalScore} size="sm" label={false} personalised />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Your suitability</p>
              <p className="text-[13px] font-medium">{band.label}</p>
            </div>
          </div>
          <EvidenceCoverage coverage={p.evidenceCoverage} variant="stacked" />
        </div>

        {spaceGiven && (
          <span className={cn("mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium", fit.className)}>
            <fit.icon className="size-3.5" /> {fit.label}
            {rec.fit === "unknown" && <span className="font-normal">— ventilation not published</span>}
          </span>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">Why it matches</p>
            <ul className="space-y-1.5">
              {rec.reasons.slice(0, 3).map((r) => (
                <li key={r} className="flex gap-2 text-[13px] leading-snug">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">Trade-offs</p>
            {rec.tradeoffs.length ? (
              <ul className="space-y-1.5">
                {rec.tradeoffs.map((t) => (
                  <li key={t} className="flex gap-2 text-[13px] leading-snug text-muted-foreground">
                    <Minus className="mt-0.5 size-3.5 shrink-0 text-warning" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-muted-foreground">No notable trade-offs against your answers.</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <CompareToggle productId={p.id} variant="button" className="h-11 flex-1 sm:h-9 sm:flex-none" />
          <Button asChild variant="ghost" className="h-11 sm:h-9">
            <Link href={`${routes.ask}?product=${p.slug}&q=${encodeURIComponent("What are its biggest weaknesses?")}`}>
              <MessageSquareText /> Ask
            </Link>
          </Button>
          {p.category === "refrigerators" || p.category === "washing-machines" ? (
            <Button asChild variant="ghost" className="hidden h-9 sm:inline-flex">
              <Link href={routes.productCompatibility(p.slug)}>
                <Ruler /> Check fit
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="default" className="ml-auto h-11 sm:h-9">
            <Link href={routes.product(p.slug)}>
              Details <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
