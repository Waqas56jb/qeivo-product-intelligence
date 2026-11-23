"use client";

import { RotateCcw } from "lucide-react";
import type { CategorySlug, ScoreFactorKey } from "@/types";
import { getCategory } from "@/data/products/categories";
import { FACTOR_ORDER } from "@/data/products/build-helpers";
import { PRIORITY_LABELS, type Priorities, type PriorityLevel } from "@/lib/scoring";
import { cn } from "@/lib/utils";

const LEVELS: PriorityLevel[] = [0, 1, 2, 3, 4];
const SHORT: Record<PriorityLevel, string> = { 0: "Skip", 1: "Low", 2: "Std", 3: "High", 4: "Must" };

/** Five-level importance for each score factor. Standard (2) is the neutral default. */
export function PrioritySelector({ category, value, onChange, className }: { category: CategorySlug; value: Priorities; onChange: (v: Priorities) => void; className?: string }) {
  const labels = getCategory(category).factorLabels;
  const custom = Object.values(value).some((v) => v !== undefined && v !== 2);
  const set = (k: ScoreFactorKey, l: PriorityLevel) => onChange({ ...value, [k]: l });
  return (
    <div className={cn("space-y-1", className)}>
      {FACTOR_ORDER.map((k) => {
        const level = (value[k] ?? 2) as PriorityLevel;
        return (
          <div key={k} className="flex flex-col gap-2 rounded-[12px] py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[14px] font-medium">{labels[k]}</p>
              <p className="text-[12px] text-muted-foreground">{PRIORITY_LABELS[level]}</p>
            </div>
            <div role="radiogroup" aria-label={`${labels[k]} importance`} className="grid grid-cols-5 gap-1 rounded-[11px] bg-surface-2 p-1 sm:w-[300px]">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  role="radio"
                  aria-checked={level === l}
                  aria-label={PRIORITY_LABELS[l]}
                  onClick={() => set(k, l)}
                  className={cn(
                    "h-10 rounded-[8px] text-[12px] font-medium transition-all sm:h-8",
                    level === l ? (l >= 3 ? "bg-brand text-brand-foreground shadow-sm" : l === 0 ? "bg-surface-3 text-foreground shadow-sm" : "bg-surface text-foreground shadow-sm") : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {SHORT[l]}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      {custom && (
        <button type="button" onClick={() => onChange({})} className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-[13px] font-medium text-brand-soft-foreground hover:underline">
          <RotateCcw className="size-3.5" /> Reset all to standard
        </button>
      )}
    </div>
  );
}
