"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Camera, Check, CircleDashed, GitCompareArrows, History, MessageSquare, NotebookPen, Package, Send } from "lucide-react";
import type { Product, ResearchProject } from "@/types";
import { routes } from "@/config/routes";
import { getProject } from "@/data/workspaces/projects";
import { getProduct } from "@/data/products";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatRelative } from "@/lib/format";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress, UserAvatar } from "@/components/ui/primitives";
import { EmptyState } from "@/components/common/states";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { ProductCard } from "@/components/product/product-card";
import { EvidenceCoverage, ScorePill } from "@/components/analysis/score";
import { ActivityFeed, AvatarStack, CATEGORY_LABEL, DueLabel, PanelHeader, ProjectStatusBadge, projectMilestones, projectProgress } from "./project-bits";
import { ApprovalPanel } from "./approvals";
import { useMemberLookup, useProject, useWorkspaceStore } from "./workspace-store";

const usd = (v: number) => formatCurrency(v, "US", { decimals: 0 });

function Fact({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-[12px] border border-border bg-card px-4 py-3">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">{label}</dt>
      <dd className="mt-1 truncate text-[17px] font-semibold tracking-tight tabular">{value}</dd>
      {sub && <dd className="mt-0.5 truncate text-[12px] text-muted-foreground">{sub}</dd>}
    </div>
  );
}

function snapshotDate(id: string, fallback: string) {
  const m = /-(\d{2})(\d{2})$/.exec(id);
  return m ? `2026-${m[1]}-${m[2]}T09:00:00Z` : fallback;
}

/** Mini side-by-side table. Suitability and evidence coverage are separate rows — never combined. */
function MiniComparison({ products }: { products: Product[] }) {
  const rows: { label: string; render: (p: Product) => React.ReactNode }[] = [
    { label: "Price", render: (p) => <span className="font-semibold tabular">{usd(p.price)}</span> },
    { label: "Suitability", render: (p) => <ScorePill score={p.suitabilityScore} /> },
    { label: "Evidence coverage", render: (p) => <EvidenceCoverage coverage={p.evidenceCoverage} variant="pill" /> },
    { label: p0Label(products), render: (p) => <span className="tabular">{p.capacity.value} {p.capacity.unit}</span> },
    { label: "Energy use", render: (p) => <span className="tabular">{p.energy.annualKwh} kWh/yr</span> },
    { label: "Warranty", render: (p) => <span>{p.warranty.years} yr{p.warranty.extended ? ` + ${p.warranty.extended}` : ""}</span> },
    { label: "Width", render: (p) => <span className="tabular">{p.dimensions.widthMm} mm</span> },
  ];
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full min-w-[520px] text-[13px]">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="w-36 py-2.5 pr-3 text-left text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">Spec</th>
            {products.map((p) => (
              <th key={p.id} scope="col" className="px-3 py-2.5 text-left align-bottom">
                <span className="block text-[11px] font-medium text-subtle-foreground">{p.name.split(" ")[0]}</span>
                <span className="block text-[13px] font-semibold leading-tight">{p.model}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-border last:border-0">
              <th scope="row" className="py-2.5 pr-3 text-left text-[12px] font-medium text-muted-foreground">{r.label}</th>
              {products.map((p) => (
                <td key={p.id} className="whitespace-nowrap px-3 py-2.5">
                  {r.render(p)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function p0Label(products: Product[]) {
  return products[0]?.capacity.label ?? "Capacity";
}

function NoteComposer({ placeholder, cta, onSubmit, id }: { placeholder: string; cta: string; onSubmit: (v: string) => void; id: string }) {
  const [v, setV] = useState("");
  const [err, setErr] = useState(false);
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (v.trim().length < 3) {
          setErr(true);
          return;
        }
        onSubmit(v.trim());
        setV("");
        setErr(false);
      }}
    >
      <label htmlFor={id} className="sr-only">
        {cta}
      </label>
      <Textarea id={id} value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} className="min-h-20" maxLength={600} aria-invalid={err} aria-describedby={`${id}-help`} />
      <div className="flex items-center justify-between gap-3">
        <p id={`${id}-help`} className={cn("text-[12px]", err ? "text-danger-foreground" : "text-subtle-foreground")}>
          {err ? "Write at least a few words first." : `${v.length}/600 · visible to the project team`}
        </p>
        <Button type="submit" size="sm" variant="brand" className="h-10 sm:h-9">
          <Send /> {cta}
        </Button>
      </div>
    </form>
  );
}

export function ProjectDetail({ id }: { id: string }) {
  const router = useRouter();
  const live = useProject(id);
  const project = (live ?? getProject(id)) as ResearchProject;
  const addNote = useWorkspaceStore((s) => s.addNote);
  const addComment = useWorkspaceStore((s) => s.addComment);
  const lookup = useMemberLookup();
  const setCompare = useAppStore((s) => s.setCompare);

  const products = project.productIds.map((pid) => getProduct(pid)).filter((p): p is Product => Boolean(p));
  const perUnit = project.budget / project.quantity;
  const cheapest = products.length ? Math.min(...products.map((p) => p.price)) : 0;
  const prog = projectProgress(project);
  const owner = lookup(project.owner);
  const snapshots = project.snapshotIds.map((sid, i) => ({ id: sid, date: snapshotDate(sid, project.updatedAt), products, index: i + 1 }));

  const openInCompare = (ids: string[], label: string) => {
    setCompare(ids);
    toast.success("Loaded into compare", { description: label });
    router.push(routes.compare);
  };

  const notesMentioning = (p: Product) => project.notes.filter((n) => n.body.includes(p.model) || n.body.includes(p.model.split(" ").slice(-1)[0])).length;

  return (
    <PageContainer size="wide">
      <PageHeader
        crumbs={[
          { label: "Home", href: routes.app },
          { label: "Workspace", href: routes.workspace },
          { label: "Projects", href: routes.projects },
          { label: project.name },
        ]}
        eyebrow={
          <span className="flex flex-wrap items-center gap-2 normal-case tracking-normal">
            <ProjectStatusBadge status={project.status} />
            <span className="text-[12px] font-medium text-muted-foreground">{CATEGORY_LABEL[project.category]}</span>
          </span>
        }
        title={project.name}
        description={project.description}
        actions={
          <>
            <Button asChild variant="ghost" className="h-11 sm:h-10">
              <Link href={routes.projects}>
                <ArrowLeft /> All projects
              </Link>
            </Button>
            {products.length >= 2 && (
              <Button variant="brand" className="h-11 sm:h-10" onClick={() => openInCompare(project.productIds, project.name)}>
                <GitCompareArrows /> Compare shortlist
              </Button>
            )}
          </>
        }
      />

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Fact label="Budget" value={usd(project.budget)} sub={`${usd(perUnit)} per unit`} />
        <Fact label="Quantity" value={`${project.quantity} units`} sub={products.length ? `From ${usd(cheapest * project.quantity)} at list price` : "No shortlist yet"} />
        <Fact label="Due" value={formatDate(project.dueDate, "d MMM yyyy")} sub={<DueLabel iso={project.dueDate} status={project.status} />} />
        <Fact
          label="Owner"
          value={
            <span className="flex items-center gap-2">
              <UserAvatar src={owner?.avatar || undefined} name={owner?.name ?? "Owner"} className="size-6" />
              <span className="truncate text-[15px]">{owner?.name}</span>
            </span>
          }
          sub={<AvatarStack ids={project.memberIds} max={5} size="size-5" className="mt-1" />}
        />
        <div className="col-span-2 min-w-0 rounded-[12px] border border-border bg-card px-4 py-3 lg:col-span-1">
          <dt className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">
            Progress <span className="tabular normal-case tracking-normal text-muted-foreground">{prog.done}/{prog.total}</span>
          </dt>
          <dd className="mt-2.5">
            <Progress value={prog.pct} aria-label="Milestones complete" />
          </dd>
          <dd className="mt-2 truncate text-[12px] text-muted-foreground">{projectMilestones(project).find((m) => !m.done)?.label ?? "All milestones complete"}</dd>
        </div>
      </dl>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          {/* Shortlist */}
          <section aria-labelledby="shortlist" className="rounded-[14px] border border-border bg-card shadow-xs">
            <PanelHeader id="shortlist" icon={Package} title="Shared product research" description={`${products.length} products on the shortlist · prices shown at list, before bulk quotes`} />
            {products.length ? (
              <ul className="grid gap-3 p-4 sm:p-5 md:grid-cols-2">
                {products.map((p) => {
                  const total = p.price * project.quantity;
                  const over = total > project.budget;
                  const mentions = notesMentioning(p);
                  return (
                    <li key={p.id} className="flex flex-col gap-2 rounded-[16px] bg-surface-2/50 p-1.5">
                      <ProductCard product={p} variant="compact" />
                      <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1 text-[12px]">
                        <span className="tabular text-muted-foreground">
                          × {project.quantity} = <span className={cn("font-semibold", over ? "text-danger-foreground" : "text-foreground")}>{usd(total)}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          {over ? <Badge variant="danger">{usd(total - project.budget)} over budget</Badge> : <Badge variant="success">Within budget</Badge>}
                          {mentions > 0 && (
                            <Badge variant="outline">
                              <NotebookPen /> {mentions} note{mentions > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-4 sm:p-5">
                <EmptyState compact icon={Package} title="No products yet" description="Add products from search or any product page to start the shortlist." action={<Button asChild variant="outline"><Link href={routes.products}>Browse products</Link></Button>} />
              </div>
            )}
          </section>

          {/* Snapshots */}
          <section aria-labelledby="snapshots" className="rounded-[14px] border border-border bg-card shadow-xs">
            <PanelHeader id="snapshots" icon={Camera} title="Comparison snapshots" description="Frozen views of the shortlist the team discussed" />
            <div className="space-y-5 p-4 sm:p-5">
              {snapshots.length && products.length ? (
                snapshots
                  .slice()
                  .reverse()
                  .map((s) => (
                    <article key={s.id} className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-[14px] font-semibold">Snapshot {s.index} · {formatDate(s.date, "d MMM yyyy")}</h3>
                          <p className="text-[12px] text-muted-foreground">{s.products.length} products · list prices at time of snapshot</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-10 sm:h-8" onClick={() => openInCompare(s.products.map((p) => p.id), `Snapshot ${s.index} — ${project.name}`)}>
                          <GitCompareArrows /> Open in compare
                        </Button>
                      </div>
                      <MiniComparison products={s.products} />
                    </article>
                  ))
              ) : (
                <EmptyState
                  compact
                  icon={Camera}
                  title="No snapshots yet"
                  description="Snapshots are saved when the shortlist is sent for approval."
                  action={
                    products.length >= 2 ? (
                      <Button variant="outline" onClick={() => openInCompare(project.productIds, project.name)}>
                        Compare current shortlist
                      </Button>
                    ) : undefined
                  }
                />
              )}
            </div>
          </section>

          {/* Notes */}
          <section aria-labelledby="notes" className="rounded-[14px] border border-border bg-card shadow-xs">
            <PanelHeader id="notes" icon={NotebookPen} title="Research notes" description="Measurements, quotes and findings the team has recorded" />
            <div className="space-y-4 p-4 sm:p-5">
              {project.notes.length ? (
                <ul className="space-y-3">
                  {project.notes.map((n) => (
                    <li key={n.id} className="rounded-[12px] border-l-2 border-brand bg-surface-2/60 px-4 py-3">
                      <p className="text-[14px] leading-relaxed">{n.body}</p>
                      <p className="mt-1.5 text-[12px] text-muted-foreground">
                        {n.author} · <time dateTime={n.date}>{formatDate(n.date, "d MMM, HH:mm")}</time>
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-muted-foreground">No notes yet.</p>
              )}
              <NoteComposer
                id="new-note"
                placeholder="Add a measurement, quote or finding…"
                cta="Add note"
                onSubmit={(v) => {
                  addNote(project.id, v);
                  toast.success("Note added", { description: "Saved in this demo session only." });
                }}
              />
            </div>
          </section>

          {/* Comments */}
          <section aria-labelledby="comments" className="rounded-[14px] border border-border bg-card shadow-xs">
            <PanelHeader id="comments" icon={MessageSquare} title="Team discussion" description={`${project.comments.length} comment${project.comments.length === 1 ? "" : "s"}`} />
            <div className="space-y-5 p-4 sm:p-5">
              <ul className="space-y-4">
                {project.comments.map((c) => {
                  const m = lookup(c.memberId);
                  return (
                    <li key={c.id} className="flex gap-3">
                      <UserAvatar src={m?.avatar || undefined} name={m?.name ?? "Former member"} className="size-9" />
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
                          <span className="font-semibold">{m?.name ?? "Former member"}</span>
                          <span className="text-[12px] text-subtle-foreground">{m?.role} · {formatRelative(c.date)}</span>
                        </p>
                        <p className="mt-1 rounded-[12px] rounded-tl-[4px] bg-surface-2/70 px-3.5 py-2.5 text-[14px] leading-relaxed">{c.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="flex gap-3">
                <UserAvatar src={lookup("wm-alex")?.avatar} name="Alex Morgan" className="hidden size-9 sm:flex" />
                <div className="flex-1">
                  <NoteComposer
                    id="new-comment"
                    placeholder="Reply to the team…"
                    cta="Comment"
                    onSubmit={(v) => {
                      addComment(project.id, v);
                      toast.success("Comment posted", { description: "Visible in this demo session — no one was notified." });
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-6">
          <ApprovalPanel project={project} />

          <section aria-labelledby="milestones" className="rounded-[14px] border border-border bg-card shadow-xs">
            <PanelHeader id="milestones" icon={Check} title="Milestones" />
            <ul className="space-y-2.5 p-4 sm:p-5">
              {projectMilestones(project).map((m) => (
                <li key={m.label} className="flex items-center gap-2.5 text-[13px]">
                  {m.done ? (
                    <span className="grid size-5 place-items-center rounded-full bg-success text-white">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  ) : (
                    <CircleDashed className="size-5 text-subtle-foreground" />
                  )}
                  <span className={m.done ? "" : "text-muted-foreground"}>{m.label}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="activity" className="rounded-[14px] border border-border bg-card shadow-xs">
            <PanelHeader id="activity" icon={History} title="Activity" />
            <div className="p-4 sm:p-5">
              <ActivityFeed items={[...project.activity].reverse()} />
            </div>
          </section>
        </aside>
      </div>
    </PageContainer>
  );
}
