"use client";

import { Check, CircleHelp, Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClaimTypeBadge, SourceCitation } from "@/components/analysis/badges";
import type { CompareCell } from "./compare-utils";

/**
 * One comparison value: normalised text (or check / cross for booleans), claim-type marker,
 * clickable citation and a "best" highlight. Missing data is explicit — "Not published".
 */
export function SpecificationDifference({ cell, highlight = true, className }: { cell: CompareCell; highlight?: boolean; className?: string }) {
  if (cell.text === null)
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-[13px] text-subtle-foreground", className)}>
        <CircleHelp className="size-3.5" aria-hidden /> Not published
      </span>
    );
  const best = highlight && cell.best;
  return (
    <span className={cn("inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-1.5 gap-y-1", className)}>
      {cell.bool !== undefined ? (
        <span className={cn("inline-flex items-center gap-1.5 text-[14px] font-medium", cell.bool ? "text-foreground" : "text-muted-foreground")}>
          <span className={cn("grid size-5 place-items-center rounded-full", cell.bool ? "bg-success-soft text-success" : "bg-surface-3 text-subtle-foreground")}>
            {cell.bool ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
          </span>
          <span className="sr-only">{cell.bool ? "Yes" : "No"}</span>
          <span aria-hidden>{cell.bool ? "Yes" : "No"}</span>
        </span>
      ) : (
        <span className={cn("tabular rounded-[7px] text-[14px] font-medium", best && "bg-success-soft px-1.5 py-0.5 font-semibold text-success")}>{cell.text}</span>
      )}
      {best && (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-success">
          <Trophy className="size-3" aria-hidden /> Best
        </span>
      )}
      {cell.claimType && <ClaimTypeBadge type={cell.claimType} size="xs" showLabel={false} />}
      {cell.sourceId && <SourceCitation sourceId={cell.sourceId} index={1} variant="number" className="mx-0" />}
    </span>
  );
}
