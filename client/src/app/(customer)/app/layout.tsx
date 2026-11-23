import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · Qeivo" } };

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
