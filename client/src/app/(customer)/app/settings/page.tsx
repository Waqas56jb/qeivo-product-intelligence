import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SettingsView } from "@/components/account/settings-view";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader eyebrow="Account" title="Settings" description="Security, regional preferences, notifications and appearance." />
      <SettingsView />
    </PageContainer>
  );
}
