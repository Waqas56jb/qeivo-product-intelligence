import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/data/workspaces/projects";
import { ProjectDetail } from "@/components/workspace";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = getProject(id);
  return { title: project ? project.name : "Project not found" };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getProject(id)) notFound();
  return <ProjectDetail id={id} />;
}
