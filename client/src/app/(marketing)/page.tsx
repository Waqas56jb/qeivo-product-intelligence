import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  Compass,
  FileSearch,
  GitCompareArrows,
  Laptop,
  Quote,
  Refrigerator,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tv,
  WashingMachine,
} from "lucide-react";
import { categories, productsByCategory, refrigerators } from "@/data/products";
import { featuredGuides, buyingGuides } from "@/data/guides";
import { avatarAt, images } from "@/data/images";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/layout/page";
import { SectionHeading } from "@/components/common/display";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { Reveal } from "@/components/common/reveal";
import { ProductCarousel } from "@/components/product/product-card";
import { AIInsightCard, ClaimLegend } from "@/components/analysis/claims";
import { CLAIM_META, CLAIM_ORDER } from "@/components/analysis/meta";
import { SponsoredDisclosure } from "@/components/analysis/warnings";
import { HeroSearch } from "@/components/marketing/hero-search";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { AskDemo, ComparisonPreview, RecommendationDemo, ScoreDemo } from "@/components/marketing/home-interactive";
import { requireProduct } from "@/data/products";
import { formatDate } from "@/lib/format";

const CATEGORY_ICON = { refrigerator: Refrigerator, "washing-machine": WashingMachine, tv: Tv, laptop: Laptop } as const;

const STEPS = [
  { icon: Compass, title: "Discover", body: "Search 64+ products across four categories, filtered by what actually fits your home and budget." },
  { icon: FileSearch, title: "Analyse", body: "Manuals, lab tests, expert reviews and owner feedback distilled into classified, cited findings." },
  { icon: GitCompareArrows, title: "Compare", body: "Normalised specs side by side, with real differences highlighted and trade-offs spelled out." },
  { icon: SlidersHorizontal, title: "Personalise", body: "Your household, space and priorities re-weight every suitability score — transparently." },
  { icon: BadgeCheck, title: "Decide", body: "Buy with confidence, then track warranty, maintenance and price drops after purchase." },
];

const TESTIMONIALS = [
  { quote: "We were about to buy a fridge that wouldn't have fitted past our hallway. The compatibility check flagged it in seconds — and showed exactly which measurement mattered.", name: "Hannah Okoye", role: "Renovating a terraced house", avatar: avatarAt(4) },
  { quote: "What sold me is that it tells you when it doesn't know. Unknown ventilation clearance is shown as unknown, not quietly assumed to be fine.", name: "Marcus Feld", role: "Kitchen designer", avatar: avatarAt(7) },
  { quote: "The difference between measured energy use and the label figure was eye-opening. Over ten years it changed which model we bought.", name: "Priya Nair", role: "Family of five", avatar: avatarAt(14) },
];

const PREMIUM = ["Unlimited comparisons of up to 4 products", "500 Ask Qeivo questions every month", "Personalised suitability for every product", "Price-drop alerts and full price history", "Warranty, maintenance and receipt vault", "Research history, folders and notes"];

export default function HomePage() {
  const featured = [...refrigerators].sort((a, b) => b.suitabilityScore - a.suitabilityScore).slice(0, 4);
  const insightProduct = requireProduct("p-ovea-eco-bf370");
  const guides = (featuredGuides.length >= 3 ? featuredGuides : buyingGuides).slice(0, 3);

  return (
    <>
      {/* ------------------------------------------------------------------ HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="bg-hero-glow pointer-events-none absolute inset-0" />
        <div aria-hidden className="surface-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <PageContainer className="relative grid items-center gap-14 pb-20 pt-10 sm:pt-14 lg:grid-cols-[1fr_1.02fr] lg:gap-12 lg:pb-28 lg:pt-20">
          <div className="max-w-xl">
            <Reveal>
              <Badge variant="brand" className="mb-6 h-7 gap-1.5 px-3 text-[12px]">
                <Sparkles /> Product intelligence, not product listings
              </Badge>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="text-display font-semibold">
                Know Before
                <br />
                You <span className="bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-teal-500">Buy.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground sm:text-[19px]">Research smarter. Compare confidently. Choose what truly fits your life.</p>
            </Reveal>
            <Reveal delay={0.15} className="relative z-20">
              <HeroSearch className="mt-8" />
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-brand" /> Every claim sourced</span>
                <span className="inline-flex items-center gap-1.5"><Scale className="size-4 text-brand" /> Scores never for sale</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="size-4 text-brand" /> Data freshness shown</span>
              </div>
            </Reveal>
          </div>
          <HeroVisual />
        </PageContainer>
      </section>

      {/* ------------------------------------------------------------ CATEGORIES */}
      <section className="border-y border-border bg-surface">
        <PageContainer className="grid grid-cols-2 gap-3 py-6 md:grid-cols-4">
          {categories.map((c) => {
            const Icon = CATEGORY_ICON[c.icon];
            const count = productsByCategory(c.slug).length;
            return (
              <Link key={c.slug} href={routes.category(c.slug)} className="group flex items-center gap-3 rounded-[14px] border border-transparent p-3 transition-colors hover:border-border hover:bg-surface-2">
                <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-brand-soft text-brand-soft-foreground transition-transform group-hover:scale-105">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold">{c.name}</span>
                  <span className="block text-[12px] text-muted-foreground tabular">{count} analysed</span>
                </span>
                <ArrowRight className="ml-auto hidden size-4 text-subtle-foreground transition-transform group-hover:translate-x-0.5 sm:block" />
              </Link>
            );
          })}
        </PageContainer>
      </section>

      {/* -------------------------------------------------------------- FEATURED */}
      <section className="py-20 lg:py-24">
        <PageContainer>
          <Reveal>
            <SectionHeading
              eyebrow="Featured refrigerators"
              title="The highest-scoring fridges right now"
              description="Ranked on evidence alone. Each card shows suitability and evidence coverage as two separate numbers."
              action={
                <Button asChild variant="outline">
                  <Link href={routes.category("refrigerators")}>
                    View all {refrigerators.length} <ArrowRight />
                  </Link>
                </Button>
              }
            />
          </Reveal>
          <ProductCarousel products={featured} className="mt-10" />
        </PageContainer>
      </section>

      {/* ---------------------------------------------------------- HOW IT WORKS */}
      <section className="bg-surface py-20 lg:py-24">
        <PageContainer>
          <Reveal>
            <SectionHeading align="center" eyebrow="How Qeivo works" title="From first search to confident decision" description="Five steps, one research workspace. Nothing is hidden behind a score." />
          </Reveal>
          <div role="list" className="relative mt-14 grid gap-4 md:grid-cols-5 md:gap-3">
            <div aria-hidden className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border-strong to-transparent md:block" />
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.07}>
                <div role="listitem" className="relative flex gap-4 md:flex-col md:items-center md:text-center">
                  <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-[16px] border border-border bg-card shadow-sm">
                    <s.icon className="size-6 text-brand" />
                    <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground tabular">{i + 1}</span>
                  </span>
                  <div className="md:mt-2">
                    <h3 className="text-[16px] font-semibold">{s.title}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ------------------------------------------------- INTELLIGENCE PREVIEW */}
      <section className="py-20 lg:py-24">
        <PageContainer className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <SectionHeading
              eyebrow="Product intelligence"
              title="Every sentence tells you where it came from"
              description="Qeivo separates what was measured from what was claimed, reviewed or inferred. Tap any citation to read the exact passage — manual page, lab table or video timestamp."
            />
            <ClaimLegend className="mt-6" />
            <ul className="mt-8 space-y-3">
              {["Manufacturer marketing is never shown as verified fact", "Conflicting sources are flagged, not averaged away", "Missing data lowers evidence coverage — it is never assumed"].map((t) => (
                <li key={t} className="flex gap-3 text-[15px]">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-success"><Check className="size-3.5" /></span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <AIInsightCard
              title={`AI summary · ${insightProduct.name}`}
              claims={[...insightProduct.aiSummary.slice(0, 2), insightProduct.strengths[0], insightProduct.limitations[0]]}
              footer={
                <Link href={routes.productAnalysis(insightProduct.slug)} className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-soft-foreground hover:underline">
                  Read the full analysis <ArrowRight className="size-3.5" />
                </Link>
              }
            />
          </Reveal>
        </PageContainer>
      </section>

      {/* ------------------------------------------------------- SCORE DEMO */}
      <section className="bg-surface py-20 lg:py-24">
        <PageContainer>
          <Reveal>
            <SectionHeading eyebrow="Suitability score" title="A score that bends to your life — and explains itself" description="Suitability (0–10) measures fit for your priorities. Evidence coverage (%) measures how much of it we could verify. They are never merged." className="mb-10" />
          </Reveal>
          <Reveal delay={0.05}>
            <ScoreDemo />
          </Reveal>
        </PageContainer>
      </section>

      {/* ---------------------------------------------------- COMPARISON PREVIEW */}
      <section className="py-20 lg:py-24">
        <PageContainer className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <SectionHeading
              eyebrow="Compare"
              title="Real differences, not spec-sheet noise"
              description="Normalised units, the best value in each row highlighted, and an AI verdict that names the trade-off you're actually making."
              action={null}
            />
            <Button asChild className="mt-8">
              <Link href={routes.compare}>
                Open the comparison tool <ArrowRight />
              </Link>
            </Button>
          </Reveal>
          <Reveal delay={0.1}>
            <ComparisonPreview />
          </Reveal>
        </PageContainer>
      </section>

      {/* ------------------------------------------------------- RECOMMENDATIONS */}
      <section className="bg-surface py-20 lg:py-24">
        <PageContainer>
          <Reveal>
            <SectionHeading
              eyebrow="Personalised recommendations"
              title="Three answers, not three hundred listings"
              description="Change the household and priorities — the ranking recalculates from evidence, with reasons and trade-offs for every pick."
              action={
                <Button asChild variant="outline">
                  <Link href={routes.recommendations}>
                    Full questionnaire <ArrowRight />
                  </Link>
                </Button>
              }
              className="mb-8"
            />
          </Reveal>
          <RecommendationDemo />
        </PageContainer>
      </section>

      {/* --------------------------------------------------------------- ASK */}
      <section className="relative overflow-hidden py-20 lg:py-24">
        <div aria-hidden className="bg-hero-glow pointer-events-none absolute inset-0 opacity-70" />
        <PageContainer className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              eyebrow="Ask Qeivo"
              title="An assistant that cites its homework"
              description="Ask anything about a product — fit, running costs, what owners complain about. Answers come from that product's manuals, lab data and reviews, with every source one tap away."
            />
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {["Manual pages", "Spec sheets", "Lab measurements", "Video timestamps", "Owner reviews", "Manufacturer statements"].map((s) => (
                <span key={s} className="inline-flex items-center gap-2 text-[14px] text-muted-foreground">
                  <Check className="size-4 text-brand" /> {s}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <AskDemo />
          </Reveal>
        </PageContainer>
      </section>

      {/* ----------------------------------------------------------- GUIDES */}
      <section className="bg-surface py-20 lg:py-24">
        <PageContainer>
          <Reveal>
            <SectionHeading
              eyebrow="Buying guides"
              title="Expert guidance, grounded in data"
              action={
                <Button asChild variant="outline">
                  <Link href={routes.guides}>
                    All {buyingGuides.length} guides <ArrowRight />
                  </Link>
                </Button>
              }
            />
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {guides.map((g, i) => (
              <Reveal key={g.slug} delay={i * 0.06}>
                <Link href={routes.guide(g.slug)} className="group block overflow-hidden rounded-[20px] border border-border bg-card shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <ImageWithFallback src={g.heroImage} alt="" aspect="aspect-[16/10]" sizes="(max-width: 768px) 100vw, 33vw" className="transition-transform duration-700 group-hover:scale-[1.04]" />
                  <div className="space-y-2 p-5">
                    <p className="text-[12px] font-medium text-brand-soft-foreground">{g.topic} · {g.readingMinutes} min read</p>
                    <h3 className="text-[17px] font-semibold leading-snug">{g.title}</h3>
                    <p className="line-clamp-2 text-[14px] text-muted-foreground">{g.excerpt}</p>
                    <p className="pt-1 text-[12px] text-subtle-foreground">
                      {g.author.name} · Updated {formatDate(g.updatedAt)}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ------------------------------------------------------------ TRUST */}
      <section id="trust" className="py-20 lg:py-24">
        <PageContainer>
          <Reveal>
            <SectionHeading align="center" eyebrow="Trust & evidence" title="Five kinds of information. Never blurred together." description="Every claim on Qeivo carries one of these labels, everywhere it appears." />
          </Reveal>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {CLAIM_ORDER.map((t, i) => {
              const m = CLAIM_META[t];
              return (
                <Reveal key={t} delay={i * 0.05}>
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
          <Reveal delay={0.1}>
            <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-[1fr_1fr]">
              <div className="flex gap-3 rounded-[16px] border border-border bg-surface p-5">
                <ShieldCheck className="size-6 shrink-0 text-brand" />
                <div>
                  <h3 className="font-semibold">Independent by design</h3>
                  <p className="mt-1 text-[14px] text-muted-foreground">Manufacturers can add documents and reply to reviews. They can never edit scores, rankings or verdicts.</p>
                </div>
              </div>
              <SponsoredDisclosure className="items-center p-5 text-[13px]" />
            </div>
          </Reveal>
        </PageContainer>
      </section>

      {/* ------------------------------------------------------- TESTIMONIALS */}
      <section className="bg-surface py-20 lg:py-24">
        <PageContainer>
          <Reveal>
            <SectionHeading align="center" eyebrow="From our members" title="Fewer returns. Better decisions." />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.07}>
                <figure className="flex h-full flex-col rounded-[20px] border border-border bg-card p-6 shadow-xs">
                  <Quote className="size-6 text-brand" />
                  <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed">{t.quote}</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <ImageWithFallback src={t.avatar} alt="" aspect="size-10 rounded-full" sizes="40px" />
                    <div>
                      <p className="text-[14px] font-semibold">{t.name}</p>
                      <p className="text-[12px] text-muted-foreground">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ------------------------------------------------------------ PREMIUM */}
      <section className="py-20 lg:py-24">
        <PageContainer>
          <Reveal>
            <div className="bg-navy-sheen relative overflow-hidden rounded-[28px] px-6 py-12 text-white sm:px-12 lg:px-16 lg:py-16">
              <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-teal-500/20 blur-3xl" />
              <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
                <div>
                  <Badge className="mb-5 border-white/15 bg-white/10 text-white">
                    <Sparkles /> Qeivo Premium
                  </Badge>
                  <h2 className="text-[30px] font-semibold leading-tight text-white sm:text-[38px]">Research every major purchase like an expert.</h2>
                  <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-white/70">Unlimited comparisons, personalised scores and an assistant that knows your home. $12 a month, or $115 a year.</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild size="lg" variant="brand">
                      <Link href={routes.signup}>Start 14-day free trial</Link>
                    </Button>
                    <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10">
                      <Link href={routes.pricing}>Compare plans</Link>
                    </Button>
                  </div>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {PREMIUM.map((f) => (
                    <li key={f} className="flex gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-3.5 text-[14px] text-white/85">
                      <Check className="mt-0.5 size-4 shrink-0 text-teal-400" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </PageContainer>
      </section>

      <section className="pb-6">
        <PageContainer>
          <div className="relative overflow-hidden rounded-[24px]">
            <ImageWithFallback src={images.cooking[1]} alt="Family cooking together in a bright kitchen" aspect="aspect-[16/7] sm:aspect-[16/5]" sizes="100vw" />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent p-6 sm:p-10">
              <p className="max-w-xl text-[22px] font-semibold leading-snug text-white sm:text-[28px]">Independent intelligence for confident decisions.</p>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
