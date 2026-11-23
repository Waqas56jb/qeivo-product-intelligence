"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { ShieldCheck } from "lucide-react";
import type { ScoreFactor } from "@/types";
import { evidenceBand, scoreBand } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Hint } from "@/components/ui/tooltip";
import { ConfidenceIndicator } from "./badges";

const SIZES = {
  xs: { box: 40, stroke: 4, text: "text-[13px]", sub: "hidden" },
  sm: { box: 56, stroke: 5, text: "text-[17px]", sub: "hidden" },
  md: { box: 96, stroke: 7, text: "text-[28px]", sub: "text-[11px]" },
  lg: { box: 152, stroke: 10, text: "text-[44px]", sub: "text-[12px]" },
  xl: { box: 200, stroke: 12, text: "text-[58px]", sub: "text-[13px]" },
};

/**
 * Suitability score ring (0–10). Visually distinct from evidence coverage,
 * which is always rendered as a segmented bar — the two are never combined.
 */
export function SuitabilityScore({ score, size = "md", label = true, className, personalised }: { score: number; size?: keyof typeof SIZES; label?: boolean; className?: string; personalised?: boolean }) {
  const s = SIZES[size];
  const id = useId();
  const r = (s.box - s.stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, score / 10));
  const band = scoreBand(score);
  return (
    <div className={cn("inline-flex flex-col items-center gap-1.5", className)}>
      <div className="relative" style={{ width: s.box, height: s.box }} role="img" aria-label={`Suitability score ${score.toFixed(1)} out of 10, ${band.label}`}>
        <svg width={s.box} height={s.box} viewBox={`0 0 ${s.box} ${s.box}`} className="-rotate-90">
          <defs>
            <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--teal-400)" />
              <stop offset="100%" stopColor="var(--teal-600)" />
            </linearGradient>
          </defs>
          <circle cx={s.box / 2} cy={s.box / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={s.stroke} />
          <motion.circle
            cx={s.box / 2}
            cy={s.box / 2}
            r={r}
            fill="none"
            stroke={`url(#${id}-g)`}
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - pct) }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("tabular font-semibold leading-none tracking-tight", s.text)}>{score.toFixed(1)}</span>
          <span className={cn("tabular font-medium text-subtle-foreground", s.sub)}>/ 10</span>
        </div>
      </div>
      {label && size !== "xs" && (
        <span className="text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{personalised ? "Your suitability" : "Suitability"}</span>
      )}
    </div>
  );
}

/** Compact inline score pill, e.g. on cards. */
export function ScorePill({ score, className }: { score: number; className?: string }) {
  const band = scoreBand(score);
  return (
    <Hint label={`Suitability ${score.toFixed(1)}/10 · ${band.label}`}>
      <span tabIndex={0} className={cn("inline-flex h-7 items-center gap-1.5 rounded-full bg-navy-900 pl-1.5 pr-2.5 text-white shadow-sm dark:bg-surface-3", className)}>
        <svg viewBox="0 0 20 20" className="size-[18px] -rotate-90" aria-hidden>
          <circle cx="10" cy="10" r="7.5" fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth="3" />
          <circle cx="10" cy="10" r="7.5" fill="none" stroke="var(--teal-400)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(score / 10) * 47.1} 47.1`} />
        </svg>
        <span className="tabular text-[13px] font-semibold">{score.toFixed(1)}</span>
        <span className="sr-only">out of 10 suitability</span>
      </span>
    </Hint>
  );
}

/** Evidence coverage — a segmented bar, never a ring. */
export function EvidenceCoverage({ coverage, variant = "bar", className, showLabel = true }: { coverage: number; variant?: "bar" | "pill" | "stacked"; className?: string; showLabel?: boolean }) {
  const band = evidenceBand(coverage);
  const tone = band.tone === "high" ? "bg-info" : band.tone === "moderate" ? "bg-warning" : "bg-danger";
  const filled = Math.round(coverage / 10);
  if (variant === "pill")
    return (
      <Hint label={`Evidence coverage ${coverage}% — share of scored data points backed by independent or verified sources. Separate from suitability.`}>
        <span tabIndex={0} className={cn("inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 text-[12px] font-medium", className)}>
          <ShieldCheck className={cn("size-3.5", band.tone === "high" ? "text-info" : band.tone === "moderate" ? "text-warning" : "text-danger")} />
          <span className="tabular">{coverage}%</span>
          <span className="text-muted-foreground">evidence</span>
        </span>
      </Hint>
    );
  return (
    <div className={cn("w-full", className)} role="img" aria-label={`Evidence coverage ${coverage} percent, ${band.label}`}>
      {showLabel && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Evidence coverage
          </span>
          <span className="tabular text-[13px] font-semibold">{coverage}%</span>
        </div>
      )}
      <div className="flex gap-[3px]">
        {Array.from({ length: 10 }, (_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className={cn("h-1.5 flex-1 rounded-full", i < filled ? tone : "bg-surface-3")}
          />
        ))}
      </div>
      {variant === "stacked" && <p className="mt-1.5 text-[12px] text-muted-foreground">{band.label}</p>}
    </div>
  );
}

export function ScoreBreakdown({ factors, personalWeights, className, showExplanations = true }: { factors: ScoreFactor[]; personalWeights?: Record<string, number>; className?: string; showExplanations?: boolean }) {
  return (
    <ul className={cn("divide-y divide-border", className)}>
      {factors.map((f, i) => {
        const w = personalWeights?.[f.key] ?? f.weight;
        return (
          <li key={f.key} className="py-3.5 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[14px] font-medium">{f.label}</span>
                <ConfidenceIndicator level={f.confidence} />
              </div>
              <div className="flex shrink-0 items-baseline gap-3">
                <span className="tabular text-[12px] text-subtle-foreground">weight {Math.round(w * 100)}%</span>
                <span className="tabular w-8 text-right text-[15px] font-semibold">{f.score.toFixed(1)}</span>
              </div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-3">
              <motion.div
                className={cn("h-full rounded-full", f.score >= 8 ? "bg-brand" : f.score >= 6.5 ? "bg-teal-400" : f.score >= 5 ? "bg-warning" : "bg-danger")}
                initial={{ width: 0 }}
                whileInView={{ width: `${f.score * 10}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            {showExplanations && <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{f.explanation}</p>}
          </li>
        );
      })}
    </ul>
  );
}
