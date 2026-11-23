import type { Metadata } from "next";
import { Info } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { RecommendationWizard } from "@/components/recommendations/recommendation-wizard";

export const metadata: Metadata = {
  title: "Recommendations",
  description: "Answer a few questions and Qeivo ranks the products that genuinely fit your home, budget and priorities — with reasons and trade-offs.",
};

export default function RecommendationsPage() {
  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow="Personalised recommendations"
        title="Find what truly fits"
        description="Answer as much or as little as you like. The ranking updates with every change, using evidence only."
        actions={
          <p className="hidden max-w-xs items-start gap-2 text-[12px] leading-relaxed text-muted-foreground md:flex">
            <Info className="mt-0.5 size-3.5 shrink-0" /> Prefilled from your profile. Changes here don&apos;t overwrite your saved preferences.
          </p>
        }
      />
      <RecommendationWizard />
    </PageContainer>
  );
}
