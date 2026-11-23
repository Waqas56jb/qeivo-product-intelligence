import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { ComparisonWorkspace } from "@/components/comparison/comparison-workspace";
import { HideCompareTray } from "@/components/product-detail/hide-compare-tray";

export const metadata: Metadata = { title: "Compare products" };

export default function ComparePage() {
  return (
    <PageContainer size="wide">
      <HideCompareTray scope="all" />
      <PageHeader
        eyebrow="Research"
        title="Compare products"
        description="Normalised specifications side by side, with the best value in each row highlighted. Suitability and evidence coverage are always shown as separate measures."
      />
      <ComparisonWorkspace />
    </PageContainer>
  );
}
