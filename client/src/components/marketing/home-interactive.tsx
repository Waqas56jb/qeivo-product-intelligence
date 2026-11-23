"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Info, MessageSquareText, Sparkles, Users } from "lucide-react";
import type { ScoreFactorKey } from "@/types";
import { products, requireProduct } from "@/data/products";
import { routes } from "@/config/routes";
import { personaliseFactors, personalScore, PRIORITY_LABELS, type Priorities, type PriorityLevel } from "@/lib/scoring";
import { idealCapacity, recommend } from "@/lib/recommend";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/primitives";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { EvidenceCoverage, SuitabilityScore } from "@/components/analysis/score";
import { ClaimTypeBadge, SourceCitation } from "@/components/analysis/badges";
import { BrandLabel, ProductPrice } from "@/components/product/product-bits";

const DEMO_FACTORS: ScoreFactorKey[] = ["energy", "capacity", "space", "value"];

/** Live suitability demonstration: priorities change the personal score, evidence never moves. */
export function ScoreDemo() {
  const p = requireProduct("p-nordvik-frostline-fd600");
  const [prio, setPrio] = useState<Priorities>({ energy: 2, capacity: 2, space: 2, value: 2 });
  const score = personalScore(p, prio);
  const factors = personaliseFactors(p, prio);
  return (
    <div className="grid gap-6 rounded-[24px] border border-border bg-card p-5 shadow-sm sm:p-8 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
      <div className="flex flex-col items-center justify-center gap-6 rounded-[20px] bg-gradient-to-b from-surface-2 to-card p-6 text-center">
        <div className="flex items-center gap-3">
          <ImageWithFallback src={p.images[0]} alt={p.name} aspect="size-16 rounded-[12px] bg-surface" sizes="64px" className="p-1.5" />
          <div className="text-left">
            <BrandLabel brandId={p.brandId} />
            <p className="font-semibold">{p.model}</p>
          </div>
        </div>
        <motion.div key={score} initial={{ scale: 0.96 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <SuitabilityScore score={score} size="lg" personalised />
        </motion.div>
        <div className="w-full max-w-[260px]">
          <EvidenceCoverage coverage={p.evidenceCoverage} />
          <p className="mt-2 text-[12px] leading-snug text-muted-foreground">Evidence coverage stays at {p.evidenceCoverage}% — your priorities change suitability, never the evidence.</p>
        </div>
      </div>
      <div className="space-y-5">
        <div>
          <h3 className="text-[18px] font-semibold">Tell Qeivo what matters to you</h3>
          <p className="mt-1 text-[14px] text-muted-foreground">Drag a priority and watch the score re-weight in real time. Every factor keeps its own explanation.</p>
        </div>
        {DEMO_FACTORS.map((k) => {
          const f = factors.find((x) => x.key === k)!;
          const level = (prio[k] ?? 2) as PriorityLevel;
          return (
            <div key={k} className="space-y-1.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium">{f.label}</span>
                <span className="tabular text-muted-foreground">
                  {PRIORITY_LABELS[level]} · factor {f.score.toFixed(1)} · weight {Math.round(f.personalWeight * 100)}%
                </span>
              </div>
              <Slider min={0} max={4} step={1} value={[level]} onValueChange={([v]) => setPrio((s) => ({ ...s, [k]: v as PriorityLevel }))} aria-label={`${f.label} priority`} />
            </div>
          );
        })}
        <p className="flex items-start gap-2 rounded-[12px] bg-surface-2 p-3 text-[12px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" /> Sponsored placements and affiliate commissions are never inputs to this calculation.
        </p>
      </div>
    </div>
  );
}

const HOUSEHOLDS = [
  { size: 1, label: "Just me", budget: 1200 },
  { size: 2, label: "Couple", budget: 2000 },
  { size: 4, label: "Family of 4", budget: 2800 },
  { size: 6, label: "Large family", budget: 4500 },
];

export function RecommendationDemo() {
  const [h, setH] = useState(HOUSEHOLDS[2]);
  const [energy, setEnergy] = useState<"balanced" | "high">("balanced");
  const { results } = useMemo(
    () =>
      recommend(products, {
        category: "refrigerators",
        budgetMin: 0,
        budgetMax: h.budget,
        householdSize: h.size,
        space: null,
        noWaterSupply: false,
        features: [],
        energyPriority: energy,
        region: "US",
        brandIds: [],
        priorities: {},
      }),
    [h, energy],
  );
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Users className="size-4" /> Household
        </span>
        {HOUSEHOLDS.map((x) => (
          <button key={x.size} type="button" onClick={() => setH(x)} aria-pressed={h.size === x.size} className={cn("h-9 rounded-full border px-3.5 text-[13px] font-medium transition-colors", h.size === x.size ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground hover:text-foreground")}>
            {x.label}
          </button>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
        <button type="button" onClick={() => setEnergy((e) => (e === "high" ? "balanced" : "high"))} aria-pressed={energy === "high"} className={cn("inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors", energy === "high" ? "border-success bg-success-soft text-success" : "border-border bg-surface text-muted-foreground hover:text-foreground")}>
          {energy === "high" && <Check className="size-3.5" />} Prioritise low energy bills
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((r, i) => (
            <motion.div key={r.product.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35, delay: i * 0.05 }}>
              <Link href={routes.product(r.product.slug)} className="group flex h-full flex-col rounded-[20px] border border-border bg-card p-4 shadow-xs transition-all hover:border-border-strong hover:shadow-md">
                <div className="flex items-start justify-between">
                  <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", i === 0 ? "bg-brand text-brand-foreground" : "bg-surface-2 text-muted-foreground")}>{i === 0 ? "Best match" : `#${i + 1} match`}</span>
                  <SuitabilityScore score={r.personalScore} size="sm" label={false} />
                </div>
                <ImageWithFallback src={r.product.images[0]} alt={r.product.name} aspect="aspect-[4/3] my-2" sizes="(max-width: 768px) 90vw, 30vw" className="p-2 transition-transform duration-500 group-hover:scale-[1.04]" />
                <BrandLabel brandId={r.product.brandId} />
                <p className="font-semibold">{r.product.model}</p>
                <ProductPrice product={r.product} size="sm" className="mt-0.5" />
                <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                  {r.reasons.slice(0, 2).map((reason) => (
                    <li key={reason} className="flex gap-2 text-[12px] leading-snug text-muted-foreground">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" /> {reason}
                    </li>
                  ))}
                </ul>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ComparisonPreview() {
  const items = ["p-halden-precision-fd590", "p-nordvik-frostline-fd600", "p-ovea-eco-fd520"].map(requireProduct);
  const rows: { label: string; get: (p: (typeof items)[number]) => number; fmt: (v: number) => string; better: "higher" | "lower" }[] = [
    { label: "Suitability", get: (p) => p.suitabilityScore, fmt: (v) => v.toFixed(1), better: "higher" },
    { label: "Evidence coverage", get: (p) => p.evidenceCoverage, fmt: (v) => `${v}%`, better: "higher" },
    { label: "Capacity", get: (p) => p.capacity.value, fmt: (v) => `${v} L`, better: "higher" },
    { label: "Rated energy", get: (p) => p.energy.annualKwh, fmt: (v) => `${v} kWh/yr`, better: "lower" },
    { label: "Depth", get: (p) => p.dimensions.depthMm, fmt: (v) => `${v} mm`, better: "lower" },
    { label: "Price", get: (p) => p.price, fmt: (v) => `$${v.toLocaleString("en-US")}`, better: "lower" },
  ];
  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-card shadow-sm">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[560px] text-[13px]">
          <thead>
            <tr className="border-b border-border">
              <th className="w-[26%] p-4 text-left text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">Side by side</th>
              {items.map((p) => (
                <th key={p.id} className="p-4 text-left align-bottom font-normal">
                  <ImageWithFallback src={p.images[0]} alt={p.name} aspect="mb-2 h-20 w-16 rounded-[10px] bg-surface-2" sizes="64px" className="p-1" />
                  <BrandLabel brandId={p.brandId} className="text-[10px]" />
                  <p className="font-semibold">{p.model}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const vals = items.map(r.get);
              const best = r.better === "higher" ? Math.max(...vals) : Math.min(...vals);
              return (
                <tr key={r.label} className="border-b border-border last:border-0">
                  <td className="p-4 text-muted-foreground">{r.label}</td>
                  {vals.map((v, i) => (
                    <td key={items[i].id} className="p-4">
                      <span className={cn("tabular inline-flex items-center gap-1.5 rounded-[7px] px-1.5 py-0.5 font-medium", v === best && "bg-success-soft text-success")}>
                        {v === best && <Check className="size-3.5" />}
                        {r.fmt(v)}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AskDemo() {
  const p = requireProduct("p-nordvik-frostline-fd600");
  const lab = p.specs.flatMap((g) => g.items).find((i) => i.key === "kwh-measured");
  const usable = p.specs.flatMap((g) => g.items).find((i) => i.key === "usable");
  const ice = p.limitations.find((l) => l.type === "customer");
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-border bg-card shadow-md">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
        <span className="grid size-8 place-items-center rounded-[9px] bg-teal-sheen text-white">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold">Ask Qeivo</p>
          <p className="truncate text-[12px] text-muted-foreground">Researching: {p.name}</p>
        </div>
      </div>
      <div className="space-y-4 bg-surface-2/40 p-5">
        <div className="ml-auto max-w-[80%] rounded-[16px] rounded-br-[6px] bg-primary px-4 py-2.5 text-[14px] text-primary-foreground">Is this fridge big enough for a family of four, and what does it cost to run?</div>
        <div className="max-w-[92%] space-y-3 rounded-[16px] rounded-bl-[6px] border border-border bg-card p-4 text-[14px] leading-relaxed shadow-xs">
          <p>
            {Number(usable?.value) >= idealCapacity("refrigerators", 4).min ? "Yes" : "It will be tight"} — it has <strong className="tabular">{String(usable?.value)} L</strong> of measured usable space against the ~{idealCapacity("refrigerators", 4).min} L we suggest for four people.
            <SourceCitation sourceId={`${p.id}:lab`} variant="number" index={1} allIds={[`${p.id}:lab`, `${p.id}:spec`, `${p.id}:customers`]} />
          </p>
          <p>
            Independent testing measured <strong className="tabular">{String(lab?.value)} kWh/yr</strong>, roughly <strong className="tabular">${Math.round(Number(lab?.value) * 0.17)}</strong> a year at $0.17/kWh.
            <SourceCitation sourceId={`${p.id}:lab`} variant="number" index={1} allIds={[`${p.id}:lab`, `${p.id}:spec`, `${p.id}:customers`]} />
          </p>
          {ice && (
            <p>
              One caution: {ice.text.charAt(0).toLowerCase() + ice.text.slice(1)}.
              <SourceCitation sourceId={`${p.id}:customers`} variant="number" index={3} allIds={[`${p.id}:lab`, `${p.id}:spec`, `${p.id}:customers`]} />
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
            <ClaimTypeBadge type="measured" size="xs" />
            <ClaimTypeBadge type="customer" size="xs" />
            <ClaimTypeBadge type="ai" size="xs" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {["What do owners complain about?", "Compare with Halden FD590", "Does it fit a 900 mm gap?"].map((q) => (
            <Link key={q} href={`${routes.ask}?product=${p.slug}&q=${encodeURIComponent(q)}`} className="rounded-full border border-border bg-card px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground">
              {q}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-border p-3">
        <Button asChild variant="brand" className="w-full">
          <Link href={routes.askAbout(p.slug)}>
            <MessageSquareText /> Ask your own question <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
