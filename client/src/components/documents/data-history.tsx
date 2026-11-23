"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, ChevronDown, Clock4, DatabaseZap, FilePlus2, GitPullRequestArrow, History, PencilLine, RefreshCcw, XCircle, AlertTriangle } from "lucide-react";
import type { DataRevision, ImportRecord } from "@/types";
import { revisions } from "@/data/imports/revisions";
import { importErrors, importHistory } from "@/data/imports/import-history";
import { getProduct, products } from "@/data/products";
import { getSource } from "@/data/sources/sources";
import { routes } from "@/config/routes";
import { formatDate } from "@/lib/format";
import { cn, DEMO_NOW, initials, pluralize } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { DateDisplay, StatCard } from "@/components/common/display";
import { FilterChip } from "@/components/common/controls";
import { EmptyState } from "@/components/common/states";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { SourceCitation } from "@/components/analysis/badges";
import { ConflictingDataWarning } from "@/components/analysis/warnings";
import { ProductStatusBadge } from "@/components/product/product-bits";
import { REVISION_KIND_META } from "./meta";

type KindFilter = DataRevision["kind"] | "all";

const KIND_ICON: Record<DataRevision["kind"], { icon: LucideIcon; className: string }> = {
  update: { icon: RefreshCcw, className: "bg-info-soft text-info-foreground" },
  correction: { icon: PencilLine, className: "bg-brand-soft text-brand-soft-foreground" },
  conflict: { icon: GitPullRequestArrow, className: "bg-warning-soft text-warning-foreground" },
  "new-source": { icon: FilePlus2, className: "bg-success-soft text-success" },
};

const IMPORT_STATUS: Record<ImportRecord["status"], { label: string; icon: LucideIcon; variant: "success" | "warning" | "danger"; iconClass: string }> = {
  completed: { label: "Completed", icon: CheckCircle2, variant: "success", iconClass: "bg-success-soft text-success" },
  partial: { label: "Partial", icon: AlertTriangle, variant: "warning", iconClass: "bg-warning-soft text-warning-foreground" },
  failed: { label: "Failed", icon: XCircle, variant: "danger", iconClass: "bg-danger-soft text-danger-foreground" },
};

const isEmpty = (v: string) => v === "—" || v.trim() === "";

function RevisionEntry({ r }: { r: DataRevision }) {
  const p = getProduct(r.productId);
  const k = KIND_ICON[r.kind];
  const meta = REVISION_KIND_META[r.kind];
  const hasSource = Boolean(getSource(r.sourceId));
  return (
    <li className="relative flex gap-3 pb-5 last:pb-0 sm:gap-4 [&:last-child>.tl-line]:hidden">
      <span aria-hidden className="tl-line absolute bottom-0 left-[17px] top-10 w-px bg-border" />
      <span className={cn("relative z-10 grid size-9 shrink-0 place-items-center rounded-full ring-4 ring-background", k.className)}>
        <k.icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1 rounded-[14px] border border-border bg-card p-3.5 shadow-xs sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div className="min-w-0">
            {p ? (
              <Link href={routes.product(p.slug)} className="text-[12px] font-medium text-muted-foreground hover:text-foreground hover:underline">
                {p.name}
              </Link>
            ) : (
              <span className="text-[12px] text-muted-foreground">Unknown product</span>
            )}
            <p className="text-[15px] font-semibold leading-snug">{r.field}</p>
          </div>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className={cn("min-w-0 rounded-[10px] px-3 py-2 sm:flex-1", isEmpty(r.previous) ? "border border-dashed border-border-strong" : "bg-surface-2")}>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground">Previous</span>
            <span className={cn("block break-words text-[13px] tabular", isEmpty(r.previous) ? "italic text-subtle-foreground" : "text-muted-foreground line-through decoration-danger/60")}>{isEmpty(r.previous) ? "Not recorded" : r.previous}</span>
          </div>
          <ArrowRight className="hidden size-4 shrink-0 text-subtle-foreground sm:block" aria-hidden />
          <div className={cn("min-w-0 rounded-[10px] px-3 py-2 sm:flex-1", r.kind === "conflict" ? "bg-warning-soft" : "bg-success-soft")}>
            <span className={cn("block text-[10px] font-semibold uppercase tracking-wider", r.kind === "conflict" ? "text-warning-foreground" : "text-success")}>{r.kind === "conflict" ? "Conflicting value" : "Now"}</span>
            <span className="block break-words text-[13px] font-semibold tabular">{r.next}</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="grid size-6 place-items-center rounded-full bg-surface-3 text-[10px] font-semibold text-foreground">{r.actor === "System" ? <DatabaseZap className="size-3" /> : initials(r.actor)}</span>
            {r.actor}
          </span>
          <span aria-hidden className="text-subtle-foreground">·</span>
          <DateDisplay iso={r.date} pattern="d MMM yyyy, HH:mm" />
          {hasSource && <SourceCitation sourceId={r.sourceId} className="max-w-[240px]" />}
        </div>
      </div>
    </li>
  );
}

function ImportRow({ rec }: { rec: ImportRecord }) {
  const [open, setOpen] = useState(false);
  const st = IMPORT_STATUS[rec.status];
  const errs = importErrors.filter((e) => e.importId === rec.id);
  return (
    <li className="rounded-[14px] border border-border bg-card shadow-xs">
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 gap-3">
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-[10px]", st.iconClass)}>
            <st.icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold leading-snug">{rec.name}</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {rec.source} · {rec.actor} · <DateDisplay iso={rec.date} pattern="d MMM yyyy, HH:mm" />
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-4 gap-2 text-center md:w-[300px] md:shrink-0">
          {[
            { l: "Rows", v: rec.rows },
            { l: "Created", v: rec.created },
            { l: "Updated", v: rec.updated },
            { l: "Failed", v: rec.failed, tone: rec.failed ? "text-danger-foreground" : undefined },
          ].map((s) => (
            <div key={s.l} className="rounded-[8px] bg-surface-2 px-1 py-1.5">
              <dt className="text-[10px] uppercase tracking-wider text-subtle-foreground">{s.l}</dt>
              <dd className={cn("text-[13px] font-semibold tabular", s.tone)}>{s.v.toLocaleString("en-US")}</dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center justify-between gap-2 md:w-[150px] md:shrink-0 md:justify-end">
          <Badge variant={st.variant}>{st.label}</Badge>
          {errs.length > 0 ? (
            <Button variant="ghost" size="sm" className="h-9" aria-expanded={open} aria-controls={`err-${rec.id}`} onClick={() => setOpen(!open)}>
              {pluralize(errs.length, "error")} <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
            </Button>
          ) : null}
        </div>
      </div>
      {open && errs.length > 0 && (
        <div id={`err-${rec.id}`} className="border-t border-border bg-surface-2/50 px-4 py-3">
          <ul className="space-y-1.5">
            {errs.map((e) => (
              <li key={`${e.row}-${e.field}`} className="flex flex-wrap gap-x-2 text-[12px]">
                <span className="font-mono text-subtle-foreground tabular">{e.row ? `row ${e.row}` : "job"}</span>
                <span className="font-mono font-medium">{e.field}</span>
                <span className="text-muted-foreground">{e.message}</span>
              </li>
            ))}
          </ul>
          {rec.failed > errs.length && <p className="mt-2 text-[11px] text-subtle-foreground">Showing {errs.length} of {rec.failed} failed rows in this demo log.</p>}
        </div>
      )}
    </li>
  );
}

export function DataHistory() {
  const [productId, setProductId] = useState("all");
  const [kind, setKind] = useState<KindFilter>("all");
  const [limit, setLimit] = useState(10);
  const [showAllStale, setShowAllStale] = useState(false);

  const productOptions = useMemo(() => {
    const ids = Array.from(new Set(revisions.map((r) => r.productId)));
    return ids
      .map((id) => getProduct(id))
      .filter((p) => p !== undefined)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const byProduct = useMemo(() => (productId === "all" ? revisions : revisions.filter((r) => r.productId === productId)), [productId]);
  const filtered = useMemo(() => (kind === "all" ? byProduct : byProduct.filter((r) => r.kind === kind)), [byProduct, kind]);
  const shown = filtered.slice(0, limit);

  const groups = useMemo(() => {
    const m = new Map<string, DataRevision[]>();
    for (const r of shown) {
      const key = formatDate(r.date, "MMMM yyyy");
      m.set(key, [...(m.get(key) ?? []), r]);
    }
    return Array.from(m.entries());
  }, [shown]);

  const stale = useMemo(
    () =>
      products
        .filter((p) => p.freshness !== "current" && (productId === "all" || p.id === productId))
        .sort((a, b) => (a.freshness === b.freshness ? a.lastVerified.localeCompare(b.lastVerified) : a.freshness === "stale" ? -1 : 1)),
    [productId],
  );
  const conflicts = byProduct.filter((r) => r.kind === "conflict");

  const thirtyDaysAgo = new Date(DEMO_NOW.getTime() - 30 * 86_400_000).toISOString();
  const recentImports = importHistory.filter((i) => i.date >= thirtyDaysAgo);
  const kindCount = (k: KindFilter) => (k === "all" ? byProduct.length : byProduct.filter((r) => r.kind === k).length);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Revisions logged" value={revisions.length} icon={History} hint="Every change keeps its previous value" />
        <StatCard label="Open conflicts" value={revisions.filter((r) => r.kind === "conflict").length} icon={GitPullRequestArrow} hint="Sources disagree — both values kept" />
        <StatCard label="Imports (30 days)" value={recentImports.length} icon={DatabaseZap} hint={`${recentImports.filter((i) => i.status !== "completed").length} need attention`} />
        <StatCard label="Aging or stale" value={products.filter((p) => p.freshness !== "current").length} icon={Clock4} hint={`of ${products.length} products`} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Select
          value={productId}
          onValueChange={(v) => {
            setProductId(v);
            setLimit(10);
          }}
        >
          <SelectTrigger className="lg:w-[300px]" aria-label="Filter by product">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products</SelectItem>
            {productOptions.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="group" aria-label="Change type">
          {(["all", "update", "correction", "conflict", "new-source"] as KindFilter[]).map((k) => (
            <FilterChip
              key={k}
              active={kind === k}
              count={kindCount(k)}
              onClick={() => {
                setKind(k);
                setLimit(10);
              }}
            >
              {k === "all" ? "All changes" : REVISION_KIND_META[k].label}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="rev-title" className="min-w-0">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 id="rev-title" className="text-[18px] font-semibold">
              Revision history
            </h2>
            <span className="text-[12px] text-muted-foreground tabular">
              {Math.min(limit, filtered.length)} of {filtered.length}
            </span>
          </div>
          {filtered.length === 0 ? (
            <EmptyState
              icon={History}
              title="No changes match these filters"
              description="Try another change type or choose all products."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setKind("all");
                    setProductId("all");
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          ) : (
            <div className="space-y-6">
              {groups.map(([month, items]) => (
                <div key={month}>
                  <h3 className="sticky top-14 z-20 -mx-1 mb-3 bg-background/90 px-1 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle-foreground backdrop-blur lg:top-16">{month}</h3>
                  <ol>
                    {items.map((r) => (
                      <RevisionEntry key={r.id} r={r} />
                    ))}
                  </ol>
                </div>
              ))}
              {filtered.length > limit && (
                <Button variant="outline" className="h-11 w-full" onClick={() => setLimit((l) => l + 10)}>
                  Show {Math.min(10, filtered.length - limit)} more changes
                </Button>
              )}
            </div>
          )}
        </section>

        <aside className="min-w-0 space-y-8">
          <section aria-labelledby="stale-title">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 id="stale-title" className="text-[18px] font-semibold">
                Stale data alerts
              </h2>
              <span className="text-[12px] text-muted-foreground tabular">{stale.length}</span>
            </div>
            <p className="mb-3 text-[13px] leading-relaxed text-muted-foreground">Products whose data hasn&apos;t been re-verified recently. Scores still show, but with a freshness warning.</p>
            {stale.length === 0 ? (
              <EmptyState compact icon={CheckCircle2} title="Everything is current" description="This product was verified recently." />
            ) : (
              <ul className="space-y-2">
                {(showAllStale ? stale : stale.slice(0, 5)).map((p) => (
                  <li key={p.id}>
                    <Link href={routes.product(p.slug)} className="flex items-center gap-3 rounded-[14px] border border-border bg-card p-2.5 transition-colors hover:border-border-strong">
                      <ImageWithFallback src={p.images[0]} alt="" aspect="size-12 shrink-0 rounded-[10px] bg-surface-2" sizes="48px" className="p-1" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold">{p.name}</p>
                        <p className="text-[12px] text-muted-foreground">
                          Last verified <DateDisplay iso={p.lastVerified} relative />
                        </p>
                      </div>
                      <ProductStatusBadge product={p} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {stale.length > 5 && (
              <Button variant="ghost" size="sm" className="mt-2 h-10 w-full" onClick={() => setShowAllStale(!showAllStale)}>
                {showAllStale ? "Show fewer" : `Show all ${stale.length}`}
              </Button>
            )}
          </section>

          <section aria-labelledby="conflict-title">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 id="conflict-title" className="text-[18px] font-semibold">
                Conflicting sources
              </h2>
              <span className="text-[12px] text-muted-foreground tabular">{conflicts.length}</span>
            </div>
            {conflicts.length === 0 ? (
              <EmptyState compact icon={GitPullRequestArrow} title="No open conflicts" description="Sources for this selection agree." />
            ) : (
              <div className="space-y-2.5">
                {conflicts.map((r) => {
                  const p = getProduct(r.productId);
                  return (
                    <ConflictingDataWarning
                      key={r.id}
                      title={`${p?.model ?? "Product"}: ${r.field}`}
                      detail={`Earlier record: ${isEmpty(r.previous) ? "not recorded" : r.previous}. New source reports ${r.next}. Both values are kept and shown until the conflict is resolved.`}
                      sourceIds={getSource(r.sourceId) ? [r.sourceId] : undefined}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </aside>
      </div>

      <section aria-labelledby="imports-title">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="imports-title" className="text-[18px] font-semibold">
            Data import history
          </h2>
          <span className="text-[12px] text-muted-foreground">Feeds, crawls and uploads that changed the catalogue</span>
        </div>
        <ul className="space-y-2">
          {importHistory.map((rec) => (
            <ImportRow key={rec.id} rec={rec} />
          ))}
        </ul>
      </section>
    </div>
  );
}
