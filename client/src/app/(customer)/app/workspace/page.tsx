import type { Metadata } from "next";
import { WorkspaceOverview } from "@/components/workspace";

export const metadata: Metadata = { title: "Workspace", description: "Harbor Property Group team workspace — projects, approvals and shared research." };

export default function WorkspacePage() {
  return <WorkspaceOverview />;
}
