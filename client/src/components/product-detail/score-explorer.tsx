"use client";

import { RotateCcw, ShieldCheck, Tag } from "lucide-react";
import type { Product, ScoreFactorKey } from "@/types";
import { evidenceBand, hasCustomPriorities, personaliseFactors, personalScore, PRIORITY_LABELS, scoreBand, type PriorityLevel } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/primitives";
import { EvidenceCoverage, ScoreBreakdown, SuitabilityScore } from "@/components/analysis/score";
import { ConfidenceIndicator } from "@/components/analysis/badges";

/** Interactive score explanation: priorities re-weight suitability live; evidence never changes. */
export function ScoreExplorer({ product }: { product: Product }) {
  const hydrated = useHydrated();
  const storePriorities = useAppStore((s) => s.priorities);
  const setPriority = useAppStore((s) => s.setPriority);
  const reset = useAppStore((s) => s.resetPriorities);
  const priorities = hydrated ? storePriorities : {};
  const factors = personaliseFactors(product, priorities);
  const score = personalScore(product, priorities);
  const custom = hasCustomPriorities(priorities);
  const band = scoreBand(score);
  const ev = evidenceBand(product.evidenceCoverage);
  const weights = Object.fromEntries(factors.map((f) => [f.key, f.personalWeight]));
  const top = [...factors].sort((a, b) => b.contribution - a.contribution).slice(0, 2);
  const weakest = [...factors].sort((a, b) => a.score - b.score)[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="flex flex-col items-center gap-4 rounded-[20px] border border-border bg-card p-6 text-center shadow-xs">
            <SuitabilityScore score={score} size="lg" personalised={custom} />
            <div>
              <p className={cn("text-[15px] font-semibold", band.tone === "excellent" || band.tone === "good" ? "text-success" : band.tone === "fair" ? "text-warning-foreground" : "text-danger-foreground")}>{band.label}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {custom ? `Personalised from the default ${product.suitabilityScore.toFixed(1)} using your priorities.` : "Using Qeivo's default weighting. Adjust priorities to personalise it."}
              </p>
            </div>
          </section>
          <section className="flex flex-col justify-center gap-4 rounded-[20px] border border-border bg-card p-6 shadow-xs">
            <EvidenceCoverage coverage={product.evidenceCoverage} variant="stacked" />
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              <strong className="text-foreground">A separate measure.</strong> Evidence coverage is the share of scored data points backed by independent tests, registries or verified documents ({ev.label.toLowerCase()}). Your priorities never change it, and it is never blended into suitability.
            </p>
          </section>
        </div>

        <section className="rounded-[20px] border border-border bg-card p-5 shadow-xs sm:p-6">
          <h2 className="text-[18px] font-semibold">Why it scores {score.toFixed(1)}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            The biggest contributors are <strong className="text-foreground">{top[0].label.toLowerCase()}</strong> ({top[0].score.toFixed(1)}) and{" "}
            <strong className="text-foreground">{top[1].label.toLowerCase()}</strong> ({top[1].score.toFixed(1)}). The weakest factor is{" "}
            <strong className="text-foreground">{weakest.label.toLowerCase()}</strong> at {weakest.score.toFixed(1)}/10 — {weakest.explanation.charAt(0).toLowerCase() + weakest.explanation.slice(1)}
          </p>
          <div className="mt-6">
            <ScoreBreakdown factors={product.scoreFactors} personalWeights={weights} />
          </div>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <section className="rounded-[20px] border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[16px] font-semibold">Your priorities</h2>
            <Button variant="ghost" size="sm" onClick={reset} disabled={!custom}>
              <RotateCcw /> Reset
            </Button>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">Applied to every product you view. Saved on this device.</p>
          <div className="mt-5 space-y-5">
            {factors.map((f) => {
              const level = (priorities[f.key as ScoreFactorKey] ?? 2) as PriorityLevel;
              return (
                <div key={f.key}>
                  <div className="flex items-center justify-between gap-2 text-[13px]">
                    <span className="flex items-center gap-1.5 font-medium">
                      {f.label} <ConfidenceIndicator level={f.confidence} />
                    </span>
                    <span className="tabular text-muted-foreground">
                      {PRIORITY_LABELS[level]} · {Math.round(f.personalWeight * 100)}%
                    </span>
                  </div>
                  <Slider className="mt-1.5" min={0} max={4} step={1} value={[level]} onValueChange={([v]) => setPriority(f.key, v as PriorityLevel)} aria-label={`${f.label} priority`} />
                </div>
              );
            })}
          </div>
        </section>
        <div className="flex gap-3 rounded-[14px] border border-warning/30 bg-warning-soft/50 p-4 text-[13px] leading-relaxed text-warning-foreground">
          <Tag className="mt-0.5 size-4 shrink-0" />
          <p>Sponsored placements, affiliate commissions and manufacturer partnerships are never inputs to this score.</p>
        </div>
        <div className="flex gap-3 rounded-[14px] border border-border bg-surface-2/60 p-4 text-[13px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
          <p>Confidence bars show how well each factor is supported. Low-confidence factors are scored conservatively until more evidence arrives.</p>
        </div>
      </aside>
    </div>
  );
}
