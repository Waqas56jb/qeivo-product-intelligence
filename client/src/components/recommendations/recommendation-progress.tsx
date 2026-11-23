"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Step progress for the questionnaire. Steps are clickable so answers can be revisited in any order. */
export function RecommendationProgress({ steps, current, onStep, className }: { steps: { id: string; label: string; summary?: string }[]; current: number; onStep: (i: number) => void; className?: string }) {
  const pct = Math.min(100, ((current + 1) / steps.length) * 100);
  return (
    <nav aria-label="Questionnaire progress" className={className}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">
          Step <span className="tabular text-foreground">{Math.min(current + 1, steps.length)}</span> of <span className="tabular">{steps.length}</span>
        </p>
        <p className="truncate text-[12px] text-muted-foreground">{steps[Math.min(current, steps.length - 1)]?.label}</p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={Math.min(current + 1, steps.length)} aria-label="Questions answered">
        <motion.div className="h-full rounded-full bg-brand" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
      </div>
      <ol className="scrollbar-none -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onStep(i)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "inline-flex h-11 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition-colors sm:h-9",
                  active ? "border-primary bg-primary text-primary-foreground" : done ? "border-brand/30 bg-brand-soft/60 text-brand-soft-foreground hover:bg-brand-soft" : "border-border bg-surface text-muted-foreground hover:text-foreground",
                )}
              >
                <span className={cn("grid size-4 place-items-center rounded-full text-[10px] tabular", active ? "bg-white/20" : done ? "bg-brand text-brand-foreground" : "bg-surface-2")}>{done ? <Check className="size-3" strokeWidth={3} /> : i + 1}</span>
                {s.label}
                {s.summary && !active && <span className="hidden max-w-[110px] truncate font-normal opacity-75 xl:inline">· {s.summary}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
