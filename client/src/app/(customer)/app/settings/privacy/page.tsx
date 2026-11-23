import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { PrivacyView } from "@/components/account/privacy-view";

export const metadata: Metadata = { title: "Privacy & data" };

export default function PrivacyPage() {
  return (
    <PageContainer>
      <PageHeader eyebrow="Account" title="Privacy & data" description="Decide what's visible, what personalises your scores, and take your data with you — or delete it." />
      <PrivacyView />
    </PageContainer>
  );
}
