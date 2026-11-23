import type { Metadata } from "next";
import { SupplierAnalyticsView } from "@/components/business/supplier/analytics-view";

export const metadata: Metadata = { title: "Analytics · Supplier" };

export default function SupplierAnalyticsPage() {
  return <SupplierAnalyticsView />;
}
