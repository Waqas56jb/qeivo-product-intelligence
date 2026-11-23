import type { Metadata } from "next";
import { ManufacturerDashboardView } from "@/components/business/manufacturer/dashboard-view";

export const metadata: Metadata = { title: "Overview · Manufacturer" };

export default function Page() {
  return <ManufacturerDashboardView />;
}
