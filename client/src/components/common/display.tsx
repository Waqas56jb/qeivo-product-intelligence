"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { RegionCode } from "@/types";
import { formatCurrency, formatDate, formatPrice, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";

/** Price display that follows the selected demo region. `usd` is the base reference price. */
export function CurrencyDisplay({ usd, region, className, strike }: { usd: number; region?: RegionCode; className?: string; strike?: boolean }) {
  const storeRegion = useAppStore((s) => s.region);
  const hydrated = useHydrated();
  const r = region ?? (hydrated ? storeRegion : "US");
  return <span className={cn("tabular", strike && "text-muted-foreground line-through decoration-1", className)}>{formatPrice(usd, r)}</span>;
}

/** Formats an already-regional amount (e.g. invoice totals) without conversion. */
export function MoneyDisplay({ amount, region = "US", decimals = 2, className }: { amount: number; region?: RegionCode; decimals?: number; className?: string }) {
  return <span className={cn("tabular", className)}>{formatCurrency(amount, region, { decimals })}</span>;
}

export function DateDisplay({ iso, relative, pattern, className }: { iso: string; relative?: boolean; pattern?: string; className?: string }) {
  return (
    <time dateTime={iso} title={formatDate(iso, "d MMMM yyyy")} className={cn("tabular", className)}>
      {relative ? formatRelative(iso) : formatDate(iso, pattern)}
    </time>
  );
}

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  hint,
  className,
  invertDelta,
  children,
}: {
  label: string;
  value: React.ReactNode;
  delta?: number;
  deltaLabel?: string;
  icon?: LucideIcon;
  hint?: string;
  className?: string;
  invertDelta?: boolean;
  children?: React.ReactNode;
}) {
  const positive = delta !== undefined && (invertDelta ? delta < 0 : delta >= 0);
  return (
    <div className={cn("flex flex-col gap-3 rounded-[14px] border border-border bg-card p-5 shadow-xs", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <span className="grid size-8 place-items-center rounded-[9px] bg-surface-2 text-muted-foreground">
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="tabular text-[26px] font-semibold leading-none tracking-tight">{value}</span>
        {delta !== undefined && (
          <span className={cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[12px] font-medium tabular", positive ? "bg-success-soft text-success" : "bg-danger-soft text-danger-foreground")}>
            {delta >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      {(hint || deltaLabel) && <p className="text-[12px] text-subtle-foreground">{hint ?? deltaLabel}</p>}
      {children}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, action, className, align = "left" }: { eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string; align?: "left" | "center" }) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", align === "center" && "items-center text-center sm:flex-col sm:items-center", className)}>
      <div className={cn("max-w-2xl space-y-2", align === "center" && "mx-auto")}>
        {eyebrow && <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-soft-foreground">{eyebrow}</p>}
        <h2 className="text-[26px] font-semibold leading-tight sm:text-[30px]">{title}</h2>
        {description && <p className="text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function KeyValue({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 py-2 text-sm", className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium tabular">{value}</span>
    </div>
  );
}
