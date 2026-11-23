"use client";

import { Check, Droplets, Gauge, HelpCircle, Home, Leaf, Lock, Ruler, Scale, ShieldCheck, Sparkles, Users, Wallet, Zap } from "lucide-react";
import type { CategorySlug, RegionCode, ScoreFactorKey } from "@/types";
import { brands, categories, products } from "@/data/products";
import { REGION_LIST, formatCurrency } from "@/lib/format";
import { idealCapacity } from "@/lib/recommend";
import { cn, mmToIn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { RadioCard, RadioGroup, Slider } from "@/components/ui/primitives";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/tabs";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { Field } from "@/components/account/fields";
import { BUDGET_MAX, BUDGET_MIN, BUDGET_PRESETS, CATEGORY_ICON, FACTORS, LEVELS, type OnboardingDraft, type WaterSupply } from "./onboarding-data";

type StepProps = { draft: OnboardingDraft; update: (patch: Partial<OnboardingDraft>) => void; errors?: Record<string, string> };

const usd = (n: number) => formatCurrency(n, "US");

/* ------------------------------------------------------------------ 1 Welcome */
export function WelcomeStep({ firstName }: { firstName?: string }) {
  const items = [
    { icon: Home, title: "Your home", body: "Household, space and installation limits" },
    { icon: Wallet, title: "Your budget", body: "A realistic range per product" },
    { icon: Gauge, title: "Your priorities", body: "What matters most when scores are weighted" },
  ];
  return (
    <div className="space-y-6">
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        {firstName ? `Hi ${firstName} — ` : ""}a few quick questions let Qeivo re-weight every suitability score for <em className="not-italic font-medium text-foreground">your</em> situation. Evidence coverage never changes — only how factors are weighted.
      </p>
      <ul className="grid gap-3 sm:grid-cols-3">
        {items.map((it) => (
          <li key={it.title} className="rounded-[14px] border border-border bg-card p-4 shadow-xs">
            <span className="grid size-9 place-items-center rounded-[10px] bg-brand-soft text-brand-soft-foreground">
              <it.icon className="size-[18px]" />
            </span>
            <p className="mt-3 text-[14px] font-semibold">{it.title}</p>
            <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{it.body}</p>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Sparkles className="size-4 text-brand" /> About 2 minutes</span>
        <span className="inline-flex items-center gap-1.5"><Lock className="size-4 text-brand" /> Stored only in this browser</span>
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-brand" /> Change anything later in Profile</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- 2 Interests */
export function InterestsStep({ draft, update, errors }: StepProps) {
  const toggle = (slug: CategorySlug) => update({ interests: draft.interests.includes(slug) ? draft.interests.filter((s) => s !== slug) : [...draft.interests, slug] });
  return (
    <div className="space-y-3">
      <div role="group" aria-label="Product interests" aria-describedby={errors?.interests ? "ob-interests-error" : undefined} className="grid grid-cols-2 gap-3">
        {categories.map((c) => {
          const Icon = CATEGORY_ICON[c.icon];
          const on = draft.interests.includes(c.slug);
          const count = products.filter((p) => p.category === c.slug).length;
          return (
            <button
              key={c.slug}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => toggle(c.slug)}
              className={cn(
                "group relative overflow-hidden rounded-[16px] border bg-card text-left shadow-xs outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/30",
                on ? "border-brand ring-1 ring-brand" : "border-border hover:border-border-strong hover:shadow-sm",
              )}
            >
              <ImageWithFallback src={c.heroImage} alt="" aspect="aspect-[16/9]" sizes="(max-width: 640px) 45vw, 260px" className="transition-transform duration-500 group-hover:scale-[1.03]" />
              <span className={cn("absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-full border-2 transition-all", on ? "border-brand bg-brand text-brand-foreground" : "border-white/80 bg-black/20")}>
                {on && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className="flex items-center gap-2.5 p-3 sm:p-3.5">
                <span className={cn("hidden size-8 shrink-0 place-items-center rounded-[9px] transition-colors min-[400px]:grid", on ? "bg-brand-soft text-brand-soft-foreground" : "bg-surface-2 text-muted-foreground")}>
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold leading-tight">{c.name}</span>
                  <span className="block text-[12px] text-muted-foreground tabular">{count} analysed</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p id="ob-interests-error" role={errors?.interests ? "alert" : undefined} className={cn("text-[13px]", errors?.interests ? "text-danger-foreground" : "text-muted-foreground")} aria-live="polite">
        {errors?.interests ?? (draft.interests.length ? `${draft.interests.length} selected — later steps adapt to these.` : "Choose one or more.")}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- 3 Household */
export function HouseholdStep({ draft, update }: StepProps) {
  const sizes = [1, 2, 3, 4, 5, 6];
  const relevant = (draft.interests.length ? draft.interests : (["refrigerators", "washing-machines"] as CategorySlug[])).filter((c) => c === "refrigerators" || c === "washing-machines");
  return (
    <div className="space-y-6">
      <RadioGroup value={String(draft.household)} onValueChange={(v) => update({ household: Number(v) })} className="grid grid-cols-3 gap-2.5 sm:grid-cols-6" aria-label="People in your household">
        {sizes.map((n) => (
          <RadioCard key={n} value={String(n)} className="group flex-col items-center justify-center gap-1 px-2 py-4 text-center">
            <span className="tabular text-[24px] font-semibold leading-none">{n === 6 ? "6+" : n}</span>
            <span className="text-[12px] text-muted-foreground">{n === 1 ? "person" : "people"}</span>
          </RadioCard>
        ))}
      </RadioGroup>
      <div className="rounded-[14px] border border-border bg-surface-2/60 p-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold">
          <Users className="size-4 text-brand" /> What this changes
        </p>
        <ul className="mt-2.5 space-y-1.5 text-[13px] text-muted-foreground">
          {relevant.length === 0 && <li>Household size mostly affects appliance capacity — it has little effect on TVs and laptops.</li>}
          {relevant.map((c) => {
            const cap = idealCapacity(c, draft.household);
            const cat = categories.find((x) => x.slug === c);
            return (
              <li key={c} className="flex items-baseline justify-between gap-3">
                <span>{cat?.singular} capacity we&apos;ll look for</span>
                <span className="tabular font-semibold text-foreground">{cap.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- 4 Budget */
export function BudgetStep({ draft, update }: StepProps) {
  const [lo, hi] = draft.budget;
  const pool = products.filter((p) => !draft.interests.length || draft.interests.includes(p.category));
  const inRange = pool.filter((p) => p.price >= lo && p.price <= hi).length;
  return (
    <div className="space-y-6">
      <div className="rounded-[16px] border border-border bg-card p-5 shadow-xs sm:p-6">
        <p className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">Per product</p>
        <p className="tabular mt-1 text-[30px] font-semibold tracking-tight sm:text-[34px]" aria-live="polite">
          {usd(lo)} <span className="text-subtle-foreground">–</span> {hi >= BUDGET_MAX ? `${usd(hi)}+` : usd(hi)}
        </p>
        <Slider
          className="mt-5"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={50}
          minStepsBetweenThumbs={4}
          value={[lo, hi]}
          onValueChange={(v) => update({ budget: [v[0], v[1]] as [number, number] })}
          aria-label="Budget range"
        />
        <div className="mt-1 flex justify-between text-[12px] text-subtle-foreground tabular">
          <span>{usd(BUDGET_MIN)}</span>
          <span>{usd(BUDGET_MAX)}+</span>
        </div>
        <p className="mt-4 flex items-center gap-2 rounded-[10px] bg-brand-soft/50 px-3 py-2 text-[13px] text-brand-soft-foreground">
          <Scale className="size-4 shrink-0" />
          <span>
            <strong className="tabular font-semibold">{inRange}</strong> of {pool.length} analysed products in your categories fall in this range.
          </span>
        </p>
      </div>
      <div>
        <p className="mb-2.5 text-[13px] font-medium">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {BUDGET_PRESETS.map((p) => {
            const on = p.range[0] === lo && p.range[1] === hi;
            return (
              <button
                key={p.label}
                type="button"
                aria-pressed={on}
                onClick={() => update({ budget: p.range })}
                className={cn("inline-flex h-11 items-center rounded-full border px-4 text-[13px] font-medium transition-colors sm:h-10", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground")}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-[12.5px] text-subtle-foreground">Shown in US dollars. Prices convert to your region&apos;s currency once you pick it in step 8.</p>
    </div>
  );
}

/* -------------------------------------------------------------------- 5 Space */
function SpaceDiagram({ w, h, d }: { w: number; h: number; d: number }) {
  const W = w || 900;
  const H = h || 1800;
  const D = d || 700;
  const scale = 130 / Math.max(W, H, D * 1.4);
  const fw = W * scale;
  const fh = H * scale;
  const dx = D * scale * 0.5;
  const dy = D * scale * 0.32;
  const x0 = 40;
  const y0 = 22 + dy;
  return (
    <svg viewBox="0 0 230 200" className="h-auto w-full max-w-[230px]" role="img" aria-label={`Space outline ${w || "?"} by ${h || "?"} by ${d || "?"} millimetres`}>
      <g className="stroke-border-strong" fill="none" strokeWidth="1.2">
        <path d={`M${x0} ${y0} l${dx} ${-dy} h${fw} v${fh} l${-dx} ${dy}`} className="fill-surface-2" />
        <path d={`M${x0 + fw} ${y0} l${dx} ${-dy}`} />
      </g>
      <rect x={x0} y={y0} width={fw} height={fh} rx="3" className="fill-brand-soft stroke-brand" strokeWidth="1.5" />
      <g className="fill-muted-foreground" fontSize="10" fontFamily="inherit">
        <text x={x0 + fw / 2} y={y0 + fh + 16} textAnchor="middle" className={cn(w ? "fill-foreground" : "")}>W {w ? `${w} mm` : "—"}</text>
        <text x={x0 - 6} y={y0 + fh / 2} textAnchor="end" transform={`rotate(-90 ${x0 - 6} ${y0 + fh / 2})`} className={cn(h ? "fill-foreground" : "")}>H {h ? `${h} mm` : "—"}</text>
        <text x={x0 + fw + dx / 2 + 6} y={y0 - dy / 2 - 2} className={cn(d ? "fill-foreground" : "")}>D {d ? `${d} mm` : "—"}</text>
      </g>
    </svg>
  );
}

export function SpaceStep({ draft, update, errors }: StepProps) {
  const s = draft.space;
  const set = (patch: Partial<OnboardingDraft["space"]>) => update({ space: { ...s, ...patch }, spaceSkipped: false });
  const n = (v: string) => (v && /^\d+$/.test(v) ? Number(v) : 0);
  const appliance = !draft.interests.length || draft.interests.some((c) => c === "refrigerators" || c === "washing-machines");
  const dims: { key: "width" | "height" | "depth"; label: string; placeholder: string }[] = [
    { key: "width", label: "Width", placeholder: "900" },
    { key: "height", label: "Height", placeholder: "1800" },
    { key: "depth", label: "Depth", placeholder: "700" },
  ];
  const water: { v: WaterSupply; label: string; body: string; icon: typeof Droplets }[] = [
    { v: "plumbed", label: "Water line available", body: "Plumbed ice/water is possible", icon: Droplets },
    { v: "none", label: "No water line", body: "Exclude plumbed-only models", icon: Ruler },
    { v: "unsure", label: "Not sure", body: "We'll show it as unknown", icon: HelpCircle },
  ];
  return (
    <div className="space-y-6">
      {!appliance && (
        <p className="rounded-[12px] border border-border bg-surface-2/60 px-4 py-3 text-[13px] text-muted-foreground">
          Your interests don&apos;t include fridges or washers, so this step is optional — you can skip it.
        </p>
      )}
      <div className="grid items-center gap-5 sm:grid-cols-[1fr_200px]">
        <fieldset>
          <legend className="mb-3 text-[13px] font-medium">Appliance space (millimetres)</legend>
          <div className="grid grid-cols-3 gap-2.5">
            {dims.map((d) => (
              <Field key={d.key} id={`ob-${d.key}`} label={d.label} error={errors?.[d.key]} hint={n(s[d.key]) ? `${mmToIn(n(s[d.key]))} in` : undefined}>
                <Input inputMode="numeric" autoComplete="off" placeholder={d.placeholder} value={s[d.key]} onChange={(e) => set({ [d.key]: e.target.value.replace(/[^\d]/g, "").slice(0, 4) })} />
              </Field>
            ))}
          </div>
          <p className="mt-3 text-[12.5px] text-muted-foreground">Measure the opening itself. We add each model&apos;s ventilation clearance for you.</p>
        </fieldset>
        <div className="hidden justify-center sm:flex">
          <SpaceDiagram w={n(s.width)} h={n(s.height)} d={n(s.depth)} />
        </div>
      </div>

      <Field id="ob-door" label="Narrowest doorway or hallway on the delivery route" optional error={errors?.door} hint="Width in mm. Doors that are too narrow are the most common delivery failure.">
        <Input inputMode="numeric" autoComplete="off" placeholder="e.g. 760" value={s.door} onChange={(e) => set({ door: e.target.value.replace(/[^\d]/g, "").slice(0, 4) })} className="sm:max-w-[200px]" />
      </Field>

      <fieldset>
        <legend className="mb-3 text-[13px] font-medium">Water supply at the space</legend>
        <RadioGroup value={s.water} onValueChange={(v) => set({ water: v as WaterSupply })} className="grid gap-2.5 sm:grid-cols-3">
          {water.map((w) => (
            <RadioCard key={w.v} value={w.v} className="items-center gap-3 p-3.5 sm:flex-col sm:items-start">
              <w.icon className="size-[18px] shrink-0 text-brand" />
              <span>
                <span className="block text-[13.5px] font-semibold leading-tight">{w.label}</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{w.body}</span>
              </span>
            </RadioCard>
          ))}
        </RadioGroup>
      </fieldset>
    </div>
  );
}

/* ------------------------------------------------------------------- 6 Brands */
export function BrandsStep({ draft, update }: StepProps) {
  const list = brands.filter((b) => !draft.interests.length || b.categories.some((c) => draft.interests.includes(c)));
  const toggle = (id: string) => update({ brands: draft.brands.includes(id) ? draft.brands.filter((b) => b !== id) : [...draft.brands, id] });
  const none = draft.brands.length === 0;
  return (
    <div className="space-y-5">
      <div role="group" aria-label="Preferred brands" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={none}
          onClick={() => update({ brands: [] })}
          className={cn("inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[13.5px] font-medium transition-colors", none ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground hover:text-foreground")}
        >
          {none && <Check className="size-4" />} No preference
        </button>
        {list.map((b) => {
          const on = draft.brands.includes(b.id);
          return (
            <button
              key={b.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(b.id)}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-full border pl-1.5 pr-4 text-[13.5px] font-medium outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/30",
                on ? "border-brand bg-brand-soft/60 text-foreground ring-1 ring-brand" : "border-border bg-surface text-foreground hover:border-border-strong",
              )}
            >
              <span className="grid size-8 place-items-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: b.color }} aria-hidden>
                {b.mark}
              </span>
              {b.name}
              {on && <Check className="size-4 text-brand" />}
            </button>
          );
        })}
      </div>
      <p className="text-[13px] text-muted-foreground" aria-live="polite">
        {none ? "We'll treat every brand equally." : `${draft.brands.length} preferred — they're highlighted, never ranked higher on score.`} Showing {list.length} brands that make {draft.interests.length ? "your chosen categories" : "products we cover"}. All brands are fictional demo data.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------- 7 Energy */
export function EnergyStep({ draft, update }: StepProps) {
  const opts: { v: OnboardingDraft["energy"]; icon: typeof Leaf; title: string; body: string; tag: string }[] = [
    { v: "high", icon: Leaf, title: "Efficiency first", body: "Running cost and measured energy use weigh heavily. Good if you keep appliances for 10+ years.", tag: "Energy → Important" },
    { v: "balanced", icon: Scale, title: "Balanced", body: "Energy counts alongside performance, reliability and value.", tag: "Energy → Standard" },
    { v: "low", icon: Zap, title: "Upfront price first", body: "Purchase price and features matter more than lifetime running cost.", tag: "Energy → Minor" },
  ];
  return (
    <RadioGroup value={draft.energy} onValueChange={(v) => {
        const energy = v as OnboardingDraft["energy"];
        update({ energy, priorities: { ...draft.priorities, energy: energy === "high" ? 3 : energy === "low" ? 1 : 2 } });
      }} className="gap-3" aria-label="Energy priority">
      {opts.map((o) => (
        <RadioCard key={o.v} value={o.v} className="group gap-4 p-4 sm:p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-surface-2 text-muted-foreground transition-colors group-data-[state=checked]:bg-brand group-data-[state=checked]:text-brand-foreground">
            <o.icon className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-semibold">{o.title}</span>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{o.tag}</span>
            </span>
            <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">{o.body}</span>
          </span>
        </RadioCard>
      ))}
    </RadioGroup>
  );
}

/* ------------------------------------------------------------------- 8 Region */
export function RegionStep({ draft, update }: StepProps) {
  return (
    <RadioGroup value={draft.region} onValueChange={(v) => update({ region: v as RegionCode })} className="grid gap-2.5 sm:grid-cols-2" aria-label="Region">
      {REGION_LIST.map((r) => (
        <RadioCard key={r.code} value={r.code} className="group items-center gap-3.5 p-4">
          <span className="text-[26px] leading-none" aria-hidden>
            {r.flag}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-semibold leading-tight">{r.name}</span>
            <span className="mt-0.5 block text-[12.5px] text-muted-foreground">
              Prices in {r.currency} · e.g. {formatCurrency(Math.round(1999 * r.priceFactor), r.code)}
            </span>
          </span>
          <Check className="size-4 shrink-0 text-brand opacity-0 transition-opacity group-data-[state=checked]:opacity-100" aria-hidden />
        </RadioCard>
      ))}
    </RadioGroup>
  );
}

/* ------------------------------------------------------------------- 9 Review */
export function ReviewStep({ draft, update }: StepProps) {
  const setLevel = (key: ScoreFactorKey, v: string) => {
    if (!v) return;
    update({ priorities: { ...draft.priorities, [key]: Number(v) as 1 | 2 | 3 | 4 } });
  };
  return (
    <div className="space-y-7">
      <fieldset>
        <legend className="mb-3 text-[13px] font-medium">Which owner reviews should shape your scores?</legend>
        <RadioGroup value={draft.review} onValueChange={(v) => update({ review: v as OnboardingDraft["review"] })} className="grid gap-2.5 sm:grid-cols-2">
          <RadioCard value="verified-only" className="flex-col gap-1 p-4">
            <span className="flex items-center gap-2 text-[14px] font-semibold"><ShieldCheck className="size-4 text-success" /> Verified purchases only</span>
            <span className="text-[12.5px] leading-snug text-muted-foreground">Fewer reviews, higher confidence. Recommended.</span>
          </RadioCard>
          <RadioCard value="all" className="flex-col gap-1 p-4">
            <span className="flex items-center gap-2 text-[14px] font-semibold"><Users className="size-4 text-info" /> All owner reviews</span>
            <span className="text-[12.5px] leading-snug text-muted-foreground">More signal, including unverified accounts.</span>
          </RadioCard>
        </RadioGroup>
      </fieldset>
      <fieldset>
        <legend className="mb-1 text-[13px] font-medium">How much does each factor matter?</legend>
        <p className="mb-3 text-[12.5px] text-muted-foreground">These weights change suitability only — never evidence coverage.</p>
        <ul className="divide-y divide-border rounded-[14px] border border-border bg-card shadow-xs">
          {FACTORS.map((f) => (
            <li key={f.key} className="flex flex-col gap-2.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[14px] font-medium leading-tight" id={`ob-f-${f.key}`}>{f.label}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{f.hint}</p>
              </div>
              <ToggleGroup type="single" value={String(draft.priorities[f.key])} onValueChange={(v) => setLevel(f.key, v)} aria-labelledby={`ob-f-${f.key}`} className="grid w-full shrink-0 grid-cols-4 sm:w-[300px]">
                {LEVELS.map((l) => (
                  <ToggleGroupItem key={l.value} value={String(l.value)} className="h-10 px-1 text-[12px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground sm:h-9">
                    {l.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  );
}
