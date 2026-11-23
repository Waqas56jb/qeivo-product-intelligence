"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Eye, FileStack, GitCompareArrows, MessagesSquare, Plus, Smile, Upload, Video } from "lucide-react";
import { contentGaps, manufacturerWeekly, productPerformance } from "@/data/analytics/manufacturer";
import { reviews } from "@/data/reviews";
import { importHistory } from "@/data/imports/import-history";
import { getProduct } from "@/data/products";
import { routes } from "@/config/routes";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { AreaChart, BarChart, ChartCard } from "@/components/charts";
import { SentimentBar } from "@/components/charts/domain-charts";
import { BusinessStatCard, Panel, PanelLink, ProductThumb, RangeFilter, ScoreIntegrityNotice } from "../primitives";
import { fmtCompact, fmtNumber, shortDate } from "../format";
import { nordvikProducts, RANGE_OPTIONS, weeksFor, windowTotals, type Range } from "./shared";

const SEVERITY = { high: "danger", medium: "warning", low: "info" } as const;

export function ManufacturerDashboardView() {
  const [range, setRange] = useState<Range>("12w");
  const t = windowTotals(range);
  const weeks = weeksFor(range);
  const last = manufacturerWeekly[manufacturerWeekly.length - 1];
  const nordvikIds = new Set(nordvikProducts.map((p) => p.id));
  const recentReviews = reviews.filter((r) => nordvikIds.has(r.productId)).slice(0, 3);
  const activity = [
    ...importHistory.slice(0, 3).map((i) => ({ id: i.id, icon: Upload, text: `${i.actor} imported “${i.name}” — ${i.created + i.updated} rows applied, ${i.failed} failed`, date: i.date })),
    ...recentReviews.map((r) => ({ id: r.id, icon: MessagesSquare, text: `New ${r.rating}★ review on ${getProduct(r.productId)?.model}: “${r.title}”`, date: r.date })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader
        eyebrow="Manufacturer workspace"
        title="Nordvik overview"
        description="How shoppers research your products on Qeivo — views, comparisons, questions and sentiment."
        actions={
          <>
            <RangeFilter value={range} onChange={setRange} options={RANGE_OPTIONS} />
            <Button asChild>
              <Link href={routes.mProductNew}>
                <Plus /> Add product
              </Link>
            </Button>
          </>
        }
      />
      <ScoreIntegrityNotice />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <BusinessStatCard label="Total products" value={nordvikProducts.length} icon={FileStack} hint="Live on Qeivo" href={routes.mProducts} />
        <BusinessStatCard label="Product views" value={fmtCompact(t.views)} change={t.viewsChange} icon={Eye} spark={weeks.map((w) => w.views)} />
        <BusinessStatCard label="Comparisons" value={fmtCompact(t.comparisons)} change={t.comparisonsChange} icon={GitCompareArrows} spark={weeks.map((w) => w.comparisons)} sparkColor={1} />
        <BusinessStatCard label="Customer questions" value={fmtNumber(t.questions)} change={t.questionsChange} icon={MessagesSquare} spark={weeks.map((w) => w.questions)} sparkColor={2} />
        <BusinessStatCard label="Positive sentiment" value={`${t.positive}%`} change={t.positiveChange} changeUnit=" pts" icon={Smile} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ChartCard title="Product views & comparisons" description="Weekly, all Nordvik products" legend={[{ key: "views", label: "Views" }, { key: "comparisons", label: "Comparisons" }]}>
          <AreaChart data={weeks} xKey="week" series={[{ key: "views", label: "Views" }, { key: "comparisons", label: "Comparisons" }]} xFormatter={shortDate} valueFormatter={fmtCompact} height={280} />
        </ChartCard>
        <Panel title="Review sentiment" description={`Average rating ${last.rating.toFixed(2)} · last week`}>
          <SentimentBar positive={last.positive} mixed={last.mixed} negative={last.negative} />
          <div className="mt-5 space-y-3">
            {recentReviews.map((r) => (
              <div key={r.id} className="rounded-[12px] bg-surface-2/60 p-3">
                <p className="text-[13px] font-medium">“{r.title}”</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {r.rating}★ · {getProduct(r.productId)?.model} · {formatRelative(r.date)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <PanelLink href={routes.mReviews}>Respond to reviews</PanelLink>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Product performance" description="Views by product, selected period">
          <BarChart
            data={productPerformance.map((r) => ({ name: getProduct(r.productId)?.model ?? r.productId, views: r.views }))}
            xKey="name"
            series={[{ key: "views", label: "Views" }]}
            layout="horizontal-bars"
            yWidth={150}
            valueFormatter={fmtCompact}
            height={280}
          />
        </ChartCard>
        <Panel title="Content gaps" description="Missing content that would answer shopper questions" action={<PanelLink href={routes.mInsights}>All insights</PanelLink>}>
          <ul className="space-y-2.5">
            {contentGaps.slice(0, 5).map((g) => (
              <li key={g.id} className="flex gap-3 rounded-[12px] border border-border p-3">
                <AlertTriangle className={cn("mt-0.5 size-4 shrink-0", g.severity === "high" ? "text-danger" : g.severity === "medium" ? "text-warning" : "text-info")} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-semibold">{g.title}</p>
                    <Badge variant={SEVERITY[g.severity]}>{g.severity}</Badge>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground">{g.detail}</p>
                </div>
                <Button asChild variant="ghost" size="icon-sm" aria-label="Fix this gap">
                  <Link href={g.kind === "video" ? routes.mVideos : g.kind === "document" ? routes.mDocuments : routes.mProductEdit(g.productId)}>{g.kind === "video" ? <Video /> : <Upload />}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Products" flush action={<PanelLink href={routes.mProducts}>Manage</PanelLink>}>
          <ul className="divide-y divide-border">
            {productPerformance.map((r) => {
              const p = getProduct(r.productId);
              if (!p) return null;
              return (
                <li key={r.productId} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <ProductThumb product={p} meta={p.modelNumber} className="min-w-0 flex-1" />
                  <div className="flex items-center gap-5 text-[13px] tabular">
                    <span>
                      <span className="text-muted-foreground">Views </span>
                      {fmtCompact(r.views)}
                    </span>
                    <span className="hidden sm:inline">
                      <span className="text-muted-foreground">Win rate </span>
                      {r.winRate}%
                    </span>
                    <span>
                      <span className="text-muted-foreground">★ </span>
                      {r.rating.toFixed(1)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Recent activity">
          <ol className="space-y-4">
            {activity.slice(0, 6).map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2">
                  <a.icon className="size-4 text-muted-foreground" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] leading-snug">{a.text}</p>
                  <p className="text-[12px] text-subtle-foreground">{formatRelative(a.date)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </PageContainer>
  );
}
