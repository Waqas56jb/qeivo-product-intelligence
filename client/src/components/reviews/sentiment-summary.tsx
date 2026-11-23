"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, MinusCircle } from "lucide-react";
import type { SentimentSummary as SentimentData } from "@/data/reviews";
import { cn } from "@/lib/utils";
import { SentimentBar } from "@/components/charts/domain-charts";
import { ClaimTypeBadge, SourceCitation } from "@/components/analysis/badges";

/**
 * Owner sentiment: positive / mixed / negative split, top praised and criticised
 * themes, and how often each aspect is mentioned. Always classified as customer opinion.
 */
export function SentimentSummary({ summary, productId, className, maxAspects = 6, aspectsOpen = false }: { summary: SentimentData; productId: string; className?: string; maxAspects?: number; aspectsOpen?: boolean }) {
  const [open, setOpen] = useState(aspectsOpen);
  const aspects = summary.aspects.slice(0, maxAspects);
  const maxMentions = Math.max(1, ...aspects.map((a) => a.positive + a.negative));
  return (
    <section aria-labelledby="sentiment-heading" className={cn("rounded-[20px] border border-border bg-card p-5 shadow-xs", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="sentiment-heading" className="text-[15px] font-semibold tracking-tight">
            Owner sentiment
          </h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Themes extracted from owner reviews.</p>
        </div>
        <ClaimTypeBadge type="customer" size="xs" />
      </div>

      <SentimentBar positive={summary.positive} mixed={summary.mixed} negative={summary.negative} className="mt-4" />

      <div className="mt-5 grid gap-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">Most praised</p>
          <ul className="space-y-1.5">
            {summary.topPositive.slice(0, 3).map((t) => (
              <li key={t} className="flex gap-2 text-[13px] leading-snug">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">Most criticised</p>
          <ul className="space-y-1.5">
            {summary.topNegative.slice(0, 3).map((t) => (
              <li key={t} className="flex gap-2 text-[13px] leading-snug">
                <MinusCircle className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {aspects.length > 0 && (
        <div className="mt-4 border-t border-border pt-1">
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="aspect-mentions" className="flex h-11 w-full items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground hover:text-foreground">
            Aspect mentions ({summary.aspects.length})
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden />
          </button>
          <ul id="aspect-mentions" hidden={!open} className="space-y-2.5 pb-1">
            {aspects.map((a) => {
              const total = a.positive + a.negative;
              return (
                <li key={a.label}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-[12px]">
                    <span className="truncate font-medium">{a.label}</span>
                    <span className="shrink-0 tabular text-muted-foreground">
                      <span className="text-success">{a.positive}</span> / <span className="text-danger-foreground">{a.negative}</span>
                    </span>
                  </div>
                  <div className="flex h-1.5 overflow-hidden rounded-full bg-surface-3" role="img" aria-label={`${a.label}: ${a.positive} positive, ${a.negative} negative mentions`}>
                    <span className="h-full bg-success" style={{ width: `${(a.positive / maxMentions) * 100}%` }} />
                    <span className="h-full bg-danger" style={{ width: `${(a.negative / maxMentions) * 100}%` }} />
                    <span className="sr-only">{total} mentions</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-[11px] text-subtle-foreground">
        Source <SourceCitation sourceId={`${productId}:customers`} />
      </div>
    </section>
  );
}
