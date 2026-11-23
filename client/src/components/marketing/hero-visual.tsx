"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, FileText, FlaskConical, MinusCircle, Ruler } from "lucide-react";
import { requireProduct } from "@/data/products";
import { images } from "@/data/images";
import { routes } from "@/config/routes";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { ClaimTypeBadge, SourceCitation } from "@/components/analysis/badges";
import { EvidenceCoverage, SuitabilityScore } from "@/components/analysis/score";
import { BrandLabel, ProductPrice } from "@/components/product/product-bits";

const ease = [0.22, 1, 0.36, 1] as const;

/** Product intelligence preview for the homepage hero — built from real seed data. */
export function HeroVisual() {
  const p = requireProduct("p-halden-precision-fd590");
  const measured = p.specs.find((g) => g.id === "energy")?.items.find((i) => i.key === "kwh-measured");
  return (
    <div className="relative mx-auto w-full max-w-[560px] sm:pb-16 lg:max-w-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease }}
        className="absolute right-0 top-0 hidden h-[88%] w-[72%] overflow-hidden rounded-[24px] shadow-lg sm:block"
      >
        <ImageWithFallback src={images.kitchens[3]} alt="Bright modern kitchen" aspect="size-full" priority sizes="(max-width: 1024px) 70vw, 40vw" />
        <div className="absolute inset-0 bg-gradient-to-tr from-navy-950/55 via-navy-950/10 to-transparent" />
      </motion.div>

      <motion.article
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease }}
        className="relative z-10 rounded-[24px] border border-border bg-card/95 p-4 shadow-lg backdrop-blur-xl sm:mt-24 sm:w-[86%] sm:p-5"
        aria-label={`Example analysis of ${p.name}`}
      >
        <div className="flex gap-4">
          <div className="relative w-[104px] shrink-0 overflow-hidden rounded-[16px] bg-gradient-to-b from-surface-2 to-surface-3/60 sm:w-[124px]">
            <ImageWithFallback src={p.images[0]} alt={p.name} aspect="aspect-[3/4]" priority sizes="124px" className="p-2.5" />
          </div>
          <div className="min-w-0 flex-1">
            <BrandLabel brandId={p.brandId} withMark />
            <h3 className="mt-1 text-[17px] font-semibold leading-tight">{p.model}</h3>
            <p className="text-[12px] text-muted-foreground">
              {p.capacity.value} L · {p.type} · {p.modelNumber}
            </p>
            <ProductPrice product={p} size="sm" className="mt-1.5" />
            <div className="mt-3 flex items-center gap-3">
              <SuitabilityScore score={p.suitabilityScore} size="sm" label={false} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Suitability</p>
                <p className="text-[13px] font-semibold text-success">Excellent fit for a family of four</p>
              </div>
            </div>
          </div>
        </div>

        <EvidenceCoverage coverage={p.evidenceCoverage} className="mt-4" />

        <div className="mt-4 space-y-2.5">
          {p.strengths.slice(0, 2).map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
              <p className="flex-1 text-[13px] leading-snug">{c.text}</p>
              <ClaimTypeBadge type={c.type} size="xs" showLabel={false} />
            </div>
          ))}
          {p.limitations.slice(0, 1).map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <MinusCircle className="mt-0.5 size-4 shrink-0 text-warning" />
              <p className="flex-1 text-[13px] leading-snug">{c.text}</p>
              <ClaimTypeBadge type={c.type} size="xs" showLabel={false} />
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <FileText className="size-3.5" /> <strong className="tabular text-foreground">{p.sourceIds.length}</strong> sources analysed
          </span>
          <Link href={routes.product(p.slug)} className="text-[12px] font-semibold text-brand-soft-foreground hover:underline">
            Open full analysis →
          </Link>
        </div>
      </motion.article>

      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.55, ease }}
        className="absolute -left-2 top-0 z-20 hidden rounded-[14px] border border-border bg-popover p-3 shadow-lg md:block lg:-left-8"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-[9px] bg-claim-measured-soft text-claim-measured">
            <FlaskConical className="size-4" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">Measured energy use</p>
            <p className="tabular text-[14px] font-semibold">
              {String(measured?.value ?? p.energy.annualKwh)} kWh/yr <span className="text-[11px] font-normal text-muted-foreground">vs {p.energy.annualKwh} rated</span>
            </p>
          </div>
        </div>
        <div className="mt-2">
          <SourceCitation sourceId={`${p.id}:lab`} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.75, ease }}
        className="absolute -bottom-5 right-2 z-20 flex items-center gap-2.5 rounded-[14px] border border-border bg-popover p-3 pr-4 shadow-lg sm:bottom-0 sm:right-0"
      >
        <span className="grid size-8 place-items-center rounded-[9px] bg-success-soft text-success">
          <Ruler className="size-4" />
        </span>
        <div>
          <p className="text-[11px] font-medium text-muted-foreground">Compatibility</p>
          <p className="text-[13px] font-semibold tabular">
            Needs {p.dimensions.widthMm + (p.installation.ventilationMm?.sides ?? 0) * 2} mm width incl. airflow
          </p>
        </div>
      </motion.div>
    </div>
  );
}
