"use client";

import Link from "next/link";
import { CheckCircle2, MinusCircle, Scale } from "lucide-react";
import type { Claim, Product } from "@/types";
import { routes } from "@/config/routes";
import { AIInsightCard, ClaimItem, ClaimLegend } from "@/components/analysis/claims";
import { SponsoredDisclosure } from "@/components/analysis/warnings";
import { ClaimTypeBadge, SourceCitation } from "@/components/analysis/badges";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { BrandLabel } from "@/components/product/product-bits";
import { rowHighlights, type CompareGroup } from "./compare-utils";

/** Deterministic AI verdict with classified, cited statements plus explicit trade-offs. */
export function ComparisonVerdict({ verdict, tradeOffs }: { verdict: Claim[]; tradeOffs: Claim[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <AIInsightCard
        title="Qeivo comparison verdict"
        claims={verdict}
        footer={
          <div className="space-y-3">
            <ClaimLegend compact />
            <SponsoredDisclosure kind="sponsored" detail="Sponsored placements and affiliate commissions are never inputs to this verdict, the scores or the ranking above." />
          </div>
        }
      />
      <section className="rounded-[20px] border border-border bg-card p-5 shadow-xs sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-[9px] bg-surface-2 text-muted-foreground">
            <Scale className="size-4" />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold">Trade-offs to weigh</h3>
            <p className="text-[12px] text-muted-foreground">What you gain and give up between the leading options.</p>
          </div>
        </div>
        {tradeOffs.length ? (
          <ul className="space-y-4">
            {tradeOffs.map((c) => (
              <ClaimItem key={c.id} claim={c} />
            ))}
          </ul>
        ) : (
          <p className="text-[14px] text-muted-foreground">These products are closely matched; no single trade-off stands out.</p>
        )}
      </section>
    </div>
  );
}

/** Advantages / disadvantages per product: row wins and losses plus cited strengths and limitations. */
export function ComparisonAdvantages({ items, groups }: { items: Product[]; groups: CompareGroup[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {items.map((p) => {
        const { wins, losses } = rowHighlights(p.id, groups);
        return (
          <article key={p.id} className="flex min-w-0 flex-col rounded-[20px] border border-border bg-card p-5 shadow-xs">
            <Link href={routes.product(p.slug)} className="mb-4 flex items-center gap-3">
              <ImageWithFallback src={p.images[0]} alt="" aspect="size-12 shrink-0 rounded-[10px] bg-surface-2" sizes="48px" className="p-1" />
              <span className="min-w-0">
                <BrandLabel brandId={p.brandId} className="text-[10px]" />
                <span className="block truncate text-[15px] font-semibold hover:underline">{p.model}</span>
              </span>
            </Link>
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-success">Advantages</h4>
            {wins.length > 0 && (
              <ul className="mb-3 space-y-1.5">
                {wins.slice(0, 4).map((w) => (
                  <li key={w.text} className="flex gap-2 text-[13px] leading-snug">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    <span className="min-w-0">
                      {w.text}
                      {w.sourceId && <SourceCitation sourceId={w.sourceId} index={1} variant="number" />}
                      {w.claimType && <ClaimTypeBadge type={w.claimType} size="xs" showLabel={false} className="ml-1 align-middle" />}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <ul className="space-y-3">
              {p.strengths.slice(0, 2).map((c) => (
                <ClaimItem key={c.id} claim={c} className="[&_p]:text-[13px]" icon={<CheckCircle2 className="size-4 text-success" />} />
              ))}
            </ul>
            <h4 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-warning-foreground">Disadvantages</h4>
            {losses.length > 0 && (
              <ul className="mb-3 space-y-1.5">
                {losses.slice(0, 4).map((w) => (
                  <li key={w.text} className="flex gap-2 text-[13px] leading-snug">
                    <MinusCircle className="mt-0.5 size-4 shrink-0 text-warning" />
                    <span className="min-w-0">
                      {w.text}
                      {w.sourceId && <SourceCitation sourceId={w.sourceId} index={1} variant="number" />}
                      {w.claimType && <ClaimTypeBadge type={w.claimType} size="xs" showLabel={false} className="ml-1 align-middle" />}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <ul className="space-y-3">
              {p.limitations.slice(0, 2).map((c) => (
                <ClaimItem key={c.id} claim={c} className="[&_p]:text-[13px]" icon={<MinusCircle className="size-4 text-warning" />} />
              ))}
            </ul>
            <p className="mt-4 border-t border-border pt-3 text-[11px] leading-relaxed text-subtle-foreground">Wins and losses are measured against the other products in this comparison only.</p>
          </article>
        );
      })}
    </div>
  );
}
