"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Building2, Check, Minus, Sparkles, Users } from "lucide-react";
import type { Plan } from "@/types";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Cycle = "monthly" | "yearly";
type PlanId = Plan["id"];

const PLAN_ICON: Record<PlanId, typeof Sparkles> = { free: Check, premium: Sparkles, team: Users, enterprise: Building2 };

export function yearlySaving(plan: Plan) {
  if (!plan.priceMonthly) return 0;
  return Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100);
}

function enterpriseEnquiry() {
  toast("Enterprise enquiry — demo only", { description: "In production this opens a sales form. Nothing was sent from this preview." });
}

export function BillingToggle({ cycle, onChange, saving, className }: { cycle: Cycle; onChange: (c: Cycle) => void; saving: number; className?: string }) {
  return (
    <div role="radiogroup" aria-label="Billing period" className={cn("relative inline-flex rounded-full border border-border bg-surface p-1 shadow-xs", className)}>
      {(["monthly", "yearly"] as const).map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={cycle === c}
          onClick={() => onChange(c)}
          className={cn("relative z-10 inline-flex h-10 items-center gap-2 rounded-full px-5 text-[14px] font-medium transition-colors", cycle === c ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          {cycle === c && <motion.span layoutId="billing-pill" className="absolute inset-0 -z-10 rounded-full bg-primary shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.45 }} />}
          {c === "monthly" ? "Monthly" : "Yearly"}
          {c === "yearly" && (
            <span className={cn("rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular", cycle === c ? "bg-teal-400 text-navy-950" : "bg-success-soft text-success")}>−{saving}%</span>
          )}
        </button>
      ))}
    </div>
  );
}

function Price({ plan, cycle }: { plan: Plan; cycle: Cycle }) {
  if (plan.id === "enterprise") return <p className="text-[36px] font-semibold leading-none tracking-tight">Custom</p>;
  const monthly = cycle === "monthly" ? plan.priceMonthly : plan.priceYearly / 12;
  const shown = monthly % 1 === 0 ? `$${monthly}` : `$${monthly.toFixed(2)}`;
  return (
    <div>
      <p className="flex items-baseline gap-1.5">
        <motion.span key={`${plan.id}-${cycle}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-[44px] font-semibold leading-none tracking-tight tabular">
          {shown}
        </motion.span>
        <span className="text-[14px] text-muted-foreground">{plan.id === "team" ? "/ seat / month" : "/ month"}</span>
      </p>
      <p className="mt-2 h-5 text-[13px] text-muted-foreground tabular">
        {plan.priceMonthly === 0 ? "Free forever — no card required" : cycle === "yearly" ? `Billed $${plan.priceYearly} yearly${plan.id === "team" ? " per seat" : ""} · save ${yearlySaving(plan)}%` : `Billed monthly · $${plan.priceYearly}/yr if paid yearly`}
      </p>
    </div>
  );
}

function PlanCta({ plan, highlight }: { plan: Plan; highlight?: boolean }) {
  if (plan.id === "enterprise")
    return (
      <Button size="lg" variant="outline" className="w-full" onClick={enterpriseEnquiry}>
        Talk to sales
      </Button>
    );
  const label = plan.id === "free" ? "Create free account" : plan.id === "premium" ? "Start 14-day free trial" : "Start a team trial";
  return (
    <Button asChild size="lg" variant={highlight ? "brand" : plan.id === "free" ? "outline" : "default"} className="w-full">
      <Link href={plan.id === "free" ? routes.signup : `${routes.signup}?plan=${plan.id}`}>{label}</Link>
    </Button>
  );
}

/** Plan cards with monthly/yearly toggle. Free, Premium and Team as cards; Enterprise as a full-width strip. */
export function PricingPlans({ plans, className }: { plans: Plan[]; className?: string }) {
  const [cycle, setCycle] = useState<Cycle>("yearly");
  const premium = plans.find((p) => p.id === "premium");
  const cards = plans.filter((p) => p.id !== "enterprise");
  const enterprise = plans.find((p) => p.id === "enterprise");

  return (
    <div className={className}>
      <div className="flex justify-center">
        <BillingToggle cycle={cycle} onChange={setCycle} saving={premium ? yearlySaving(premium) : 20} />
      </div>

      <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
        {cards.map((plan) => {
          const Icon = PLAN_ICON[plan.id];
          const hl = plan.highlight;
          return (
            <article
              key={plan.id}
              aria-labelledby={`plan-${plan.id}`}
              className={cn(
                "relative flex flex-col rounded-[24px] border p-6 sm:p-7",
                hl ? "bg-navy-sheen border-navy-800 text-white shadow-lg lg:-my-3 lg:py-10" : "border-border bg-card shadow-xs",
              )}
            >
              {hl && <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-teal-500/25 blur-3xl" />}
              <div className="relative flex items-center justify-between gap-3">
                <h3 id={`plan-${plan.id}`} className={cn("flex items-center gap-2.5 text-[18px] font-semibold", hl && "text-white")}>
                  <span className={cn("grid size-9 place-items-center rounded-[10px]", hl ? "bg-white/10 text-teal-400" : "bg-brand-soft text-brand-soft-foreground")}>
                    <Icon className="size-4.5" />
                  </span>
                  {plan.name}
                </h3>
                {hl && <Badge className="border-teal-400/30 bg-teal-400/15 text-teal-400">Most popular</Badge>}
              </div>
              <p className={cn("relative mt-4 min-h-[44px] text-[14px] leading-relaxed", hl ? "text-white/70" : "text-muted-foreground")}>{plan.description}</p>
              <div className={cn("relative mt-6", hl && "[&_.text-muted-foreground]:text-white/60")}>
                <Price plan={plan} cycle={cycle} />
              </div>
              <div className="relative mt-6">
                <PlanCta plan={plan} highlight={hl} />
              </div>
              <dl className={cn("relative mt-7 space-y-2.5 border-t pt-6", hl ? "border-white/10" : "border-border")}>
                {plan.allowances.slice(0, 4).map((a) => (
                  <div key={a.label} className="flex items-baseline justify-between gap-3 text-[13px]">
                    <dt className={hl ? "text-white/65" : "text-muted-foreground"}>{a.label}</dt>
                    <dd className="text-right font-semibold tabular">{a.value}</dd>
                  </div>
                ))}
              </dl>
              <ul className={cn("relative mt-6 space-y-2.5 border-t pt-6", hl ? "border-white/10" : "border-border")}>
                {plan.features.map((f) => (
                  <li key={f} className={cn("flex gap-2.5 text-[14px]", hl ? "text-white/85" : "text-foreground/85")}>
                    <Check className={cn("mt-0.5 size-4 shrink-0", hl ? "text-teal-400" : "text-brand")} /> {f}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      {enterprise && (
        <div className="mt-6 flex flex-col gap-6 rounded-[24px] border border-border bg-surface p-6 sm:p-7 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4 lg:max-w-md">
            <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-card text-brand shadow-xs">
              <Building2 className="size-5" />
            </span>
            <div>
              <h3 className="text-[18px] font-semibold">{enterprise.name}</h3>
              <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{enterprise.description}</p>
            </div>
          </div>
          <ul className="grid flex-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {enterprise.features.slice(1).map((f) => (
              <li key={f} className="flex gap-2 text-[14px] text-foreground/85">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" /> {f}
              </li>
            ))}
          </ul>
          <Button size="lg" variant="outline" className="lg:w-auto" onClick={enterpriseEnquiry}>
            Talk to sales
          </Button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ comparison */

type Cell = string | boolean;
export interface ComparisonGroup {
  title: string;
  rows: { label: string; hint?: string; values: Record<PlanId, Cell> }[];
}

function CellValue({ v, strong }: { v: Cell; strong?: boolean }) {
  if (v === true)
    return (
      <span className="inline-grid size-6 place-items-center rounded-full bg-brand-soft text-brand-soft-foreground">
        <Check className="size-3.5" />
        <span className="sr-only">Included</span>
      </span>
    );
  if (v === false)
    return (
      <span className="inline-grid size-6 place-items-center text-subtle-foreground">
        <Minus className="size-4" />
        <span className="sr-only">Not included</span>
      </span>
    );
  return <span className={cn("text-[13px] tabular", strong ? "font-semibold" : "text-foreground/85")}>{v}</span>;
}

/** Full feature comparison: table on desktop, per-plan list on mobile. */
export function PlanComparison({ plans, groups, className }: { plans: Plan[]; groups: ComparisonGroup[]; className?: string }) {
  const [mobilePlan, setMobilePlan] = useState<PlanId>("premium");
  return (
    <div className={className}>
      {/* mobile */}
      <div className="md:hidden">
        <div role="tablist" aria-label="Choose a plan to compare" className="sticky top-16 z-20 -mx-4 flex gap-1 border-b border-border bg-background/90 px-4 py-2 backdrop-blur-xl">
          {plans.map((p) => (
            <button
              key={p.id}
              role="tab"
              type="button"
              aria-selected={mobilePlan === p.id}
              onClick={() => setMobilePlan(p.id)}
              className={cn("h-10 flex-1 rounded-[10px] text-[13px] font-medium transition-colors", mobilePlan === p.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface-2")}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-6">
          {groups.map((g) => (
            <section key={g.title}>
              <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">{g.title}</h3>
              <dl className="divide-y divide-border rounded-[16px] border border-border bg-card">
                {g.rows.map((r) => (
                  <div key={r.label} className="flex items-center justify-between gap-4 px-4 py-3">
                    <dt className="text-[14px]">{r.label}</dt>
                    <dd className="shrink-0 text-right">
                      <CellValue v={r.values[mobilePlan]} strong />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>

      {/* desktop */}
      <div className="hidden overflow-hidden rounded-[20px] border border-border bg-card shadow-xs md:block">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">Feature comparison across Qeivo plans</caption>
          <colgroup>
            <col className="w-[32%]" />
            {plans.map((p) => (
              <col key={p.id} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="p-5 align-bottom text-[13px] font-medium text-muted-foreground">
                Features
              </th>
              {plans.map((p) => (
                <th key={p.id} scope="col" className={cn("p-5 text-center align-bottom", p.highlight && "bg-brand-soft/40")}>
                  <span className="block text-[15px] font-semibold">{p.name}</span>
                  <span className="mt-0.5 block text-[12px] font-normal text-muted-foreground tabular">
                    {p.id === "enterprise" ? "Custom pricing" : p.priceMonthly === 0 ? "$0" : `From $${(p.priceYearly / 12).toFixed(2)}/mo`}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((g) => (
            <tbody key={g.title}>
              <tr className="bg-surface">
                <th colSpan={plans.length + 1} scope="colgroup" className="px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">
                  {g.title}
                </th>
              </tr>
              {g.rows.map((r) => (
                <tr key={r.label} className="border-t border-border transition-colors hover:bg-surface/60">
                  <th scope="row" className="px-5 py-3.5 text-[14px] font-medium">
                    {r.label}
                    {r.hint && <span className="mt-0.5 block text-[12px] font-normal text-muted-foreground">{r.hint}</span>}
                  </th>
                  {plans.map((p) => (
                    <td key={p.id} className={cn("px-3 py-3.5 text-center", p.highlight && "bg-brand-soft/25")}>
                      <CellValue v={r.values[p.id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}
