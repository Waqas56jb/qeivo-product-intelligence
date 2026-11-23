import type { Metadata } from "next";
import { CustomerDashboard } from "@/components/dashboard/customer-dashboard";

export const metadata: Metadata = { title: "Home" };

export default function CustomerHomePage() {
  return <CustomerDashboard />;
}
