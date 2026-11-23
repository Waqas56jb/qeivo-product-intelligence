"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, PackageSearch, SlidersHorizontal } from "lucide-react";
import type { CategorySlug, Product } from "@/types";
import { getBrand } from "@/data/products/brands";
import { routes } from "@/config/routes";
import { sortProducts, type SortKey } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { CurrencyDisplay } from "@/components/common/display";
import { EmptyState } from "@/components/common/states";
import { ResponsiveSheet } from "@/components/layout/page";
import { ProductCard } from "@/components/product/product-card";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "score", label: "Suitability score" },
  { value: "evidence", label: "Evidence coverage" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Owner rating" },
];

/** Energy facet: letter classes for appliances and TVs, battery-life bands for laptops. */
function energyFacet(category: CategorySlug, p: Product): string {
  if (category !== "laptops") return `Class ${p.energy.rating}`;
  const h = parseFloat(p.energy.rating);
  return h >= 11 ? "11 h or more" : h >= 8 ? "8–11 h" : "Under 8 h";
}
const BATTERY_ORDER = ["11 h or more", "8–11 h", "Under 8 h"];

interface Filters {
  types: string[];
  brands: string[];
  energy: string[];
  price: [number, number];
}

function toggle(list: string[], v: string) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function Facet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-subtle-foreground">{title}</legend>
      {children}
    </fieldset>
  );
}

function Option({ active, onClick, label, count, mark }: { active: boolean; onClick: () => void; label: React.ReactNode; count: number; mark?: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      disabled={!active && count === 0}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors disabled:opacity-40",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
      )}
    >
      {mark}
      {label}
      <span className={cn("text-[11px] tabular", active ? "opacity-75" : "text-subtle-foreground")}>{count}</span>
    </button>
  );
}

/** Interactive category browser: type, brand, price and energy facets over the category's products. */
export function CategoryExplorer({ category, products, types, className }: { category: CategorySlug; products: Product[]; types: string[]; className?: string }) {
  const bounds = useMemo<[number, number]>(() => {
    const prices = products.map((p) => p.price);
    return [Math.floor(Math.min(...prices) / 50) * 50, Math.ceil(Math.max(...prices) / 50) * 50];
  }, [products]);
  const empty: Filters = { types: [], brands: [], energy: [], price: bounds };
  const [f, setF] = useState<Filters>(empty);
  const [sort, setSort] = useState<SortKey>("score");
  const [sheet, setSheet] = useState(false);
  const [limit, setLimit] = useState(9);

  const brandIds = useMemo(() => [...new Set(products.map((p) => p.brandId))].sort((a, b) => getBrand(a).name.localeCompare(getBrand(b).name)), [products]);
  const energyValues = useMemo(() => {
    const vals = [...new Set(products.map((p) => energyFacet(category, p)))];
    return category === "laptops" ? BATTERY_ORDER.filter((v) => vals.includes(v)) : vals.sort();
  }, [products, category]);
  const presentTypes = types.filter((t) => products.some((p) => p.type === t));

  const match = (p: Product, skip?: keyof Filters) =>
    (skip === "types" || !f.types.length || f.types.includes(p.type)) &&
    (skip === "brands" || !f.brands.length || f.brands.includes(p.brandId)) &&
    (skip === "energy" || !f.energy.length || f.energy.includes(energyFacet(category, p))) &&
    (skip === "price" || (p.price >= f.price[0] && p.price <= f.price[1]));

  const results = sortProducts(products.filter((p) => match(p)), sort);
  const countFor = (key: keyof Filters, pred: (p: Product) => boolean) => products.filter((p) => match(p, key) && pred(p)).length;
  const active = f.types.length + f.brands.length + f.energy.length + (f.price[0] !== bounds[0] || f.price[1] !== bounds[1] ? 1 : 0);
  const reset = () => setF(empty);

  const panel = (
    <div className="space-y-7">
      <Facet title="Type">
        <div className="flex flex-wrap gap-2">
          {presentTypes.map((t) => (
            <Option key={t} active={f.types.includes(t)} onClick={() => setF({ ...f, types: toggle(f.types, t) })} label={t} count={countFor("types", (p) => p.type === t)} />
          ))}
        </div>
      </Facet>
      <Facet title="Brand">
        <div className="flex flex-wrap gap-2">
          {brandIds.map((id) => {
            const b = getBrand(id);
            return (
              <Option
                key={id}
                active={f.brands.includes(id)}
                onClick={() => setF({ ...f, brands: toggle(f.brands, id) })}
                label={b.name}
                count={countFor("brands", (p) => p.brandId === id)}
                mark={<span aria-hidden className="grid size-4 place-items-center rounded-[4px] text-[8px] font-bold text-white" style={{ backgroundColor: b.color }}>{b.mark}</span>}
              />
            );
          })}
        </div>
      </Facet>
      <Facet title="Price">
        <div className="flex items-center justify-between text-[13px] font-semibold">
          <CurrencyDisplay usd={f.price[0]} />
          <span className="text-subtle-foreground">–</span>
          <CurrencyDisplay usd={f.price[1]} />
        </div>
        <Slider min={bounds[0]} max={bounds[1]} step={50} value={f.price} onValueChange={(v) => setF({ ...f, price: [v[0], v[1]] })} aria-label="Price range" minStepsBetweenThumbs={1} />
      </Facet>
      <Facet title={category === "laptops" ? "Battery life (tested)" : "Energy class"}>
        <div className="flex flex-wrap gap-2">
          {energyValues.map((e) => (
            <Option key={e} active={f.energy.includes(e)} onClick={() => setF({ ...f, energy: toggle(f.energy, e) })} label={e} count={countFor("energy", (p) => energyFacet(category, p) === e)} />
          ))}
        </div>
      </Facet>
    </div>
  );

  return (
    <div className={cn("grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]", className)}>
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="sticky top-24 rounded-[20px] border border-border bg-card p-5 shadow-xs">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold">
              <SlidersHorizontal className="size-4 text-brand" /> Filters
            </h3>
            {active > 0 && (
              <button type="button" onClick={reset} className="text-[12px] font-semibold text-brand-soft-foreground hover:underline">
                Reset ({active})
              </button>
            )}
          </div>
          {panel}
        </div>
      </aside>

      <div className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] text-muted-foreground" aria-live="polite">
            <span className="text-[20px] font-semibold text-foreground tabular">{results.length}</span> of <span className="tabular">{products.length}</span> models match
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="lg:hidden" onClick={() => setSheet(true)}>
              <SlidersHorizontal /> Filters{active > 0 && <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] text-primary-foreground tabular">{active}</span>}
            </Button>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[180px]" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {results.length === 0 ? (
          <EmptyState icon={PackageSearch} title="No models match every filter" description="Widen the price range or remove a brand or type to see more of the category." action={<Button variant="outline" onClick={reset}>Reset filters</Button>} />
        ) : (
          <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false}>
              {results.slice(0, limit).map((p, i) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <ProductCard product={p} priority={i < 3} className="h-full" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        {results.length > limit ? (
          <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
            <Button variant="outline" size="lg" onClick={() => setLimit((l) => l + 9)}>
              Show more <span className="text-muted-foreground tabular">({results.length - limit} more)</span>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href={routes.products}>
                Open in the research app <ArrowRight />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      <ResponsiveSheet
        open={sheet}
        onOpenChange={setSheet}
        title="Filters"
        description={`${results.length} of ${products.length} models match`}
        footer={
          <>
            <Button variant="outline" className="flex-1" onClick={reset} disabled={active === 0}>
              Reset
            </Button>
            <Button className="flex-1" onClick={() => setSheet(false)}>
              Show {results.length} {results.length === 1 ? "model" : "models"}
            </Button>
          </>
        }
      >
        {panel}
      </ResponsiveSheet>
    </div>
  );
}
