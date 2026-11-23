import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Ban, Check, Eye, FileClock, FlaskConical, HandCoins, HeartHandshake, Link2, Megaphone, Microscope, Scale, ShieldCheck, Target, Users } from "lucide-react";
import { products } from "@/data/products";
import { sources } from "@/data/sources/sources";
import { reviews } from "@/data/reviews";
import { buyingGuides } from "@/data/guides";
import { authors } from "@/data/guides/guide-helpers";
import { videos } from "@/data/videos";
import { images } from "@/data/images";
import { routes } from "@/config/routes";
import { PageContainer } from "@/components/layout/page";
import { SectionHeading } from "@/components/common/display";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { Reveal } from "@/components/common/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClaimLegend } from "@/components/analysis/claims";

export const metadata: Metadata = {
  title: "About",
  description: "Qeivo is an independent product intelligence platform. Our mission, product philosophy, independence policy and the team behind the evidence.",
};

const PRINCIPLES = [
  { icon: Microscope, title: "Evidence before opinion", body: "A measured figure outranks an expert's impression, which outranks a manufacturer's claim. When we only have the claim, we say so." },
  { icon: Scale, title: "Two numbers, never one", body: "Suitability tells you how well something fits. Evidence coverage tells you how sure we are. Merging them would hide exactly what you need to know." },
  { icon: Eye, title: "Show the working", body: "Every score breaks down into factors, weights and sources. If you can't see why we said something, we haven't finished the job." },
  { icon: Target, title: "Fit beats ‘best’", body: "There is no best refrigerator — only the best one for your opening, your household and your bills. We rank for you, not for a headline." },
];

const CAN = ["Upload manuals, specification sheets and certifications", "Correct factual errors through a documented review process", "Reply publicly to owner reviews and community questions", "Buy clearly labelled sponsored placements"];
const NEVER = ["Edit, approve or preview a score, verdict or guide", "Pay to change a ranking or a recommendation", "Remove or hide negative owner reviews", "Have their marketing presented as verified fact"];

const MONEY = [
  { icon: Users, title: "Member subscriptions", body: "Premium and Team subscriptions are our primary revenue. Members pay for tools — never for different answers.", tag: "Primary" },
  { icon: Link2, title: "Affiliate links", body: "Some retailer links earn a commission. They are labelled, shown alongside non-affiliate retailers, and sorted by price — not commission.", tag: "Labelled" },
  { icon: Megaphone, title: "Sponsored placements", body: "Brands can pay for visibility in clearly marked slots. Sponsorship is excluded from every scoring and ranking input.", tag: "Labelled" },
];

const VALUES = [
  { icon: ShieldCheck, title: "Independence is the product", body: "If buyers can't trust the verdict, nothing else we build matters." },
  { icon: FlaskConical, title: "Measure what matters", body: "We test the things owners live with — noise at night, real capacity, ten-year running costs." },
  { icon: FileClock, title: "Correct in the open", body: "Every data change is versioned. When we get something wrong, the correction is logged and visible." },
  { icon: HeartHandshake, title: "Respect people's time", body: "Three good answers beat three hundred listings. We optimise for decisions, not page views." },
];

export default function AboutPage() {
  const team = Object.values(authors);
  const stats = [
    { v: products.length, k: "Products analysed in depth" },
    { v: sources.length.toLocaleString("en-US"), k: "Sources indexed and cited" },
    { v: reviews.length.toLocaleString("en-US"), k: "Owner reviews classified" },
    { v: buyingGuides.length + videos.length, k: "Guides and videos" },
    { v: "0", k: "Scores ever sold" },
  ];

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="bg-hero-glow pointer-events-none absolute inset-0" />
        <PageContainer className="relative grid items-center gap-12 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
          <Reveal>
            <Badge variant="brand" className="mb-6 h-7 px-3 text-[12px]">About Qeivo</Badge>
            <h1 className="text-balance text-[40px] font-semibold leading-[1.04] tracking-tight sm:text-[56px]">Independent intelligence for confident decisions.</h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground sm:text-[18px]">
              Buying a fridge, a washing machine or a laptop shouldn&apos;t require a week of tabs, contradictory reviews and spec sheets written by the people selling it. Qeivo reads the evidence for you — and shows you exactly where every conclusion came from.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={routes.howItWorks}>
                  How Qeivo works <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#independence">Independence policy</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="grid grid-cols-[1.15fr_1fr] gap-3 sm:gap-4">
              <ImageWithFallback src={images.kitchens[6]} alt="Family kitchen with built-in appliances" aspect="row-span-2 aspect-[3/4] h-full rounded-[24px] shadow-md" priority sizes="(max-width: 1024px) 55vw, 30vw" />
              <ImageWithFallback src={images.laundry[0]} alt="Front-loading washing machine in a laundry room" aspect="aspect-[4/3] rounded-[20px] shadow-sm" sizes="(max-width: 1024px) 45vw, 22vw" />
              <ImageWithFallback src={images.interiors[1]} alt="Living room with a wall-mounted television" aspect="aspect-[4/3] rounded-[20px] shadow-sm" sizes="(max-width: 1024px) 45vw, 22vw" />
            </div>
          </Reveal>
        </PageContainer>
      </section>

      <section className="border-y border-border bg-surface">
        <PageContainer className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s, i) => (
            <Reveal key={s.k} delay={i * 0.04}>
              <p className="text-[30px] font-semibold leading-none tracking-tight tabular sm:text-[36px]">{s.v}</p>
              <p className="mt-2 text-[13px] text-muted-foreground">{s.k}</p>
            </Reveal>
          ))}
        </PageContainer>
      </section>

      <section className="py-16 lg:py-24">
        <PageContainer className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <SectionHeading eyebrow="Our mission" title="Make every major purchase an informed one" />
          </Reveal>
          <Reveal delay={0.05}>
            <div className="space-y-5 text-[16px] leading-[1.75] text-foreground/85 sm:text-[17px]">
              <p>
                Household appliances and electronics are some of the largest purchases most people make, and some of the hardest to research. The information exists — in installation manuals, energy registries, laboratory tests and thousands of owner reviews — but it is scattered, inconsistent and often buried under marketing.
              </p>
              <p>
                Qeivo brings it together. We extract every measurable fact, classify every claim by where it came from, and score each product on how well it fits a real household. Then we show our working: the factors, the weights, the sources and the gaps.
              </p>
              <p className="font-medium text-foreground">We would rather tell you we don&apos;t know than pretend we do.</p>
            </div>
          </Reveal>
        </PageContainer>
      </section>

      <section className="bg-surface py-16 lg:py-24">
        <PageContainer>
          <Reveal>
            <SectionHeading align="center" eyebrow="Product philosophy" title="Four principles behind every screen" />
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.05}>
                <div className="h-full rounded-[20px] border border-border bg-card p-6 shadow-xs">
                  <span className="grid size-11 place-items-center rounded-[12px] bg-brand-soft text-brand-soft-foreground">
                    <p.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-[16px] font-semibold">{p.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </PageContainer>
      </section>

      <section id="independence" aria-labelledby="independence-h" className="scroll-mt-16 py-16 lg:py-24">
        <PageContainer>
          <Reveal>
            <div className="bg-navy-sheen relative overflow-hidden rounded-[28px] px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
              <div aria-hidden className="absolute -right-24 -top-24 size-96 rounded-full bg-teal-500/20 blur-3xl" />
              <div className="relative max-w-2xl">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-teal-400">Independence policy</p>
                <h2 id="independence-h" className="mt-3 text-balance text-[30px] font-semibold leading-tight text-white sm:text-[40px]">
                  Brands can talk to us. They can&apos;t buy our verdict.
                </h2>
                <p className="mt-4 text-[16px] leading-relaxed text-white/70">
                  Manufacturers and retailers use Qeivo to share accurate data and respond to owners. That relationship has hard limits, written into our contracts and enforced in the product itself.
                </p>
              </div>
              <div className="relative mt-10 grid gap-4 md:grid-cols-2">
                <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-6">
                  <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
                    <span className="grid size-7 place-items-center rounded-full bg-teal-400/15 text-teal-400">
                      <Check className="size-4" />
                    </span>
                    Brands and retailers can
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {CAN.map((c) => (
                      <li key={c} className="flex gap-3 text-[14px] leading-relaxed text-white/80">
                        <Check className="mt-0.5 size-4 shrink-0 text-teal-400" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-6">
                  <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
                    <span className="grid size-7 place-items-center rounded-full bg-warning/20 text-warning">
                      <Ban className="size-4" />
                    </span>
                    They can never
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {NEVER.map((c) => (
                      <li key={c} className="flex gap-3 text-[14px] leading-relaxed text-white/80">
                        <Ban className="mt-0.5 size-4 shrink-0 text-warning" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="relative mt-8 text-[13px] text-white/55">Scoring code reads no commercial fields. Sponsored and affiliate status is stored separately and is never an input to suitability, evidence coverage, rankings or AI verdicts.</p>
            </div>
          </Reveal>
        </PageContainer>
      </section>

      <section className="border-t border-border bg-surface py-16 lg:py-24">
        <PageContainer>
          <Reveal>
            <SectionHeading eyebrow="Transparency" title="How Qeivo makes money" description="Three revenue streams, each with rules you can check on any page." />
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {MONEY.map((m, i) => (
              <Reveal key={m.title} delay={i * 0.05}>
                <div className="flex h-full flex-col rounded-[20px] border border-border bg-card p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-[12px] bg-surface-2 text-foreground">
                      <m.icon className="size-5" />
                    </span>
                    <Badge variant={m.tag === "Primary" ? "success" : "warning"}>{m.tag}</Badge>
                  </div>
                  <h3 className="mt-5 text-[16px] font-semibold">{m.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{m.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <div className="mt-6 flex flex-col gap-4 rounded-[20px] border border-border bg-card p-5 shadow-xs sm:flex-row sm:items-center sm:p-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-info-soft text-info-foreground">
                <FileClock className="size-5" />
              </span>
              <div className="flex-1">
                <h3 className="text-[15px] font-semibold">Every change is on the record</h3>
                <p className="mt-1 text-[14px] text-muted-foreground">Product data is versioned. Members can see what changed, when, and which source triggered it.</p>
              </div>
              <Button asChild variant="outline">
                <Link href={routes.dataHistory}>
                  View data history <ArrowRight />
                </Link>
              </Button>
            </div>
          </Reveal>
        </PageContainer>
      </section>

      <section className="py-16 lg:py-24">
        <PageContainer className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeading eyebrow="Evidence-first methodology" title="Five labels. Used everywhere." description="Whether you're reading a product page, a guide or an AI answer, every claim carries the same label — so you always know whether you're looking at a measurement or a marketing line." />
            <Button asChild variant="outline" className="mt-8">
              <Link href={routes.howItWorks + "#methodology"}>
                Read the full methodology <ArrowRight />
              </Link>
            </Button>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm sm:p-8">
              <ClaimLegend />
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-6 text-center">
                {[
                  { v: `${Math.round(products.reduce((n, p) => n + p.evidenceCoverage, 0) / products.length)}%`, k: "Avg. evidence coverage" },
                  { v: new Set(sources.map((s) => s.publisher)).size, k: "Distinct publishers" },
                  { v: products.filter((p) => p.warnings.length > 0).length, k: "Products with open data notices" },
                ].map((s) => (
                  <div key={s.k}>
                    <p className="text-[22px] font-semibold tracking-tight tabular sm:text-[26px]">{s.v}</p>
                    <p className="mt-1 text-[11px] leading-snug text-muted-foreground sm:text-[12px]">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </PageContainer>
      </section>

      <section className="border-t border-border bg-surface py-16 lg:py-24">
        <PageContainer>
          <Reveal>
            <SectionHeading eyebrow="The team" title="Editors, engineers and lab specialists" description="The people who write our guides and check every number against its source." />
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {team.map((a, i) => (
              <Reveal key={a.name} delay={i * 0.04}>
                <figure className="group h-full overflow-hidden rounded-[20px] border border-border bg-card shadow-xs">
                  <ImageWithFallback src={a.avatar} alt={`Portrait of ${a.name}`} aspect="aspect-square" sizes="(max-width: 768px) 50vw, 16vw" className="grayscale-[30%] transition-all duration-500 group-hover:scale-[1.03] group-hover:grayscale-0" />
                  <figcaption className="p-4">
                    <p className="text-[14px] font-semibold">{a.name}</p>
                    <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{a.role}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.05}>
                <div className="flex h-full gap-4 rounded-[20px] border border-border bg-card p-5 shadow-xs">
                  <v.icon className="mt-0.5 size-5 shrink-0 text-brand" />
                  <div>
                    <h3 className="text-[15px] font-semibold">{v.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{v.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-16 lg:py-24">
        <PageContainer>
          <div className="relative overflow-hidden rounded-[24px]">
            <ImageWithFallback src={images.cooking[2]} alt="People cooking together in a home kitchen" aspect="aspect-[4/5] sm:aspect-[16/6]" sizes="100vw" />
            <div className="absolute inset-0 flex flex-col justify-end gap-5 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-transparent p-6 sm:p-10 lg:p-14">
              <p className="max-w-2xl text-balance text-[26px] font-semibold leading-tight text-white sm:text-[36px]">Know before you buy.</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" variant="brand">
                  <Link href={routes.signup}>Start researching free</Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10">
                  <Link href={routes.pricing}>
                    <HandCoins /> See plans
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
