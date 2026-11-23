import type { Metadata } from "next";
import { currentCreator } from "@/data/creators/creators";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { ProfileForm } from "@/components/business/creator/profile-form";

export const metadata: Metadata = { title: "Profile · Creator" };

export default function CreatorProfilePage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Creator workspace"
        title="Creator profile"
        description="Your public profile on Qeivo. Shoppers see it next to every video, review and guide you publish."
      />
      <ProfileForm creator={currentCreator} />
    </PageContainer>
  );
}
