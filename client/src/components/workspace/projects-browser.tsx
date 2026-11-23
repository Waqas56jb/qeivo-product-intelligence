"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FolderSearch, KanbanSquare, List } from "lucide-react";
import type { ResearchProject } from "@/types";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/states";
import { FilterBar, FilterChip, SearchField } from "@/components/common/controls";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { AvatarStack, CATEGORY_ICON, CATEGORY_LABEL, DueLabel, ProgressRing, ProjectCard, ProjectStatusBadge, STATUS_META, projectProgress } from "./project-bits";
import { NewProjectDialog } from "./new-project-dialog";
import { useWorkspaceStore, type LocalProject } from "./workspace-store";

const STATUSES: ResearchProject["status"][] = ["active", "in-review", "approved", "archived"];

function ProjectRow({ project }: { project: LocalProject }) {
  const Icon = CATEGORY_ICON[project.category];
  const prog = projectProgress(project);
  const inner = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-brand-soft text-brand-soft-foreground">
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[14px] font-semibold group-hover:text-brand-soft-foreground">{project.name}</p>
          {project.local && <Badge variant="outline">Draft · this session</Badge>}
        </div>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          {CATEGORY_LABEL[project.category]} · {project.quantity} units · {formatCurrency(project.budget, "US", { decimals: 0 })}
        </p>
      </div>
      <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 pl-[52px] md:w-auto md:flex-nowrap md:pl-0">
        <ProjectStatusBadge status={project.status} />
        <DueLabel iso={project.dueDate} status={project.status} className="md:w-40" />
        <AvatarStack ids={project.memberIds} max={3} className="hidden lg:flex" />
        <span className="flex items-center gap-2 text-[12px] text-muted-foreground tabular">
          <ProgressRing pct={prog.pct} size={32} />
          <span className="hidden sm:inline">
            {prog.done}/{prog.total}
          </span>
        </span>
      </div>
    </>
  );
  const cls = "group flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors md:flex-nowrap sm:px-5";
  return project.local ? (
    <li className={cls}>{inner}</li>
  ) : (
    <li>
      <Link href={routes.project(project.id)} className={cn(cls, "outline-none hover:bg-surface-2/60 focus-visible:bg-surface-2")}>
        {inner}
      </Link>
    </li>
  );
}

export function ProjectsBrowser() {
  const projects = useWorkspaceStore((s) => s.projects);
  const [status, setStatus] = useState<ResearchProject["status"] | "all">("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"board" | "list">("board");

  const searched = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return projects;
    return projects.filter((p) => `${p.name} ${p.description} ${CATEGORY_LABEL[p.category]}`.toLowerCase().includes(t));
  }, [projects, q]);
  const filtered = status === "all" ? searched : searched.filter((p) => p.status === status);
  const counts = Object.fromEntries(STATUSES.map((s) => [s, searched.filter((p) => p.status === s).length])) as Record<ResearchProject["status"], number>;
  const columns = status === "all" ? STATUSES : [status];

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow="Harbor Property Group"
        title="Research projects"
        description="Every procurement decision in one place: the brief, the shortlist, team discussion and approvals."
        actions={<NewProjectDialog />}
      />

      <FilterBar className="mb-5">
        <SearchField value={q} onChange={setQ} placeholder="Search projects…" className="w-full sm:w-72" />
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <FilterChip active={status === "all"} onClick={() => setStatus("all")} count={searched.length}>
            All
          </FilterChip>
          {STATUSES.map((s) => (
            <FilterChip key={s} active={status === s} onClick={() => setStatus(s)} count={counts[s]}>
              {STATUS_META[s].label}
            </FilterChip>
          ))}
        </div>
        <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as "board" | "list")} className="sm:ml-auto" aria-label="Layout">
          <ToggleGroupItem value="board" aria-label="Board view" className="h-9 px-3">
            <KanbanSquare /> Board
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view" className="h-9 px-3">
            <List /> List
          </ToggleGroupItem>
        </ToggleGroup>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderSearch}
          title="No projects match"
          description={q ? `Nothing matches “${q}”${status !== "all" ? ` in ${STATUS_META[status].label.toLowerCase()}` : ""}.` : "No projects with this status yet."}
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQ("");
                setStatus("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : view === "list" ? (
        <ul className="divide-y divide-border overflow-hidden rounded-[14px] border border-border bg-card shadow-xs">
          {filtered.map((p) => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </ul>
      ) : status !== "all" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="scrollbar-thin -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 xl:grid xl:grid-cols-4 xl:overflow-visible">
          {columns.map((s) => {
            const items = filtered.filter((p) => p.status === s);
            const M = STATUS_META[s];
            return (
              <section key={s} aria-label={M.label} className="flex w-[300px] shrink-0 snap-start flex-col gap-3 rounded-[16px] bg-surface-2/60 p-2.5 sm:w-[320px] xl:w-auto">
                <header className="flex items-center justify-between px-1.5 pt-1">
                  <span className="flex items-center gap-2 text-[13px] font-semibold">
                    <M.icon className="size-4 text-muted-foreground" /> {M.label}
                  </span>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-muted-foreground tabular">{items.length}</span>
                </header>
                {items.length ? (
                  items.map((p) => <ProjectCard key={p.id} project={p} className="h-auto" />)
                ) : (
                  <p className="rounded-[12px] border border-dashed border-border-strong px-3 py-6 text-center text-[12px] text-subtle-foreground">No projects</p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
