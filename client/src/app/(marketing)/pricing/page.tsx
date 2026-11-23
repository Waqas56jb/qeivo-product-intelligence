import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bell, FileDown, History, MessageSquareText, Ruler, Scale, ShieldCheck, SlidersHorizontal, Wrench } from "lucide-react";
import type { Plan } from "@/types";
import { plans } from "@/data/subscriptions/plans";
import { routes } from "@/config/routes";
import { PageContainer } from "@/components/layout/page";
import { SectionHeading } from "@/components/common/display";
import { Reveal } from "@/components/common/reveal";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/tabs";
import { PlanComparison, PricingPlans, type ComparisonGroup } from "@/components/marketing/pricing-plans";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free evidence-backed product research, with Premium for unlimited comparisons, personalised scores and 500 Ask Qeivo messages a month.",
};

function allowance(id: Plan["id"], label: string): string {
  return plans.find((p) => p.id === id)?.allowances.find((a) => a.label === label)?.value ?? "—";
}
const per = (label: string, fallback: Partial<Record<Plan["id"], string>> = {}) =>
  Object.fromEntries((["free", "premium", "team", "enterprise"] as const).map((id) => [id, fallback[id] ?? allowance(id, label)])) as Record<Plan["id"], string>;
const all = { free: true, premium: true, team: true, enterprise: true };
const paid = { free: false, premium: true, team: true, enterprise: true };
const business = { free: false, premium: false, team: true, enterprise: true };

const GROUPS: ComparisonGroup[] = [
  {
    title: "Research",
    rows: [
      { label: "Suitability scores & evidence coverage", values: all },
      { label: "Claim labels and source panel", hint: "Every claim classified and cited", values: all },
      { label: "Product comparisons", values: per("Product comparisons", { enterprise: "Unlimited", team: "Unlimited" }) },
      { label: "Products per comparison", values: { free: "2", premium: "4", team: "6", enterprise: "6" } },
      { label: "Saved products", values: per("Saved products", { team: "Unlimited", enterprise: "Unlimited" }) },
      { label: "Research history", values: per("Research history", { enterprise: "Custom retention" }) },
      { label: "Personalised scoring weights", values: paid },
      { label: "Space-fit compatibility checker", values: paid },
    ],
  },
  {
    title: "Ask Qeivo (AI assistant)",
    rows: [
      { label: "Messages", values: per("Ask Qeivo messages", { team: "2,000 / seat / mo", enterprise: "Custom" }) },
      { label: "Answers cite manuals, lab data and reviews", values: all },
      { label: "Remembers your home & household", values: paid },
    ],
  },
  {
    title: "Prices & ownership",
    rows: [
      { label: "Retailer price comparison", values: all },
      { label: "Active price alerts", values: per("Price alerts", { team: "25 / seat", enterprise: "Custom" }) },
      { label: "Price history", values: { free: "30 days", premium: "52 weeks", team: "52 weeks", enterprise: "52 weeks + feeds" } },
      { label: "Owned products", values: per("Owned products", { team: "Unlimited", enterprise: "Unlimited" }) },
      { label: "Maintenance reminders & warranty tracking", values: paid },
      { label: "Export comparisons as PDF", values: paid },
    ],
  },
  {
    title: "Teams & business",
    rows: [
      { label: "Shared projects, notes & approvals", values: business },
      { label: "Role-based access", values: business },
      { label: "API access", values: { free: false, premium: false, team: "Read · 50k req/mo", enterprise: "Custom volume" } },
      { label: "SSO / SAML and SCIM", values: { free: false, premium: false, team: false, enterprise: true } },
      { label: "Support", values: { free: "Help centre", premium: "Email · 2 business days", team: "Priority", enterprise: "Dedicated manager" } },
    ],
  },
];

const BENEFITS = [
  { icon: Scale, title: "Unlimited comparisons", body: "Put up to four models side by side as often as you like, with real differences highlighted row by row." },
  { icon: SlidersHorizontal, title: "Scores tuned to you", body: "Re-weight energy, noise, capacity and reliability. Every suitability score recalculates — and shows its working." },
  { icon: MessageSquareText, title: "500 Ask Qeivo messages", body: "Ask about fit, running costs or owner complaints. Each answer cites the manual page, lab table or review." },
  { icon: Ruler, title: "Space-fit checker", body: "Enter your opening, doorways and stairs once. We flag what fits, what doesn't, and what is unknown." },
  { icon: Bell, title: "Price alerts & 52-week history", body: "Track up to 25 products and see whether today's ‘deal’ is genuinely low for that model." },
  { icon: Wrench, title: "Ownership vault", body: "Receipts, warranty dates and maintenance reminders for everything you already own." },
  { icon: History, title: "Unlimited research history", body: "Pick up where you left off months later, with folders and notes for each decision." },
  { icon: FileDown, title: "PDF exports", body: "Share a clean comparison with your partner, landlord or kitchen fitter." },
];

const FAQ = [
  { q: "Does paying change a product's score?", a: "No. Suitability scores, evidence coverage, rankings and AI verdicts are identical on every plan. Premium unlocks tools — personalised weights, more comparisons, more Ask Qeivo messages — not different answers." },
  { q: "How does the 14-day Premium trial work?", a: "You get every Premium feature for 14 days. We remind you three days before it ends, and you can cancel from Billing in two clicks. If you cancel, your account returns to Free and your saved research stays." },
  { q: "What counts as one comparison?", a: "Opening the comparison view with a new set of products counts once. Re-opening, re-sorting or exporting the same comparison does not count again. Free accounts get three new comparisons per calendar month." },
  { q: "What happens when I reach my Ask Qeivo limit?", a: "You can keep browsing and reading cited analysis. New questions pause until your allowance resets on the first of the month, or you can upgrade at any time and continue immediately." },
  { q: "Can I switch between monthly and yearly billing?", a: "Yes. Switching to yearly applies the 20% saving from your next renewal, and any unused monthly time is credited pro rata." },
  { q: "How does Qeivo make money if scores aren't for sale?", a: "Subscriptions fund the platform. Some retailer links are affiliate links and some placements are sponsored — both are always labelled, and neither can affect scores, rankings or recommendations." },
  { q: "Is Team billed per seat?", a: "Yes. Team starts at three seats and is billed per active seat. Seats can be added or removed at any time; changes are prorated on your next invoice." },
  { q: "Do you offer refunds?", a: "Yearly plans can be refunded in full within 30 days of purchase or renewal. Monthly plans can be cancelled at any time and remain active until the end of the paid period." },
];

export default function PricingPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="bg-hero-glow pointer-events-none absolute inset-0" />
        <div aria-hidden className="surface-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]" />
        <PageContainer className="relative pb-16 pt-12 sm:pt-16 lg:pb-24 lg:pt-20">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-soft-foreground">Pricing</p>
              <h1 className="mt-3 text-balance text-[38px] font-semibold leading-[1.05] tracking-tight sm:text-[54px]">Research for free. Go further with Premium.</h1>
              <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground">The same independent scores on every plan. Premium adds the tools that make a big purchase faster — and the confidence that it fits.</p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <PricingPlans plans={plans} className="mt-10" />
          </Reveal>
          <p className="mt-8 text-center text-[13px] text-muted-foreground">
            Prices in USD, excluding local taxes. Already a member?{" "}
            <Link href={routes.billing} className="font-semibold text-brand-soft-foreground hover:underline">
              Manage your plan in Billing
            </Link>
            .
          </p>
        </PageContainer>
      </section>

      <section className="border-y border-border bg-surface py-16 lg:py-24">
        <PageContainer>
          <Reveal>
            <SectionHeading align="center" eyebrow="Premium benefits" title="Everything you need for a major purchase" description="Most members subscribe for the few months around a kitchen renovation or a big replacement — then keep the ownership tools." />
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={(i % 4) * 0.05}>
                <div className="h-full rounded-[20px] border border-border bg-card p-5 shadow-xs">
                  <span className="grid size-10 place-items-center rounded-[12px] bg-brand-soft text-brand-soft-foreground">
                    <b.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold">{b.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-16 lg:py-24">
        <PageContainer>
          <Reveal>
            <SectionHeading eyebrow="Compare plans" title="Every feature, side by side" description="Allowances reset on the first day of each calendar month." className="mb-10" />
          </Reveal>
          <PlanComparison plans={plans} groups={GROUPS} />
        </PageContainer>
      </section>

      <section className="pb-16 lg:pb-24">
        <PageContainer>
          <Reveal>
            <div className="grid gap-6 rounded-[24px] border border-border bg-card p-6 shadow-xs sm:p-8 md:grid-cols-[auto_1fr_auto] md:items-center">
              <span className="grid size-14 place-items-center rounded-[16px] bg-success-soft text-success">
                <ShieldCheck className="size-7" />
              </span>
              <div>
                <h2 className="text-[20px] font-semibold">Your subscription never buys a better score</h2>
                <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
                  Free and paid members see identical suitability scores, evidence coverage and verdicts. Manufacturers and retailers cannot pay to change them either.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href={routes.about + "#independence"}>
                  Independence policy <ArrowRight />
                </Link>
              </Button>
            </div>
          </Reveal>
        </PageContainer>
      </section>

      <section className="bg-surface py-16 lg:py-24">
        <PageContainer className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <SectionHeading eyebrow="FAQ" title="Questions about plans and billing" description="Can't find what you need? Ask Qeivo answers account questions too." />
            <Button asChild variant="outline" className="mt-6">
              <Link href={routes.ask}>Ask Qeivo</Link>
            </Button>
          </Reveal>
          <Reveal delay={0.05}>
            <Accordion type="single" collapsible defaultValue="faq-0" className="rounded-[20px] border border-border bg-card px-5 shadow-xs sm:px-6">
              {FAQ.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent className="text-[14px] leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </PageContainer>
      </section>

      <section className="py-16 lg:py-24">
        <PageContainer>
          <Reveal>
            <div className="bg-navy-sheen relative overflow-hidden rounded-[28px] px-6 py-12 text-center text-white sm:px-12 lg:py-16">
              <div aria-hidden className="absolute -left-24 -top-24 size-80 rounded-full bg-teal-500/20 blur-3xl" />
              <div className="relative mx-auto max-w-2xl">
                <h2 className="text-balance text-[28px] font-semibold leading-tight text-white sm:text-[38px]">Know before you buy — starting today.</h2>
                <p className="mt-4 text-[16px] leading-relaxed text-white/70">Start free in under a minute. Upgrade only when a big decision comes along.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button asChild size="lg" variant="brand">
                    <Link href={`${routes.signup}?plan=premium`}>Start 14-day free trial</Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10">
                    <Link href={routes.signup}>Create free account</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </PageContainer>
      </section>
    </>
  );
}
