import type { Metadata } from "next";
import { ManufacturerTeamView } from "@/components/business/manufacturer/team-reviews-videos";

export const metadata: Metadata = { title: "Team · Manufacturer" };

export default function Page() {
  return <ManufacturerTeamView />;
}
