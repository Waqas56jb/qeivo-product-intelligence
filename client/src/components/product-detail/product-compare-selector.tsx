"use client";

import { useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";
import type { CategorySlug, Product } from "@/types";
import { categories, products } from "@/data/products";
import { searchProducts } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FilterChip, SearchField } from "@/components/common/controls";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { EmptyState } from "@/components/common/states";
import { ScorePill } from "@/components/analysis/score";
import { BrandLabel, ProductPrice } from "@/components/product/product-bits";

export interface ProductCompareSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: Product) => void;
  /** Products already selected — shown as "Added" and not selectable. */
  excludeIds?: string[];
  /** Pre-selected category filter (e.g. the category already being compared). */
  category?: CategorySlug;
  title?: string;
  description?: string;
}

/** Searchable product picker dialog. Reusable anywhere a product must be chosen (compare, projects, Ask Qeivo…). */
export function ProductCompareSelector({ open, onOpenChange, onSelect, excludeIds = [], category, title = "Add a product", description = "Search by brand, model, model number or feature." }: ProductCompareSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(720px,calc(100dvh-32px))] max-w-xl flex-col gap-0 overflow-hidden p-0">
        {open && <PickerBody title={title} description={description} category={category} excludeIds={excludeIds} onSelect={onSelect} />}
      </DialogContent>
    </Dialog>
  );
}

function PickerBody({ title, description, category, excludeIds, onSelect }: { title: string; description: string; category?: CategorySlug; excludeIds: string[]; onSelect: (p: Product) => void }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<CategorySlug | "all">(category ?? "all");
  const results = useMemo(() => {
    const pool = cat === "all" ? products : products.filter((p) => p.category === cat);
    if (query.trim()) return searchProducts(pool, query, 40);
    return [...pool].sort((a, b) => b.suitabilityScore - a.suitabilityScore).slice(0, 40);
  }, [query, cat]);

  return (
    <>
      <DialogHeader className="space-y-3 border-b border-border p-5 pb-4 pr-14">
        <div className="space-y-1">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </div>
        <SearchField value={query} onChange={setQuery} placeholder="Search products…" ariaLabel="Search products" autoFocus />
        <div className="scrollbar-none -mx-5 flex gap-1.5 overflow-x-auto px-5">
          <FilterChip active={cat === "all"} onClick={() => setCat("all")} count={products.length}>
            All
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)} count={products.filter((p) => p.category === c.slug).length}>
              {c.name}
            </FilterChip>
          ))}
        </div>
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto p-2 scrollbar-thin" role="listbox" aria-label="Products">
        {results.length === 0 ? (
          <EmptyState compact title="No matching products" description="Try a brand name, a model number or a broader category." className="m-3" />
        ) : (
          results.map((p) => {
            const added = excludeIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={added}
                disabled={added}
                onClick={() => onSelect(p)}
                className={cn(
                  "flex min-h-[64px] w-full items-center gap-3 rounded-[12px] p-2 text-left transition-colors",
                  added ? "cursor-default opacity-60" : "hover:bg-surface-2 focus-visible:bg-surface-2",
                )}
              >
                <ImageWithFallback src={p.images[0]} alt="" aspect="size-14 shrink-0 rounded-[10px] bg-gradient-to-b from-surface-2 to-surface-3/60" sizes="56px" className="p-1" />
                <span className="min-w-0 flex-1">
                  <BrandLabel brandId={p.brandId} className="text-[10px]" />
                  <span className="block truncate text-[14px] font-semibold leading-tight">{p.model}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-muted-foreground">
                    <span className="truncate">{p.type}</span>
                    <ProductPrice product={p} size="sm" showSaving={false} className="[&>span:first-child]:text-[13px]" />
                  </span>
                </span>
                <ScorePill score={p.suitabilityScore} className="hidden sm:inline-flex" />
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", added ? "bg-brand-soft text-brand-soft-foreground" : "border border-border-strong text-muted-foreground")}>
                  {added ? <Check className="size-4" /> : <Plus className="size-4" />}
                  <span className="sr-only">{added ? "Already added" : "Add"}</span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}
