"use client";

import type { ApiKey } from "@/types";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/primitives";
import type { HttpMethod } from "./dev-data";

const METHOD_CLASS: Record<HttpMethod, string> = {
  GET: "bg-info-soft text-info-foreground",
  POST: "bg-success-soft text-success",
  PATCH: "bg-warning-soft text-warning-foreground",
  DELETE: "bg-danger-soft text-danger-foreground",
};

export function MethodBadge({ method, className }: { method: HttpMethod; className?: string }) {
  return <span className={cn("inline-flex h-5 min-w-[46px] shrink-0 items-center justify-center rounded-[6px] px-1.5 font-mono text-[10.5px] font-semibold tracking-wide", METHOD_CLASS[method], className)}>{method}</span>;
}

export function StatusCode({ status, className }: { status: number; className?: string }) {
  const tone = status >= 500 ? "bg-danger" : status === 429 ? "bg-warning" : status >= 400 ? "bg-warning" : "bg-success";
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-[12px] font-medium tabular", className)}>
      <span className={cn("size-1.5 rounded-full", tone)} aria-hidden />
      {status}
    </span>
  );
}

export function EnvBadge({ env, className }: { env: ApiKey["environment"]; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full px-2 text-[11px] font-semibold",
        env === "live" ? "bg-success-soft text-success" : "bg-warning-soft text-warning-foreground",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", env === "live" ? "bg-success" : "bg-warning")} aria-hidden />
      {env === "live" ? "Live" : "Test"}
    </span>
  );
}

export function ScopeChips({ scopes, className }: { scopes: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-1", className)} aria-label="Scopes">
      {scopes.map((s) => (
        <li key={s} className="rounded-[6px] border border-border bg-surface-2/70 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          {s}
        </li>
      ))}
    </ul>
  );
}

export function QuotaMeter({ used, limit, label, className, projected }: { used: number; limit: number; label?: string; className?: string; projected?: number }) {
  const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
  const projPct = projected && limit ? Math.min(100, (projected / limit) * 100) : null;
  const tone = pct >= 90 ? "bg-danger" : pct >= 75 ? "bg-warning" : undefined;
  return (
    <div className={cn("min-w-0", className)}>
      {label && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[12px]">
          <span className="truncate font-medium">{label}</span>
          <span className="shrink-0 tabular text-muted-foreground">{Math.round(pct)}%</span>
        </div>
      )}
      <div className="relative">
        <Progress value={pct} indicatorClassName={tone} aria-label={`${label ?? "Quota"}: ${used.toLocaleString("en-US")} of ${limit.toLocaleString("en-US")}`} />
        {projPct !== null && (
          <span aria-hidden className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-foreground/50" style={{ left: `calc(${projPct}% - 1px)` }} />
        )}
      </div>
      <p className="mt-1.5 text-[12px] tabular text-subtle-foreground">
        {used.toLocaleString("en-US")} / {limit.toLocaleString("en-US")} requests
      </p>
    </div>
  );
}

/** Notice used on every developer page: the API is a preview with illustrative data. */
export function PreviewNotice({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start gap-3 rounded-[14px] border border-info/25 bg-info-soft/60 px-4 py-3 text-[13px] leading-relaxed text-info-foreground", className)}>
      <span className="mt-0.5 rounded-full bg-info px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Preview</span>
      <p>
        The Qeivo API is in private preview. Usage, keys and responses on these pages are illustrative demo data — no requests are made and no real credentials exist.
      </p>
    </div>
  );
}
