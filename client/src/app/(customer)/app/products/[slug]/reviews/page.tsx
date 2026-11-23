import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/data/products";
import { ratingDistribution, reviewsForProduct, sentimentSummary } from "@/data/reviews";
import { videosForProduct } from "@/data/videos";
import { PageContainer } from "@/components/layout/page";
import { ProductSubpageHeader } from "@/components/product-detail/product-subpage-header";
import { productStaticParams } from "@/components/product-detail/spec-utils";
import { ReviewsExplorer } from "@/components/reviews";

export function generateStaticParams() {
  return productStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return { title: product ? `${product.model} reviews` : "Reviews" };
}

export default async function ProductReviewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product || product.slug !== slug) notFound();

  const reviews = reviewsForProduct(product.id);
  const videos = videosForProduct(product.id).filter((v) => v.kind === "independent");

  return (
    <PageContainer>
      <ProductSubpageHeader
        product={product}
        eyebrow="Owner reviews"
        title={`What owners say about the ${product.model}`}
        description="Ratings, written reviews and recurring themes from people who live with it — classified as customer opinion, with manufacturer responses clearly separated."
      />
      <ReviewsExplorer product={product} reviews={reviews} buckets={ratingDistribution(product.id)} sentiment={sentimentSummary(product.id)} videos={videos} />
    </PageContainer>
  );
}
