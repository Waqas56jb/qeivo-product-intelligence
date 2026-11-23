"use client";

import { useMemo, useState } from "react";
import { Clock, Eye, MousePointerClick, Sparkles, UsersRound } from "lucide-react";
import type { ContentPerformanceRow } from "@/types";
import { contentPerformance, creatorWeekly } from "@/data/analytics/creator";
import { formatDate } from "@/lib/format";
import { compactNumber, round } from "@/lib/utils";
import { AreaChart, BarChart, ChartCard, DonutChart, LineChart } from "@/components/charts/charts";
import { DataTable, type Column } from "@/components/tables/data-table";
import { BusinessStatCard, RangeFilter, ScoreIntegrityNotice } from "@/components/business/primitives";
import { avg, pctChange, shortDate, sum } from "@/components/business/format";
import { CONTENT_TYPE_META } from "./meta";

type Range = "4w" | "12w" | "26w";
const WEEKS: Record<Range, number> = { "4w": 4, "12w": 12, "26w": 26 };
const RANGE_LABEL: Record<Range, string> = { "4w": "last 4 weeks", "12w": "last 12 weeks", "26w": "last 26 weeks" };

const truncate = (s: string, n = 26) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

const columns: Column<ContentPerformanceRow>[] = [
  {
    key: "title",
    header: "Content",
    cell: (r) => {
      const T = CONTENT_TYPE_META[r.type];
      return (
        <span className="flex min-w-0 max-w-[340px] items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-surface-2 text-muted-foreground">
            <T.icon className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium">{r.title}</span>
            <span className="block text-[12px] text-muted-foreground">{T.label}</span>
          </span>
        </span>
      );
    },
    sortValue: (r) => r.title,
  },
  { key: "views", header: "Views", align: "right", cell: (r) => <span className="tabular">{r.views.toLocaleString("en-US")}</span>, sortValue: (r) => r.views },
  { key: "engagement", header: "Engagement", align: "right", hideBelow: "sm", cell: (r) => <span className="tabular">{r.engagement}%</span>, sortValue: (r) => r.engagement },
  { key: "watch", header: "Avg watched", align: "right", hideBelow: "md", cell: (r) => <span className="tabular text-muted-foreground">{r.avgWatchPct ? `${r.avgWatchPct}%` : "—"}</span>, sortValue: (r) => r.avgWatchPct },
  { key: "clicks", header: "Product clicks", align: "right", hideBelow: "md", cell: (r) => <span className="tabular">{r.productClicks.toLocaleString("en-US")}</span>, sortValue: (r) => r.productClicks },
  { key: "published", header: "Published", align: "right", hideBelow: "lg", cell: (r) => <span className="tabular text-muted-foreground">{formatDate(r.publishedAt)}</span>, sortValue: (r) => r.publishedAt },
];

export function CreatorAnalytics() {
  const [range, setRange] = useState<Range>("12w");
  const n = WEEKS[range];
  const rows = useMemo(() => creatorWeekly.slice(-n).map((w) => ({ ...w })), [n]);
  const prev = useMemo(() => (creatorWeekly.length >= n * 2 ? creatorWeekly.slice(-n * 2, -n) : null), [n]);

  const views = sum(rows, (r) => r.views);
  const hours = sum(rows, (r) => r.watchHours);
  const eng = round(avg(rows, (r) => r.engagement), 1);
  const gained = rows[rows.length - 1].followers - rows[0].followers;
  const prevGained = prev ? prev[prev.length - 1].followers - prev[0].followers : 0;
  const hint = prev ? `vs previous ${n} weeks` : "26 weeks of data available";

  const byType = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of contentPerformance) m.set(c.type, (m.get(c.type) ?? 0) + c.views);
    return [...m.entries()].map(([t, value], i) => ({ name: CONTENT_TYPE_META[t as ContentPerformanceRow["type"]].plural, value, color: i }));
  }, []);
  const totalContentViews = byType.reduce((s, d) => s + d.value, 0);
  const contentBars = [...contentPerformance].sort((a, b) => b.views - a.views).map((c) => ({ title: truncate(c.title), views: c.views }));
  const best = [...rows].sort((a, b) => b.views - a.views)[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-muted-foreground">
          Showing the <span className="font-medium text-foreground">{RANGE_LABEL[range]}</span> · {shortDate(rows[0].week)} – {shortDate(rows[rows.length - 1].week)} 2026
        </p>
        <RangeFilter value={range} onChange={setRange} options={[{ value: "4w", label: "4 weeks" }, { value: "12w", label: "12 weeks" }, { value: "26w", label: "26 weeks" }]} />
      </div>

      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
        <BusinessStatCard label="Views" icon={Eye} value={compactNumber(views)} change={prev ? pctChange(views, sum(prev, (r) => r.views)) : undefined} hint={hint} spark={rows.map((r) => r.views)} />
        <BusinessStatCard label="Watch hours" icon={Clock} value={compactNumber(hours)} change={prev ? pctChange(hours, sum(prev, (r) => r.watchHours)) : undefined} hint={hint} spark={rows.map((r) => r.watchHours)} sparkColor={1} />
        <BusinessStatCard label="Avg engagement" icon={Sparkles} value={`${eng}%`} change={prev ? round(eng - avg(prev, (r) => r.engagement), 1) : undefined} changeUnit=" pts" hint={hint} spark={rows.map((r) => r.engagement)} sparkColor={2} />
        <BusinessStatCard label="Followers gained" icon={UsersRound} value={`+${compactNumber(gained)}`} change={prev ? pctChange(gained, prevGained) : undefined} hint={hint} spark={rows.map((r) => r.followers)} sparkColor={3} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ChartCard title="Views per week" description={`Peak: ${best.views.toLocaleString("en-US")} views in the week of ${shortDate(best.week)} — release weeks spike.`}>
          <AreaChart data={rows} xKey="week" series={[{ key: "views", label: "Views" }]} xFormatter={shortDate} valueFormatter={compactNumber} height={280} />
        </ChartCard>
        <ChartCard title="Watch hours" description="Hours watched across all published videos">
          <BarChart data={rows} xKey="week" series={[{ key: "watchHours", label: "Watch hours", color: 1 }]} xFormatter={shortDate} valueFormatter={compactNumber} height={280} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Engagement rate" description="Likes, comments and saves as a share of views">
          <LineChart data={rows} xKey="week" series={[{ key: "engagement", label: "Engagement", color: 2 }]} xFormatter={shortDate} valueFormatter={(v) => `${v}%`} referenceY={{ value: eng, label: `avg ${eng}%` }} height={240} />
        </ChartCard>
        <ChartCard title="Followers" description="Total followers across linked channels">
          <LineChart data={rows} xKey="week" series={[{ key: "followers", label: "Followers", color: 3 }]} xFormatter={shortDate} valueFormatter={compactNumber} yWidth={48} height={240} />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ChartCard title="Content performance" description="All-time views per published piece">
          <BarChart data={contentBars} xKey="title" layout="horizontal-bars" series={[{ key: "views", label: "Views" }]} valueFormatter={compactNumber} yWidth={170} height={Math.max(200, contentBars.length * 52)} />
        </ChartCard>
        <ChartCard title="Views by content type" description="All-time, published content">
          <DonutChart data={byType} valueFormatter={compactNumber} centerValue={compactNumber(totalContentViews)} centerLabel="views" height={170} />
        </ChartCard>
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight">Published content</h2>
            <p className="text-[13px] text-muted-foreground">Sort any column. Product clicks are shoppers opening a product page from your content.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-subtle-foreground">
            <MousePointerClick className="size-3.5" /> {sum(contentPerformance, (c) => c.productClicks).toLocaleString("en-US")} product clicks all-time
          </span>
        </div>
        <DataTable data={contentPerformance} columns={columns} rowKey={(r) => r.submissionId} initialSort={{ key: "views", dir: "desc" }} />
      </section>

      <ScoreIntegrityNotice role="Creators" variant="inline">
        Views and engagement are shown for your own reporting. They never feed into Qeivo suitability scores, evidence coverage, rankings or verdicts — and sponsored content is excluded from any ranking signal.
      </ScoreIntegrityNotice>
    </div>
  );
}
