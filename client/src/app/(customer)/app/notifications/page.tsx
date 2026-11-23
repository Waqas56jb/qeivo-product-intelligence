import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { NotificationsInbox } from "@/components/community";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <PageContainer size="wide">
      <PageHeader eyebrow="Inbox" title="Notifications" description="Price drops, product data changes, maintenance reminders and replies to your threads — newest first." />
      <NotificationsInbox />
    </PageContainer>
  );
}
