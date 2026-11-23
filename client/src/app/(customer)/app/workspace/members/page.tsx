import type { Metadata } from "next";
import { MembersManager } from "@/components/workspace";

export const metadata: Metadata = { title: "Members & roles" };

export default function MembersPage() {
  return <MembersManager />;
}
