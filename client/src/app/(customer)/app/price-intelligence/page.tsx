import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { PriceIntelligenceView } from "@/components/price";

export const metadata: Metadata = { title: "Price intelligence", description: "Retailer offers, 52-week price history and price-drop alerts for the products you're researching." };

export default function PriceIntelligencePage() {
  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow="Price intelligence"
        title="Buy at the right price"
        description="Live retailer offers in your region, 52 weeks of price history and alerts when a watched product hits your target."
      />
      <PriceIntelligenceView />
    </PageContainer>
  );
}
