import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/data/products";
import { PageContainer } from "@/components/layout/page";
import { ProductSubpageHeader } from "@/components/product-detail/product-subpage-header";
import { CompatibilityChecker } from "@/components/product-detail/compatibility-checker";
import { productStaticParams } from "@/components/product-detail/spec-utils";

export function generateStaticParams() {
  return productStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return { title: product ? `Compatibility · ${product.model}` : "Compatibility" };
}

export default async function CompatibilityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const laptop = product.category === "laptops";
  return (
    <PageContainer>
      <ProductSubpageHeader
        product={product}
        eyebrow="Will it fit?"
        title={laptop ? "Size & portability" : "Space compatibility check"}
        description={
          laptop
            ? `Footprint and weight of the ${product.model} for your desk and bag.`
            : `Compare the ${product.model} — including ventilation and door clearance — with your opening and delivery route. Anything we can't confirm is shown as unknown, never as a fit.`
        }
      />
      <CompatibilityChecker product={product} />
    </PageContainer>
  );
}
