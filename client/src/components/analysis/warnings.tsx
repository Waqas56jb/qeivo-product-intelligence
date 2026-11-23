"use client";

import type { LucideIcon } from "lucide-react";
import { CircleHelp, Clock4, GitPullRequestArrow, HelpCircle, Megaphone, ShieldAlert, Tag } from "lucide-react";
import type { DataWarning, WarningKind } from "@/types";
import { cn } from "@/lib/utils";
import { SourceList } from "./badges";

const KIND: Record<WarningKind, { icon: LucideIcon; label: string; className: string; iconClass: string }> = {
  missing: { icon: CircleHelp, label: "Missing data", className: "border-border-strong bg-surface-2/70", iconClass: "bg-surface-3 text-muted-foreground" },
  conflict: { icon: GitPullRequestArrow, label: "Conflicting sources", className: "border-warning/35 bg-warning-soft/60", iconClass: "bg-warning-soft text-warning-foreground" },
  stale: { icon: Clock4, label: "Data freshness", className: "border-info/30 bg-info-soft/60", iconClass: "bg-info-soft text-info-foreground" },
  unverified: { icon: Megaphone, label: "Unverified claim", className: "border-claim-manufacturer/30 bg-claim-manufacturer-soft/60", iconClass: "bg-claim-manufacturer-soft text-claim-manufacturer" },
  "low-evidence": { icon: ShieldAlert, label: "Low evidence", className: "border-danger/25 bg-danger-soft/50", iconClass: "bg-danger-soft text-danger-foreground" },
  "unknown-compatibility": { icon: HelpCircle, label: "Unknown compatibility", className: "border-border-strong bg-surface-2/70", iconClass: "bg-surface-3 text-muted-foreground" },
};

/** Informative (not alarming) data-quality notice. */
export function DataWarningCard({ warning, compact, className }: { warning: DataWarning; compact?: boolean; className?: string }) {
  const k = KIND[warning.kind];
  return (
    <div role="note" className={cn("flex gap-3 rounded-[12px] border p-3.5", k.className, className)}>
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-[9px]", k.iconClass)}>
        <k.icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{k.label}</p>
        <p className="text-[14px] font-medium leading-snug">{warning.title}</p>
        {!compact && <p className="text-[13px] leading-relaxed text-muted-foreground">{warning.detail}</p>}
        {!compact && warning.sourceIds?.length ? <SourceList ids={warning.sourceIds} className="pt-1" /> : null}
      </div>
    </div>
  );
}

export function MissingDataWarning(props: { title: string; detail: string; sourceIds?: string[]; className?: string }) {
  return <DataWarningCard warning={{ kind: "missing", ...props }} className={props.className} />;
}
export function ConflictingDataWarning(props: { title: string; detail: string; sourceIds?: string[]; className?: string }) {
  return <DataWarningCard warning={{ kind: "conflict", ...props }} className={props.className} />;
}
export function StaleDataWarning(props: { title: string; detail: string; sourceIds?: string[]; className?: string }) {
  return <DataWarningCard warning={{ kind: "stale", ...props }} className={props.className} />;
}

export function WarningList({ warnings, compact, className }: { warnings: DataWarning[]; compact?: boolean; className?: string }) {
  if (!warnings.length) return null;
  return (
    <div className={cn("grid gap-2.5", className)}>
      {warnings.map((w, i) => (
        <DataWarningCard key={`${w.kind}-${i}`} warning={w} compact={compact} />
      ))}
    </div>
  );
}

/** Disclosure shown next to any sponsored or affiliate content. */
export function SponsoredDisclosure({ kind = "sponsored", className, detail }: { kind?: "sponsored" | "affiliate"; className?: string; detail?: string }) {
  return (
    <p className={cn("flex items-start gap-2 rounded-[10px] border border-warning/30 bg-warning-soft/50 px-3 py-2 text-[12px] leading-relaxed text-warning-foreground", className)}>
      <Tag className="mt-0.5 size-3.5 shrink-0" />
      <span>
        <strong className="font-semibold">{kind === "sponsored" ? "Sponsored placement." : "Affiliate links."}</strong>{" "}
        {detail ??
          (kind === "sponsored"
            ? "This placement is paid for. It never changes suitability scores, AI verdicts, rankings or recommendations."
            : "Qeivo may earn a commission from retailer links. Commissions never influence scores, rankings or recommendations.")}
      </span>
    </p>
  );
}

export function SponsoredTag({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning-foreground", className)}>
      Sponsored
    </span>
  );
}
