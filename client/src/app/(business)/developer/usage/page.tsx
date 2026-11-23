import type { Metadata } from "next";
import { UsageDashboard } from "@/components/developer";

export const metadata: Metadata = { title: "API usage · Qeivo Developer" };

export default function ApiUsagePage() {
  return <UsageDashboard />;
}
