import type { Metadata } from "next";
import { ProjectsBrowser } from "@/components/workspace";

export const metadata: Metadata = { title: "Research projects" };

export default function ProjectsPage() {
  return <ProjectsBrowser />;
}
