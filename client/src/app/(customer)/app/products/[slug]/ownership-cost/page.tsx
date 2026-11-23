import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/data/products";
import { PageContainer } from "@/components/layout/page";
import { ProductSubpageHeader } from "@/components/product-detail/product-subpage-header";
import { OwnershipCalculator } from "@/components/product-detail/ownership-calculator";
import { productStaticParams } from "@/components/product-detail/spec-utils";

export function generateStaticParams() {
  return productStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return { title: product ? `Ownership cost · ${product.model}` : "Ownership cost" };
}

export default async function OwnershipCostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return (
    <PageContainer>
      <ProductSubpageHeader
        product={product}
        eyebrow="Total cost of ownership"
        title="What it really costs to own"
        description={`Purchase price is only part of the story. Adjust the assumptions to project energy, maintenance and accessories for the ${product.model} over the years you plan to keep it.`}
      />
      <OwnershipCalculator product={product} />
    </PageContainer>
  );
}
