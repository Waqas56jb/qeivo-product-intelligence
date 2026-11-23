import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Clock, Eye } from "lucide-react";
import { getProduct } from "@/data/products";
import { getCategory } from "@/data/products/categories";
import { getVideo, videos } from "@/data/videos";
import { guidesForProduct } from "@/data/guides";
import { routes } from "@/config/routes";
import { formatDate } from "@/lib/format";
import { compactNumber } from "@/lib/utils";
import { PageContainer, Breadcrumbs } from "@/components/layout/page";
import { SectionHeading } from "@/components/common/display";
import { Reveal } from "@/components/common/reveal";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { GuideCard } from "@/components/guides";
import { CreatorCard, VideoCard, VideoClassification, VideoKindBadge, VideoSourceBadge, VideoWatch, videoCreator } from "@/components/video";

export function generateStaticParams() {
  return videos.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = getVideo(slug);
  return v ? { title: v.title, description: v.description } : { title: "Video not found" };
}

export default async function VideoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const video = getVideo(slug);
  if (!video) notFound();

  const creator = videoCreator(video);
  const category = getCategory(video.category);
  const products = video.productIds.map((id) => getProduct(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const sharesProduct = videos.filter((v) => v.id !== video.id && v.productIds.some((id) => video.productIds.includes(id)));
  const sameCategory = videos.filter((v) => v.id !== video.id && v.category === video.category && !sharesProduct.includes(v)).sort((a, b) => b.views - a.views);
  const related = [...sharesProduct, ...sameCategory].slice(0, 6);
  const guide = video.productIds.flatMap((id) => guidesForProduct(id))[0];

  const header = (
      <div key="video-header">
        <div className="flex flex-wrap items-center gap-2">
          <VideoKindBadge kind={video.kind} />
          <VideoSourceBadge video={video} />
        </div>
        <h1 className="mt-3 text-balance text-[24px] font-semibold leading-tight tracking-tight sm:text-[30px]">{video.title}</h1>
        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-muted-foreground">
          <div className="inline-flex items-center gap-1.5">
            <Eye className="size-4 text-subtle-foreground" />
            <dt className="sr-only">Views</dt>
            <dd className="tabular">{compactNumber(video.views)} views</dd>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4 text-subtle-foreground" />
            <dt className="sr-only">Published</dt>
            <dd>
              <time dateTime={video.publishedAt}>{formatDate(video.publishedAt, "d MMMM yyyy")}</time>
            </dd>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <Clock className="size-4 text-subtle-foreground" />
            <dt className="sr-only">Duration</dt>
            <dd className="tabular">{video.duration}</dd>
          </div>
        </dl>
      </div>
  );

  const details = (
    <div key="video-details" className="space-y-6">
      <p className="text-[15px] leading-relaxed text-foreground/85 sm:text-[16px]">{video.description}</p>
      <VideoClassification video={video} />
      {creator && <CreatorCard creator={creator} />}
    </div>
  );

  return (
    <>
      <PageContainer className="pb-14 pt-6 sm:pt-8">
        <Breadcrumbs items={[{ label: "Videos", href: routes.videos }, { label: category.name, href: routes.category(category.slug) }, { label: video.title }]} className="mb-5" />
        <VideoWatch video={video} header={header} details={details} />
      </PageContainer>

      {products.length > 0 && (
        <section className="border-t border-border bg-surface py-14 lg:py-20">
          <PageContainer>
            <Reveal>
              <SectionHeading
                eyebrow="Featured in this video"
                title={products.length === 1 ? "The product in this video" : `The ${products.length} products in this video`}
                description="Video claims feed into product analysis only after they are classified — manufacturer demos never count as verified evidence."
                action={
                  guide ? (
                    <Button asChild variant="outline">
                      <Link href={routes.guide(guide.slug)}>
                        Read the buying guide <ArrowRight />
                      </Link>
                    </Button>
                  ) : undefined
                }
                className="mb-8"
              />
            </Reveal>
            {products.length <= 2 ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} variant="list" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </PageContainer>
        </section>
      )}

      {related.length > 0 && (
        <section className="py-14 lg:py-20">
          <PageContainer>
            <Reveal>
              <SectionHeading
                eyebrow="Up next"
                title="Related videos"
                action={
                  <Button asChild variant="outline">
                    <Link href={routes.videos}>
                      Video library <ArrowRight />
                    </Link>
                  </Button>
                }
                className="mb-8"
              />
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </PageContainer>
        </section>
      )}

      {guide && products.length === 0 && (
        <PageContainer className="pb-16">
          <GuideCard guide={guide} variant="compact" />
        </PageContainer>
      )}
    </>
  );
}
