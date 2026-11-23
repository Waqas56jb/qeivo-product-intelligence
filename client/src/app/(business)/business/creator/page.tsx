import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, FilePlus2, MessageSquareWarning, PencilLine } from "lucide-react";
import type { SubmissionStatus } from "@/types";
import { currentCreator } from "@/data/creators/creators";
import { submissionsForCreator } from "@/data/creators/submissions";
import { CREATOR_ID, contentPerformance } from "@/data/analytics/creator";
import { routes } from "@/config/routes";
import { formatDate } from "@/lib/format";
import { cn, compactNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { Panel, PanelLink, ScoreIntegrityNotice } from "@/components/business/primitives";
import { SUBMISSION_META, SubmissionStatusBadge, SubmissionStatusTimeline } from "@/components/business/submission-status";
import { CONTENT_TYPE_META } from "@/components/business/creator/meta";
import { CreatorEngagementChart, CreatorKpiGrid, CreatorViewsChart } from "@/components/business/creator/overview-widgets";

export const metadata: Metadata = { title: "Creator overview" };

const STATUS_ORDER: SubmissionStatus[] = ["published", "approved", "in-review", "changes-requested", "draft", "rejected"];
const BAR_COLOR: Record<SubmissionStatus, string> = {
  published: "bg-success",
  approved: "bg-brand",
  "in-review": "bg-info",
  "changes-requested": "bg-warning",
  draft: "bg-border-strong",
  rejected: "bg-danger",
};

export default function CreatorOverviewPage() {
  const c = currentCreator;
  const subs = submissionsForCreator(CREATOR_ID);
  const counts = STATUS_ORDER.map((s) => ({ status: s, count: subs.filter((x) => x.status === s).length })).filter((x) => x.count > 0);
  const inFlight = subs.filter((s) => s.status === "in-review" || s.status === "approved" || s.status === "changes-requested").sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const attention = subs.find((s) => s.status === "changes-requested");
  const top = [...contentPerformance].sort((a, b) => b.views - a.views).slice(0, 4);
  const subById = new Map(subs.map((s) => [s.id, s]));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Creator workspace"
        title={`Good morning, ${c.name.split(" ")[0]}`}
        description="How your content is performing on Qeivo, and where each submission stands in editorial review."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={routes.cProfile}>
                <PencilLine /> Edit profile
              </Link>
            </Button>
            <Button asChild variant="brand">
              <Link href={routes.cSubmissionNew}>
                <FilePlus2 /> New submission
              </Link>
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        {/* Profile strip */}
        <section className="overflow-hidden rounded-[20px] border border-border bg-card shadow-xs">
          <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
              <ImageWithFallback src={c.avatar} alt={c.name} wrapperClassName="size-16 shrink-0 rounded-full ring-4 ring-brand-soft" sizes="64px" />
              <div className="min-w-0 space-y-1.5">
                <p className="flex items-center gap-1.5 text-[17px] font-semibold">
                  {c.name} {c.verified && <BadgeCheck className="size-[18px] text-brand" aria-label="Verified creator" />}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {c.handle} · Independent reviewer · <span className="tabular">{compactNumber(c.followers)}</span> followers
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {c.expertise.map((e) => (
                    <span key={e} className="rounded-full bg-surface-2 px-2 py-0.5 text-[11.5px] font-medium text-muted-foreground">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <dl className="grid grid-cols-3 divide-x divide-border border-t border-border bg-surface-2/40 md:border-l md:border-t-0">
              {[
                { label: "Published", value: subs.filter((s) => s.status === "published").length },
                { label: "In the pipeline", value: inFlight.length },
                { label: "Approval rate", value: `${Math.round((subs.filter((s) => s.status === "published" || s.status === "approved").length / subs.filter((s) => s.status !== "draft").length) * 100)}%` },
              ].map((s) => (
                <div key={s.label} className="flex flex-col justify-center gap-1 p-4 sm:p-5">
                  <dt className="text-[12px] text-muted-foreground">{s.label}</dt>
                  <dd className="text-[22px] font-semibold tabular tracking-tight">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {attention && (
          <div className="flex flex-col gap-3 rounded-[14px] border border-warning/35 bg-warning-soft/50 p-4 sm:flex-row sm:items-center">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-warning-soft text-warning-foreground">
              <MessageSquareWarning className="size-[18px]" />
            </span>
            <div className="min-w-0 flex-1 text-[13px]">
              <p className="font-semibold text-foreground">Changes requested on “{attention.title}”</p>
              <p className="line-clamp-2 text-muted-foreground">{attention.reviewerNote}</p>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link href={`${routes.cSubmissionNew}?from=${attention.id}`}>
                Revise now <ArrowRight />
              </Link>
            </Button>
          </div>
        )}

        <CreatorKpiGrid />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <CreatorViewsChart />

          <Panel title="Approval status" description={`${subs.length} submissions in total`} action={<PanelLink href={routes.cSubmissions}>All</PanelLink>}>
            <div className="space-y-4">
              <div className="flex h-2.5 overflow-hidden rounded-full bg-surface-2" role="img" aria-label={counts.map((x) => `${x.count} ${SUBMISSION_META[x.status].label}`).join(", ")}>
                {counts.map((x) => (
                  <span key={x.status} className={cn("h-full border-r-2 border-card last:border-r-0", BAR_COLOR[x.status])} style={{ width: `${(x.count / subs.length) * 100}%` }} />
                ))}
              </div>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12.5px]">
                {counts.map((x) => (
                  <li key={x.status} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className={cn("size-2 rounded-full", BAR_COLOR[x.status])} /> {SUBMISSION_META[x.status].label}
                    </span>
                    <span className="font-semibold tabular">{x.count}</span>
                  </li>
                ))}
              </ul>
              <ul className="divide-y divide-border border-t border-border">
                {inFlight.map((s) => (
                  <li key={s.id} className="space-y-3 py-3.5 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={routes.cSubmissions} className="line-clamp-2 text-[13px] font-medium leading-snug hover:underline">
                        {s.title}
                      </Link>
                      <SubmissionStatusBadge status={s.status} className="shrink-0" />
                    </div>
                    <SubmissionStatusTimeline status={s.status} compact />
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Top content" description="All-time views on published pieces" action={<PanelLink href={routes.cAnalytics}>Performance</PanelLink>} flush>
            <ol className="divide-y divide-border">
              {top.map((t, i) => {
                const s = subById.get(t.submissionId);
                const T = CONTENT_TYPE_META[t.type];
                return (
                  <li key={t.submissionId} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                    <span className="w-4 shrink-0 text-[12px] font-semibold text-subtle-foreground tabular">{i + 1}</span>
                    {s && <ImageWithFallback src={s.thumbnail} alt="" wrapperClassName="aspect-video w-20 shrink-0 rounded-[8px]" sizes="80px" />}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-[13px] font-medium">{t.title}</p>
                      <p className="flex items-center gap-1 text-[12px] text-muted-foreground">
                        <T.icon className="size-3" /> {T.label} · {formatDate(t.publishedAt)}
                        {s?.sponsored && <span className="font-medium text-warning-foreground"> · Sponsored</span>}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[13px] font-semibold tabular">{compactNumber(t.views)}</p>
                      <p className="text-[11.5px] text-muted-foreground tabular">{t.engagement}% eng.</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>
          <CreatorEngagementChart />
        </div>

        <ScoreIntegrityNotice role="Creators">
          Your videos, reviews and guides appear next to products as evidence, clearly attributed to you. They cannot change Qeivo suitability scores, evidence coverage, rankings or verdicts — and sponsored content never affects them.
        </ScoreIntegrityNotice>
      </div>
    </PageContainer>
  );
}
