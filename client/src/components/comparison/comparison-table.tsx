"use client";

import { Fragment, useCallback, useRef, useState } from "react";
import { Award, Plus } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { MAX_COMPARE } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/tooltip";
import { CurrencyDisplay } from "@/components/common/display";
import { EvidenceCoverage, SuitabilityScore } from "@/components/analysis/score";
import { ProductRating } from "@/components/product/product-bits";
import { evidenceBand } from "@/lib/scoring";
import { ComparisonProductHeader } from "./comparison-product-header";
import { SpecificationDifference } from "./specification-difference";
import { valueIndex, type CompareGroup } from "./compare-utils";

interface RowDef {
  id: string;
  label: string;
  hint?: string;
  render: (p: Product, i: number) => React.ReactNode;
}

interface GroupDef {
  id: string;
  label: string;
  rows: RowDef[];
}

export interface ComparisonTableProps {
  items: Product[];
  scores: Record<string, number>;
  personalised: boolean;
  groups: CompareGroup[];
  differencesOnly: boolean;
  bestValueId?: string;
  onRemove: (productId: string) => void;
  onAdd: () => void;
}

function BestBadge({ children = "Best" }: { children?: React.ReactNode }) {
  return (
    <Badge variant="success" className="gap-0.5 uppercase tracking-wider text-[10px]">
      <Award /> {children}
    </Badge>
  );
}

/**
 * Side-by-side comparison. Desktop: grid table with a sticky product header row.
 * Mobile: sticky header + horizontally scrolling product columns kept in sync, with an
 * active-product selector. Suitability and evidence coverage are always separate rows.
 */
export function ComparisonTable({ items, scores, personalised, groups, differencesOnly, bestValueId, onRemove, onAdd }: ComparisonTableProps) {
  const prices = items.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const topScore = Math.max(...items.map((p) => scores[p.id]));
  const topEvidence = Math.max(...items.map((p) => p.evidenceCoverage));
  const topRating = Math.max(...items.map((p) => p.rating));
  const allEqual = (vals: number[]) => new Set(vals).size === 1;

  const overview: GroupDef = {
    id: "overview",
    label: "Overview",
    rows: [
      {
        id: "price",
        label: "Price",
        hint: "Reference price in your selected region. Retailer offers may differ.",
        render: (p) => (
          <span className="flex flex-wrap items-center gap-2">
            <CurrencyDisplay usd={p.price} className="text-[17px] font-semibold tracking-tight" />
            {p.originalPrice && <CurrencyDisplay usd={p.originalPrice} strike className="text-[12px]" />}
            {p.price === minPrice && !allEqual(prices) && <BestBadge>Lowest</BestBadge>}
          </span>
        ),
      },
      {
        id: "value",
        label: "Price per suitability point",
        hint: "Price divided by suitability score. Lower means more suitability for your money.",
        render: (p) => (
          <span className="flex flex-wrap items-center gap-2">
            <span className="tabular text-[14px] font-medium">${Math.round(valueIndex(p, scores[p.id])).toLocaleString("en-US")}</span>
            {p.id === bestValueId && <BestBadge>Best value</BestBadge>}
          </span>
        ),
      },
      {
        id: "rating",
        label: "Owner rating",
        render: (p) => (
          <span className="flex flex-wrap items-center gap-2">
            <ProductRating rating={p.rating} count={p.reviewCount} />
            {p.rating === topRating && !allEqual(items.map((x) => x.rating)) && <BestBadge />}
          </span>
        ),
      },
      {
        id: "suitability",
        label: personalised ? "Your suitability" : "Suitability score",
        hint: "How well the product fits typical (or your) priorities, 0–10. Separate from evidence coverage.",
        render: (p) => (
          <span className="flex items-center gap-3">
            <SuitabilityScore score={scores[p.id]} size="sm" label={false} />
            {scores[p.id] === topScore && !allEqual(items.map((x) => scores[x.id])) && <BestBadge>Highest</BestBadge>}
          </span>
        ),
      },
      {
        id: "evidence",
        label: "Evidence coverage",
        hint: "Share of scored data points backed by independent or verified sources. Never combined with suitability.",
        render: (p) => (
          <span className="block w-full max-w-[200px] space-y-1.5">
            <span className="flex items-baseline justify-between gap-2">
              <span className="tabular text-[14px] font-semibold">{p.evidenceCoverage}%</span>
              <span className="truncate text-[11px] text-muted-foreground">{evidenceBand(p.evidenceCoverage).label}</span>
            </span>
            <EvidenceCoverage coverage={p.evidenceCoverage} showLabel={false} />
            {p.evidenceCoverage === topEvidence && !allEqual(items.map((x) => x.evidenceCoverage)) && <span className="sr-only">Highest evidence coverage</span>}
          </span>
        ),
      },
    ],
  };

  const specGroups: GroupDef[] = groups
    .map((g) => ({
      id: g.id,
      label: g.label,
      rows: g.rows
        .filter((r) => !differencesOnly || r.differs)
        .map((r) => ({ id: r.id, label: r.label, render: (_p: Product, i: number) => <SpecificationDifference cell={r.cells[i]} /> })),
    }))
    .filter((g) => g.rows.length > 0);

  const allGroups = [overview, ...specGroups];
  const hiddenCount = differencesOnly ? groups.reduce((s, g) => s + g.rows.filter((r) => !r.differs).length, 0) : 0;

  return (
    <>
      <DesktopTable items={items} groups={allGroups} onRemove={onRemove} onAdd={onAdd} bestValueId={bestValueId} />
      <MobileTable items={items} groups={allGroups} onRemove={onRemove} onAdd={onAdd} />
      {hiddenCount > 0 && <p className="mt-3 text-center text-[12px] text-muted-foreground tabular">{hiddenCount} identical specification{hiddenCount === 1 ? "" : "s"} hidden</p>}
    </>
  );
}

function RowLabel({ row }: { row: RowDef }) {
  const label = <span className="text-[13px] font-medium text-muted-foreground">{row.label}</span>;
  if (!row.hint) return label;
  return (
    <Hint label={row.hint}>
      <span tabIndex={0} className="cursor-help decoration-border-strong decoration-dotted underline-offset-4 hover:underline">
        {label}
      </span>
    </Hint>
  );
}

/* -------------------------------------------------------------- desktop */

function DesktopTable({ items, groups, onRemove, onAdd, bestValueId }: { items: Product[]; groups: GroupDef[]; onRemove: (id: string) => void; onAdd: () => void; bestValueId?: string }) {
  const cols = { gridTemplateColumns: `minmax(170px, 210px) repeat(${items.length}, minmax(0, 1fr))` };
  return (
    <div role="table" aria-label="Product comparison" className="hidden lg:block">
      <div role="rowgroup" className="sticky top-16 z-20 -mx-2 border-b border-border bg-background/92 px-2 pb-4 pt-3 backdrop-blur-xl">
        <div role="row" className="grid gap-4" style={cols}>
          <div role="columnheader" className="flex flex-col justify-end gap-2 pb-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground tabular">
              {items.length} of {MAX_COMPARE} products
            </p>
            {items.length < MAX_COMPARE && (
              <Button variant="outline" size="sm" onClick={onAdd} className="h-10 w-fit">
                <Plus /> Add product
              </Button>
            )}
          </div>
          {items.map((p) => (
            <div role="columnheader" key={p.id} className="min-w-0">
              <ComparisonProductHeader product={p} onRemove={() => onRemove(p.id)} badge={p.id === bestValueId ? <Badge variant="lime" className="shadow-sm">Best value</Badge> : undefined} />
            </div>
          ))}
        </div>
      </div>
      {groups.map((g) => (
        <div role="rowgroup" key={g.id} className="mt-6">
          <h3 className="mb-1 px-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-soft-foreground">{g.label}</h3>
          <div className="rounded-[14px] border border-border bg-card shadow-xs">
            {g.rows.map((r) => (
              <div role="row" key={r.id} className="grid items-center gap-4 border-b border-border px-3 py-3 transition-colors last:border-b-0 hover:bg-surface-2/50" style={cols}>
                <div role="rowheader" className="min-w-0">
                  <RowLabel row={r} />
                </div>
                {items.map((p, i) => (
                  <div role="cell" key={p.id} className="min-w-0">
                    {r.render(p, i)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- mobile */

const COL = "w-[72vw] sm:w-[42vw]";
const LABEL_W = "w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)]";

function MobileTable({ items, groups, onRemove, onAdd }: { items: Product[]; groups: GroupDef[]; onRemove: (id: string) => void; onAdd: () => void }) {
  const headRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const sync = useCallback((from: "head" | "body") => {
    const a = from === "head" ? headRef.current : bodyRef.current;
    const b = from === "head" ? bodyRef.current : headRef.current;
    if (!a || !b) return;
    if (Math.abs(b.scrollLeft - a.scrollLeft) > 1) b.scrollLeft = a.scrollLeft;
    const col = a.querySelector<HTMLElement>("[data-col]");
    if (col) setActive(Math.min(items.length - 1, Math.round(a.scrollLeft / (col.offsetWidth + 12))));
  }, [items.length]);

  const goTo = (i: number) => {
    setActive(i);
    const col = bodyRef.current?.querySelector<HTMLElement>("[data-col]");
    const left = col ? i * (col.offsetWidth + 12) : 0;
    bodyRef.current?.scrollTo({ left, behavior: "smooth" });
    headRef.current?.scrollTo({ left, behavior: "smooth" });
  };

  return (
    <div className="lg:hidden">
      <div className="sticky top-14 z-20 -mx-4 border-b border-border bg-background/95 px-4 pb-3 pt-2 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div role="tablist" aria-label="Focus product" className="scrollbar-none mb-2 flex gap-1 overflow-x-auto rounded-[12px] bg-surface-2 p-1">
          {items.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={active === i}
              onClick={() => goTo(i)}
              className={cn("h-9 min-w-0 flex-1 shrink-0 truncate rounded-[9px] px-3 text-[12px] font-medium transition-all", active === i ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground")}
            >
              {p.model}
            </button>
          ))}
          {items.length < MAX_COMPARE && (
            <button type="button" onClick={onAdd} aria-label="Add product" className="grid h-9 w-11 shrink-0 place-items-center rounded-[9px] text-brand-soft-foreground hover:bg-surface">
              <Plus className="size-4" />
            </button>
          )}
        </div>
        <div ref={headRef} onScroll={() => sync("head")} className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto">
          {items.map((p) => (
            <div key={p.id} data-col className={cn("shrink-0 snap-start", COL)}>
              <ComparisonProductHeader product={p} compact onRemove={() => onRemove(p.id)} />
            </div>
          ))}
          <div aria-hidden className="w-[calc(28vw-2rem)] shrink-0 sm:w-[calc(58vw-3rem)]" />
        </div>
      </div>

      <div ref={bodyRef} onScroll={() => sync("body")} className="scrollbar-none snap-x snap-mandatory overflow-x-auto pb-2" role="table" aria-label="Product comparison">
        <div className="w-max">
          {groups.map((g) => (
            <Fragment key={g.id}>
              <h3 className={cn("sticky left-0 pb-1 pt-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-soft-foreground", LABEL_W)}>{g.label}</h3>
              {g.rows.map((r) => (
                <div role="row" key={r.id} className="border-b border-border py-3 last:border-b-0">
                  <div role="rowheader" className={cn("sticky left-0 mb-1.5", LABEL_W)}>
                    <RowLabel row={r} />
                  </div>
                  <div className="flex gap-3">
                    {items.map((p, i) => (
                      <div role="cell" key={p.id} data-col className={cn("min-w-0 shrink-0 snap-start", COL)}>
                        {r.render(p, i)}
                      </div>
                    ))}
                    <div aria-hidden className="w-[calc(28vw-2rem)] shrink-0 sm:w-[calc(58vw-3rem)]" />
                  </div>
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
