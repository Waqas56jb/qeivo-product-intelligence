"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { ArrowRight, Building2, CheckCircle2, FolderKanban, GitCompareArrows, Hourglass, Inbox, ListChecks, UserPlus, Users, Wallet } from "lucide-react";
import { routes } from "@/config/routes";
import { currentWorkspace } from "@/data/workspaces/workspaces";
import { savedComparisons } from "@/data/research/comparisons";
import { getProduct } from "@/data/products";
import { cn, DEMO_NOW } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress, UserAvatar } from "@/components/ui/primitives";
import { Hint } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/common/states";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { ActivityFeed, PanelHeader, ProjectCard, type FeedItem } from "./project-bits";
import { ApprovalItem } from "./approvals";
import { NewProjectDialog } from "./new-project-dialog";
import { useWorkspaceStore } from "./workspace-store";

function QuickStat({ icon: Icon, label, value, hint, tone = "default" }: { icon: typeof Inbox; label: string; value: React.ReactNode; hint: string; tone?: "default" | "warning" }) {
  return (
    <div className="flex items-start gap-3 rounded-[14px] border border-border bg-card p-4 shadow-xs">
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-[10px]", tone === "warning" ? "bg-warning-soft text-warning-foreground" : "bg-surface-2 text-muted-foreground")}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-[22px] font-semibold leading-tight tracking-tight tabular">{value}</p>
        <p className="mt-0.5 truncate text-[12px] text-subtle-foreground">{hint}</p>
      </div>
    </div>
  );
}

export function WorkspaceOverview() {
  const router = useRouter();
  const projects = useWorkspaceStore((s) => s.projects);
  const members = useWorkspaceStore((s) => s.members);
  const setCompare = useAppStore((s) => s.setCompare);
  const ws = currentWorkspace;

  const live = projects.filter((p) => p.status !== "archived");
  const active = [...live].sort((a, b) => (a.status === "approved" ? 1 : 0) - (b.status === "approved" ? 1 : 0) || a.dueDate.localeCompare(b.dueDate));
  const pending = projects.flatMap((p) => p.approvals.filter((a) => a.decision === "pending").map((a) => ({ project: p, approval: a })));
  const budgetInFlight = live.filter((p) => p.status !== "approved").reduce((s, p) => s + p.budget, 0);
  const shortlisted = new Set(live.flatMap((p) => p.productIds)).size;
  const seatsUsed = members.length;

  const feed: FeedItem[] = useMemo(
    () =>
      projects
        .flatMap((p) => p.activity.map((a) => ({ ...a, project: { id: p.id, name: p.name } })))
        .filter((a) => !a.project.id.startsWith("prj-local"))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 7),
    [projects],
  );

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow="Team workspace"
        title="Workspace overview"
        description="Shared research, approvals and activity across Harbor Property Group’s procurement projects."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={routes.workspaceMembers}>
                <UserPlus /> Invite
              </Link>
            </Button>
            <NewProjectDialog onCreated={() => router.push(routes.projects)} />
          </>
        }
      />

      {/* Organisation card */}
      <section aria-label="Organisation" className="relative overflow-hidden rounded-[20px] border border-border bg-card shadow-xs">
        <div aria-hidden className="surface-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(90deg,transparent,black_60%)]" />
        <div className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="flex min-w-0 items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-[16px] bg-navy-sheen text-[18px] font-semibold tracking-tight text-white shadow-sm">{ws.logo}</span>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[20px] font-semibold tracking-tight">{ws.name}</h2>
                <Badge variant="brand">{ws.plan} plan</Badge>
              </div>
              <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Building2 className="size-3.5" /> {ws.industry}
              </p>
              <p className="max-w-xl text-[13px] leading-relaxed text-muted-foreground">{ws.description}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[14px] border border-border bg-surface/80 p-4 backdrop-blur">
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] font-medium text-muted-foreground">Seats</span>
                <span className="text-[13px] font-semibold tabular">
                  {seatsUsed} <span className="font-normal text-subtle-foreground">/ {ws.seats}</span>
                </span>
              </div>
              <Progress value={(seatsUsed / ws.seats) * 100} className="mt-2.5" aria-label="Seats used" />
              <p className="mt-2 text-[12px] text-subtle-foreground">{Math.max(0, ws.seats - seatsUsed)} seats available</p>
            </div>
            <div className="rounded-[14px] border border-border bg-surface/80 p-4 backdrop-blur">
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] font-medium text-muted-foreground">Team</span>
                <Link href={routes.workspaceMembers} className="text-[12px] font-medium text-brand-soft-foreground hover:underline">
                  Manage
                </Link>
              </div>
              <div className="mt-2.5 flex -space-x-2">
                {members.slice(0, 6).map((m) => (
                  <Hint key={m.id} label={`${m.name} · ${m.role}`}>
                    <span tabIndex={0} className="rounded-full ring-2 ring-card outline-none">
                      <UserAvatar src={m.avatar || undefined} name={m.name} className="size-8" />
                    </span>
                  </Hint>
                ))}
                {members.length > 6 && <span className="grid size-8 place-items-center rounded-full bg-surface-2 text-[11px] font-semibold text-muted-foreground ring-2 ring-card tabular">+{members.length - 6}</span>}
              </div>
              <p className="mt-2 text-[12px] text-subtle-foreground">{members.filter((m) => m.role === "Approver").length} approvers · {members.filter((m) => m.role === "Researcher").length} researchers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
        <QuickStat icon={FolderKanban} label="Open projects" value={live.length} hint={`${projects.filter((p) => p.status === "archived").length} archived`} />
        <QuickStat icon={Hourglass} label="Pending approvals" value={pending.length} hint={pending.length ? "Waiting on a decision" : "Nothing waiting"} tone={pending.length ? "warning" : "default"} />
        <QuickStat icon={ListChecks} label="Products shortlisted" value={shortlisted} hint="Across open projects" />
        <QuickStat icon={Wallet} label="Budget in research" value={formatCurrency(budgetInFlight, "US", { decimals: 0 })} hint="Not yet approved" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          {/* Active projects */}
          <section aria-labelledby="active-projects">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 id="active-projects" className="text-[18px] font-semibold tracking-tight">Active projects</h2>
                <p className="text-[13px] text-muted-foreground">Progress is based on five research milestones.</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-10 sm:h-8">
                <Link href={routes.projects}>
                  All projects <ArrowRight />
                </Link>
              </Button>
            </div>
            {active.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {active.slice(0, 4).map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            ) : (
              <EmptyState icon={FolderKanban} title="No open projects" description="Start a project to share a shortlist with your team." action={<NewProjectDialog />} />
            )}
          </section>

          {/* Shared research */}
          <section aria-labelledby="shared-research" className="rounded-[14px] border border-border bg-card shadow-xs">
            <PanelHeader id="shared-research" icon={GitCompareArrows} title="Shared research" description="Comparisons team members have shared to the workspace" />
            <ul className="divide-y divide-border">
              {savedComparisons.slice(0, 4).map((c) => {
                const ps = c.productIds.map((id) => getProduct(id)).filter((p) => p !== undefined);
                return (
                  <li key={c.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                    <div className="flex shrink-0 -space-x-3">
                      {ps.slice(0, 3).map((p) => (
                        <ImageWithFallback key={p.id} src={p.images[0]} alt="" aspect="size-11 rounded-[10px] border-2 border-card bg-surface-2" sizes="44px" className="p-1" />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold">{c.name}</p>
                      <p className="line-clamp-1 text-[12px] text-muted-foreground">{c.verdict}</p>
                      <p className="mt-1 text-[11px] text-subtle-foreground">
                        {ps.length} products · shared by Alex Morgan · {formatDate(c.createdAt, "d MMM")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 shrink-0 self-start sm:h-8 sm:self-center"
                      onClick={() => {
                        setCompare(c.productIds);
                        toast.success("Loaded into compare", { description: c.name });
                        router.push(routes.compare);
                      }}
                    >
                      Open in compare
                    </Button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          {/* Pending approvals */}
          <section aria-labelledby="pending-approvals" className="rounded-[14px] border border-border bg-card shadow-xs">
            <PanelHeader id="pending-approvals"
              icon={CheckCircle2}
              title="Pending approvals"
              description="Decisions recorded here update the project instantly"
              action={pending.length ? <Badge variant="warning" className="tabular">{pending.length} waiting</Badge> : undefined}
            />
            <div className="divide-y divide-border px-4 py-4 sm:px-5">
              {pending.length ? (
                pending.map(({ project, approval }) => <ApprovalItem key={approval.id} project={project} approval={approval} showProject />)
              ) : (
                <div className="flex items-center gap-3 py-2 text-[13px] text-muted-foreground">
                  <span className="grid size-9 place-items-center rounded-full bg-success-soft text-success">
                    <CheckCircle2 className="size-4" />
                  </span>
                  All caught up — no approvals are waiting.
                </div>
              )}
            </div>
          </section>

          {/* Team strip */}
          <section aria-labelledby="team-strip" className="rounded-[14px] border border-border bg-card shadow-xs">
            <PanelHeader id="team-strip"
              icon={Users}
              title="Team members"
              action={
                <Link href={routes.workspaceMembers} className="inline-flex min-h-8 items-center text-[12px] font-medium text-brand-soft-foreground hover:underline">
                  View all
                </Link>
              }
            />
            <ul className="scrollbar-none flex gap-3 overflow-x-auto px-4 py-4 sm:px-5">
              {[...members]
                .filter((m) => m.lastActive)
                .sort((a, b) => b.lastActive.localeCompare(a.lastActive))
                .map((m) => (
                  <li key={m.id} className="flex w-[84px] shrink-0 flex-col items-center gap-1.5 text-center">
                    <span className="relative">
                      <UserAvatar src={m.avatar || undefined} name={m.name} className="size-12" />
                      {DEMO_NOW.getTime() - new Date(m.lastActive).getTime() < 86_400_000 && <span className="absolute bottom-0 right-0 size-3 rounded-full bg-success ring-2 ring-card" aria-label="Active today" />}
                    </span>
                    <span className="w-full truncate text-[12px] font-medium">{m.name.split(" ")[0]}</span>
                    <span className="w-full truncate text-[11px] text-subtle-foreground">{m.role}</span>
                  </li>
                ))}
            </ul>
          </section>

          {/* Activity */}
          <section aria-labelledby="recent-activity" className="rounded-[14px] border border-border bg-card shadow-xs">
            <PanelHeader id="recent-activity" icon={Inbox} title="Recent activity" />
            <div className="px-4 py-4 sm:px-5">
              <ActivityFeed items={feed} showProject />
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
