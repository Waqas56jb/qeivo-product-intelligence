import type { Metadata } from "next";
import { ManufacturerInsightsView } from "@/components/business/manufacturer/insights-view";

export const metadata: Metadata = { title: "Insights · Manufacturer" };

export default function Page() {
  return <ManufacturerInsightsView />;
}
