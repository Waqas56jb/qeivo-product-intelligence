import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { CreatorAnalytics } from "@/components/business/creator/creator-analytics";

export const metadata: Metadata = { title: "Analytics · Creator" };

export default function CreatorAnalyticsPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Creator workspace"
        title="Analytics"
        description="Audience and content performance for your content on Qeivo. Weekly data, ending the week of 16 November 2026."
      />
      <CreatorAnalytics />
    </PageContainer>
  );
}
