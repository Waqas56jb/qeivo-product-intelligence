import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileSearch, GitCompareArrows, Laptop, Layers, Refrigerator, ShieldCheck, Sparkles, Tags, Tv, WashingMachine } from "lucide-react";
import type { CategorySlug } from "@/types";
import { categories, categoryBySlug } from "@/data/products/categories";
import { getBrand } from "@/data/products/brands";
import { productsByCategory } from "@/data/products";
import { buyingGuides } from "@/data/guides";
import { videos } from "@/data/videos";
import { routes } from "@/config/routes";
import { PageContainer, Breadcrumbs } from "@/components/layout/page";
import { CurrencyDisplay, SectionHeading } from "@/components/common/display";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { Reveal } from "@/components/common/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EvidenceCoverage, ScorePill } from "@/components/analysis/score";
import { ProductCarousel } from "@/components/product/product-card";
import { GuideCard } from "@/components/guides";
import { VideoCard } from "@/components/video";
import { CategoryExplorer } from "@/components/marketing/category-explorer";

const ICON = { refrigerator: Refrigerator, "washing-machine": WashingMachine, tv: Tv, laptop: Laptop } as const;

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = categoryBySlug.get(slug as CategorySlug);
  return c ? { title: c.name, description: c.description } : { title: "Category not found" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categoryBySlug.get(slug as CategorySlug);
  if (!category) notFound();

  const Icon = ICON[category.icon];
  const products = productsByCategory(category.slug);
  const ranked = [...products].sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  const top = ranked[0];
  const avgEvidence = Math.round(products.reduce((n, p) => n + p.evidenceCoverage, 0) / products.length);
  const minPrice = Math.min(...products.map((p) => p.price));
  const maxPrice = Math.max(...products.map((p) => p.price));
  const sourceCount = new Set(products.flatMap((p) => p.sourceIds)).size;
  const guides = buyingGuides.filter((g) => g.category === category.slug).sort((a, b) => Number(b.featured) - Number(a.featured) || b.updatedAt.localeCompare(a.updatedAt));
  const catVideos = videos.filter((v) => v.category === category.slug).sort((a, b) => b.views - a.views).slice(0, 3);

  const brandStats = [...new Set(products.map((p) => p.brandId))]
    .map((id) => {
      const list = products.filter((p) => p.brandId === id);
      return { brand: getBrand(id), count: list.length, avg: list.reduce((n, p) => n + p.suitabilityScore, 0) / list.length, best: [...list].sort((a, b) => b.suitabilityScore - a.suitabilityScore)[0] };
    })
    .sort((a, b) => b.count - a.count || b.avg - a.avg);

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="bg-hero-glow pointer-events-none absolute inset-0" />
        <div aria-hidden className="surface-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_60%_at_30%_0%,black,transparent)]" />
        <PageContainer className="relative grid items-center gap-10 pb-14 pt-8 sm:pt-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pb-20">
          <Reveal>
            <Breadcrumbs items={[{ label: "Home", href: routes.home }, { label: "Categories" }, { label: category.name }]} className="mb-6" />
            <span className="mb-5 inline-flex items-center gap-2.5 text-[13px] font-semibold text-brand-soft-foreground">
              <span className="grid size-9 place-items-center rounded-[11px] bg-brand-soft">
                <Icon className="size-4.5" />
              </span>
              {products.length} models independently analysed
            </span>
            <h1 className="text-balance text-[40px] font-semibold leading-[1.04] tracking-tight sm:text-[56px]">{category.name}</h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground">{category.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="#browse">
                  Browse all {products.length} <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={routes.recommendations}>
                  <Sparkles /> Get my shortlist
                </Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="relative pb-8 sm:pb-10">
              <ImageWithFallback src={category.heroImage} alt={`${category.name} in a modern home`} aspect="aspect-[4/3] rounded-[24px] shadow-lg" priority sizes="(max-width: 1024px) 100vw, 50vw" />
              <Link
                href={routes.product(top.slug)}
                className="absolute -bottom-0 left-3 right-3 flex items-center gap-3 rounded-[16px] border border-border bg-card/95 p-3 shadow-lg backdrop-blur-xl transition-transform hover:-translate-y-0.5 sm:left-auto sm:right-6 sm:w-[340px]"
              >
                <ImageWithFallback src={top.images[0]} alt={top.name} aspect="size-16 shrink-0 rounded-[12px] bg-gradient-to-b from-surface-2 to-surface-3/60" sizes="64px" className="p-1.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-soft-foreground">Highest suitability</p>
                  <p className="truncate text-[14px] font-semibold">{top.name}</p>
                  <EvidenceCoverage coverage={top.evidenceCoverage} variant="pill" className="mt-1 h-6" />
                </div>
                <ScorePill score={top.suitabilityScore} />
              </Link>
            </div>
          </Reveal>
        </PageContainer>
      </section>

      <section className="border-y border-border bg-surface">
        <PageContainer className="grid grid-cols-2 gap-px overflow-hidden py-0 md:grid-cols-4">
          {[
            { icon: Layers, label: "Models analysed", value: products.length },
            { icon: Tags, label: "Price range (US)", value: <><CurrencyDisplay usd={minPrice} region="US" /> – <CurrencyDisplay usd={maxPrice} region="US" /></> },
            { icon: ShieldCheck, label: "Avg. evidence coverage", value: `${avgEvidence}%` },
            { icon: FileSearch, label: "Sources cited", value: sourceCount },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 px-1 py-5 sm:px-4">
              <span className="hidden size-10 shrink-0 place-items-center rounded-[11px] bg-card text-brand shadow-xs sm:grid">
                <s.icon className="size-4.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[18px] font-semibold tracking-tight tabular sm:text-[22px]">{s.value}</p>
                <p className="text-[12px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </PageContainer>
      </section>

      <section className="py-16 lg:py-20">
        <PageContainer>
          <Reveal>
            <SectionHeading
              eyebrow="Top rated"
              title={`The highest-scoring ${category.name.toLowerCase()}`}
              description="Ranked on evidence alone — sponsored placements never change this order."
              action={
                <Button asChild variant="outline">
                  <Link href={routes.compare}>
                    <GitCompareArrows /> Compare models
                  </Link>
                </Button>
              }
            />
          </Reveal>
          <ProductCarousel products={ranked.slice(0, 4)} className="mt-10" />
        </PageContainer>
      </section>

      <section className="bg-surface py-16 lg:py-20">
        <PageContainer className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <Reveal>
            <SectionHeading eyebrow="Before you buy" title="What actually matters" description={`The considerations that most often separate a good ${category.singular.toLowerCase()} purchase from a regretted one, drawn from lab data and owner reports.`} />
            {guides[0] && (
              <Button asChild variant="outline" className="mt-8">
                <Link href={routes.guide(guides[0].slug)}>
                  Read: {guides[0].title} <ArrowRight />
                </Link>
              </Button>
            )}
          </Reveal>
          <ol className="grid gap-4 sm:grid-cols-2">
            {category.considerations.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.05}>
                <li className="h-full rounded-[20px] border border-border bg-card p-5 shadow-xs">
                  <span className="text-[13px] font-semibold text-brand-soft-foreground tabular">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 text-[16px] font-semibold leading-snug">{c.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{c.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </PageContainer>
      </section>

      <section id="browse" className="scroll-mt-20 py-16 lg:py-20">
        <PageContainer>
          <Reveal>
            <SectionHeading eyebrow="Browse" title={`Find the right ${category.singular.toLowerCase()}`} description="Results update instantly as you filter. Every card shows suitability and evidence coverage as two separate measures." className="mb-8" />
          </Reveal>
          <CategoryExplorer category={category.slug} products={ranked} types={category.types} />
        </PageContainer>
      </section>

      <section className="bg-surface py-16 lg:py-20">
        <PageContainer>
          <Reveal>
            <SectionHeading eyebrow="Brands" title="Popular brands in this category" description="Brand reliability index combines five-year owner fault reports with service-network data. Brands cannot pay to change it." className="mb-10" />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brandStats.slice(0, 6).map(({ brand, count, avg, best }, i) => (
              <Reveal key={brand.id} delay={i * 0.04}>
                <div className="flex h-full flex-col gap-4 rounded-[20px] border border-border bg-card p-5 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-[12px] text-[15px] font-bold text-white shadow-sm" style={{ backgroundColor: brand.color }}>
                      {brand.mark}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[16px] font-semibold">{brand.name}</h3>
                      <p className="truncate text-[12px] text-muted-foreground">
                        {brand.origin} · since {brand.founded}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-auto tabular">
                      {count} {count === 1 ? "model" : "models"}
                    </Badge>
                  </div>
                  <dl className="grid grid-cols-2 gap-2">
                    <div className="rounded-[12px] bg-surface-2 px-3 py-2.5">
                      <dt className="text-[11px] text-muted-foreground">Avg. suitability</dt>
                      <dd className="text-[17px] font-semibold tabular">{avg.toFixed(1)}</dd>
                    </div>
                    <div className="rounded-[12px] bg-surface-2 px-3 py-2.5">
                      <dt className="text-[11px] text-muted-foreground">Reliability index</dt>
                      <dd className="text-[17px] font-semibold tabular">{brand.reliabilityIndex.toFixed(1)}</dd>
                    </div>
                  </dl>
                  <Link href={routes.product(best.slug)} className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3 text-[13px] text-muted-foreground hover:text-foreground">
                    <span className="min-w-0 truncate">
                      Best rated: <span className="font-medium text-foreground">{best.model}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </PageContainer>
      </section>

      {guides.length > 0 && (
        <section className="py-16 lg:py-20">
          <PageContainer>
            <Reveal>
              <SectionHeading
                eyebrow="Guides"
                title={`${category.singular} buying guides`}
                action={
                  <Button asChild variant="outline">
                    <Link href={routes.guides}>
                      All guides <ArrowRight />
                    </Link>
                  </Button>
                }
                className="mb-10"
              />
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {guides.slice(0, 3).map((g, i) => (
                <Reveal key={g.slug} delay={i * 0.05}>
                  <GuideCard guide={g} />
                </Reveal>
              ))}
            </div>
          </PageContainer>
        </section>
      )}

      {catVideos.length > 0 && (
        <section className="border-t border-border bg-surface py-16 lg:py-20">
          <PageContainer>
            <Reveal>
              <SectionHeading
                eyebrow="Watch"
                title="Tested on camera"
                action={
                  <Button asChild variant="outline">
                    <Link href={routes.videos}>
                      Video library <ArrowRight />
                    </Link>
                  </Button>
                }
                className="mb-10"
              />
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {catVideos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </PageContainer>
        </section>
      )}

      <section className="py-16 lg:py-20">
        <PageContainer>
          <div className="bg-navy-sheen relative overflow-hidden rounded-[28px] px-6 py-10 text-white sm:px-12 lg:py-14">
            <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-teal-500/20 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="text-[26px] font-semibold leading-tight text-white sm:text-[32px]">Not sure where to start?</h2>
                <p className="mt-3 text-[16px] leading-relaxed text-white/70">Tell us about your space, household and priorities. We&apos;ll shortlist three {category.name.toLowerCase()} that fit — with the trade-offs spelled out.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" variant="brand">
                  <Link href={routes.recommendations}>Get recommendations</Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10">
                  <Link href={routes.ask}>Ask Qeivo</Link>
                </Button>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
