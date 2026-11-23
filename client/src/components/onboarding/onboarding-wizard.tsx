"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, CornerDownLeft, PartyPopper, Pencil } from "lucide-react";
import type { ScoreFactorKey } from "@/types";
import { routes } from "@/config/routes";
import { brandById, categories } from "@/data/products";
import { REGIONS, formatCurrency } from "@/lib/format";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import { FACTORS, LEVELS, initialDraft, type OnboardingDraft } from "./onboarding-data";
import { BrandsStep, BudgetStep, EnergyStep, HouseholdStep, InterestsStep, RegionStep, ReviewStep, SpaceStep, WelcomeStep } from "./onboarding-steps";

const dim = (label: string) =>
  z
    .string()
    .min(1, `Enter the ${label}`)
    .refine((v) => Number(v) >= 300 && Number(v) <= 2600, `${label[0].toUpperCase() + label.slice(1)} should be 300–2,600 mm`);

const spaceSchema = z.object({
  width: dim("width"),
  height: dim("height"),
  depth: dim("depth"),
  door: z.string().refine((v) => !v || (Number(v) >= 450 && Number(v) <= 1600), "Doorways are usually 450–1,600 mm wide"),
});

interface StepDef {
  id: string;
  label: string;
  title: string;
  subtitle?: string;
  optional?: boolean;
  validate?: (d: OnboardingDraft) => Record<string, string> | null;
}

const STEPS: StepDef[] = [
  { id: "welcome", label: "Welcome", title: "Let's personalise Qeivo" },
  {
    id: "interests",
    label: "Interests",
    title: "What are you researching?",
    subtitle: "Pick the categories you're shopping for now or soon.",
    validate: (d) => (d.interests.length ? null : { interests: "Choose at least one category to continue." }),
  },
  { id: "household", label: "Household", title: "How many people live with you?", subtitle: "Capacity recommendations scale with your household." },
  { id: "budget", label: "Budget", title: "What's your budget per product?", subtitle: "Drag the handles or pick a preset. Over-budget products stay visible, just flagged." },
  {
    id: "space",
    label: "Space",
    title: "Where will it go?",
    subtitle: "Dimensions power the space-fit checker. Unknown measurements are shown as unknown — never assumed to fit.",
    optional: true,
    validate: (d) => {
      if (d.spaceSkipped) return null;
      const s = d.space;
      if (!s.width && !s.height && !s.depth && !s.door) return null;
      const r = spaceSchema.safeParse(s);
      if (r.success) return null;
      const out: Record<string, string> = {};
      for (const issue of r.error.issues) {
        const k = String(issue.path[0]);
        if (!out[k]) out[k] = issue.message;
      }
      return out;
    },
  },
  { id: "brands", label: "Brands", title: "Any brands you already trust?", subtitle: "Optional. Preferred brands are highlighted, never scored higher." },
  { id: "energy", label: "Energy", title: "How much does running cost matter?", subtitle: "This sets the default weight for energy efficiency." },
  { id: "region", label: "Region", title: "Where are you shopping?", subtitle: "Sets currency, retailer prices and regional model availability." },
  { id: "review", label: "Research", title: "How should we weigh the evidence?", subtitle: "Fine-tune how suitability scores are personalised." },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function OnboardingWizard() {
  const hydrated = useHydrated();
  const profileName = useAppStore((s) => s.profile.name);
  const setPreferences = useAppStore((s) => s.setPreferences);
  const setRegion = useAppStore((s) => s.setRegion);
  const setPriority = useAppStore((s) => s.setPriority);
  const setRole = useAppStore((s) => s.setRole);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const [draft, setDraft] = useState<OnboardingDraft>(initialDraft);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [returnToSummary, setReturnToSummary] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const def = STEPS[step];
  const total = STEPS.length;
  const update = (patch: Partial<OnboardingDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    if (Object.keys(errors).length) setErrors({});
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, done]);

  const finish = (d: OnboardingDraft) => {
    const levels = d.priorities;
    const sum = FACTORS.reduce((s, f) => s + levels[f.key], 0);
    const weights = Object.fromEntries(FACTORS.map((f) => [f.key, Math.round((levels[f.key] / sum) * 100) / 100])) as Partial<Record<ScoreFactorKey, number>>;
    const hasSpace = !d.spaceSkipped && d.space.width && d.space.height && d.space.depth;
    setPreferences({
      interests: d.interests,
      householdSize: d.household,
      budgetMin: d.budget[0],
      budgetMax: d.budget[1],
      space: hasSpace ? { widthMm: Number(d.space.width), heightMm: Number(d.space.height), depthMm: Number(d.space.depth) } : null,
      preferredBrandIds: d.brands,
      energyPriority: d.energy,
      region: d.region,
      reviewPreference: d.review,
      priorities: weights,
    });
    setRegion(d.region);
    FACTORS.forEach((f) => setPriority(f.key, levels[f.key]));
    setRole("customer");
    completeOnboarding();
    setDone(true);
  };

  const next = () => {
    const errs = def.validate?.(draft);
    if (errs) {
      setErrors(errs);
      return;
    }
    setErrors({});
    if (returnToSummary) {
      setReturnToSummary(false);
      finish(draft);
      return;
    }
    if (step === total - 1) {
      finish(draft);
      return;
    }
    setDir(1);
    setStep((s) => s + 1);
  };

  const back = () => {
    setErrors({});
    setDir(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  const skipSpace = () => {
    setDraft((d) => ({ ...d, spaceSkipped: true, space: initialDraft().space }));
    setErrors({});
    setDir(1);
    setStep((s) => s + 1);
  };

  const editStep = (i: number) => {
    setDone(false);
    setReturnToSummary(true);
    setDir(-1);
    setStep(i);
  };

  if (done) return <Completion draft={draft} onEdit={editStep} headingRef={headingRef} />;

  const firstName = hydrated && profileName ? profileName.split(" ")[0] : undefined;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        next();
      }}
      onKeyDown={(e) => {
        if (e.altKey && e.key === "ArrowLeft" && step > 0) {
          e.preventDefault();
          back();
        }
      }}
      className="flex flex-1 flex-col"
      aria-labelledby="ob-title"
    >
      <div className="mx-auto w-full max-w-[680px] flex-1 px-4 pb-8 pt-2 sm:px-8 sm:pt-6">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-3 text-[12.5px]">
            <p className="font-medium text-muted-foreground">
              Step <span className="tabular text-foreground">{step + 1}</span> of <span className="tabular">{total}</span>
              <span className="text-subtle-foreground"> · {def.label}</span>
            </p>
            <Link
              href={routes.app}
              onClick={() => toast("Personalisation skipped", { description: "Scores use standard weights until you finish this in Profile." })}
              className="inline-flex h-9 items-center rounded-[8px] px-2 font-medium text-muted-foreground hover:bg-surface-2 hover:text-foreground"
            >
              Skip for now
            </Link>
          </div>
          <ol className="grid gap-1" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }} aria-label="Onboarding progress">
            {STEPS.map((s, i) => (
              <li key={s.id} aria-current={i === step ? "step" : undefined} className="relative h-1.5 overflow-hidden rounded-full bg-surface-3">
                <span className="sr-only">
                  {s.label} {i < step ? "(complete)" : i === step ? "(current)" : ""}
                </span>
                <motion.span className="absolute inset-y-0 left-0 rounded-full bg-brand" initial={false} animate={{ width: i < step ? "100%" : i === step ? "50%" : "0%" }} transition={{ duration: 0.45, ease }} />
              </li>
            ))}
          </ol>
        </div>

        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.section
            key={def.id}
            custom={dir}
            initial={{ opacity: 0, x: dir * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -28 }}
            transition={{ duration: 0.3, ease }}
          >
            <header className="mb-7">
              {def.optional && <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-subtle-foreground">Optional</p>}
              <h1 id="ob-title" ref={headingRef} tabIndex={-1} className="text-[26px] font-semibold leading-tight tracking-[-0.02em] outline-none sm:text-[32px]">
                {step === 0 && firstName ? `Welcome to Qeivo, ${firstName}` : def.title}
              </h1>
              {def.subtitle && <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{def.subtitle}</p>}
            </header>

            {def.id === "welcome" && <WelcomeStep firstName={firstName} />}
            {def.id === "interests" && <InterestsStep draft={draft} update={update} errors={errors} />}
            {def.id === "household" && <HouseholdStep draft={draft} update={update} />}
            {def.id === "budget" && <BudgetStep draft={draft} update={update} />}
            {def.id === "space" && <SpaceStep draft={draft} update={update} errors={errors} />}
            {def.id === "brands" && <BrandsStep draft={draft} update={update} />}
            {def.id === "energy" && <EnergyStep draft={draft} update={update} />}
            {def.id === "region" && <RegionStep draft={draft} update={update} />}
            {def.id === "review" && <ReviewStep draft={draft} update={update} />}
          </motion.section>
        </AnimatePresence>
      </div>

      {/* Footer: sticky on mobile */}
      <div className="sticky bottom-0 z-20 border-t border-border bg-background/90 backdrop-blur-xl sm:static sm:border-0 sm:bg-transparent sm:backdrop-blur-none">
        <div className="mx-auto flex w-full max-w-[680px] items-center gap-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-4">
          {step > 0 ? (
            <Button variant="ghost" size="lg" onClick={back} className="px-3 sm:px-4" aria-keyshortcuts="Alt+ArrowLeft">
              <ArrowLeft /> Back
            </Button>
          ) : (
            <span className="hidden text-[12px] text-subtle-foreground sm:inline-flex sm:items-center sm:gap-1.5">
              Press <kbd className="inline-flex h-5 items-center rounded border border-border bg-surface px-1"><CornerDownLeft className="size-3" /></kbd> Enter to continue
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {def.optional && (
              <Button variant="outline" size="lg" onClick={skipSpace} className="px-3 sm:px-5">
                Skip<span className="hidden min-[400px]:inline">&nbsp;this step</span>
              </Button>
            )}
            <Button type="submit" variant="brand" size="lg" className="min-w-[120px]">
              {returnToSummary ? "Save & review" : step === 0 ? "Get started" : step === total - 1 ? "Finish" : "Continue"}
              {step === total - 1 || returnToSummary ? <Check /> : <ArrowRight />}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Completion({ draft, onEdit, headingRef }: { draft: OnboardingDraft; onEdit: (step: number) => void; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const router = useRouter();
  const region = REGIONS[draft.region];
  const top = FACTORS.filter((f) => draft.priorities[f.key] >= 3).map((f) => `${f.label} (${LEVELS.find((l) => l.value === draft.priorities[f.key])?.label})`);
  const hasSpace = !draft.spaceSkipped && draft.space.width && draft.space.height && draft.space.depth;
  const rows: { label: string; value: string; step: number }[] = [
    { label: "Researching", value: draft.interests.map((s) => categories.find((c) => c.slug === s)?.name).join(", "), step: 1 },
    { label: "Household", value: `${draft.household === 6 ? "6+" : draft.household} ${draft.household === 1 ? "person" : "people"}`, step: 2 },
    { label: "Budget", value: `${formatCurrency(draft.budget[0], "US")} – ${formatCurrency(draft.budget[1], "US")} per product`, step: 3 },
    {
      label: "Space",
      value: hasSpace ? `${draft.space.width} × ${draft.space.height} × ${draft.space.depth} mm${draft.space.door ? ` · doorway ${draft.space.door} mm` : ""}` : "Not provided — fit shown as unknown",
      step: 4,
    },
    { label: "Brands", value: draft.brands.length ? draft.brands.map((b) => brandById.get(b)?.name).join(", ") : "No preference", step: 5 },
    { label: "Energy", value: draft.energy === "high" ? "Efficiency first" : draft.energy === "low" ? "Upfront price first" : "Balanced", step: 6 },
    { label: "Region", value: `${region.flag} ${region.name} · ${region.currency}`, step: 7 },
    { label: "Reviews", value: draft.review === "verified-only" ? "Verified purchases only" : "All owner reviews", step: 8 },
    { label: "Top priorities", value: top.length ? top.join(", ") : "Standard weighting", step: 8 },
  ];
  return (
    <div className="mx-auto w-full max-w-[640px] flex-1 px-4 pb-10 pt-2 sm:px-8 sm:pt-6">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
        <div className="mb-6 flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-[16px] bg-brand text-brand-foreground shadow-md">
            <PartyPopper className="size-7" />
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand" aria-hidden />
        </div>
        <h1 ref={headingRef} tabIndex={-1} className="text-[28px] font-semibold leading-tight tracking-[-0.02em] outline-none sm:text-[34px]">
          You&apos;re all set
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground" role="status">
          Every suitability score is now weighted for your home. Preferences are saved in this browser only (demo) — edit them anytime in Profile.
        </p>

        <dl className="mt-7 divide-y divide-border rounded-[16px] border border-border bg-card shadow-xs">
          {rows.map((r) => (
            <div key={r.label} className="flex items-start gap-3 px-4 py-3 sm:px-5">
              <dt className="w-[108px] shrink-0 pt-0.5 text-[12.5px] font-medium text-muted-foreground sm:w-[132px]">{r.label}</dt>
              <dd className="min-w-0 flex-1 text-[14px] leading-snug">{r.value}</dd>
              <button
                type="button"
                onClick={() => onEdit(r.step)}
                className="-my-2 -mr-2 grid size-10 shrink-0 place-items-center rounded-[9px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                aria-label={`Edit ${r.label.toLowerCase()}`}
              >
                <Pencil className="size-3.5" />
              </button>
            </div>
          ))}
        </dl>

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <Button size="lg" variant="brand" className="sm:flex-1" onClick={() => router.push(routes.app)}>
            Go to my dashboard <ArrowRight />
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={routes.recommendations}>See recommendations</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

