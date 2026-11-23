import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, FileSearch, ShieldCheck, UserCheck } from "lucide-react";
import { buyingGuides, featuredGuides } from "@/data/guides";
import { authors } from "@/data/guides/guide-helpers";
import { routes } from "@/config/routes";
import { PageContainer, Breadcrumbs } from "@/components/layout/page";
import { SectionHeading } from "@/components/common/display";
import { Reveal } from "@/components/common/reveal";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GuideCard, GuideLibrary } from "@/components/guides";

export const metadata: Metadata = {
  title: "Buying guides",
  description: "Independent, evidence-backed buying guides for refrigerators, washing machines, televisions and laptops.",
};

const STANDARDS = [
  { icon: FileSearch, title: "Every figure is cited", body: "Numbers link to the lab table, manual page or survey they came from — open any reference without leaving the guide." },
  { icon: ShieldCheck, title: "No paid placements", body: "Brands cannot buy a mention, a recommendation or a place in a list. Guides carry no sponsored products." },
  { icon: UserCheck, title: "Written by specialists", body: "Lab leads, designers and category editors write each guide, and a second editor checks every number against its source." },
];

export default function GuidesPage() {
  const sorted = [...buyingGuides].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const [lead, ...restFeatured] = featuredGuides.length ? featuredGuides : sorted;
  const picks = [...restFeatured, ...sorted.filter((g) => g.slug !== lead.slug && !restFeatured.includes(g))].slice(0, 4);
  const sourceCount = new Set(buyingGuides.flatMap((g) => g.sourceIds)).size;
  const team = Object.values(authors);

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="bg-hero-glow pointer-events-none absolute inset-0" />
        <PageContainer className="relative pb-12 pt-8 sm:pt-12 lg:pb-16">
          <Breadcrumbs items={[{ label: "Home", href: routes.home }, { label: "Buying guides" }]} className="mb-6" />
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <Reveal>
              <Badge variant="brand" className="mb-5 h-7 gap-1.5 px-3 text-[12px]">
                <BookOpenCheck /> {buyingGuides.length} guides · reviewed quarterly
              </Badge>
              <h1 className="text-balance text-[38px] font-semibold leading-[1.05] tracking-tight sm:text-[52px]">Buy with the evidence, not the brochure.</h1>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
                Practical, measured advice from our lab and editorial team — what to measure, what the label leaves out, and which features are worth paying for.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <dl className="grid grid-cols-3 gap-3">
                {[
                  { k: "Guides", v: buyingGuides.length },
                  { k: "Sources cited", v: sourceCount },
                  { k: "Specialist authors", v: team.length },
                ].map((s) => (
                  <div key={s.k} className="rounded-[16px] border border-border bg-card/80 p-4 shadow-xs backdrop-blur">
                    <dd className="text-[26px] font-semibold leading-none tracking-tight tabular sm:text-[30px]">{s.v}</dd>
                    <dt className="mt-2 text-[12px] text-muted-foreground">{s.k}</dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16 lg:pb-20">
        <PageContainer className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:gap-8">
          <Reveal>
            <GuideCard guide={lead} variant="feature" priority className="h-full" />
          </Reveal>
          <Reveal delay={0.06}>
            <div className="flex h-full flex-col rounded-[24px] border border-border bg-card p-4 shadow-xs sm:p-5">
              <div className="flex items-center justify-between px-2 pb-2 pt-1">
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">Editor&apos;s picks</h2>
                <span className="text-[12px] text-subtle-foreground">Updated this season</span>
              </div>
              <div className="flex flex-1 flex-col justify-between divide-y divide-border">
                {picks.map((g) => (
                  <GuideCard key={g.slug} guide={g} variant="compact" className="my-1.5" />
                ))}
              </div>
            </div>
          </Reveal>
        </PageContainer>
      </section>

      <section className="border-t border-border bg-surface py-16 lg:py-20">
        <PageContainer>
          <Reveal>
            <SectionHeading eyebrow="The library" title="Find the guide for your decision" description="Filter by category and topic, or search for the exact question you're stuck on." className="mb-8" />
          </Reveal>
          <GuideLibrary guides={sorted} />
        </PageContainer>
      </section>

      <section className="py-16 lg:py-24">
        <PageContainer className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <SectionHeading eyebrow="Editorial standards" title="Guides you can check for yourself" description="Our guides follow the same evidence rules as product analysis: measured beats claimed, and anything we could not verify is labelled as such." />
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {team.map((a) => (
                  <ImageWithFallback key={a.name} src={a.avatar} alt={a.name} aspect="size-10 rounded-full ring-2 ring-background" sizes="40px" />
                ))}
              </div>
              <p className="text-[13px] text-muted-foreground">
                Written by {team.slice(0, 2).map((a) => a.name).join(", ")} and {team.length - 2} more specialists.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-8">
              <Link href={routes.howItWorks + "#methodology"}>
                Read our methodology <ArrowRight />
              </Link>
            </Button>
          </Reveal>
          <div className="grid gap-4">
            {STANDARDS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <div className="flex gap-4 rounded-[20px] border border-border bg-card p-5 shadow-xs">
                  <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-brand-soft text-brand-soft-foreground">
                    <s.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-semibold">{s.title}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </PageContainer>
      </section>
    </>
  );
}
