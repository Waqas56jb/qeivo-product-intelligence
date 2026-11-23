"use client";

import Link from "next/link";
import { Archive, CalendarClock, CheckCircle2, CircleDashed, Clock3, FileClock, Laptop, Refrigerator, Tv, WashingMachine } from "lucide-react";
import type { CategorySlug, ResearchProject, WorkspaceMember } from "@/types";
import { routes } from "@/config/routes";
import { cn, DEMO_NOW } from "@/lib/utils";
import { formatCurrency, formatDate, formatRelative } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/primitives";
import { Hint } from "@/components/ui/tooltip";
import { useMemberLookup, type LocalProject } from "./workspace-store";

export const STATUS_META: Record<ResearchProject["status"], { label: string; variant: "brand" | "warning" | "success" | "default"; icon: typeof CircleDashed }> = {
  active: { label: "Researching", variant: "brand", icon: CircleDashed },
  "in-review": { label: "In review", variant: "warning", icon: FileClock },
  approved: { label: "Approved", variant: "success", icon: CheckCircle2 },
  archived: { label: "Archived", variant: "default", icon: Archive },
};

export const CATEGORY_ICON: Record<CategorySlug, typeof Refrigerator> = {
  refrigerators: Refrigerator,
  "washing-machines": WashingMachine,
  televisions: Tv,
  laptops: Laptop,
};

export const CATEGORY_LABEL: Record<CategorySlug, string> = {
  refrigerators: "Refrigerators",
  "washing-machines": "Washing machines",
  televisions: "Televisions",
  laptops: "Laptops",
};

export function ProjectStatusBadge({ status, className }: { status: ResearchProject["status"]; className?: string }) {
  const m = STATUS_META[status];
  return (
    <Badge variant={m.variant} className={className}>
      <m.icon /> {m.label}
    </Badge>
  );
}

/** Five research milestones — derived from the project record, never invented. */
export function projectMilestones(p: ResearchProject) {
  return [
    { label: "Brief & budget set", done: p.budget > 0 && p.quantity > 0 },
    { label: "Shortlist of 2+ products", done: p.productIds.length >= 2 },
    { label: "Team notes added", done: p.notes.length > 0 },
    { label: "Approval requested", done: p.approvals.length > 0 || p.status === "approved" || p.status === "archived" },
    { label: "All approvals in", done: p.status === "approved" || p.status === "archived" || (p.approvals.length > 0 && p.approvals.every((a) => a.decision === "approved")) },
  ];
}

export function projectProgress(p: ResearchProject) {
  const m = projectMilestones(p);
  const done = m.filter((x) => x.done).length;
  return { done, total: m.length, pct: Math.round((done / m.length) * 100) };
}

export function daysUntil(iso: string) {
  return Math.round((new Date(iso + "T23:59:59Z").getTime() - DEMO_NOW.getTime()) / 86_400_000);
}

export function DueLabel({ iso, status, className }: { iso: string; status: ResearchProject["status"]; className?: string }) {
  const d = daysUntil(iso);
  const closed = status === "approved" || status === "archived";
  const tone = closed ? "text-muted-foreground" : d < 0 ? "text-danger-foreground" : d <= 14 ? "text-warning-foreground" : "text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] tabular", tone, className)}>
      <CalendarClock className="size-3.5 shrink-0" />
      {closed ? `Due ${formatDate(iso, "d MMM")}` : d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? "Due today" : `Due in ${d}d · ${formatDate(iso, "d MMM")}`}
    </span>
  );
}

export function ProgressRing({ pct, size = 36, className }: { pct: number; size?: number; className?: string }) {
  const stroke = 3.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center", className)} style={{ width: size, height: size }} role="img" aria-label={`${pct}% of milestones complete`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--brand)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} />
      </svg>
      <span className="absolute text-[10px] font-semibold tabular">{pct}</span>
    </span>
  );
}

export function AvatarStack({ ids, max = 4, size = "size-7", className }: { ids: string[]; max?: number; size?: string; className?: string }) {
  const lookup = useMemberLookup();
  const members = ids.map(lookup).filter((m): m is WorkspaceMember => Boolean(m));
  const shown = members.slice(0, max);
  const rest = members.length - shown.length;
  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {shown.map((m) => (
        <Hint key={m.id} label={`${m.name} · ${m.role}`}>
          <span tabIndex={0} className="rounded-full ring-2 ring-card outline-none focus-visible:ring-ring">
            <UserAvatar src={m.avatar || undefined} name={m.name} className={size} />
          </span>
        </Hint>
      ))}
      {rest > 0 && <span className={cn("grid place-items-center rounded-full bg-surface-2 text-[11px] font-semibold text-muted-foreground ring-2 ring-card tabular", size)}>+{rest}</span>}
    </div>
  );
}

/** Grid card used on the workspace dashboard and projects board. */
export function ProjectCard({ project, className }: { project: LocalProject; className?: string }) {
  const Icon = CATEGORY_ICON[project.category];
  const prog = projectProgress(project);
  const pending = project.approvals.filter((a) => a.decision === "pending").length;
  const body = (
    <>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-brand-soft text-brand-soft-foreground">
          <Icon className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <ProjectStatusBadge status={project.status} />
            {project.local && <Badge variant="outline">Draft · this session</Badge>}
          </div>
          <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug group-hover:text-brand-soft-foreground">{project.name}</h3>
        </div>
        <ProgressRing pct={prog.pct} />
      </div>
      <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{project.description}</p>
      <dl className="grid grid-cols-3 gap-2 rounded-[10px] bg-surface-2/70 px-3 py-2.5">
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">Budget</dt>
          <dd className="mt-0.5 text-[13px] font-semibold tabular">{formatCurrency(project.budget, "US", { decimals: 0 })}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">Units</dt>
          <dd className="mt-0.5 text-[13px] font-semibold tabular">{project.quantity}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">Shortlist</dt>
          <dd className="mt-0.5 text-[13px] font-semibold tabular">{project.productIds.length}</dd>
        </div>
      </dl>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
        <AvatarStack ids={project.memberIds} />
        <div className="flex flex-col items-end gap-0.5">
          <DueLabel iso={project.dueDate} status={project.status} />
          {pending > 0 && <span className="text-[11px] font-medium text-warning-foreground">{pending} approval{pending > 1 ? "s" : ""} pending</span>}
        </div>
      </div>
    </>
  );
  const cls = cn("group flex h-full flex-col gap-3.5 rounded-[14px] border border-border bg-card p-4 shadow-xs transition-all sm:p-5", className);
  if (project.local)
    return (
      <article className={cls} aria-label={project.name}>
        {body}
        <p className="border-t border-border pt-3 text-[12px] text-subtle-foreground">Created locally in this demo session — add products from search to start the shortlist.</p>
      </article>
    );
  return (
    <Link href={routes.project(project.id)} className={cn(cls, "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/30 outline-none")}>
      {body}
    </Link>
  );
}

export interface FeedItem {
  id: string;
  memberId: string;
  action: string;
  date: string;
  project?: { id: string; name: string };
}

export function ActivityFeed({ items, className, showProject }: { items: FeedItem[]; className?: string; showProject?: boolean }) {
  const lookup = useMemberLookup();
  return (
    <ol className={cn("relative space-y-0", className)}>
      {items.map((it, i) => {
        const m = lookup(it.memberId);
        return (
          <li key={it.id} className="relative flex gap-3 pb-5 last:pb-0">
            {i < items.length - 1 && <span aria-hidden className="absolute left-[15px] top-9 bottom-1 w-px bg-border" />}
            <UserAvatar src={m?.avatar || undefined} name={m?.name ?? "Former member"} className="size-8 ring-2 ring-card" />
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[13px] leading-snug">
                <span className="font-semibold">{m?.name ?? "Former member"}</span> <span className="text-muted-foreground">{it.action}</span>
                {showProject && it.project && (
                  <>
                    <span className="text-muted-foreground"> in </span>
                    <Link href={routes.project(it.project.id)} className="font-medium text-foreground underline-offset-2 hover:text-brand-soft-foreground hover:underline">
                      {it.project.name}
                    </Link>
                  </>
                )}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[12px] text-subtle-foreground">
                <Clock3 className="size-3" />
                <time dateTime={it.date} title={formatDate(it.date, "d MMMM yyyy, HH:mm")}>{formatRelative(it.date)}</time>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Small "section card" header used across workspace pages. */
export function PanelHeader({ id, title, description, action, icon: Icon }: { id?: string; title: string; description?: string; action?: React.ReactNode; icon?: typeof Clock3 }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon && (
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[8px] bg-surface-2 text-muted-foreground">
            <Icon className="size-3.5" />
          </span>
        )}
        <div className="min-w-0">
          <h2 id={id} className="text-[15px] font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
