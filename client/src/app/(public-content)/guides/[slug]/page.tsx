import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Clock, FileText, RefreshCw } from "lucide-react";
import { buyingGuides, getGuide } from "@/data/guides";
import { getProduct } from "@/data/products";
import { getCategory } from "@/data/products/categories";
import { videos } from "@/data/videos";
import { routes } from "@/config/routes";
import { formatDate } from "@/lib/format";
import { PageContainer, Breadcrumbs } from "@/components/layout/page";
import { SectionHeading } from "@/components/common/display";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { Reveal } from "@/components/common/reveal";
import { Button } from "@/components/ui/button";
import { ClaimTypeBadge } from "@/components/analysis/badges";
import { ProductCard } from "@/components/product/product-card";
import { ProductPrice } from "@/components/product/product-bits";
import { ScorePill } from "@/components/analysis/score";
import { GuideArticle, GuideCard, GuideReferences, GuideToc, GuideTocMobile } from "@/components/guides";
import { VideoCard } from "@/components/video";

export function generateStaticParams() {
  return buyingGuides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  return g ? { title: g.title, description: g.excerpt } : { title: "Guide not found" };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const category = getCategory(guide.category);
  const products = guide.relatedProductIds.map((id) => getProduct(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const related = guide.relatedGuideSlugs.map((s) => getGuide(s)).filter((g): g is NonNullable<typeof g> => Boolean(g));
  const moreGuides = related.length >= 3 ? related.slice(0, 3) : [...related, ...buyingGuides.filter((g) => g.category === guide.category && g.slug !== guide.slug && !related.includes(g))].slice(0, 3);
  const relatedVideos = videos.filter((v) => v.productIds.some((id) => guide.relatedProductIds.includes(id))).slice(0, 3);
  const toc = [...guide.sections.map((s) => ({ id: s.id, label: s.heading })), { id: "references", label: "Sources & references" }];
  const articleId = "guide-article";

  return (
    <>
      <header className="relative overflow-hidden">
        <div aria-hidden className="bg-hero-glow pointer-events-none absolute inset-0 opacity-70" />
        <PageContainer className="relative pb-8 pt-8 sm:pt-12">
          <Breadcrumbs items={[{ label: "Guides", href: routes.guides }, { label: category.name, href: routes.category(category.slug) }, { label: guide.title }]} className="mb-6" />
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={routes.category(category.slug)} className="rounded-full bg-brand-soft px-3 py-1 text-[12px] font-semibold text-brand-soft-foreground hover:bg-brand-soft/70">
                {category.name}
              </Link>
              <span className="rounded-full border border-border bg-surface px-3 py-1 text-[12px] font-medium text-muted-foreground">{guide.topic}</span>
            </div>
            <h1 className="mt-5 text-balance text-[34px] font-semibold leading-[1.08] tracking-tight sm:text-[48px]">{guide.title}</h1>
            <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground sm:text-[19px]">{guide.excerpt}</p>
            <div className="mt-8 flex flex-col gap-5 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <ImageWithFallback src={guide.author.avatar} alt="" aspect="size-12 shrink-0 rounded-full" sizes="48px" />
                <div className="leading-tight">
                  <p className="text-[15px] font-semibold">{guide.author.name}</p>
                  <p className="text-[13px] text-muted-foreground">{guide.author.role}</p>
                </div>
              </div>
              <dl className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
                <div className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-subtle-foreground" />
                  <dt className="sr-only">Published</dt>
                  <dd>
                    Published <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
                  </dd>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <RefreshCw className="size-4 text-subtle-foreground" />
                  <dt className="sr-only">Updated</dt>
                  <dd>
                    Updated <time dateTime={guide.updatedAt}>{formatDate(guide.updatedAt)}</time>
                  </dd>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <Clock className="size-4 text-subtle-foreground" />
                  <dt className="sr-only">Reading time</dt>
                  <dd className="tabular">{guide.readingMinutes} min read</dd>
                </div>
              </dl>
            </div>
          </div>
        </PageContainer>
        <PageContainer className="relative pb-4">
          <ImageWithFallback src={guide.heroImage} alt={`${guide.title} — ${category.name.toLowerCase()} in a real home`} aspect="aspect-[16/9] rounded-[20px] sm:aspect-[21/8] sm:rounded-[24px]" priority sizes="(max-width: 1240px) 100vw, 1240px" />
        </PageContainer>
      </header>

      <GuideTocMobile items={toc} articleId={articleId} className="lg:hidden" />

      <PageContainer className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[220px_minmax(0,1fr)_264px]">
        <aside className="hidden lg:block">
          <GuideToc items={toc} articleId={articleId} />
        </aside>

        <article id={articleId} className="min-w-0 max-w-[720px]">
          <div className="mb-10 flex flex-wrap items-start gap-2.5 rounded-[14px] border border-border bg-surface px-4 py-3 text-[13px] text-muted-foreground">
            <ClaimTypeBadge type="expert" />
            <span className="min-w-0 flex-1">Editorial assessment by Qeivo specialists. No brand paid for or reviewed this guide. Figures are cited in the references below.</span>
          </div>

          <GuideArticle guide={guide} />

          <section id="references" aria-labelledby="references-h" className="mt-16 scroll-mt-28">
            <h2 id="references-h" className="flex items-center gap-2 text-[22px] font-semibold tracking-tight sm:text-[24px]">
              <FileText className="size-5 text-brand" /> Sources &amp; references
            </h2>
            <p className="mb-5 mt-2 text-[14px] text-muted-foreground">Tap a citation to read the exact passage in the source panel. Sources were retrieved and checked when this guide was last updated.</p>
            <GuideReferences sourceIds={guide.sourceIds} />
          </section>

          <div className="mt-12 flex flex-col gap-4 rounded-[20px] border border-border bg-card p-5 shadow-xs sm:flex-row sm:items-center sm:p-6">
            <ImageWithFallback src={guide.author.avatar} alt="" aspect="size-16 shrink-0 rounded-full" sizes="64px" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">About the author</p>
              <p className="mt-0.5 text-[16px] font-semibold">{guide.author.name}</p>
              <p className="text-[14px] text-muted-foreground">
                {guide.author.role} at Qeivo. Every guide is fact-checked by a second editor against the cited sources before publication.
              </p>
            </div>
          </div>
        </article>

        {products.length > 0 && (
          <aside aria-label="Products mentioned" className="hidden xl:block">
            <div className="sticky top-24 space-y-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">Mentioned in this guide</p>
              {products.slice(0, 4).map((p) => (
                <Link key={p.id} href={routes.product(p.slug)} className="group flex gap-3 rounded-[14px] border border-border bg-card p-2.5 shadow-xs transition-all hover:border-border-strong hover:shadow-sm">
                  <ImageWithFallback src={p.images[0]} alt={p.name} aspect="size-16 shrink-0 rounded-[10px] bg-gradient-to-b from-surface-2 to-surface-3/60" sizes="64px" className="p-1.5" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13px] font-semibold leading-snug group-hover:text-brand-soft-foreground">{p.name}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <ProductPrice product={p} size="sm" showSaving={false} className="[&_.line-through]:hidden" />
                      <ScorePill score={p.suitabilityScore} className="h-6" />
                    </div>
                  </div>
                </Link>
              ))}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={routes.compare}>Compare these models</Link>
              </Button>
            </div>
          </aside>
        )}
      </PageContainer>

      {products.length > 0 && (
        <section className="border-t border-border bg-surface py-16 lg:py-20">
          <PageContainer>
            <Reveal>
              <SectionHeading
                eyebrow="Products in this guide"
                title="See the evidence behind each model"
                description="Suitability and evidence coverage are shown separately on every card."
                action={
                  <Button asChild variant="outline">
                    <Link href={routes.category(category.slug)}>
                      All {category.name.toLowerCase()} <ArrowRight />
                    </Link>
                  </Button>
                }
                className="mb-8"
              />
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </PageContainer>
        </section>
      )}

      {relatedVideos.length > 0 && (
        <section className="py-16 lg:py-20">
          <PageContainer>
            <Reveal>
              <SectionHeading eyebrow="Watch" title="Videos featuring these products" className="mb-8" />
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedVideos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </PageContainer>
        </section>
      )}

      {moreGuides.length > 0 && (
        <section className={relatedVideos.length > 0 ? "border-t border-border bg-surface py-16 lg:py-20" : "py-16 lg:py-20"}>
          <PageContainer>
            <Reveal>
              <SectionHeading
                eyebrow="Keep reading"
                title="Related guides"
                action={
                  <Button asChild variant="outline">
                    <Link href={routes.guides}>
                      All guides <ArrowRight />
                    </Link>
                  </Button>
                }
                className="mb-8"
              />
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {moreGuides.map((g) => (
                <GuideCard key={g.slug} guide={g} />
              ))}
            </div>
          </PageContainer>
        </section>
      )}
    </>
  );
}
