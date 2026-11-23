"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ArrowRight, Droplets, Laptop, Leaf, Minus, Plus, Refrigerator, RotateCcw, Ruler, Scale, Sparkles, Tv, Users, WashingMachine, Zap } from "lucide-react";
import type { CategorySlug, RegionCode } from "@/types";
import { brands } from "@/data/products/brands";
import { categories, getCategory } from "@/data/products/categories";
import { productsByCategory } from "@/data/products";
import { currentUser } from "@/data/users/customers";
import { REGION_LIST, REGIONS, formatPrice } from "@/lib/format";
import { idealCapacity, recommend } from "@/lib/recommend";
import { physicallyFits } from "@/lib/compatibility";
import type { Priorities } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, RadioCard, RadioGroup, Slider, Switch } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { EmptyState } from "@/components/common/states";
import { HideCompareTray } from "@/components/mobile/hide-compare-tray";
import { PrioritySelector } from "./priority-selector";
import { RecommendationCard } from "./recommendation-card";
import { RecommendationExplanation, type ExclusionBreakdown } from "./recommendation-explanation";
import { RecommendationProgress } from "./recommendation-progress";

type Energy = "low" | "balanced" | "high";

interface Answers {
  category: CategorySlug;
  budget: [number, number];
  householdSize: number;
  width: string;
  height: string;
  depth: string;
  maxDepth: string;
  noWaterSupply: boolean;
  features: string[];
  energyPriority: Energy;
  region: RegionCode;
  brandIds: string[];
  priorities: Priorities;
}

const BUDGET: Record<CategorySlug, { min: number; max: number; step: number; preset: [number, number] }> = {
  refrigerators: { min: 200, max: 6000, step: 50, preset: [1500, 3000] },
  "washing-machines": { min: 300, max: 2000, step: 25, preset: [500, 1200] },
  televisions: { min: 300, max: 4000, step: 50, preset: [800, 2200] },
  laptops: { min: 500, max: 3000, step: 50, preset: [900, 2000] },
};

const CATEGORY_ICON: Record<string, LucideIcon> = { refrigerator: Refrigerator, "washing-machine": WashingMachine, tv: Tv, laptop: Laptop };

const STEPS = [
  { id: "category", label: "Category" },
  { id: "budget", label: "Budget" },
  { id: "household", label: "Household" },
  { id: "space", label: "Space" },
  { id: "features", label: "Features" },
  { id: "brands", label: "Brands" },
  { id: "priorities", label: "Priorities" },
] as const;

const hasSpace = (c: CategorySlug) => c === "refrigerators" || c === "washing-machines";

function parseMm(v: string): number | null {
  const n = Number(v.replace(/[^\d]/g, ""));
  return v.trim() && n >= 300 && n <= 2600 ? n : null;
}
const invalidMm = (v: string) => v.trim() !== "" && parseMm(v) === null;

function initialAnswers(): Answers {
  const p = currentUser.preferences;
  const cat = p.interests[0] ?? "refrigerators";
  return {
    category: cat,
    budget: [p.budgetMin, p.budgetMax],
    householdSize: p.householdSize,
    width: p.space ? String(p.space.widthMm) : "",
    height: p.space ? String(p.space.heightMm) : "",
    depth: p.space ? String(p.space.depthMm) : "",
    maxDepth: "",
    noWaterSupply: false,
    features: [],
    energyPriority: p.energyPriority,
    region: p.region,
    brandIds: p.preferredBrandIds,
    priorities: {},
  };
}

function StepTitle({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-brand-soft text-brand-soft-foreground">
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="text-[19px] font-semibold leading-tight tracking-tight">{title}</h2>
        <p className="mt-1 text-[14px] text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[13.5px] font-medium transition-colors sm:min-h-10",
        active ? "border-brand bg-brand-soft text-brand-soft-foreground" : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function MmField({ id, label, value, onChange, hint }: { id: string; label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const bad = invalidMm(value);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} inputMode="numeric" value={value} onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, "").slice(0, 4))} placeholder="Optional" aria-invalid={bad} aria-describedby={`${id}-hint`} className="pr-11 tabular" />
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-subtle-foreground">mm</span>
      </div>
      <p id={`${id}-hint`} className={cn("text-[12px]", bad ? "text-danger-foreground" : "text-subtle-foreground")}>
        {bad ? "Enter a value between 300 and 2,600 mm" : hint ?? "Leave blank if unknown"}
      </p>
    </div>
  );
}

/** Interactive recommendation questionnaire with live, deterministic re-ranking. */
export function RecommendationWizard() {
  const hydrated = useHydrated();
  const storeRegion = useAppStore((s) => s.region);
  const storePrefs = useAppStore((s) => s.preferences);
  const storePriorities = useAppStore((s) => s.priorities);
  const [a, setA] = useState<Answers>(initialAnswers);
  const [step, setStep] = useState(0);
  const [prefilled, setPrefilled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const RESULTS = STEPS.length;

  // Prefill once from persisted preferences (after hydration, so SSR markup matches).
  useEffect(() => {
    if (!hydrated || prefilled) return;
    setPrefilled(true);
    setA((cur) => ({
      ...cur,
      category: storePrefs.interests?.[0] ?? cur.category,
      budget: [storePrefs.budgetMin ?? cur.budget[0], storePrefs.budgetMax ?? cur.budget[1]],
      householdSize: storePrefs.householdSize ?? cur.householdSize,
      width: storePrefs.space ? String(storePrefs.space.widthMm) : cur.width,
      height: storePrefs.space ? String(storePrefs.space.heightMm) : cur.height,
      depth: storePrefs.space ? String(storePrefs.space.depthMm) : cur.depth,
      energyPriority: storePrefs.energyPriority ?? cur.energyPriority,
      region: storeRegion,
      brandIds: storePrefs.preferredBrandIds ?? cur.brandIds,
      priorities: storePriorities,
    }));
  }, [hydrated, prefilled, storePrefs, storeRegion, storePriorities]);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((cur) => ({ ...cur, [k]: v }));
  const setCategory = (c: CategorySlug) =>
    setA((cur) => (cur.category === c ? cur : { ...cur, category: c, budget: BUDGET[c].preset, features: [], brandIds: cur.brandIds.filter((id) => brands.find((b) => b.id === id)?.categories.includes(c)) }));

  const cat = getCategory(a.category);
  const range = BUDGET[a.category];

  const computed = useMemo(() => {
    const inCat = productsByCategory(a.category);
    const spaceOn = hasSpace(a.category);
    const w = spaceOn ? parseMm(a.width) : null;
    const h = spaceOn ? parseMm(a.height) : null;
    const dRaw = spaceOn ? parseMm(a.depth) : null;
    const maxD = spaceOn ? parseMm(a.maxDepth) : null;
    const d = dRaw !== null && maxD !== null ? Math.min(dRaw, maxD) : dRaw ?? maxD;
    const noWater = a.category === "refrigerators" && a.noWaterSupply;
    // Partial measurements: pre-filter on the dimensions given; full W×H×D goes to the ranking for ventilation-aware fit.
    const pool = inCat.filter((p) => (w === null || p.dimensions.widthMm <= w) && (h === null || p.dimensions.heightMm <= h) && (d === null || p.dimensions.depthMm <= d));
    const full = w !== null && h !== null && d !== null ? { widthMm: w, heightMm: h, depthMm: d } : null;
    const res = recommend(pool, {
      category: a.category,
      budgetMin: a.budget[0],
      budgetMax: a.budget[1],
      householdSize: a.householdSize,
      space: full,
      noWaterSupply: noWater,
      features: a.features,
      energyPriority: a.energyPriority,
      region: a.region,
      brandIds: a.brandIds,
      priorities: a.priorities,
    });
    // Mirror the exclusion rules to explain them (first failing rule wins).
    const breakdown: ExclusionBreakdown = { region: 0, budget: 0, space: 0, water: 0 };
    for (const p of inCat) {
      if (!pool.includes(p)) breakdown.space++;
      else if (!p.regions.includes(a.region)) breakdown.region++;
      else if (p.price > a.budget[1] * 1.08 || p.price < a.budget[0] * 0.6) breakdown.budget++;
      else if (full && physicallyFits(p, full) === "no-fit") breakdown.space++;
      else if (noWater && p.features.some((f) => /ice maker|dispenser/i.test(f))) breakdown.water++;
    }
    return { ...res, considered: inCat.length, excluded: inCat.length - pool.length + res.excluded, breakdown, spaceGiven: w !== null || h !== null || d !== null };
  }, [a]);

  const goTo = (i: number) => {
    setStep(i);
    requestAnimationFrame(() => {
      panelRef.current?.focus({ preventScroll: true });
      if (window.innerWidth < 1024) window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const summaries: Record<string, string> = {
    category: cat.name,
    budget: `${formatPrice(a.budget[0], a.region)}–${formatPrice(a.budget[1], a.region)}`,
    household: `${a.householdSize} ${a.householdSize === 1 ? "person" : "people"}`,
    space: hasSpace(a.category) && (parseMm(a.width) || parseMm(a.depth)) ? "Measured" : "Any",
    features: a.features.length ? `${a.features.length} selected` : "Any",
    brands: a.brandIds.length ? `${a.brandIds.length} preferred` : "Any",
    priorities: Object.values(a.priorities).some((v) => v !== 2) ? "Custom" : "Standard",
  };

  const reset = () => {
    setA(initialAnswers());
    goTo(0);
  };

  const ideal = idealCapacity(a.category, a.householdSize);
  const catBrands = brands.filter((b) => b.categories.includes(a.category));

  const panels: Record<(typeof STEPS)[number]["id"], React.ReactNode> = {
    category: (
      <>
        <StepTitle icon={Sparkles} title="What are you shopping for?" description="We'll tailor the remaining questions to the category." />
        <RadioGroup value={a.category} onValueChange={(v) => setCategory(v as CategorySlug)} className="grid gap-2.5 sm:grid-cols-2" aria-label="Category">
          {categories.map((c) => {
            const Icon = CATEGORY_ICON[c.icon];
            return (
              <RadioCard key={c.slug} value={c.slug} className="items-center">
                <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-surface-2 text-brand">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold">{c.name}</span>
                  <span className="block text-[12px] text-muted-foreground tabular">{productsByCategory(c.slug).length} analysed</span>
                </span>
              </RadioCard>
            );
          })}
        </RadioGroup>
      </>
    ),
    budget: (
      <>
        <StepTitle icon={Scale} title="What's your budget?" description="Products up to 8% over your maximum are still considered, but flagged." />
        <div className="rounded-[16px] border border-border bg-surface-2/50 p-4 sm:p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">Minimum</p>
              <p className="tabular text-[22px] font-semibold tracking-tight">{formatPrice(a.budget[0], a.region)}</p>
            </div>
            <span className="mb-2 h-px flex-1 bg-border-strong" aria-hidden />
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">Maximum</p>
              <p className="tabular text-[22px] font-semibold tracking-tight">{formatPrice(a.budget[1], a.region)}</p>
            </div>
          </div>
          <Slider className="mt-4" min={range.min} max={range.max} step={range.step} value={a.budget} minStepsBetweenThumbs={2} onValueChange={(v) => set("budget", [v[0], v[1]] as [number, number])} aria-label="Budget range" />
          <div className="mt-1 flex justify-between text-[11px] text-subtle-foreground tabular">
            <span>{formatPrice(range.min, a.region)}</span>
            <span>{formatPrice(range.max, a.region)}</span>
          </div>
        </div>
        <div className="mt-5 grid gap-1.5 sm:max-w-xs">
          <Label htmlFor="rec-region">Region</Label>
          <Select value={a.region} onValueChange={(v) => set("region", v as RegionCode)}>
            <SelectTrigger id="rec-region" aria-label="Region">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REGION_LIST.map((r) => (
                <SelectItem key={r.code} value={r.code}>
                  <span aria-hidden>{r.flag}</span> {r.name} <span className="text-subtle-foreground">{r.currency}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[12px] text-subtle-foreground">Only models sold in {REGIONS[a.region].name} are ranked; prices are shown in {REGIONS[a.region].currency}.</p>
        </div>
      </>
    ),
    household: (
      <>
        <StepTitle icon={Users} title="How many people will use it?" description={a.category === "refrigerators" || a.category === "washing-machines" ? "We'll suggest a capacity and penalise undersized models." : "Household size has little effect for this category, but helps tie-breaks."} />
        <div className="flex items-center justify-center gap-5 rounded-[16px] border border-border bg-surface-2/50 p-5">
          <Button variant="outline" size="icon-lg" aria-label="Fewer people" disabled={a.householdSize <= 1} onClick={() => set("householdSize", Math.max(1, a.householdSize - 1))}>
            <Minus />
          </Button>
          <div className="min-w-[120px] text-center" aria-live="polite">
            <p className="tabular text-[44px] font-semibold leading-none tracking-tight">{a.householdSize}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{a.householdSize === 1 ? "person" : "people"}</p>
          </div>
          <Button variant="outline" size="icon-lg" aria-label="More people" disabled={a.householdSize >= 8} onClick={() => set("householdSize", Math.min(8, a.householdSize + 1))}>
            <Plus />
          </Button>
        </div>
        <div className="mt-3 flex justify-center gap-1" aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <Users key={i} className={cn("size-4 transition-colors", i < a.householdSize ? "text-brand" : "text-border-strong")} />
          ))}
        </div>
        {(a.category === "refrigerators" || a.category === "washing-machines") && (
          <p className="mt-4 rounded-[12px] bg-brand-soft/50 p-3 text-center text-[13px] text-brand-soft-foreground">
            Suggested capacity for {a.householdSize}: <strong className="tabular">{ideal.label}</strong>
          </p>
        )}
      </>
    ),
    space: (
      <>
        <StepTitle icon={Ruler} title="Where will it go?" description="Measurements are optional. Unknown dimensions are never treated as a fit." />
        {hasSpace(a.category) ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <MmField id="rec-w" label="Width" value={a.width} onChange={(v) => set("width", v)} />
              <MmField id="rec-h" label="Height" value={a.height} onChange={(v) => set("height", v)} />
              <MmField id="rec-d" label="Depth" value={a.depth} onChange={(v) => set("depth", v)} />
            </div>
            <div className="mt-5 grid gap-4 rounded-[16px] border border-border bg-surface-2/50 p-4 sm:grid-cols-2">
              <MmField id="rec-maxd" label="Maximum depth (installation limit)" value={a.maxDepth} onChange={(v) => set("maxDepth", v)} hint="e.g. to keep a walkway clear" />
              {a.category === "refrigerators" && (
                <div className="flex items-start justify-between gap-3 sm:pt-6">
                  <Label htmlFor="rec-water" className="flex-col items-start gap-1 leading-snug">
                    <span className="inline-flex items-center gap-1.5">
                      <Droplets className="size-4 text-info" /> No water supply nearby
                    </span>
                    <span className="text-[12px] font-normal text-muted-foreground">Excludes plumbed ice makers and dispensers</span>
                  </Label>
                  <Switch id="rec-water" checked={a.noWaterSupply} onCheckedChange={(v) => set("noWaterSupply", v)} />
                </div>
              )}
            </div>
            {(a.width || a.height || a.depth) && (
              <Button variant="ghost" size="sm" className="mt-3 h-11 sm:h-8" onClick={() => setA((cur) => ({ ...cur, width: "", height: "", depth: "", maxDepth: "" }))}>
                <RotateCcw /> Clear measurements
              </Button>
            )}
          </>
        ) : (
          <p className="rounded-[14px] border border-dashed border-border-strong p-5 text-[14px] text-muted-foreground">Space isn&apos;t a constraint for {cat.name.toLowerCase()} — skip ahead.</p>
        )}
      </>
    ),
    features: (
      <>
        <StepTitle icon={Zap} title="Features and running costs" description="Requested features lift matching products; missing ones are listed as trade-offs." />
        <p className="mb-2 text-[13px] font-medium">Preferred features</p>
        <div className="flex flex-wrap gap-2">
          {cat.featureFilters.map((f) => (
            <Chip key={f} active={a.features.includes(f)} onClick={() => set("features", a.features.includes(f) ? a.features.filter((x) => x !== f) : [...a.features, f])}>
              {f}
            </Chip>
          ))}
        </div>
        <p className="mb-2 mt-6 text-[13px] font-medium">How much do running costs matter?</p>
        <RadioGroup value={a.energyPriority} onValueChange={(v) => set("energyPriority", v as Energy)} className="grid gap-2 sm:grid-cols-3" aria-label="Energy priority">
          {(
            [
              { v: "low", t: "Not a priority", d: "Rank on everything else" },
              { v: "balanced", t: "Balanced", d: "Standard weighting" },
              { v: "high", t: "Keep bills low", d: "Efficiency weighs heavily" },
            ] as const
          ).map((o) => (
            <RadioCard key={o.v} value={o.v} className="flex-col gap-1 p-3.5">
              <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold">
                {o.v === "high" && <Leaf className="size-4 text-success" />}
                {o.t}
              </span>
              <span className="text-[12px] text-muted-foreground">{o.d}</span>
            </RadioCard>
          ))}
        </RadioGroup>
      </>
    ),
    brands: (
      <>
        <StepTitle icon={Sparkles} title="Any brand preferences?" description="Preferred brands get a small boost — they never exclude others." />
        <div className="flex flex-wrap gap-2">
          <Chip active={a.brandIds.length === 0} onClick={() => set("brandIds", [])}>
            No preference
          </Chip>
          {catBrands.map((b) => (
            <Chip key={b.id} active={a.brandIds.includes(b.id)} onClick={() => set("brandIds", a.brandIds.includes(b.id) ? a.brandIds.filter((x) => x !== b.id) : [...a.brandIds, b.id])}>
              <span className="grid size-5 place-items-center rounded-[6px] text-[9px] font-bold text-white" style={{ backgroundColor: b.color }} aria-hidden>
                {b.mark}
              </span>
              {b.name}
            </Chip>
          ))}
        </div>
      </>
    ),
    priorities: (
      <>
        <StepTitle icon={Scale} title="What matters most?" description="Your priorities re-weight each factor score. Evidence coverage is never changed." />
        <PrioritySelector category={a.category} value={a.priorities} onChange={(v) => set("priorities", v)} />
      </>
    ),
  };

  const results = (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-soft-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-brand" />
            </span>
            Live ranking
          </p>
          <h2 ref={resultsRef} tabIndex={-1} className="mt-1 text-[20px] font-semibold tracking-tight outline-none">
            {computed.results.length ? `Your top ${computed.results.length} ${computed.results.length === 1 ? "match" : "matches"}` : "No matches yet"}
          </h2>
        </div>
        <p className="text-right text-[12px] text-muted-foreground tabular">
          {computed.considered - computed.excluded} of {computed.considered} eligible
        </p>
      </div>
      <div aria-live="polite" className="sr-only">
        {computed.results.length ? `Top match: ${computed.results[0].product.name}` : "No products match all your answers"}
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        {computed.results.map((r, i) => (
          <RecommendationCard key={r.product.id} rec={r} rank={i + 1} region={a.region} spaceGiven={computed.spaceGiven} />
        ))}
      </AnimatePresence>
      {!computed.results.length && (
        <EmptyState
          title="Nothing meets every answer"
          description={`All ${computed.considered} ${cat.name.toLowerCase()} were excluded. Try widening your budget, removing a measurement or allowing a water supply.`}
          action={
            <Button variant="outline" onClick={() => goTo(1)}>
              Adjust budget
            </Button>
          }
        />
      )}
      <RecommendationExplanation category={a.category} priorities={a.priorities} considered={computed.considered} excluded={computed.excluded} breakdown={computed.breakdown} />
    </div>
  );

  const isResults = step === RESULTS;
  const current = STEPS[Math.min(step, STEPS.length - 1)];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)] xl:gap-8">
      <HideCompareTray scope="mobile" />
      {/* Questionnaire */}
      <div className={cn("min-w-0", isResults && "hidden lg:block")}>
        <RecommendationProgress steps={STEPS.map((s) => ({ ...s, summary: summaries[s.id] }))} current={Math.min(step, STEPS.length - 1)} onStep={goTo} />
        <div ref={panelRef} tabIndex={-1} className="mt-5 rounded-[20px] border border-border bg-card p-4 shadow-xs outline-none sm:p-6" aria-label={`${current.label} question`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={current.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
              {panels[current.id]}
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 hidden items-center justify-between gap-3 border-t border-border pt-4 lg:flex">
            <Button variant="ghost" onClick={() => goTo(Math.max(0, step - 1))} disabled={step === 0}>
              <ArrowLeft /> Back
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={reset}>
                <RotateCcw /> Start over
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => goTo(step + 1)}>
                  Next <ArrowRight />
                </Button>
              ) : (
                <Button variant="brand" onClick={() => resultsRef.current?.focus()}>
                  Review matches <ArrowRight />
                </Button>
              )}
            </div>
          </div>
        </div>
        <p className="mt-3 hidden text-[12px] text-subtle-foreground lg:block">Every change re-ranks instantly — you don&apos;t have to finish every step.</p>
      </div>

      {/* Results — sticky on desktop, a final step on mobile */}
      <aside aria-label="Recommendations" className={cn("min-w-0 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pb-2 lg:pr-1 lg:scrollbar-thin", !isResults && "hidden")}>
        {isResults && (
          <Button variant="ghost" className="mb-3 h-11 lg:hidden" onClick={() => goTo(STEPS.length - 1)}>
            <ArrowLeft /> Edit answers
          </Button>
        )}
        {results}
      </aside>

      {/* Mobile sticky stepper controls */}
      {!isResults && (
        <div className="sticky bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 -mx-4 lg:hidden">
          <div className="mx-3 flex items-center gap-2 rounded-[18px] border border-border bg-popover/95 p-2 shadow-lg backdrop-blur-xl">
            <Button variant="ghost" className="h-11 px-3" onClick={() => goTo(Math.max(0, step - 1))} disabled={step === 0} aria-label="Previous question">
              <ArrowLeft />
            </Button>
            <button type="button" onClick={() => goTo(RESULTS)} className="min-w-0 flex-1 text-left">
              <span className="block text-[11px] text-muted-foreground">Live matches</span>
              <span className="block truncate text-[13px] font-semibold">{computed.results[0] ? `${computed.results.length} · ${computed.results[0].product.model} leads` : "No matches"}</span>
            </button>
            <Button className="h-11" onClick={() => goTo(step < STEPS.length - 1 ? step + 1 : RESULTS)}>
              {step < STEPS.length - 1 ? "Next" : "See matches"} <ArrowRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

