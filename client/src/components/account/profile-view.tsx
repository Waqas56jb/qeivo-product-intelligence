"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarDays, Check, ChevronRight, CreditCard, Database, Gauge, Home, Loader2, Lock, MapPin, Settings, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import type { CategorySlug, RegionCode, ScoreFactorKey, UserPreferences } from "@/types";
import { routes } from "@/config/routes";
import { currentUser } from "@/data/users/customers";
import { categories } from "@/data/products";
import { REGIONS, REGION_LIST, formatDate } from "@/lib/format";
import type { PriorityLevel } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress, RadioCard, RadioGroup, UserAvatar } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/tabs";
import { LoadingSkeleton } from "@/components/common/states";
import { CATEGORY_ICON, FACTORS, LEVELS } from "@/components/onboarding/onboarding-data";
import { Field, SettingsCard, wait } from "./fields";

/* ----------------------------------------------------------- shared hook */
export function useEffectivePreferences(): UserPreferences {
  const prefs = useAppStore((s) => s.preferences);
  const region = useAppStore((s) => s.region);
  return { ...currentUser.preferences, ...prefs, region };
}

/* ------------------------------------------------------------- personal */
const personalSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80, "Keep it under 80 characters"),
  email: z.string().trim().min(1, "Enter your email address").pipe(z.email("Enter a valid email address")),
  location: z.string().trim().max(80, "Keep it under 80 characters"),
  bio: z.string().trim().max(280, "Keep your bio under 280 characters"),
});
type Personal = z.infer<typeof personalSchema>;

function PersonalForm() {
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<Personal>({ resolver: zodResolver(personalSchema), defaultValues: profile, mode: "onTouched" });
  const bio = watch("bio") ?? "";

  const onSubmit = async (v: Personal) => {
    await wait(450);
    updateProfile(v);
    reset(v);
    toast.success("Profile saved", { description: "Stored in this browser only — no account was updated (demo)." });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <SettingsCard
        id="personal"
        icon={UserRound}
        title="Personal details"
        description="Shown on your community answers and used to address you."
        footer={
          <>
            <Button variant="ghost" disabled={!isDirty || isSubmitting} onClick={() => reset()}>
              Discard
            </Button>
            <Button type="submit" variant="default" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Check />} Save details
            </Button>
          </>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="pf-name" label="Full name" error={errors.name?.message}>
            <Input autoComplete="name" {...register("name")} />
          </Field>
          <Field id="pf-email" label="Email" error={errors.email?.message}>
            <Input type="email" inputMode="email" autoComplete="email" {...register("email")} />
          </Field>
          <Field id="pf-location" label="Location" optional error={errors.location?.message} hint="City and region — helps with local retailer availability.">
            <Input autoComplete="address-level2" {...register("location")} />
          </Field>
          <Field id="pf-bio" label="About your project" optional error={errors.bio?.message} className="sm:col-span-2" hint={`${bio.length}/280 · Visible on your community profile`}>
            <Textarea rows={3} {...register("bio")} />
          </Field>
        </div>
      </SettingsCard>
    </form>
  );
}

/* ---------------------------------------------------------- shopping prefs */
const digits = (msg: string) => z.string().regex(/^\d*$/, msg);
const shoppingSchema = z
  .object({
    budgetMin: z.string().min(1, "Enter a minimum").regex(/^\d+$/, "Whole numbers only"),
    budgetMax: z.string().min(1, "Enter a maximum").regex(/^\d+$/, "Whole numbers only"),
    householdSize: z.string(),
    region: z.enum(["US", "UK", "EU", "AU", "CA"]),
    energyPriority: z.enum(["low", "balanced", "high"]),
    interests: z.array(z.enum(["refrigerators", "washing-machines", "televisions", "laptops"])).min(1, "Choose at least one category"),
    width: digits("Numbers only"),
    height: digits("Numbers only"),
    depth: digits("Numbers only"),
  })
  .superRefine((v, ctx) => {
    if (Number(v.budgetMax) <= Number(v.budgetMin)) ctx.addIssue({ code: "custom", path: ["budgetMax"], message: "Maximum must be higher than minimum" });
    const dims = [v.width, v.height, v.depth];
    const filled = dims.filter(Boolean).length;
    if (filled > 0 && filled < 3) {
      (["width", "height", "depth"] as const).forEach((k) => {
        if (!v[k]) ctx.addIssue({ code: "custom", path: [k], message: "Add all three or leave blank" });
      });
    }
    (["width", "height", "depth"] as const).forEach((k) => {
      if (v[k] && (Number(v[k]) < 300 || Number(v[k]) > 2600)) ctx.addIssue({ code: "custom", path: [k], message: "300–2,600 mm" });
    });
  });
type Shopping = z.infer<typeof shoppingSchema>;

function ShoppingForm() {
  const prefs = useEffectivePreferences();
  const setPreferences = useAppStore((s) => s.setPreferences);
  const setRegion = useAppStore((s) => s.setRegion);
  const defaults: Shopping = {
    budgetMin: String(prefs.budgetMin),
    budgetMax: String(prefs.budgetMax),
    householdSize: String(prefs.householdSize),
    region: prefs.region,
    energyPriority: prefs.energyPriority,
    interests: prefs.interests,
    width: prefs.space ? String(prefs.space.widthMm) : "",
    height: prefs.space ? String(prefs.space.heightMm) : "",
    depth: prefs.space ? String(prefs.space.depthMm) : "",
  };
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<Shopping>({ resolver: zodResolver(shoppingSchema), defaultValues: defaults, mode: "onTouched" });

  const onSubmit = async (v: Shopping) => {
    await wait(450);
    setPreferences({
      budgetMin: Number(v.budgetMin),
      budgetMax: Number(v.budgetMax),
      householdSize: Number(v.householdSize),
      region: v.region as RegionCode,
      energyPriority: v.energyPriority,
      interests: v.interests as CategorySlug[],
      space: v.width && v.height && v.depth ? { widthMm: Number(v.width), heightMm: Number(v.height), depthMm: Number(v.depth) } : null,
    });
    setRegion(v.region as RegionCode);
    reset(v);
    toast.success("Shopping preferences saved", { description: "Suitability scores now use these values (stored locally, demo)." });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <SettingsCard
        id="shopping"
        icon={Home}
        title="Home & budget"
        description="Used for capacity, fit and over-budget flags. Never shared with retailers."
        footer={
          <>
            <Button variant="ghost" disabled={!isDirty || isSubmitting} onClick={() => reset()}>
              Discard
            </Button>
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Check />} Save preferences
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <Controller
            control={control}
            name="interests"
            render={({ field }) => (
              <fieldset>
                <legend className="mb-2.5 text-[13px] font-medium">Product interests</legend>
                <div className="flex flex-wrap gap-2" role="group" aria-describedby={errors.interests ? "pf-interests-error" : undefined}>
                  {categories.map((c) => {
                    const Icon = CATEGORY_ICON[c.icon];
                    const on = field.value.includes(c.slug);
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        aria-pressed={on}
                        onClick={() => field.onChange(on ? field.value.filter((x) => x !== c.slug) : [...field.value, c.slug])}
                        className={cn(
                          "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[13.5px] font-medium transition-colors sm:h-10",
                          on ? "border-brand bg-brand-soft/60 text-foreground ring-1 ring-brand" : "border-border bg-surface text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className={cn("size-4", on && "text-brand")} /> {c.name}
                      </button>
                    );
                  })}
                </div>
                {errors.interests && (
                  <p id="pf-interests-error" role="alert" className="mt-2 text-[12.5px] text-danger-foreground">
                    {errors.interests.message}
                  </p>
                )}
              </fieldset>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field id="pf-bmin" label="Budget from (USD)" error={errors.budgetMin?.message}>
              <Input inputMode="numeric" autoComplete="off" {...register("budgetMin")} />
            </Field>
            <Field id="pf-bmax" label="Budget to (USD)" error={errors.budgetMax?.message}>
              <Input inputMode="numeric" autoComplete="off" {...register("budgetMax")} />
            </Field>
            <Controller
              control={control}
              name="householdSize"
              render={({ field }) => (
                <Field id="pf-household" label="Household">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n === 6 ? "6+" : n} {n === 1 ? "person" : "people"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              control={control}
              name="region"
              render={({ field }) => (
                <Field id="pf-region" label="Region">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
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
                </Field>
              )}
            />
          </div>

          <fieldset>
            <legend className="mb-2.5 text-[13px] font-medium">
              Appliance space <span className="font-normal text-subtle-foreground">(optional, mm)</span>
            </legend>
            <div className="grid grid-cols-3 gap-2.5 sm:max-w-[420px]">
              <Field id="pf-w" label="Width" error={errors.width?.message}>
                <Input inputMode="numeric" autoComplete="off" placeholder="—" {...register("width")} />
              </Field>
              <Field id="pf-h" label="Height" error={errors.height?.message}>
                <Input inputMode="numeric" autoComplete="off" placeholder="—" {...register("height")} />
              </Field>
              <Field id="pf-d" label="Depth" error={errors.depth?.message}>
                <Input inputMode="numeric" autoComplete="off" placeholder="—" {...register("depth")} />
              </Field>
            </div>
            <p className="mt-2 text-[12.5px] text-muted-foreground">Leave blank and fit is shown as unknown — never assumed compatible.</p>
          </fieldset>

          <Controller
            control={control}
            name="energyPriority"
            render={({ field }) => (
              <fieldset>
                <legend className="mb-2.5 text-[13px] font-medium">Energy priority</legend>
                <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-2 sm:grid-cols-3">
                  {(
                    [
                      ["high", "Efficiency first"],
                      ["balanced", "Balanced"],
                      ["low", "Upfront price first"],
                    ] as const
                  ).map(([v, l]) => (
                    <RadioCard key={v} value={v} className="items-center p-3 text-[13.5px] font-medium">
                      {l}
                    </RadioCard>
                  ))}
                </RadioGroup>
              </fieldset>
            )}
          />
        </div>
      </SettingsCard>
    </form>
  );
}

/* --------------------------------------------------------- research prefs */
function ResearchPreferences() {
  const prefs = useEffectivePreferences();
  const storePriorities = useAppStore((s) => s.priorities);
  const setPriority = useAppStore((s) => s.setPriority);
  const setPreferences = useAppStore((s) => s.setPreferences);
  const initialLevels = Object.fromEntries(FACTORS.map((f) => [f.key, (storePriorities[f.key] ?? 2) || 1])) as Record<ScoreFactorKey, PriorityLevel>;
  const [levels, setLevels] = useState(initialLevels);
  const [review, setReview] = useState(prefs.reviewPreference);
  const dirty = review !== prefs.reviewPreference || FACTORS.some((f) => levels[f.key] !== initialLevels[f.key]);

  const save = () => {
    FACTORS.forEach((f) => setPriority(f.key, levels[f.key]));
    const sum = FACTORS.reduce((s, f) => s + levels[f.key], 0);
    setPreferences({ reviewPreference: review, priorities: Object.fromEntries(FACTORS.map((f) => [f.key, Math.round((levels[f.key] / sum) * 100) / 100])) });
    toast.success("Research preferences saved", { description: "Suitability is re-weighted. Evidence coverage is unaffected." });
  };

  return (
    <SettingsCard
      id="research"
      icon={Gauge}
      title="Research preferences"
      description="How suitability scores are personalised. Evidence coverage is never re-weighted."
      footer={
        <>
          <Button
            variant="ghost"
            disabled={!dirty}
            onClick={() => {
              setLevels(initialLevels);
              setReview(prefs.reviewPreference);
            }}
          >
            Discard
          </Button>
          <Button disabled={!dirty} onClick={save}>
            <Check /> Save research preferences
          </Button>
        </>
      }
    >
      <fieldset className="mb-6">
        <legend className="mb-2.5 text-[13px] font-medium">Owner reviews used in scores</legend>
        <RadioGroup value={review} onValueChange={(v) => setReview(v as UserPreferences["reviewPreference"])} className="grid gap-2 sm:grid-cols-2">
          <RadioCard value="verified-only" className="items-center gap-2.5 p-3 text-[13.5px] font-medium">
            <ShieldCheck className="size-4 text-success" /> Verified purchases only
          </RadioCard>
          <RadioCard value="all" className="items-center gap-2.5 p-3 text-[13.5px] font-medium">
            <UserRound className="size-4 text-info" /> All owner reviews
          </RadioCard>
        </RadioGroup>
      </fieldset>
      <ul className="divide-y divide-border">
        {FACTORS.map((f) => (
          <li key={f.key} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
            <span id={`pf-f-${f.key}`} className="text-[14px] font-medium">
              {f.label}
            </span>
            <ToggleGroup
              type="single"
              value={String(levels[f.key])}
              onValueChange={(v) => v && setLevels((l) => ({ ...l, [f.key]: Number(v) as PriorityLevel }))}
              aria-labelledby={`pf-f-${f.key}`}
              className="grid w-full grid-cols-4 sm:w-[300px]"
            >
              {LEVELS.map((l) => (
                <ToggleGroupItem key={l.value} value={String(l.value)} className="h-10 px-1 text-[12px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground sm:h-9">
                  {l.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </li>
        ))}
      </ul>
    </SettingsCard>
  );
}

/* -------------------------------------------------------------- side panel */
function IdentityCard() {
  const profile = useAppStore((s) => s.profile);
  const plan = useAppStore((s) => s.plan);
  const prefs = useEffectivePreferences();
  const checks = [
    { label: "Name & email", ok: Boolean(profile.name && profile.email) },
    { label: "Location", ok: Boolean(profile.location) },
    { label: "Project description", ok: Boolean(profile.bio) },
    { label: "Product interests", ok: prefs.interests.length > 0 },
    { label: "Appliance space", ok: Boolean(prefs.space) },
    { label: "Preferred brands", ok: prefs.preferredBrandIds.length > 0 },
  ];
  const pct = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  const region = REGIONS[prefs.region];
  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-card shadow-xs">
      <div className="bg-navy-sheen relative h-20" aria-hidden />
      <div className="-mt-10 px-5 pb-5">
        <UserAvatar src={currentUser.avatar} name={profile.name} className="size-20 ring-4 ring-card" />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h2 className="text-[18px] font-semibold tracking-tight">{profile.name}</h2>
          <Badge variant={plan === "premium" ? "lime" : "default"}>
            {plan === "premium" && <Sparkles />} {plan === "premium" ? "Premium" : "Free"}
          </Badge>
        </div>
        <p className="truncate text-[13px] text-muted-foreground">{profile.email}</p>
        <ul className="mt-4 space-y-2 text-[13px] text-muted-foreground">
          <li className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" /> {profile.location || "No location"}
          </li>
          <li className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0" /> Member since {formatDate(currentUser.memberSince, "MMMM yyyy")}
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="w-4 text-center">{region.flag}</span> {region.name} · {region.currency}
          </li>
        </ul>
        <div className="mt-5 rounded-[14px] bg-surface-2/70 p-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-medium">Profile completeness</span>
            <span className="tabular font-semibold">{pct}%</span>
          </div>
          <Progress value={pct} className="mt-2" />
          <ul className="mt-3 space-y-1.5">
            {checks.map((c) => (
              <li key={c.label} className={cn("flex items-center gap-2 text-[12.5px]", c.ok ? "text-foreground" : "text-subtle-foreground")}>
                <span className={cn("grid size-4 place-items-center rounded-full", c.ok ? "bg-success text-white" : "border border-border-strong")}>{c.ok && <Check className="size-2.5" strokeWidth={3.5} />}</span>
                {c.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PrivacySummary() {
  const links = [
    { href: routes.settings, icon: Settings, label: "Account settings", body: "Security, notifications, appearance" },
    { href: routes.privacy, icon: Lock, label: "Privacy & data", body: "Consent, export and deletion" },
    { href: routes.billing, icon: CreditCard, label: "Plan & billing", body: "Usage, invoices, payment method" },
  ];
  return (
    <div className="rounded-[14px] border border-border bg-card p-5 shadow-xs">
      <h2 className="flex items-center gap-2 text-[14px] font-semibold">
        <Database className="size-4 text-brand" /> Privacy summary
      </h2>
      <ul className="mt-3 space-y-2 text-[13px] text-muted-foreground">
        <li className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-success" /> Profile and preferences live only in this browser&apos;s storage.</li>
        <li className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-success" /> Preferences never change evidence coverage or rankings for others.</li>
        <li className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-success" /> Retailers and brands never see your home details.</li>
      </ul>
      <nav aria-label="Account" className="-mx-2 mt-4 border-t border-border pt-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="flex min-h-12 items-center gap-3 rounded-[10px] px-2 py-2 transition-colors hover:bg-surface-2">
            <span className="grid size-8 place-items-center rounded-[9px] bg-surface-2 text-muted-foreground">
              <l.icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-medium leading-tight">{l.label}</span>
              <span className="block text-[12px] text-muted-foreground">{l.body}</span>
            </span>
            <ChevronRight className="size-4 text-subtle-foreground" />
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function ProfileView() {
  const hydrated = useHydrated();
  if (!hydrated) return <LoadingSkeleton variant="detail" />;
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-6 lg:sticky lg:top-24">
        <IdentityCard />
        <PrivacySummary />
      </div>
      <div className="min-w-0 space-y-6">
        <PersonalForm />
        <ShoppingForm />
        <ResearchPreferences />
      </div>
    </div>
  );
}
