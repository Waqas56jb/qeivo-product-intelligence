"use client";

import { useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Info, Package, PlugZap, RotateCcw, Wrench, Zap } from "lucide-react";
import type { Product, RegionCode } from "@/types";
import { defaultAnnualKwh, defaultMaintenance, ownershipCost, type OwnershipInputs } from "@/lib/ownership";
import { formatCurrency, REGIONS, regionalPrice } from "@/lib/format";
import { cn, round } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Slider } from "@/components/ui/primitives";
import { BarChart, ChartCard, SERIES_COLORS } from "@/components/charts";
import { ClaimTypeBadge, SourceCitation } from "@/components/analysis/badges";
import { categoryAverage, getSpecItem } from "./spec-utils";
import { HideCompareTray } from "./hide-compare-tray";

const USAGE_STOPS = [
  { value: 0.5, label: "Light" },
  { value: 1, label: "Typical" },
  { value: 1.5, label: "Heavy" },
];

function usageLabel(v: number) {
  if (v < 0.8) return "Light";
  if (v <= 1.2) return "Typical";
  return "Heavy";
}

function defaultYears(product: Product) {
  return product.category === "laptops" || product.category === "televisions" ? 6 : 10;
}

function defaultsFor(product: Product, region: RegionCode): OwnershipInputs {
  const r = REGIONS[region];
  return {
    purchasePrice: regionalPrice(product.price, region),
    tariff: r.tariff,
    usageFactor: 1,
    years: defaultYears(product),
    accessories: 0,
    maintenancePerYear: Math.round(defaultMaintenance(product) * r.priceFactor),
  };
}

/** Same projection as lib/ownership, for a hypothetical category-average product. */
function projectAverage(price: number, kwh: number, maintenance: number, input: OwnershipInputs) {
  const annual = Math.round(kwh * input.usageFactor) * input.tariff;
  let energy = 0;
  for (let y = 1; y <= input.years; y++) energy += Math.round(annual * Math.pow(1.025, y - 1));
  return Math.round(price + input.accessories + energy + maintenance * input.years);
}

type Overrides = Partial<OwnershipInputs> & { region: RegionCode };

function MoneyField({ id, label, hint, value, onChange, region, step = 1 }: { id: string; label: string; hint?: string; value: number; onChange: (v: number) => void; region: RegionCode; step?: number }) {
  const symbol = formatCurrency(0, region).replace(/[\d.,\s]/g, "");
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {hint && <span className="text-[11px] text-subtle-foreground">{hint}</span>}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-muted-foreground">{symbol}</span>
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => {
            const n = e.target.value === "" ? 0 : Number(e.target.value);
            onChange(Number.isFinite(n) ? Math.max(0, n) : 0);
          }}
          className="tabular"
          style={{ paddingLeft: `${Math.max(2.25, 1.25 + symbol.length * 0.55)}rem` }}
        />
      </div>
    </div>
  );
}

export function OwnershipCalculator({ product }: { product: Product }) {
  const hydrated = useHydrated();
  const storeRegion = useAppStore((s) => s.region);
  const region: RegionCode = hydrated ? storeRegion : "US";
  const uid = useId();
  const [overrides, setOverrides] = useState<Overrides>({ region: "US" });

  const defaults = useMemo(() => defaultsFor(product, region), [product, region]);
  const active = overrides.region === region ? overrides : { region };
  const input: OwnershipInputs = { ...defaults, ...Object.fromEntries(Object.entries(active).filter(([k]) => k !== "region")) };
  const set = (patch: Partial<OwnershipInputs>) => setOverrides({ ...active, ...patch, region });
  const isDefault = Object.keys(active).length === 1;

  const result = ownershipCost(product, input);
  const money = (v: number) => formatCurrency(v, region);
  const moneyShort = (v: number) =>
    new Intl.NumberFormat(REGIONS[region].locale, { style: "currency", currency: REGIONS[region].currency, notation: "compact", maximumFractionDigits: 1 }).format(v);

  const measured = getSpecItem(product, "kwh-measured");
  const avg = useMemo(() => {
    const r = REGIONS[region];
    return {
      price: regionalPrice(categoryAverage(product, (p) => p.price), region),
      kwh: categoryAverage(product, (p) => defaultAnnualKwh(p)),
      maintenance: Math.round(categoryAverage(product, (p) => defaultMaintenance(p)) * r.priceFactor),
    };
  }, [product, region]);
  const avgTotal = projectAverage(avg.price, avg.kwh, avg.maintenance, input);
  const avgEnergy = avgTotal - avg.price - input.accessories - avg.maintenance * input.years;
  const driver = Math.abs(result.purchase - avg.price) >= Math.abs(result.energy - avgEnergy) ? "the purchase price" : "energy use";
  const diff = result.total - avgTotal;
  const diffPct = avgTotal ? Math.round((diff / avgTotal) * 100) : 0;

  const parts = [
    { key: "purchase", label: "Purchase price", value: result.purchase, icon: Package, color: SERIES_COLORS[0] },
    { key: "energy", label: product.category === "laptops" ? "Charging energy" : "Energy", value: result.energy, icon: Zap, color: SERIES_COLORS[1] },
    { key: "maintenance", label: "Maintenance", value: result.maintenance, icon: Wrench, color: SERIES_COLORS[2] },
    { key: "accessories", label: "Accessories & install", value: result.accessories, icon: PlugZap, color: SERIES_COLORS[3] },
  ];

  const chartData = result.yearly.map((y, i) => {
    const energy = result.yearly.slice(0, i + 1).reduce((s, x) => s + x.energy, 0);
    const maintenance = y.maintenance * (i + 1);
    return { year: `Y${y.year}`, upfront: input.purchasePrice + input.accessories, energy, maintenance };
  });

  const usage = usageLabel(input.usageFactor);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
      <HideCompareTray />
      {/* ------------------------------------------------------------ Inputs */}
      <section aria-labelledby={`${uid}-inputs`} className="h-fit rounded-[20px] border border-border bg-card p-5 shadow-xs sm:p-6 lg:sticky lg:top-24">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-[10px] bg-brand-soft text-brand-soft-foreground">
              <Calculator className="size-[18px]" />
            </span>
            <div>
              <h2 id={`${uid}-inputs`} className="text-[16px] font-semibold">Your assumptions</h2>
              <p className="text-[12px] text-muted-foreground">
                {REGIONS[region].flag} {REGIONS[region].name} · {REGIONS[region].currency}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setOverrides({ region })} disabled={isDefault} className="h-9">
            <RotateCcw /> Reset
          </Button>
        </div>

        <div className="space-y-5">
          <MoneyField id={`${uid}-price`} label="Purchase price" hint="Regional reference price" value={input.purchasePrice} onChange={(v) => set({ purchasePrice: v })} region={region} step={10} />
          <MoneyField id={`${uid}-tariff`} label="Electricity tariff (per kWh)" hint={`Default ${formatCurrency(REGIONS[region].tariff, region, { decimals: 2 })}`} value={input.tariff} onChange={(v) => set({ tariff: v })} region={region} step={0.01} />

          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <Label>Daily usage</Label>
              <span className="tabular text-[13px] font-medium">
                {usage} · {Math.round(input.usageFactor * 100)}%
              </span>
            </div>
            <Slider min={0.5} max={1.5} step={0.05} value={[input.usageFactor]} onValueChange={([v]) => set({ usageFactor: round(v, 2) })} aria-label="Daily usage relative to rated consumption" />
            <div className="flex justify-between text-[11px] text-subtle-foreground">
              {USAGE_STOPS.map((s) => (
                <button key={s.label} type="button" onClick={() => set({ usageFactor: s.value })} className={cn("-my-2 rounded-[6px] px-1 py-2 hover:text-foreground", usage === s.label && "font-semibold text-foreground")}>
                  {s.label}
                </button>
              ))}
            </div>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {result.annualKwh.toLocaleString("en-US")} kWh per year at this usage level.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <Label>Ownership period</Label>
              <span className="tabular text-[13px] font-medium">{input.years} {input.years === 1 ? "year" : "years"}</span>
            </div>
            <Slider min={1} max={15} step={1} value={[input.years]} onValueChange={([v]) => set({ years: v })} aria-label="Ownership period in years" />
            <div className="flex justify-between text-[11px] tabular text-subtle-foreground">
              <span>1 yr</span>
              <span>15 yrs</span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <MoneyField id={`${uid}-acc`} label="Accessories & install" value={input.accessories} onChange={(v) => set({ accessories: v })} region={region} step={5} />
            <MoneyField id={`${uid}-maint`} label="Maintenance / year" value={input.maintenancePerYear} onChange={(v) => set({ maintenancePerYear: v })} region={region} step={5} />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- Results */}
      <div className="min-w-0 space-y-6">
        <section aria-live="polite" className="relative overflow-hidden rounded-[20px] bg-navy-sheen p-5 text-white shadow-md sm:p-7">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70">Estimated total over {input.years} {input.years === 1 ? "year" : "years"}</p>
          <div className="mt-2 flex flex-wrap items-end gap-x-6 gap-y-2">
            <motion.span key={result.total} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="tabular text-[40px] font-semibold leading-none tracking-tight sm:text-[52px]">
              {money(result.total)}
            </motion.span>
            <span className="pb-1 text-[14px] text-white/75">
              <strong className="tabular font-semibold text-white">{money(result.perYear)}</strong> per year on average
            </span>
          </div>
          <div className="mt-6 flex h-2.5 gap-[2px] overflow-hidden rounded-full bg-white/10" role="img" aria-label="Share of total cost by component">
            {parts.filter((p) => p.value > 0).map((p) => (
              <motion.span key={p.key} layout className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${(p.value / result.total) * 100}%`, background: p.color }} />
            ))}
          </div>
          <p className="mt-3 text-[12px] text-white/70">
            Running costs add {result.total ? Math.round(((result.total - result.purchase) / result.total) * 100) : 0}% on top of the purchase price.
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {parts.map((p) => {
            const share = result.total ? (p.value / result.total) * 100 : 0;
            return (
              <div key={p.key} className="flex flex-col gap-2 rounded-[14px] border border-border bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-medium text-muted-foreground">{p.label}</span>
                  <p.icon className="size-4 text-subtle-foreground" aria-hidden />
                </div>
                <span className="tabular text-[20px] font-semibold tracking-tight">{money(p.value)}</span>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${share}%`, background: p.color }} />
                </div>
                <span className="tabular text-[11px] text-subtle-foreground">{Math.round(share)}% of total</span>
              </div>
            );
          })}
        </div>

        <ChartCard
          title="Cumulative cost by year"
          description="Upfront spend, then energy and maintenance accumulating each year."
          legend={[
            { key: "upfront", label: "Purchase + accessories", color: 0 },
            { key: "energy", label: "Energy", color: 1 },
            { key: "maintenance", label: "Maintenance", color: 2 },
          ]}
        >
          <BarChart
            data={chartData}
            xKey="year"
            stacked
            height={280}
            yWidth={56}
            valueFormatter={moneyShort}
            series={[
              { key: "upfront", label: "Purchase + accessories", color: 0 },
              { key: "energy", label: "Energy", color: 1 },
              { key: "maintenance", label: "Maintenance", color: 2 },
            ]}
          />
        </ChartCard>

        <section className="rounded-[20px] border border-border bg-card p-5 shadow-xs sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-[16px] font-semibold">Compared with the category average</h3>
              <p className="mt-0.5 text-[13px] text-muted-foreground">Same assumptions applied to an average {product.category.replace("-", " ")} in our catalogue.</p>
            </div>
            <ClaimTypeBadge type="ai" />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div>
              <p className="text-[12px] text-muted-foreground">This product</p>
              <p className="tabular text-[22px] font-semibold">{money(result.total)}</p>
            </div>
            <div>
              <p className="text-[12px] text-muted-foreground">Category average</p>
              <p className="tabular text-[22px] font-semibold text-muted-foreground">{money(avgTotal)}</p>
            </div>
            <span className={cn("inline-flex h-8 items-center justify-self-start rounded-full px-3 text-[13px] font-semibold tabular", diff <= 0 ? "bg-success-soft text-success" : "bg-warning-soft text-warning-foreground")}>
              {diff <= 0 ? "−" : "+"}
              {money(Math.abs(diff))} ({diff <= 0 ? "" : "+"}
              {diffPct}%)
            </span>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
            {diff <= 0
              ? `Over ${input.years} years this costs about ${money(Math.abs(diff))} less to own than a typical model in the category`
              : `Over ${input.years} years this costs about ${money(diff)} more to own than a typical model in the category`}
            , driven mostly by {driver}.
            <SourceCitation sourceId={`${product.id}:lab`} variant="number" index={1} />
          </p>
        </section>

        <section className="rounded-[20px] border border-border bg-surface-2/60 p-5 sm:p-6">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold">
            <Info className="size-4 text-muted-foreground" /> How this estimate is calculated
          </h3>
          <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-muted-foreground">
            <li className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>
                Energy uses {measured ? `the independently measured ${measured.value} kWh/yr` : `the rated ${product.energy.annualKwh} kWh/yr`}, scaled by your usage level.
              </span>
              <SourceCitation sourceId={measured ? `${product.id}:lab` : `${product.id}:cert`} />
            </li>
            <li>Electricity prices are assumed to rise 2.5% per year from your tariff.</li>
            <li>Maintenance covers filters, descaling and cleaning products — not repairs outside warranty.</li>
            <li>No discounting, resale value or financing costs are included.</li>
            <li className="flex flex-wrap items-center gap-2">
              <ClaimTypeBadge type="ai" size="xs" /> This is a projection for planning, not a quote.
            </li>
          </ul>
        </section>
      </div>

      {/* Mobile sticky summary */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-background/92 px-4 py-2.5 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{input.years}-year total</p>
            <p className="tabular text-[18px] font-semibold leading-tight">{money(result.total)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Per year</p>
            <p className="tabular text-[15px] font-semibold leading-tight">{money(result.perYear)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
