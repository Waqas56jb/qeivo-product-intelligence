"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, CircleHelp, MinusCircle, Search, ShieldCheck, Trophy, XCircle } from "lucide-react";
import type { Product, ScoreFactorKey } from "@/types";
import { getCategory } from "@/data/products/categories";
import { requireProduct, productsByCategory } from "@/data/products";
import { checkCompatibility, type FitStatus } from "@/lib/compatibility";
import { defaultMaintenance, ownershipCost } from "@/lib/ownership";
import { PRIORITY_LABELS, personalScore, type Priorities, type PriorityLevel } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { CurrencyDisplay } from "@/components/common/display";
import { ClaimTypeBadge, SourceCitation } from "@/components/analysis/badges";
import { EvidenceCoverage, ScorePill, SuitabilityScore } from "@/components/analysis/score";
import { BrandLabel, ProductPrice } from "@/components/product/product-bits";
import { ProductCard } from "@/components/product/product-card";
import { ImageWithFallback } from "@/components/common/image-with-fallback";

const frame = "rounded-[24px] border border-border bg-card p-4 shadow-md sm:p-5";

function specValue(p: Product, key: string) {
  return p.specs.flatMap((g) => g.items).find((i) => i.key === key);
}

/* ---------------------------------------------------------------- Discover */
export function DiscoverVisual() {
  const results = productsByCategory("refrigerators")
    .filter((p) => p.type === "Counter-depth" && p.dimensions.depthMm <= 720)
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
    .slice(0, 3);
  return (
    <div className={frame}>
      <div className="flex items-center gap-2.5 rounded-[14px] border border-border bg-surface px-3.5 py-3">
        <Search className="size-4 shrink-0 text-brand" />
        <span className="truncate text-[14px]">quiet counter-depth fridge for a family of four</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["Counter-depth", "Depth ≤ 720 mm", "Family of 4", "Sorted by suitability"].map((c) => (
          <span key={c} className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand-soft-foreground">
            {c}
          </span>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {results.map((p) => (
          <ProductCard key={p.id} product={p} variant="compact" />
        ))}
      </div>
      <p className="mt-3 text-[12px] text-subtle-foreground">
        {results.length} of {productsByCategory("refrigerators").length} refrigerators match · sponsored listings never change this order
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- Analyse */
export function AnalyseVisual() {
  const p = requireProduct("p-halden-precision-fd590");
  const claims = [p.aiSummary[0], p.strengths[0], p.strengths[1], p.limitations[0]].filter(Boolean);
  return (
    <div className={frame}>
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <ImageWithFallback src={p.images[0]} alt={p.name} aspect="size-14 shrink-0 rounded-[12px] bg-gradient-to-b from-surface-2 to-surface-3/60" sizes="56px" className="p-1.5" />
        <div className="min-w-0 flex-1">
          <BrandLabel brandId={p.brandId} withMark />
          <p className="truncate text-[15px] font-semibold">{p.model}</p>
        </div>
        <span className="hidden text-right text-[12px] text-muted-foreground sm:block">
          <strong className="block text-[15px] text-foreground tabular">{p.sourceIds.length}</strong> sources read
        </span>
      </div>
      <ul className="mt-4 space-y-3.5">
        {claims.map((c) => (
          <li key={c.id} className="space-y-1.5">
            <div className="flex items-start gap-2.5">
              <ClaimTypeBadge type={c.type} size="xs" />
              <p className="flex-1 text-[13px] leading-snug">{c.text}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 pl-0 sm:pl-[86px]">
              {c.sourceIds.slice(0, 2).map((id) => (
                <SourceCitation key={id} sourceId={id} allIds={c.sourceIds} />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------- Compare */
const COMPARE_IDS = ["p-halden-precision-fd590", "p-nordvik-frostline-fd600", "p-brightwater-family-fd560"];

export function CompareVisual() {
  const ps = COMPARE_IDS.map((id) => requireProduct(id));
  const num = (p: Product, key: string) => {
    const v = specValue(p, key);
    return typeof v?.numeric === "number" ? v.numeric : typeof v?.value === "number" ? v.value : null;
  };
  const rows: { label: string; get: (p: Product) => number | null; unit: string; better: "higher" | "lower" }[] = [
    { label: "Capacity", get: (p) => p.capacity.value, unit: "L", better: "higher" },
    { label: "Measured energy", get: (p) => num(p, "kwh-measured") ?? p.energy.annualKwh, unit: "kWh/yr", better: "lower" },
    { label: "Noise", get: (p) => num(p, "noise"), unit: "dB", better: "lower" },
    { label: "Width", get: (p) => p.dimensions.widthMm, unit: "mm", better: "lower" },
  ];
  return (
    <div className={cn(frame, "overflow-hidden p-0 sm:p-0")}>
      <div className="grid grid-cols-[minmax(84px,1fr)_repeat(3,minmax(0,1fr))]">
        <div className="border-b border-border p-3" />
        {ps.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-1.5 border-b border-l border-border p-3 text-center">
            <ImageWithFallback src={p.images[0]} alt={p.name} aspect="size-12 rounded-[10px] bg-surface-2" sizes="48px" className="p-1" />
            <p className="line-clamp-2 text-[11px] font-semibold leading-tight sm:text-[12px]">{p.model}</p>
            <ScorePill score={p.suitabilityScore} className="h-6" />
          </div>
        ))}
        {rows.map((r) => {
          const vals = ps.map(r.get);
          const nums = vals.filter((v): v is number => v !== null);
          const best = nums.length ? (r.better === "higher" ? Math.max(...nums) : Math.min(...nums)) : null;
          return (
            <div key={r.label} className="contents">
              <div className="border-b border-border px-3 py-2.5 text-[12px] font-medium text-muted-foreground">{r.label}</div>
              {vals.map((v, i) => (
                <div key={i} className={cn("border-b border-l border-border px-2 py-2.5 text-center text-[12px] tabular sm:text-[13px]", v !== null && v === best ? "bg-success-soft/60 font-semibold text-success" : "")}>
                  {v === null ? <span className="text-subtle-foreground">Unknown</span> : `${v.toLocaleString("en-US")} ${r.unit}`}
                </div>
              ))}
            </div>
          );
        })}
        <div className="px-3 py-2.5 text-[12px] font-medium text-muted-foreground">Evidence</div>
        {ps.map((p) => (
          <div key={p.id} className="border-l border-border px-2 py-2.5">
            <EvidenceCoverage coverage={p.evidenceCoverage} showLabel={false} />
            <p className="mt-1 text-center text-[11px] text-muted-foreground tabular">{p.evidenceCoverage}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Personalise */
const PRESETS: { id: string; label: string; priorities: Priorities }[] = [
  { id: "balanced", label: "Balanced", priorities: {} },
  { id: "energy", label: "Lowest running cost", priorities: { energy: 4, value: 3 } },
  { id: "quiet", label: "Open-plan & quiet", priorities: { performance: 3, space: 4 } },
  { id: "space", label: "Big family shop", priorities: { capacity: 4, reliability: 3 } },
];

export function PersonaliseVisual() {
  const [preset, setPreset] = useState(PRESETS[0]);
  const ps = COMPARE_IDS.map((id) => requireProduct(id));
  const ranked = ps.map((p) => ({ p, score: personalScore(p, preset.priorities) })).sort((a, b) => b.score - a.score);
  const factorLabels = getCategory("refrigerators").factorLabels;
  const label = (k: ScoreFactorKey, v: PriorityLevel) => `${factorLabels[k]}: ${PRIORITY_LABELS[v].toLowerCase()}`;
  return (
    <div className={frame}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">Your priorities</p>
      <div role="radiogroup" aria-label="Priority preset" className="mt-2.5 flex flex-wrap gap-1.5">
        {PRESETS.map((pr) => (
          <button
            key={pr.id}
            type="button"
            role="radio"
            aria-checked={preset.id === pr.id}
            onClick={() => setPreset(pr)}
            className={cn("h-9 rounded-full border px-3 text-[13px] font-medium transition-colors", preset.id === pr.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground hover:text-foreground")}
          >
            {pr.label}
          </button>
        ))}
      </div>
      <p className="mt-2 min-h-4 text-[11px] leading-relaxed text-subtle-foreground">
        {Object.keys(preset.priorities).length ? `Weights raised: ${Object.entries(preset.priorities).map(([k, v]) => label(k as ScoreFactorKey, v as PriorityLevel)).join(" · ")}` : "Default weights for every factor"}
      </p>
      <ol className="mt-4 space-y-2">
        {ranked.map(({ p, score }, i) => (
          <motion.li layout key={p.id} transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} className={cn("flex items-center gap-3 rounded-[14px] border p-2.5", i === 0 ? "border-brand/40 bg-brand-soft/40" : "border-border bg-surface")}>
            <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold tabular", i === 0 ? "bg-brand text-brand-foreground" : "bg-surface-3 text-muted-foreground")}>{i === 0 ? <Trophy className="size-3.5" /> : i + 1}</span>
            <ImageWithFallback src={p.images[0]} alt="" aspect="size-10 shrink-0 rounded-[9px] bg-card" sizes="40px" className="p-1" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold">{p.model}</p>
              <p className="text-[11px] text-muted-foreground tabular">Evidence {p.evidenceCoverage}% · unchanged</p>
            </div>
            <SuitabilityScore score={score} size="xs" label={false} />
          </motion.li>
        ))}
      </ol>
      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-subtle-foreground">
        <ShieldCheck className="mt-px size-3.5 shrink-0" /> Priorities re-weight suitability only. Evidence coverage is never an input and never changes.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- Decide */
const FIT_ICON: Record<FitStatus, { icon: typeof CheckCircle2; className: string; label: string }> = {
  fits: { icon: CheckCircle2, className: "text-success", label: "Fits" },
  "no-fit": { icon: XCircle, className: "text-danger", label: "Doesn't fit" },
  unknown: { icon: CircleHelp, className: "text-muted-foreground", label: "Unknown" },
};

export function DecideVisual() {
  const p = requireProduct("p-halden-precision-fd590");
  const checks = checkCompatibility(p, { widthMm: 940, heightMm: 1850, depthMm: 760, doorClearanceMm: 1100, accessWidthMm: null, hasWaterSupply: true }).slice(0, 5);
  const cost = ownershipCost(p, { purchasePrice: p.price, tariff: 0.17, usageFactor: 1, years: 10, accessories: 0, maintenancePerYear: defaultMaintenance(p) });
  return (
    <div className={frame}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-soft-foreground">Your decision</p>
          <p className="truncate text-[16px] font-semibold">{p.name}</p>
          <ProductPrice product={p} size="sm" />
        </div>
        <SuitabilityScore score={p.suitabilityScore} size="sm" label={false} />
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2">
        {[
          { k: "10-yr energy", v: <CurrencyDisplay usd={cost.energy} region="US" /> },
          { k: "10-yr total", v: <CurrencyDisplay usd={cost.total} region="US" /> },
          { k: "Warranty", v: `${p.warranty.years} yrs` },
        ].map((x) => (
          <div key={x.k} className="rounded-[12px] bg-surface-2 px-2.5 py-2">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">{x.k}</dt>
            <dd className="mt-0.5 text-[13px] font-semibold tabular sm:text-[14px]">{x.v}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-4 divide-y divide-border rounded-[14px] border border-border">
        {checks.map((c) => {
          const m = FIT_ICON[c.status];
          return (
            <li key={c.id} className="flex items-center gap-2.5 px-3 py-2">
              <m.icon className={cn("size-4 shrink-0", m.className)} />
              <span className="flex-1 text-[13px]">{c.label}</span>
              <span className="text-[12px] text-muted-foreground tabular">{c.status === "unknown" ? "Measure to confirm" : c.required}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-subtle-foreground">
        <MinusCircle className="mt-px size-3.5 shrink-0" /> Unknown is never shown as compatible. Energy projection uses measured consumption at $0.17/kWh.
      </p>
    </div>
  );
}

