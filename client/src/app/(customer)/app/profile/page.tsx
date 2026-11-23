import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { ProfileView } from "@/components/account/profile-view";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <PageContainer>
      <PageHeader eyebrow="Account" title="Your profile" description="Personal details and the home, budget and research preferences that personalise every suitability score." />
      <ProfileView />
    </PageContainer>
  );
}
