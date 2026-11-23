import type { Metadata } from "next";
import { DeveloperOverview } from "@/components/developer";

export const metadata: Metadata = { title: "API overview · Qeivo Developer" };

export default function DeveloperPage() {
  return <DeveloperOverview />;
}
