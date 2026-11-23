import type { Metadata } from "next";
import { ManufacturerReviewsView } from "@/components/business/manufacturer/team-reviews-videos";

export const metadata: Metadata = { title: "Reviews · Manufacturer" };

export default function Page() {
  return <ManufacturerReviewsView />;
}
