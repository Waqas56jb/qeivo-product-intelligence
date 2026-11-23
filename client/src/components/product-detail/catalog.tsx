"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import type { CategorySlug } from "@/types";
import { products } from "@/data/products";
import { brands } from "@/data/products/brands";
import { categories, getCategory } from "@/data/products/categories";
import { activeFilterCount, EMPTY_FILTERS, filterProducts, SORT_OPTIONS, sortProducts, type CatalogFilters, type SortKey } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox, Label, Slider } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/tabs";
import { FilterChip, SearchField } from "@/components/common/controls";
import { EmptyState } from "@/components/common/states";
import { ResponsiveSheet } from "@/components/layout/page";
import { ProductGrid, ProductList } from "@/components/product/product-card";

const PRICE_MAX = 6000;

function toggle(list: string[], v: string) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-border pb-5 last:border-0">
      <legend className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-subtle-foreground">{title}</legend>
      {children}
    </fieldset>
  );
}

function FilterPanel({ f, set, pool }: { f: CatalogFilters; set: (f: CatalogFilters) => void; pool: typeof products }) {
  const cat = f.category === "all" ? null : getCategory(f.category);
  const brandOptions = brands.filter((b) => pool.some((p) => p.brandId === b.id));
  const types = Array.from(new Set(pool.map((p) => p.type)));
  const ratings = Array.from(new Set(pool.map((p) => p.energy.rating))).filter((r) => r.length === 1).sort();
  const featureOptions = cat ? cat.featureFilters : [];
  const caps = pool.map((p) => p.capacity.value);
  const capMin = Math.min(...caps);
  const capMax = Math.max(...caps);
  const unit = pool[0]?.capacity.unit ?? "";
  return (
    <div className="space-y-5">
      <FilterGroup title="Price">
        <Slider min={0} max={PRICE_MAX} step={100} value={[f.priceMin ?? 0, f.priceMax ?? PRICE_MAX]} onValueChange={([a, b]) => set({ ...f, priceMin: a > 0 ? a : null, priceMax: b < PRICE_MAX ? b : null })} aria-label="Price range" />
        <p className="mt-2 text-[13px] tabular text-muted-foreground">
          ${(f.priceMin ?? 0).toLocaleString("en-US")} – ${(f.priceMax ?? PRICE_MAX).toLocaleString("en-US")}
          {f.priceMax === null && "+"}
        </p>
      </FilterGroup>
      {types.length > 1 && (
        <FilterGroup title="Type">
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <FilterChip key={t} active={f.types.includes(t)} onClick={() => set({ ...f, types: toggle(f.types, t) })} count={pool.filter((p) => p.type === t).length}>
                {t}
              </FilterChip>
            ))}
          </div>
        </FilterGroup>
      )}
      <FilterGroup title="Brand">
        <div className="grid grid-cols-2 gap-2.5">
          {brandOptions.map((b) => (
            <Label key={b.id} className="h-7 cursor-pointer font-normal">
              <Checkbox checked={f.brands.includes(b.id)} onCheckedChange={() => set({ ...f, brands: toggle(f.brands, b.id) })} /> {b.name}
            </Label>
          ))}
        </div>
      </FilterGroup>
      {f.category !== "all" && capMax > capMin && (
        <FilterGroup title={`${cat?.capacityLabel ?? "Capacity"} (${unit})`}>
          <Slider min={capMin} max={capMax} step={1} value={[f.capacityMin ?? capMin, f.capacityMax ?? capMax]} onValueChange={([a, b]) => set({ ...f, capacityMin: a > capMin ? a : null, capacityMax: b < capMax ? b : null })} aria-label="Capacity range" />
          <p className="mt-2 text-[13px] tabular text-muted-foreground">
            {f.capacityMin ?? capMin} – {f.capacityMax ?? capMax} {unit}
          </p>
        </FilterGroup>
      )}
      {(f.category === "refrigerators" || f.category === "washing-machines") && (
        <FilterGroup title="Maximum dimensions (mm)">
          <div className="grid grid-cols-3 gap-2">
            {(["maxWidth", "maxHeight", "maxDepth"] as const).map((k) => (
              <div key={k}>
                <Label htmlFor={k} className="mb-1.5 text-[12px] text-muted-foreground">
                  {k === "maxWidth" ? "Width" : k === "maxHeight" ? "Height" : "Depth"}
                </Label>
                <Input id={k} inputMode="numeric" placeholder="Any" value={f[k] ?? ""} onChange={(e) => set({ ...f, [k]: e.target.value ? Number(e.target.value.replace(/\D/g, "")) || null : null })} className="h-10 px-2.5" />
              </div>
            ))}
          </div>
        </FilterGroup>
      )}
      {ratings.length > 0 && (
        <FilterGroup title="Energy rating">
          <div className="flex flex-wrap gap-1.5">
            {ratings.map((r) => (
              <button key={r} type="button" aria-pressed={f.energyRatings.includes(r)} onClick={() => set({ ...f, energyRatings: toggle(f.energyRatings, r) })} className={cn("grid size-10 place-items-center rounded-[10px] border text-[14px] font-bold transition-colors", f.energyRatings.includes(r) ? "border-success bg-success text-white" : "border-border bg-surface text-muted-foreground hover:border-border-strong")}>
                {r}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}
      {featureOptions.length > 0 && (
        <FilterGroup title="Features">
          <div className="space-y-2.5">
            {featureOptions.map((ft) => (
              <Label key={ft} className="cursor-pointer font-normal">
                <Checkbox checked={f.features.includes(ft)} onCheckedChange={() => set({ ...f, features: toggle(f.features, ft) })} /> {ft}
              </Label>
            ))}
          </div>
        </FilterGroup>
      )}
      <FilterGroup title="Minimum suitability">
        <div className="flex flex-wrap gap-2">
          {[null, 6, 7, 7.5, 8].map((s) => (
            <FilterChip key={String(s)} active={f.minScore === s} onClick={() => set({ ...f, minScore: s })}>
              {s === null ? "Any" : `${s}+`}
            </FilterChip>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}

export function Catalog() {
  const params = useSearchParams();
  const router = useRouter();
  const initialCat = params.get("category");
  const [f, setF] = useState<CatalogFilters>({
    ...EMPTY_FILTERS,
    query: params.get("q") ?? "",
    category: categories.some((c) => c.slug === initialCat) ? (initialCat as CategorySlug) : "all",
  });
  const [sort, setSort] = useState<SortKey>("relevance");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sheet, setSheet] = useState(false);
  const hydrated = useHydrated();
  const storePriorities = useAppStore((s) => s.priorities);
  const priorities = useMemo(() => (hydrated ? storePriorities : {}), [hydrated, storePriorities]);

  const pool = useMemo(() => (f.category === "all" ? products : products.filter((p) => p.category === f.category)), [f.category]);
  const results = useMemo(() => sortProducts(filterProducts(products, f), sort, f.query, priorities), [f, sort, priorities]);
  const count = activeFilterCount(f);

  const setCategory = (c: CategorySlug | "all") => {
    setF({ ...EMPTY_FILTERS, query: f.query, category: c });
    router.replace(c === "all" ? "/app/products" : `/app/products?category=${c}`, { scroll: false });
  };

  const chips: { label: string; clear: () => void }[] = [
    ...f.brands.map((b) => ({ label: brands.find((x) => x.id === b)?.name ?? b, clear: () => setF({ ...f, brands: f.brands.filter((x) => x !== b) }) })),
    ...f.types.map((t) => ({ label: t, clear: () => setF({ ...f, types: f.types.filter((x) => x !== t) }) })),
    ...f.features.map((t) => ({ label: t, clear: () => setF({ ...f, features: f.features.filter((x) => x !== t) }) })),
    ...f.energyRatings.map((t) => ({ label: `Energy ${t}`, clear: () => setF({ ...f, energyRatings: f.energyRatings.filter((x) => x !== t) }) })),
    ...(f.priceMin !== null || f.priceMax !== null ? [{ label: `$${f.priceMin ?? 0}–${f.priceMax ?? "max"}`, clear: () => setF({ ...f, priceMin: null, priceMax: null }) }] : []),
    ...(f.capacityMin !== null || f.capacityMax !== null ? [{ label: "Capacity", clear: () => setF({ ...f, capacityMin: null, capacityMax: null }) }] : []),
    ...(f.maxWidth !== null ? [{ label: `W ≤ ${f.maxWidth} mm`, clear: () => setF({ ...f, maxWidth: null }) }] : []),
    ...(f.maxHeight !== null ? [{ label: `H ≤ ${f.maxHeight} mm`, clear: () => setF({ ...f, maxHeight: null }) }] : []),
    ...(f.maxDepth !== null ? [{ label: `D ≤ ${f.maxDepth} mm`, clear: () => setF({ ...f, maxDepth: null }) }] : []),
    ...(f.minScore !== null ? [{ label: `Score ${f.minScore}+`, clear: () => setF({ ...f, minScore: null }) }] : []),
  ];
  const clearAll = () => setF({ ...EMPTY_FILTERS, category: f.category });

  return (
    <div className="space-y-5">
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <FilterChip active={f.category === "all"} onClick={() => setCategory("all")} count={products.length}>
          All categories
        </FilterChip>
        {categories.map((c) => (
          <FilterChip key={c.slug} active={f.category === c.slug} onClick={() => setCategory(c.slug)} count={products.filter((p) => p.category === c.slug).length}>
            {c.name}
          </FilterChip>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchField value={f.query} onChange={(q) => setF({ ...f, query: q })} placeholder="Search brand, model, model number or feature…" className="flex-1" />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-11 lg:hidden" onClick={() => setSheet(true)}>
            <SlidersHorizontal /> Filters {count > 0 && <span className="rounded-full bg-brand px-1.5 text-[11px] tabular text-brand-foreground">{count}</span>}
          </Button>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-11 w-[190px]" aria-label="Sort products">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as "grid" | "list")} className="hidden h-11 sm:inline-flex" aria-label="View">
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-[20px] border border-border bg-card p-5 shadow-xs scrollbar-thin">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Filters</h2>
              <Button variant="ghost" size="sm" onClick={clearAll} disabled={count === 0}>
                Clear
              </Button>
            </div>
            <FilterPanel f={f} set={setF} pool={pool} />
          </div>
        </aside>
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-1 text-[14px] text-muted-foreground" aria-live="polite">
              <strong className="tabular text-foreground">{results.length}</strong> {results.length === 1 ? "product" : "products"}
              {f.query && <> for “{f.query}”</>}
            </p>
            {chips.map((c) => (
              <button key={c.label} type="button" onClick={c.clear} className="inline-flex h-7 items-center gap-1 rounded-full bg-brand-soft px-2.5 text-[12px] font-medium text-brand-soft-foreground hover:bg-brand-soft/70" aria-label={`Remove filter ${c.label}`}>
                {c.label} <X className="size-3" />
              </button>
            ))}
            {chips.length > 1 && (
              <button type="button" onClick={clearAll} className="text-[12px] font-medium text-muted-foreground underline-offset-2 hover:underline">
                Clear all
              </button>
            )}
          </div>
          {results.length === 0 ? (
            <EmptyState title="No products match these filters" description="Try widening the price range, removing a feature or clearing your search." action={<Button onClick={clearAll}>Clear filters</Button>} />
          ) : view === "grid" ? (
            <ProductGrid products={results} priorities={priorities} />
          ) : (
            <ProductList products={results} priorities={priorities} />
          )}
        </div>
      </div>

      <ResponsiveSheet
        open={sheet}
        onOpenChange={setSheet}
        title="Filters"
        description={`${results.length} matching products`}
        footer={
          <>
            <Button variant="outline" className="flex-1" onClick={clearAll}>
              Clear
            </Button>
            <Button className="flex-[2]" onClick={() => setSheet(false)}>
              Show {results.length} results
            </Button>
          </>
        }
      >
        <FilterPanel f={f} set={setF} pool={pool} />
      </ResponsiveSheet>
    </div>
  );
}
