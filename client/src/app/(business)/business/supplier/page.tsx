import type { Metadata } from "next";
import { SupplierDashboardView } from "@/components/business/supplier/dashboard-view";

export const metadata: Metadata = { title: "Overview · Supplier" };

export default function SupplierHomePage() {
  return <SupplierDashboardView />;
}
