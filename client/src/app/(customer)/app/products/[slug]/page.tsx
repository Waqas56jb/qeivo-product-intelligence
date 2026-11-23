import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calculator, Check, Clock4, Ruler, Shield, ShieldCheck, Sparkles, Store, X, Zap } from "lucide-react";
import { getProduct } from "@/data/products";
import { getBrand } from "@/data/products/brands";
import { ratingDistribution, reviewsForProduct } from "@/data/reviews";
import { videosForProduct } from "@/data/videos";
import { diyGuidesForProduct } from "@/data/guides";
import { offersForProduct } from "@/data/offers/retailer-offers";
import { priceHistory } from "@/data/offers/price-history";
import { routes } from "@/config/routes";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/tabs";
import { Breadcrumbs, PageContainer, SectionNavigation } from "@/components/layout/page";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { CurrencyDisplay } from "@/components/common/display";
import { BrandLabel, ProductRating, ProductStatusBadge } from "@/components/product/product-bits";
import { ProductCard } from "@/components/product/product-card";
import { EvidenceCoverage, SuitabilityScore } from "@/components/analysis/score";
import { AIInsightCard, LimitationsList, StrengthsList } from "@/components/analysis/claims";
import { ClaimTypeBadge, SourceCitation, SourceList } from "@/components/analysis/badges";
import { SponsoredDisclosure, SponsoredTag, WarningList } from "@/components/analysis/warnings";
import { PriceHistoryChart } from "@/components/charts/domain-charts";
import { ReviewCard, RatingSummary } from "@/components/reviews";
import { VideoCard } from "@/components/video";
import { HideCompareTray } from "@/components/product-detail/hide-compare-tray";
import { formatSpecValue, productStaticParams, relatedProducts } from "@/components/product-detail/spec-utils";
import { ProductGallery, StickyActions, TrackView, VariantAndRegion } from "@/components/product-detail/detail-client";

export function generateStaticParams() {
  return productStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return { title: p ? p.name : "Product", description: p?.description };
}

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "summary", label: "AI summary" },
  { id: "fit", label: "Strengths & fit" },
  { id: "specs", label: "Specifications" },
  { id: "energy", label: "Energy & size" },
  { id: "reviews", label: "Reviews" },
  { id: "media", label: "Videos & guides" },
  { id: "offers", label: "Offers & price" },
  { id: "ownership", label: "Ownership" },
  { id: "faqs", label: "FAQs" },
  { id: "sources", label: "Sources" },
];

function Section({ id, title, description, action, children, className }: { id: string; title: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("scroll-mt-32 rounded-[20px] border border-border bg-card p-5 shadow-xs sm:p-6", className)}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[19px] font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p || p.slug !== slug) notFound();
  const brand = getBrand(p.brandId);
  const reviews = reviewsForProduct(p.id).slice(0, 3);
  const videos = videosForProduct(p.id).slice(0, 3);
  const diy = diyGuidesForProduct(p.id).slice(0, 3);
  const offers = offersForProduct(p.id);
  const related = relatedProducts(p, 4);
  const d = p.dimensions;
  const maxDim = Math.max(d.widthMm, d.heightMm, d.depthMm);

  return (
    <PageContainer size="wide" className="pb-24 lg:pb-0">
      <TrackView productId={p.id} />
      <HideCompareTray />
      <Breadcrumbs className="mb-5 hidden sm:block" />

      {/* ---------- Overview */}
      <div id="overview" className="grid scroll-mt-32 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] xl:gap-12">
        <ProductGallery product={p} />
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <BrandLabel brandId={p.brandId} withMark />
              <ProductStatusBadge product={p} />
              {p.sponsored && <SponsoredTag />}
            </div>
            <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-tight sm:text-[36px]">{p.model}</h1>
            <p className="mt-1 text-[14px] text-muted-foreground">
              {p.type} · Model {p.modelNumber} · Released {p.releaseYear} · {brand.origin}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <ProductRating rating={p.rating} count={p.reviewCount} size="md" />
              <Link href={routes.productReviews(p.slug)} className="text-[13px] font-medium text-brand-soft-foreground hover:underline">
                Read reviews
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link href={routes.productScore(p.slug)} className="group flex items-center gap-4 rounded-[20px] border border-border bg-card p-4 shadow-xs transition-colors hover:border-border-strong">
              <SuitabilityScore score={p.suitabilityScore} size="md" label={false} />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Suitability</p>
                <p className="text-[14px] font-semibold">Fit for typical priorities</p>
                <p className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-brand-soft-foreground">
                  See factors <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </p>
              </div>
            </Link>
            <div className="flex flex-col justify-center gap-2 rounded-[20px] border border-border bg-card p-4 shadow-xs">
              <EvidenceCoverage coverage={p.evidenceCoverage} variant="stacked" />
              <p className="text-[12px] text-muted-foreground">
                {p.sourceIds.length} sources · verified {formatDate(p.lastVerified)}
              </p>
            </div>
          </div>

          <p className="text-[15px] leading-relaxed text-muted-foreground">{p.description}</p>
          <VariantAndRegion product={p} />
          <StickyActions product={p} />
          <ul className="flex flex-wrap gap-2">
            {p.features.slice(0, 8).map((f) => (
              <li key={f} className="rounded-full border border-border bg-surface px-3 py-1 text-[12px] text-muted-foreground">
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[190px_minmax(0,1fr)] xl:gap-8">
        <SectionNavigation sections={SECTIONS} className="sticky top-14 z-20 -mx-4 border-b border-border bg-background/90 px-4 py-2 backdrop-blur lg:top-24 lg:mx-0 lg:self-start lg:border-0 lg:bg-transparent lg:p-0" />
        <div className="min-w-0 space-y-6">
          {/* ---------- AI summary */}
          <div id="summary" className="scroll-mt-32 space-y-4">
            <AIInsightCard
              claims={p.aiSummary}
              footer={
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={routes.productAnalysis(p.slug)}>
                      <Sparkles /> Full AI analysis
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={routes.productScore(p.slug)}>How the score works</Link>
                  </Button>
                </div>
              }
            />
            {p.warnings.length > 0 && <WarningList warnings={p.warnings} />}
          </div>

          {/* ---------- Strengths & fit */}
          <div id="fit" className="grid scroll-mt-32 gap-6 xl:grid-cols-2">
            <Section id="strengths" title="Strengths">
              <StrengthsList claims={p.strengths} />
            </Section>
            <Section id="limitations" title="Limitations">
              <LimitationsList claims={p.limitations} />
            </Section>
            <Section id="best-for" title="Best suited for">
              <ul className="space-y-2.5">
                {p.bestFor.map((b) => (
                  <li key={b} className="flex gap-2.5 text-[14px]">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" /> {b}
                  </li>
                ))}
              </ul>
            </Section>
            <Section id="not-for" title="Not suited for">
              <ul className="space-y-2.5">
                {(p.notFor.length ? p.notFor : ["No common household types are poorly served"]).map((b) => (
                  <li key={b} className="flex gap-2.5 text-[14px]">
                    <X className="mt-0.5 size-4 shrink-0 text-danger" /> {b}
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          {/* ---------- Specs */}
          <Section id="specs" title="Technical specifications" description="Each value shows where it came from: manufacturer claim, independent measurement or expert assessment.">
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
              {p.specs.map((g) => (
                <div key={g.id}>
                  <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-subtle-foreground">{g.label}</h3>
                  <dl className="divide-y divide-border">
                    {g.items.map((i) => (
                      <div key={i.key} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                        <dt className="min-w-0 text-muted-foreground">{i.label}</dt>
                        <dd className="flex shrink-0 items-center gap-2">
                          {typeof i.value === "boolean" ? (
                            i.value ? <Check className="size-4 text-success" aria-label="Yes" /> : <X className="size-4 text-subtle-foreground" aria-label="No" />
                          ) : (
                            <span className="font-medium tabular">{formatSpecValue(i)}</span>
                          )}
                          {typeof i.value !== "boolean" && <ClaimTypeBadge type={i.claimType} size="xs" showLabel={false} />}
                          {i.sourceId && typeof i.value !== "boolean" && <SourceCitation sourceId={i.sourceId} variant="number" index={1} />}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </Section>

          {/* ---------- Energy & dimensions & warranty */}
          <div id="energy" className="grid scroll-mt-32 gap-6 xl:grid-cols-3">
            <Section id="energy-info" title="Energy">
              <div className="flex items-center gap-3">
                <span className="grid size-14 place-items-center rounded-[14px] bg-success-soft text-[24px] font-bold text-success">{p.category === "laptops" ? <Zap className="size-6" /> : p.energy.rating}</span>
                <div>
                  <p className="font-semibold">{p.energy.label}</p>
                  <p className="text-[13px] text-muted-foreground tabular">{p.energy.annualKwh} kWh per year declared</p>
                </div>
              </div>
              <p className="mt-4 text-[13px] text-muted-foreground">
                Estimated running cost: <strong className="tabular text-foreground">${Math.round(p.energy.annualKwh * 0.17)}</strong>/yr at $0.17/kWh.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                <Link href={routes.productOwnership(p.slug)}>
                  <Calculator /> Ownership cost calculator
                </Link>
              </Button>
            </Section>
            <Section id="dimensions" title="Dimensions">
              <div className="flex items-end justify-center gap-4 py-2" aria-hidden>
                <div className="relative rounded-[6px] border-2 border-brand/60 bg-brand-soft/40" style={{ width: `${(d.widthMm / maxDim) * 110}px`, height: `${(d.heightMm / maxDim) * 110}px` }}>
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] tabular text-muted-foreground">{d.widthMm}</span>
                  <span className="absolute -left-9 top-1/2 -translate-y-1/2 text-[10px] tabular text-muted-foreground">{d.heightMm}</span>
                </div>
                <div className="relative rounded-[6px] border-2 border-dashed border-border-strong" style={{ width: `${(d.depthMm / maxDim) * 110}px`, height: `${(d.heightMm / maxDim) * 110}px` }}>
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] tabular text-muted-foreground">{d.depthMm}</span>
                </div>
              </div>
              <p className="mt-6 text-center text-[13px] tabular">
                {d.widthMm} W × {d.heightMm} H × {d.depthMm} D mm · {d.weightKg} kg
              </p>
              <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                <Link href={routes.productCompatibility(p.slug)}>
                  <Ruler /> Check it fits your space
                </Link>
              </Button>
            </Section>
            <Section id="warranty" title="Warranty">
              <div className="flex items-center gap-3">
                <span className="grid size-14 place-items-center rounded-[14px] bg-info-soft text-info-foreground">
                  <Shield className="size-6" />
                </span>
                <div>
                  <p className="font-semibold tabular">{p.warranty.years}-year parts & labour</p>
                  {p.warranty.extended && <p className="text-[13px] text-muted-foreground">{p.warranty.extended}</p>}
                </div>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">{p.warranty.notes}</p>
              <div className="mt-3">
                <ClaimTypeBadge type="manufacturer" size="xs" />
              </div>
            </Section>
          </div>

          {/* ---------- Reviews */}
          <Section
            id="reviews"
            title="Customer reviews"
            action={
              <Button asChild size="sm" variant="outline">
                <Link href={routes.productReviews(p.slug)}>
                  All reviews <ArrowRight />
                </Link>
              </Button>
            }
          >
            <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
              <RatingSummary rating={p.rating} reviewCount={p.reviewCount} buckets={ratingDistribution(p.id)} />
              <div className="space-y-3">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} compact />
                ))}
              </div>
            </div>
          </Section>

          {/* ---------- Videos & DIY */}
          <Section id="media" title="Videos & DIY guides" description="Manufacturer, independent and how-to content linked to this model.">
            {videos.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {videos.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No videos linked to this model yet.</p>
            )}
            {diy.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {diy.map((g) => (
                  <Link key={g.id} href={`${routes.ownershipGuides}?guide=${g.slug}`} className="group flex items-center gap-3 rounded-[14px] border border-border p-2.5 transition-colors hover:bg-surface-2">
                    <ImageWithFallback src={g.image} alt="" aspect="size-14 shrink-0 rounded-[10px]" sizes="56px" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold">{g.title}</span>
                      <span className="block text-[12px] text-muted-foreground">
                        {g.difficulty} · {g.durationMinutes} min
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Section>

          {/* ---------- Offers & price */}
          <Section id="offers" title="Retailer offers & price history" description="Observed prices; retailer links are labelled. Offers never affect scores or rankings.">
            <ul className="divide-y divide-border rounded-[14px] border border-border">
              {offers.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-3 p-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-[12px] font-bold">{o.retailerLogo}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-[14px] font-medium">
                      {o.retailer}
                      {o.sponsored && <SponsoredTag />}
                      {o.affiliate && <Badge variant="outline">Affiliate</Badge>}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {o.delivery} · <Clock4 className="inline size-3" /> observed {formatRelative(o.observedAt)}
                    </p>
                  </div>
                  <Badge variant={o.stock === "in-stock" ? "success" : o.stock === "low-stock" ? "warning" : o.stock === "preorder" ? "info" : "danger"}>{o.stock.replace("-", " ")}</Badge>
                  <CurrencyDisplay usd={o.price} className="w-24 text-right text-[16px] font-semibold" />
                </li>
              ))}
            </ul>
            <SponsoredDisclosure kind="affiliate" className="mt-3" />
            <div className="mt-6">
              <PriceHistoryChart points={priceHistory(p.id)} />
            </div>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href={routes.priceIntelligence}>
                <Store /> Price intelligence & alerts
              </Link>
            </Button>
          </Section>

          {/* ---------- Ownership & compatibility */}
          <div id="ownership" className="grid scroll-mt-32 gap-4 sm:grid-cols-2">
            <Link href={routes.productOwnership(p.slug)} className="group rounded-[20px] border border-border bg-card p-5 shadow-xs transition-colors hover:border-border-strong">
              <Calculator className="size-6 text-brand" />
              <h3 className="mt-3 font-semibold">Total cost of ownership</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">Purchase, energy, maintenance and accessories over the years you&apos;ll own it.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-brand-soft-foreground">
                Calculate <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link href={routes.productCompatibility(p.slug)} className="group rounded-[20px] border border-border bg-card p-5 shadow-xs transition-colors hover:border-border-strong">
              <Ruler className="size-6 text-brand" />
              <h3 className="mt-3 font-semibold">Compatibility checker</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">Width, height, depth, door swing, ventilation and delivery access. Unknowns stay unknown.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-brand-soft-foreground">
                Check fit <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>

          {/* ---------- FAQs */}
          <Section id="faqs" title="Frequently asked questions">
            <Accordion type="single" collapsible>
              {p.faqs.map((q, i) => (
                <AccordionItem key={i} value={`q${i}`}>
                  <AccordionTrigger>{q.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-[14px] leading-relaxed text-foreground">{q.answer}</p>
                    <SourceList ids={q.sourceIds} className="mt-3" />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Section>

          {/* ---------- Sources */}
          <Section id="sources" title="Source references" description="Every source used for this product. Tap one to read the exact passage.">
            <SourceList ids={p.sourceIds} />
            <p className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground">
              <ShieldCheck className="size-3.5 text-brand" /> Last verified {formatDate(p.lastVerified)}. Sponsored content is never used as evidence.
            </p>
          </Section>

          {/* ---------- Related */}
          <section aria-labelledby="related-h">
            <h2 id="related-h" className="mb-4 text-[19px] font-semibold tracking-tight">
              Related products
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((r) => (
                <ProductCard key={r.id} product={r} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
