"use client";

import { Info, Scale, ShieldCheck } from "lucide-react";
import type { CategorySlug } from "@/types";
import { getCategory } from "@/data/products/categories";
import { PRIORITY_LABELS, type Priorities, type PriorityLevel } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/tabs";

export interface ExclusionBreakdown {
  region: number;
  budget: number;
  space: number;
  water: number;
}

/** Transparent account of how the ranking was produced. */
export function RecommendationExplanation({ category, priorities, considered, excluded, breakdown, className }: { category: CategorySlug; priorities: Priorities; considered: number; excluded: number; breakdown: ExclusionBreakdown; className?: string }) {
  const labels = getCategory(category).factorLabels;
  const weighted = (Object.entries(priorities) as [keyof typeof labels, PriorityLevel][]).filter(([, v]) => v !== 2).sort((a, b) => b[1] - a[1]);
  const reasons = [
    breakdown.budget && `${breakdown.budget} outside your budget`,
    breakdown.region && `${breakdown.region} not sold in your region`,
    breakdown.space && `${breakdown.space} too large for your space`,
    breakdown.water && `${breakdown.water} need a water supply`,
  ].filter(Boolean) as string[];
  return (
    <section aria-labelledby="how-ranking-works" className={cn("rounded-[20px] border border-border bg-card p-4 shadow-xs sm:p-5", className)}>
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-soft text-brand-soft-foreground">
          <Scale className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 id="how-ranking-works" className="text-[15px] font-semibold">
            How this ranking works
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            <span className="tabular font-medium text-foreground">{considered}</span> {getCategory(category).name.toLowerCase()} considered ·{" "}
            <span className="tabular font-medium text-foreground">{excluded}</span> excluded{reasons.length ? ` (${reasons.join(", ")})` : ""}.
          </p>
        </div>
      </div>
      <Accordion type="single" collapsible className="mt-2">
        <AccordionItem value="method" className="border-b-0">
          <AccordionTrigger className="py-3 text-[13px]">Method, weights and what never counts</AccordionTrigger>
          <AccordionContent className="space-y-3 text-[13px] leading-relaxed">
            <ol className="list-decimal space-y-1.5 pl-4">
              <li>Products outside your region, budget (with 8% headroom), measured space or water-supply limits are removed.</li>
              <li>Each remaining product&apos;s eight factor scores are re-weighted by your priorities to give your personal suitability (0–10).</li>
              <li>Requested features, preferred brands and capacity for your household adjust the order; going over budget or under-sizing is penalised.</li>
              <li>Ties are broken by evidence coverage, then by price.</li>
            </ol>
            {weighted.length > 0 && (
              <div>
                <p className="mb-1.5 font-medium text-foreground">Your non-standard priorities</p>
                <div className="flex flex-wrap gap-1.5">
                  {weighted.map(([k, v]) => (
                    <span key={k} className="rounded-full bg-surface-2 px-2.5 py-1 text-[12px]">
                      {labels[k]} · {PRIORITY_LABELS[v]}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <p className="flex gap-2 rounded-[10px] bg-surface-2 p-2.5 text-[12px]">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Evidence coverage is shown separately and never merged into suitability. A provisional score is flagged, not hidden.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <p className="mt-1 flex items-start gap-2 rounded-[12px] border border-border bg-surface-2/60 p-3 text-[12px] leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
        <span>
          <strong className="font-semibold text-foreground">Sponsored placements never influence this ranking.</strong> Sponsored products are labelled where they appear, and affiliate commissions are not an input.
        </span>
      </p>
    </section>
  );
}
