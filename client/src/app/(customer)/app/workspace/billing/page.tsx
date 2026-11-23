import type { Metadata } from "next";
import { OrgBilling } from "@/components/workspace";

export const metadata: Metadata = { title: "Organisation billing" };

export default function WorkspaceBillingPage() {
  return <OrgBilling />;
}
