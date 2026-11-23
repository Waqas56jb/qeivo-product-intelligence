import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { BillingView } from "@/components/account/billing-view";

export const metadata: Metadata = { title: "Plan & billing" };

export default function BillingPage() {
  return (
    <PageContainer>
      <PageHeader eyebrow="Account" title="Plan & billing" description="Your subscription, usage, payment method and invoices." />
      <BillingView />
    </PageContainer>
  );
}
