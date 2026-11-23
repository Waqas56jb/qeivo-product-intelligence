"use client";

import { ChevronLeft, ChevronRight, FileQuestion, Minus, Plus, ScanSearch } from "lucide-react";
import type { ProductDocument } from "@/types";
import { getProduct } from "@/data/products";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/tooltip";
import { EXTRACTION_STATUS_META } from "./meta";

export const ZOOM_STEPS = [0.8, 0.9, 1, 1.15, 1.3, 1.5] as const;

/** Pages worth jumping to: pages with a rendered preview or an extracted value. */
export function pagesOfInterest(doc: ProductDocument) {
  return Array.from(new Set([...doc.previewPages.map((p) => p.page), ...doc.extractions.map((e) => e.page)])).sort((a, b) => a - b);
}

const HIGHLIGHT: Record<string, string> = {
  confirmed: "bg-brand-soft/70 shadow-[inset_2px_0_0_var(--brand)]",
  uncertain: "bg-warning-soft shadow-[inset_2px_0_0_var(--warning)]",
  contradiction: "bg-danger-soft shadow-[inset_2px_0_0_var(--danger)]",
};

function normalise(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ");
}

export function DocumentPreview({
  doc,
  page,
  onPageChange,
  zoom,
  onZoomChange,
  focusField,
  className,
}: {
  doc: ProductDocument;
  page: number;
  onPageChange: (page: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  focusField?: string | null;
  className?: string;
}) {
  const product = getProduct(doc.productId);
  const preview = doc.previewPages.find((p) => p.page === page);
  const onPage = doc.extractions.filter((e) => e.page === page);
  const interest = pagesOfInterest(doc);
  const zi = ZOOM_STEPS.findIndex((z) => z === zoom);

  const lineMatch = (line: string) => {
    const l = normalise(line);
    return onPage.find((e) => l.includes(normalise(e.value)) || (e.value.length > 3 && l.includes(normalise(e.value).split(" ")[0]) && l.includes(normalise(e.field).split(" ")[0])));
  };

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-1">
          <Hint label="Previous page">
            <Button variant="ghost" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft />
            </Button>
          </Hint>
          <span className="min-w-[88px] text-center text-[13px] font-medium tabular" aria-live="polite">
            Page {page} <span className="text-subtle-foreground">/ {doc.pages}</span>
          </span>
          <Hint label="Next page">
            <Button variant="ghost" size="icon" aria-label="Next page" disabled={page >= doc.pages} onClick={() => onPageChange(page + 1)}>
              <ChevronRight />
            </Button>
          </Hint>
        </div>
        <div className="flex items-center gap-1 rounded-[10px] border border-border bg-surface p-0.5">
          <Button variant="ghost" size="icon-sm" aria-label="Zoom out" disabled={zi <= 0} onClick={() => onZoomChange(ZOOM_STEPS[Math.max(0, zi - 1)])}>
            <Minus />
          </Button>
          <button type="button" onClick={() => onZoomChange(1)} className="h-8 min-w-[52px] rounded-[7px] text-[12px] font-semibold tabular text-muted-foreground hover:bg-surface-2 hover:text-foreground" aria-label="Reset zoom to 100%">
            {Math.round(zoom * 100)}%
          </button>
          <Button variant="ghost" size="icon-sm" aria-label="Zoom in" disabled={zi >= ZOOM_STEPS.length - 1} onClick={() => onZoomChange(ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, zi + 1)])}>
            <Plus />
          </Button>
        </div>
      </div>

      {/* pages of interest */}
      <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto border-b border-border px-3 py-2">
        <span className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">Jump to</span>
        {interest.map((p) => {
          const hasClash = doc.extractions.some((e) => e.page === p && e.status === "contradiction");
          const hasUnsure = doc.extractions.some((e) => e.page === p && e.status === "uncertain");
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "relative inline-flex h-8 min-w-9 shrink-0 items-center justify-center rounded-[8px] border px-2 text-[12px] font-semibold tabular transition-colors",
                p === page ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              p.{p}
              {(hasClash || hasUnsure) && <span aria-hidden className={cn("absolute -right-0.5 -top-0.5 size-2 rounded-full ring-2 ring-card", hasClash ? "bg-danger" : "bg-warning")} />}
            </button>
          );
        })}
      </div>

      {/* canvas */}
      <div className="relative min-h-0 flex-1 overflow-auto bg-surface-2/70 p-4 scrollbar-thin sm:p-6" style={{ backgroundImage: "radial-gradient(color-mix(in srgb, var(--border-strong) 60%, transparent) 1px, transparent 1px)", backgroundSize: "16px 16px" }}>
        <article
          aria-label={`Page ${page} of ${doc.title}`}
          className="mx-auto flex aspect-[1/1.32] flex-col rounded-[6px] border border-border bg-card shadow-md transition-[width,font-size] duration-200"
          style={{ width: `min(${Math.round(500 * zoom)}px, ${Math.round(100 * Math.max(1, zoom))}%)`, fontSize: `${13 * zoom}px` }}
        >
          <header className="flex items-center justify-between gap-3 border-b border-border px-[2.2em] py-[1.1em] text-[0.72em] uppercase tracking-[0.14em] text-subtle-foreground">
            <span className="truncate font-semibold">{product?.name ?? "Product document"}</span>
            <span className="shrink-0 tabular">{product?.modelNumber}</span>
          </header>
          {preview ? (
            <div className="flex-1 space-y-[0.85em] px-[2.2em] py-[1.8em]">
              <p className="text-[0.75em] font-semibold uppercase tracking-[0.12em] text-brand-soft-foreground">Section · page {page}</p>
              <h3 className="text-[1.45em] font-semibold leading-tight tracking-tight">{preview.heading}</h3>
              <div className="h-px w-[3em] bg-brand" aria-hidden />
              {preview.lines.map((line, i) => {
                const hit = lineMatch(line);
                const focused = hit && focusField === hit.field;
                return (
                  <p
                    key={i}
                    className={cn(
                      "-mx-[0.5em] rounded-[4px] px-[0.5em] py-[0.15em] leading-[1.6] text-foreground/85",
                      hit && HIGHLIGHT[hit.status],
                      focused && "ring-2 ring-ring/50",
                    )}
                  >
                    {line}
                    {hit && <span className="sr-only"> ({EXTRACTION_STATUS_META[hit.status].label} extraction: {hit.field})</span>}
                  </p>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-[0.8em] px-[2.2em] text-center">
              <span className="grid size-[3.2em] place-items-center rounded-[0.8em] bg-surface-2 text-subtle-foreground">
                <FileQuestion className="size-[1.6em]" />
              </span>
              <p className="text-[1em] font-semibold">Page {page} isn&apos;t included in the demo preview</p>
              <p className="max-w-[26em] text-[0.85em] leading-relaxed text-muted-foreground">
                Only the pages Qeivo extracted values from are rendered in this demonstration.
                {onPage.length > 0 ? ` ${onPage.length} value${onPage.length > 1 ? "s were" : " was"} read from this page — see the list of extracted values.` : ""}
              </p>
              {interest.length > 0 && (
                <button type="button" onClick={() => onPageChange(interest.find((p) => p > page) ?? interest[0])} className="mt-[0.4em] inline-flex items-center gap-1.5 text-[0.85em] font-medium text-brand-soft-foreground hover:underline">
                  <ScanSearch className="size-[1.1em]" /> Go to next analysed page
                </button>
              )}
            </div>
          )}
          {onPage.length > 0 && (
            <div className="mx-[2.2em] mb-[1.2em] flex flex-wrap gap-[0.4em] border-t border-dashed border-border pt-[0.8em]">
              {onPage.map((e) => (
                <span key={e.field} className={cn("rounded-full px-[0.7em] py-[0.15em] text-[0.72em] font-medium", e.status === "contradiction" ? "bg-danger-soft text-danger-foreground" : e.status === "uncertain" ? "bg-warning-soft text-warning-foreground" : "bg-brand-soft text-brand-soft-foreground")}>
                  {e.field}
                </span>
              ))}
            </div>
          )}
          <footer className="mt-auto flex justify-between border-t border-border px-[2.2em] py-[0.9em] text-[0.7em] text-subtle-foreground tabular">
            <span>{doc.language}</span>
            <span>
              {page} / {doc.pages}
            </span>
          </footer>
        </article>
      </div>
    </div>
  );
}
