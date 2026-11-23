import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { LoadingSkeleton } from "@/components/common/states";
import { Catalog } from "@/components/product-detail/catalog";

export const metadata: Metadata = { title: "Explore products" };

export default function ProductsPage() {
  return (
    <PageContainer size="wide">
      <PageHeader title="Explore products" description="Every product is scored on evidence. Filter by what fits your home, then compare the ones that matter." />
      <Suspense fallback={<LoadingSkeleton count={6} />}>
        <Catalog />
      </Suspense>
    </PageContainer>
  );
}
