import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { CommunityBrowser } from "@/components/community";

export const metadata: Metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow="Community"
        title="Questions & discussions"
        description="Real-world answers from owners, Qeivo experts and verified manufacturer teams — every reply labelled by who wrote it."
      />
      <CommunityBrowser />
    </PageContainer>
  );
}
