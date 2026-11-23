import type { Metadata } from "next";
import { ManufacturerVideosView } from "@/components/business/manufacturer/team-reviews-videos";

export const metadata: Metadata = { title: "Videos · Manufacturer" };

export default function Page() {
  return <ManufacturerVideosView />;
}
