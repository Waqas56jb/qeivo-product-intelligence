"use client";

import type { ClaimType, Confidence, SourceType } from "@/types";
import { getSource } from "@/data/sources/sources";
import { cn } from "@/lib/utils";
import { Hint } from "@/components/ui/tooltip";
import { CLAIM_META, SOURCE_META } from "./meta";
import { useSourceDrawer } from "./source-drawer";

export function ClaimTypeBadge({ type, size = "sm", showLabel = true, className }: { type: ClaimType; size?: "xs" | "sm"; showLabel?: boolean; className?: string }) {
  const m = CLAIM_META[type];
  return (
    <Hint label={<span><strong className="font-semibold">{m.label}.</strong> {m.description}</span>}>
      <span
        tabIndex={0}
        className={cn(
          "inline-flex shrink-0 cursor-help items-center gap-1 rounded-full border font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          size === "xs" ? "h-5 px-1.5 text-[10px]" : "h-6 px-2 text-[11px]",
          m.className,
          className,
        )}
      >
        <m.icon className={size === "xs" ? "size-3" : "size-3.5"} aria-hidden />
        {showLabel ? m.short : <span className="sr-only">{m.label}</span>}
      </span>
    </Hint>
  );
}

export function SourceTypeBadge({ type, className }: { type: SourceType; className?: string }) {
  const m = SOURCE_META[type];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted-foreground", className)}>
      <m.icon className={cn("size-3", m.tone)} /> {m.label}
    </span>
  );
}

/**
 * Clickable inline citation. Shows a compact locator ("Manual · p.14") and
 * opens the local source panel focused on that source.
 */
export function SourceCitation({ sourceId, allIds, index, variant = "chip", className }: { sourceId: string; allIds?: string[]; index?: number; variant?: "chip" | "number"; className?: string }) {
  const { openSources } = useSourceDrawer();
  const s = getSource(sourceId);
  if (!s) return null;
  const meta = SOURCE_META[s.type];
  const open = () => openSources(allIds ?? [sourceId], sourceId);
  if (variant === "number")
    return (
      <button
        type="button"
        onClick={open}
        aria-label={`Source ${index ?? ""}: ${s.title}, ${s.locator}`}
        className={cn("mx-0.5 inline-grid h-[18px] min-w-[18px] place-items-center rounded-[5px] bg-brand-soft px-1 align-text-top text-[10px] font-semibold tabular text-brand-soft-foreground transition-colors hover:bg-brand hover:text-brand-foreground", className)}
      >
        {index ?? "•"}
      </button>
    );
  return (
    <button
      type="button"
      onClick={open}
      className={cn("inline-flex max-w-full items-center gap-1 rounded-[7px] border border-border bg-surface px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground", className)}
      aria-label={`Open source: ${s.title}, ${s.locator}`}
    >
      <meta.icon className={cn("size-3 shrink-0", meta.tone)} />
      <span className="truncate">{meta.label}</span>
      <span className="text-subtle-foreground">·</span>
      <span className="truncate tabular">{s.locator}</span>
    </button>
  );
}

export function SourceList({ ids, className, max }: { ids: string[]; className?: string; max?: number }) {
  const { openSources } = useSourceDrawer();
  const shown = max ? ids.slice(0, max) : ids;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {shown.map((id) => (
        <SourceCitation key={id} sourceId={id} allIds={ids} />
      ))}
      {max && ids.length > max && (
        <button type="button" onClick={() => openSources(ids)} className="text-[11px] font-medium text-brand-soft-foreground hover:underline">
          +{ids.length - max} more
        </button>
      )}
    </div>
  );
}

const CONF: Record<Confidence, { label: string; bars: number; className: string }> = {
  high: { label: "High confidence", bars: 3, className: "bg-success" },
  moderate: { label: "Moderate confidence", bars: 2, className: "bg-warning" },
  low: { label: "Low confidence", bars: 1, className: "bg-danger" },
};

export function ConfidenceIndicator({ level, showLabel = false, className }: { level: Confidence; showLabel?: boolean; className?: string }) {
  const c = CONF[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground", className)} title={c.label}>
      <span className="flex items-end gap-[2px]" aria-hidden>
        {[1, 2, 3].map((b) => (
          <span key={b} className={cn("w-[3px] rounded-full", b <= c.bars ? c.className : "bg-border-strong")} style={{ height: 4 + b * 3 }} />
        ))}
      </span>
      {showLabel ? c.label : <span className="sr-only">{c.label}</span>}
    </span>
  );
}
