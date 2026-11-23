import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Ban, Check, Compass, FileSearch, GitCompareArrows, Scale, ShieldCheck, SlidersHorizontal } from "lucide-react";
import type { SourceType, WarningKind } from "@/types";
import { products } from "@/data/products";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/page";
import { SectionHeading } from "@/components/common/display";
import { Reveal } from "@/components/common/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CLAIM_META, CLAIM_ORDER, SOURCE_META } from "@/components/analysis/meta";
import { EvidenceCoverage, SuitabilityScore } from "@/components/analysis/score";
import { DataWarningCard, SponsoredDisclosure, SponsoredTag } from "@/components/analysis/warnings";
import { AnalyseVisual, CompareVisual, DecideVisual, DiscoverVisual, PersonaliseVisual } from "@/components/marketing/journey-visuals";

export const metadata: Metadata = {
  title: "How it works",
  description: "How Qeivo turns manuals, lab tests, expert reviews and owner feedback into cited, personalised product intelligence — and the methodology behind every score.",
};

const STEPS = [
  {
    id: "discover",
    icon: Compass,
    title: "Discover",
    lead: "Start from your situation, not a product list.",
    body: "Search in plain language or filter by the constraints that matter — opening size, household, budget, energy class. Results are ranked on evidence alone, and sponsored placements are labelled and kept out of the ranking.",
    points: ["Natural-language search across four categories", "Filters for dimensions, capacity, energy and price", "Every result shows suitability and evidence side by side"],
    visual: DiscoverVisual,
    cta: { label: "Browse refrigerators", href: routes.category("refrigerators") },
  },
  {
    id: "analyse",
    icon: FileSearch,
    title: "Analyse",
    lead: "Every sentence tells you where it came from.",
    body: "We read the manual, the spec sheet, independent lab tests, expert reviews, owner reviews and video reviews. Each finding is classified — measured, expert, owner, manufacturer or AI — and linked to the exact page, table or timestamp.",
    points: ["Claims labelled by type, everywhere they appear", "Tap a citation to read the source passage", "Conflicting sources are flagged, not averaged"],
    visual: AnalyseVisual,
    cta: { label: "See a full analysis", href: routes.productAnalysis("halden-precision-fd590") },
  },
  {
    id: "compare",
    icon: GitCompareArrows,
    title: "Compare",
    lead: "Real differences, not spec-sheet noise.",
    body: "Specs are normalised into the same units so you compare like with like. The best value in each row is highlighted, unknowns stay visibly unknown, and an AI verdict names the trade-off you are actually making.",
    points: ["Measured figures preferred over claimed ones", "Best-in-row highlighting with units normalised", "Missing values shown as unknown — never guessed"],
    visual: CompareVisual,
    cta: { label: "Open the comparison tool", href: routes.compare },
  },
  {
    id: "personalise",
    icon: SlidersHorizontal,
    title: "Personalise",
    lead: "A score that bends to your life — and shows its working.",
    body: "Tell us what matters: running costs, noise, capacity, reliability. Suitability is re-weighted for you and every factor shows its contribution. Evidence coverage stays exactly the same, because what we know doesn't change with what you want.",
    points: ["Eight scored factors per category", "Weights you can see and adjust", "Try a preset on the right — rankings re-order live"],
    visual: PersonaliseVisual,
    cta: { label: "Get personalised recommendations", href: routes.recommendations },
  },
  {
    id: "decide",
    icon: BadgeCheck,
    title: "Decide",
    lead: "Buy once, with the whole picture.",
    body: "Check the fit against your measurements, project ten years of running costs, compare retailer prices, and keep warranty and maintenance on track after you buy.",
    points: ["Space-fit checks for width, height, depth, doors and delivery", "Ten-year ownership cost using measured energy", "Price history so you know a real deal"],
    visual: DecideVisual,
    cta: { label: "Try the compatibility checker", href: routes.productCompatibility("halden-precision-fd590") },
  },
];

const SOURCE_NOTES: Record<SourceType, string> = {
  "lab-test": "Controlled measurements with a published method. Highest weight for performance and energy.",
  certification: "Official registries and test standards. Used for label figures and safety.",
  "independent-review": "Hands-on testing by reviewers with no commercial tie to the brand.",
  manual: "Installation requirements, clearances and care instructions — authoritative for fit.",
  "spec-sheet": "Manufacturer dimensions and ratings. Used, but labelled as manufacturer claims.",
  "customer-review": "Owner themes aggregated across verified purchases. Subjective, but vital for reliability.",
  video: "Creator testing cited by timestamp, classified by who made the video.",
  "manufacturer-statement": "Marketing and press claims. Never presented as verified fact.",
};

const SPONSOR_RULES = [
  { ok: false, text: "Sponsorship cannot change a suitability score, evidence coverage, ranking, verdict or recommendation." },
  { ok: false, text: "Brands cannot edit, approve or preview analysis, guides or AI answers before they are published." },
  { ok: true, text: "Sponsored placements and affiliate links carry a visible label wherever they appear." },
  { ok: true, text: "Sponsored creator videos display the creator's full disclosure on the video page." },
  { ok: true, text: "Members can hide sponsored content in the video library and catalogue." },
];

export default function HowItWorksPage() {
  const contrast = [...products].sort((a, b) => b.suitabilityScore - b.evidenceCoverage / 10 - (a.suitabilityScore - a.evidenceCoverage / 10))[0];
  const warningKinds: WarningKind[] = ["conflict", "missing", "stale"];
  const sampleWarnings = warningKinds.map((k) => products.flatMap((p) => p.warnings).find((w) => w.kind === k)).filter((w): w is NonNullable<typeof w> => Boolean(w));

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="bg-hero-glow pointer-events-none absolute inset-0" />
        <div aria-hidden className="surface-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_0%,black,transparent)]" />
        <PageContainer className="relative pb-16 pt-12 text-center sm:pt-16 lg:pb-20 lg:pt-20">
          <Reveal>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-soft-foreground">How Qeivo works</p>
            <h1 className="mx-auto mt-3 max-w-3xl text-balance text-[38px] font-semibold leading-[1.05] tracking-tight sm:text-[56px]">From first search to a decision you won&apos;t second-guess.</h1>
            <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">Five steps, one research workspace. Every score explained, every claim sourced, and nothing hidden behind a number.</p>
          </Reveal>
          <Reveal delay={0.08}>
            <nav aria-label="Journey steps" className="mx-auto mt-12 max-w-4xl">
              <ol className="relative grid grid-cols-5 gap-2">
                <div aria-hidden className="absolute left-[10%] right-[10%] top-6 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent sm:top-7" />
                {STEPS.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="group relative flex flex-col items-center gap-2.5 rounded-[14px] p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                      <span className="relative grid size-12 place-items-center rounded-[14px] border border-border bg-card shadow-sm transition-transform group-hover:-translate-y-0.5 sm:size-14 sm:rounded-[16px]">
                        <s.icon className="size-5 text-brand sm:size-6" />
                        <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground tabular">{i + 1}</span>
                      </span>
                      <span className="text-[12px] font-semibold sm:text-[14px]">{s.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </Reveal>
        </PageContainer>
      </section>

      {STEPS.map((s, i) => {
        const Visual = s.visual;
        const flip = i % 2 === 1;
        return (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className={cn("scroll-mt-16 py-16 lg:py-24", i % 2 === 0 && "border-t border-border bg-surface")}>
            <PageContainer className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <Reveal className={cn(flip && "lg:order-2")}>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-[12px] bg-brand-soft text-brand-soft-foreground">
                    <s.icon className="size-5" />
                  </span>
                  <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-soft-foreground">
                    Step {i + 1} · {s.title}
                  </span>
                </div>
                <h2 id={`${s.id}-h`} className="mt-5 text-balance text-[28px] font-semibold leading-tight tracking-tight sm:text-[36px]">
                  {s.lead}
                </h2>
                <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">{s.body}</p>
                <ul className="mt-6 space-y-3">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-3 text-[15px]">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                        <Check className="size-3.5" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="mt-8">
                  <Link href={s.cta.href}>
                    {s.cta.label} <ArrowRight />
                  </Link>
                </Button>
              </Reveal>
              <Reveal delay={0.08} className={cn("min-w-0", flip && "lg:order-1")}>
                <div className="relative">
                  <div aria-hidden className="absolute -inset-6 -z-0 rounded-[40px] bg-hero-glow opacity-80" />
                  <div className="relative mx-auto max-w-[540px]">
                    <Visual />
                  </div>
                </div>
              </Reveal>
            </PageContainer>
          </section>
        );
      })}

      {/* ------------------------------------------------------------ METHODOLOGY */}
      <section id="methodology" aria-labelledby="methodology-h" className="scroll-mt-16 border-t border-border py-16 lg:py-24">
        <PageContainer>
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="brand" className="h-7 gap-1.5 px-3 text-[12px]">
                <Scale /> Methodology
              </Badge>
              <h2 id="methodology-h" className="mt-4 text-balance text-[30px] font-semibold leading-tight tracking-tight sm:text-[40px]">
                Two numbers. Five claim types. Rules that never bend.
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">How we score products, classify what we know, and keep money out of the verdict.</p>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="relative mt-14 grid gap-5 lg:grid-cols-2">
              <div className="rounded-[24px] border border-border bg-card p-6 shadow-xs sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <SuitabilityScore score={contrast.suitabilityScore} size="md" />
                  <div>
                    <h3 className="text-[20px] font-semibold">Suitability · 0–10</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">How well a product fits — a weighted score across eight factors such as performance, energy, capacity, reliability and space fit. Personalisation changes the weights, never the underlying factor scores.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-border bg-card p-6 shadow-xs sm:p-8">
                <EvidenceCoverage coverage={contrast.evidenceCoverage} variant="stacked" />
                <h3 className="mt-6 text-[20px] font-semibold">Evidence coverage · %</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">How much of that score we could verify — the share of scored data points backed by independent measurement, certification or expert testing rather than manufacturer claims alone.</p>
              </div>
              <span className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-semibold shadow-sm lg:inline-flex">Never combined</span>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mx-auto mt-5 max-w-3xl rounded-[16px] border border-info/30 bg-info-soft/50 px-5 py-4 text-center text-[14px] leading-relaxed text-info-foreground">
              Example: the <strong className="font-semibold">{contrast.name}</strong> scores <span className="tabular">{contrast.suitabilityScore.toFixed(1)}</span> for suitability, but only <span className="tabular">{contrast.evidenceCoverage}%</span> of that is independently evidenced. We show both, so you can decide how much to trust the score.
            </p>
          </Reveal>

          <div className="mt-20">
            <Reveal>
              <SectionHeading eyebrow="Claim types" title="Every statement is labelled" description="The same five labels appear on product pages, comparisons, guides and AI answers." />
            </Reveal>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {CLAIM_ORDER.map((t, i) => {
                const m = CLAIM_META[t];
                return (
                  <Reveal key={t} delay={i * 0.04}>
                    <div className="h-full rounded-[20px] border border-border bg-card p-5 shadow-xs">
                      <span className={`grid size-10 place-items-center rounded-[12px] border ${m.className}`}>
                        <m.icon className="size-5" />
                      </span>
                      <h3 className="mt-4 text-[15px] font-semibold">{m.label}</h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{m.description}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          <div className="mt-20 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <Reveal>
              <SectionHeading eyebrow="Source types" title="Not all sources count equally" description="Each source carries a reliability rating. Measured and certified sources carry the most weight; manufacturer marketing carries the least and is always labelled." />
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(SOURCE_NOTES) as SourceType[]).map((t, i) => {
                const m = SOURCE_META[t];
                return (
                  <Reveal key={t} delay={(i % 2) * 0.04}>
                    <div className="flex h-full gap-3 rounded-[16px] border border-border bg-card p-4 shadow-xs">
                      <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2">
                        <m.icon className={cn("size-4.5", m.tone)} />
                      </span>
                      <div>
                        <h3 className="text-[14px] font-semibold">{m.label}</h3>
                        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{SOURCE_NOTES[t]}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          {sampleWarnings.length > 0 && (
            <div className="mt-20 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
              <Reveal>
                <SectionHeading eyebrow="Data quality" title="Unknown is never treated as fine" description="When sources disagree, data is missing or a figure is getting old, you see a calm, specific notice — and evidence coverage drops to match." />
              </Reveal>
              <div className="grid gap-3">
                {sampleWarnings.map((w, i) => (
                  <Reveal key={w.title} delay={i * 0.05}>
                    <DataWarningCard warning={w} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          <Reveal>
            <div className="bg-navy-sheen relative mt-20 overflow-hidden rounded-[28px] px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
              <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-teal-500/20 blur-3xl" />
              <div className="relative grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <SponsoredTag />
                    <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-teal-400">Sponsored content rules</span>
                  </div>
                  <h3 className="mt-4 text-[26px] font-semibold leading-tight text-white sm:text-[32px]">Money can buy visibility. Never a verdict.</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/70">Qeivo is funded by subscriptions. Where we show sponsored placements or affiliate links, they follow five fixed rules.</p>
                  <SponsoredDisclosure className="mt-6 border-warning/40" />
                </div>
                <ul className="space-y-2.5">
                  {SPONSOR_RULES.map((r) => (
                    <li key={r.text} className="flex gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-4 text-[14px] leading-relaxed text-white/85">
                      {r.ok ? <ShieldCheck className="mt-0.5 size-4.5 shrink-0 text-teal-400" /> : <Ban className="mt-0.5 size-4.5 shrink-0 text-warning" />}
                      {r.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </PageContainer>
      </section>

      <section className="border-t border-border bg-surface py-16 lg:py-20">
        <PageContainer className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-2xl text-balance text-[28px] font-semibold leading-tight sm:text-[36px]">Ready to research your next big purchase?</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={routes.signup}>
                Start free <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={routes.about + "#independence"}>Read our independence policy</Link>
            </Button>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
