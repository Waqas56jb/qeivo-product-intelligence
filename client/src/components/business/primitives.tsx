"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Lock, Minus, ShieldCheck } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/charts/charts";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/tabs";

/* ----------------------------------------------------------------- Stat card */

export function DeltaPill({ value, unit = "%", invert, className, digits = 1 }: { value: number; unit?: string; invert?: boolean; className?: string; digits?: number }) {
  const flat = Math.abs(value) < 0.05;
  const good = invert ? value < 0 : value > 0;
  const Icon = flat ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[12px] font-medium tabular",
        flat ? "bg-surface-2 text-muted-foreground" : good ? "bg-success-soft text-success" : "bg-danger-soft text-danger-foreground",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      <span className="sr-only">{value >= 0 ? "Up" : "Down"}</span>
      {Math.abs(value).toFixed(digits)}
      {unit}
    </span>
  );
}

/** KPI tile with delta, comparison hint and optional sparkline. */
export function BusinessStatCard({
  label,
  value,
  change,
  changeUnit = "%",
  changeDigits,
  invert,
  icon: Icon,
  hint = "vs previous period",
  spark,
  sparkColor = 0,
  className,
  href,
}: {
  label: string;
  value: React.ReactNode;
  change?: number;
  changeUnit?: string;
  changeDigits?: number;
  invert?: boolean;
  icon?: LucideIcon;
  hint?: string;
  spark?: number[];
  sparkColor?: number;
  className?: string;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[13px] font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-surface-2 text-muted-foreground transition-colors group-hover:bg-brand-soft group-hover:text-brand-soft-foreground">
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
        <span className="tabular text-[26px] font-semibold leading-none tracking-tight">{value}</span>
        {change !== undefined && <DeltaPill value={change} unit={changeUnit} invert={invert} digits={changeDigits} />}
      </div>
      {spark && spark.length > 1 ? <Sparkline values={spark} color={sparkColor} height={34} className="-mx-1 mt-auto" /> : null}
      {hint && <p className="text-[12px] text-subtle-foreground">{hint}</p>}
    </>
  );
  const cls = cn("group flex min-w-0 flex-col gap-3 rounded-[14px] border border-border bg-card p-4 shadow-xs sm:p-5", href && "transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-sm", className);
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/* --------------------------------------------------------------------- Panel */

/** Generic content card with a header row — matches ChartCard's frame. */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  id,
  flush,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
  /** Remove body padding (for lists/tables that bleed to the edges) */
  flush?: boolean;
}) {
  return (
    <section id={id} className={cn("min-w-0 rounded-[14px] border border-border bg-card shadow-xs", className)}>
      {(title || action) && (
        <div className={cn("flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5", flush && "pb-3")}>
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>}
            {description && <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn(flush ? "" : "p-4 sm:p-5", !flush && (title || action) && "pt-4 sm:pt-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 rounded-[8px] px-2 py-1 text-[13px] font-medium text-brand-soft-foreground hover:bg-brand-soft/50">
      {children} <ArrowRight className="size-3.5" />
    </Link>
  );
}

/* -------------------------------------------------------------- Trust notice */

/** States plainly that business accounts can't influence Qeivo scores. */
export function ScoreIntegrityNotice({ children, className, variant = "banner", role = "Manufacturers" }: { children?: React.ReactNode; className?: string; variant?: "banner" | "inline"; role?: string }) {
  if (variant === "inline")
    return (
      <p className={cn("flex items-start gap-2 text-[12px] leading-relaxed text-muted-foreground", className)}>
        <Lock className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
        <span>{children ?? `${role} cannot edit or influence Qeivo suitability scores, evidence coverage, rankings or verdicts.`}</span>
      </p>
    );
  return (
    <div role="note" className={cn("flex items-start gap-3 rounded-[14px] border border-brand/25 bg-brand-soft/40 p-4", className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-soft text-brand-soft-foreground">
        <ShieldCheck className="size-[18px]" />
      </span>
      <div className="min-w-0 text-[13px] leading-relaxed text-muted-foreground">
        <p className="text-[14px] font-semibold text-foreground">{role} cannot influence Qeivo scores</p>
        <p>{children ?? "Suitability scores, evidence coverage, rankings and AI verdicts are calculated independently from verified evidence. You can supply data and respond to customers — Qeivo verifies everything before it is published."}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Range filter */

export function RangeFilter<T extends string>({ value, onChange, options, label = "Date range", className }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label?: string; className?: string }) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      aria-label={label}
      className={cn("shrink-0", className)}
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value} className="px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

/* ------------------------------------------------------------ Product thumb */

export function ProductThumb({ product, size = "md", className, meta }: { product: Pick<Product, "name" | "images" | "modelNumber">; size?: "sm" | "md"; className?: string; meta?: React.ReactNode }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-3", className)}>
      <ImageWithFallback src={product.images[0]} alt="" fit="contain" sizes="48px" wrapperClassName={cn("shrink-0 rounded-[10px] border border-border bg-surface-2", size === "sm" ? "size-9" : "size-11")} className="p-1" />
      <span className="min-w-0">
        <span className="block truncate text-[13.5px] font-medium leading-tight text-foreground">{product.name}</span>
        <span className="block truncate font-mono text-[11.5px] text-muted-foreground">{meta ?? product.modelNumber}</span>
      </span>
    </span>
  );
}

/* ------------------------------------------------------------- Status badge */

export type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info" | "manufacturer";

const TONE: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted-foreground",
  brand: "bg-brand-soft text-brand-soft-foreground",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning-foreground",
  danger: "bg-danger-soft text-danger-foreground",
  info: "bg-info-soft text-info-foreground",
  manufacturer: "bg-claim-manufacturer-soft text-claim-manufacturer",
};
const DOT: Record<Tone, string> = {
  neutral: "bg-subtle-foreground",
  brand: "bg-brand",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  manufacturer: "bg-claim-manufacturer",
};

/** Small status label with a coloured dot. */
export function StatusDot({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-medium", TONE[tone], className)}>
      <span className={cn("size-1.5 rounded-full", DOT[tone])} aria-hidden />
      {children}
    </span>
  );
}

/** "Demo" marker for simulated states. */
export function DemoTag({ className, children = "Demo" }: { className?: string; children?: React.ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full border border-dashed border-border-strong px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground", className)}>{children}</span>;
}

/** Numbered step indicator for wizards. */
export function Stepper({ steps, current, className }: { steps: string[]; current: number; className?: string }) {
  return (
    <ol className={cn("flex items-center gap-2 overflow-x-auto scrollbar-none", className)} aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex shrink-0 items-center gap-2" aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "grid size-7 place-items-center rounded-full text-[12px] font-semibold tabular transition-colors",
                done ? "bg-brand text-brand-foreground" : active ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground",
              )}
            >
              {i + 1}
            </span>
            <span className={cn("text-[13px] font-medium", active ? "text-foreground" : "text-muted-foreground", !active && "hidden sm:inline")}>{s}</span>
            {i < steps.length - 1 && <span className={cn("h-px w-6 sm:w-10", done ? "bg-brand" : "bg-border-strong")} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
