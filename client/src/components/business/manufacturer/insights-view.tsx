"use client";

import { useState } from "react";
import { Eye, GitCompareArrows, MessagesSquare, Star } from "lucide-react";
import { contentGaps, productPerformance } from "@/data/analytics/manufacturer";
import { getProduct } from "@/data/products";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { AreaChart, BarChart, ChartCard, LineChart } from "@/components/charts";
import { DataTable } from "@/components/tables/data-table";
import { BusinessStatCard, Panel, RangeFilter, ScoreIntegrityNotice } from "../primitives";
import { fmtCompact, fmtNumber, shortDate } from "../format";
import { RANGE_OPTIONS, weeksFor, windowTotals, type Range } from "./shared";

export function ManufacturerInsightsView() {
  const [range, setRange] = useState<Range>("12w");
  const weeks = weeksFor(range);
  const t = windowTotals(range);
  const factor = range === "4w" ? 4 / 26 : range === "12w" ? 12 / 26 : 1;
  const perf = productPerformance.map((r) => ({ ...r, views: Math.round(r.views * factor), comparisons: Math.round(r.comparisons * factor), questions: Math.round(r.questions * factor) }));

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader title="Insights" description="Research behaviour around your products. These metrics describe shopper interest — they do not and cannot change Qeivo scores." actions={<RangeFilter value={range} onChange={setRange} options={RANGE_OPTIONS} />} />
      <ScoreIntegrityNotice />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BusinessStatCard label="Product views" value={fmtCompact(t.views)} change={t.viewsChange} icon={Eye} />
        <BusinessStatCard label="Comparisons" value={fmtCompact(t.comparisons)} change={t.comparisonsChange} icon={GitCompareArrows} />
        <BusinessStatCard label="Questions" value={fmtNumber(t.questions)} change={t.questionsChange} icon={MessagesSquare} />
        <BusinessStatCard label="Average rating" value={t.rating.toFixed(2)} change={t.ratingChange} changeUnit="" changeDigits={2} icon={Star} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Product views" description="Weekly">
          <AreaChart data={weeks} xKey="week" series={[{ key: "views", label: "Views" }]} xFormatter={shortDate} valueFormatter={fmtCompact} />
        </ChartCard>
        <ChartCard title="Comparison frequency" description="Times a Nordvik product was added to a comparison">
          <BarChart data={weeks} xKey="week" series={[{ key: "comparisons", label: "Comparisons", color: 1 }]} xFormatter={shortDate} valueFormatter={fmtCompact} />
        </ChartCard>
        <ChartCard title="Rating trend" description="Average owner rating, weekly">
          <LineChart data={weeks} xKey="week" series={[{ key: "rating", label: "Average rating", color: 2 }]} xFormatter={shortDate} valueFormatter={(v) => v.toFixed(2)} />
        </ChartCard>
        <ChartCard title="Sentiment" description="Share of reviews by sentiment (%)" legend={[{ key: "positive", label: "Positive" }, { key: "mixed", label: "Mixed" }, { key: "negative", label: "Negative" }]}>
          <AreaChart data={weeks} xKey="week" stacked series={[{ key: "positive", label: "Positive" }, { key: "mixed", label: "Mixed" }, { key: "negative", label: "Negative" }]} xFormatter={shortDate} valueFormatter={(v) => `${v}%`} />
        </ChartCard>
        <ChartCard title="Customer questions" description="New community questions about your products">
          <BarChart data={weeks} xKey="week" series={[{ key: "questions", label: "Questions", color: 3 }]} xFormatter={shortDate} />
        </ChartCard>
        <Panel title="Content gaps" description="Ranked by estimated affected shoppers">
          <ul className="space-y-2">
            {contentGaps.map((g) => (
              <li key={g.id} className="flex items-start justify-between gap-3 rounded-[12px] bg-surface-2/60 p-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold">{g.title}</p>
                  <p className="text-[12px] text-muted-foreground">{getProduct(g.productId)?.model}</p>
                </div>
                <Badge variant={g.severity === "high" ? "danger" : g.severity === "medium" ? "warning" : "info"}>{fmtCompact(g.impact)} shoppers</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <DataTable
        data={perf}
        rowKey={(r) => r.productId}
        initialSort={{ key: "views", dir: "desc" }}
        columns={[
          { key: "product", header: "Product", cell: (r) => <span className="font-medium">{getProduct(r.productId)?.model}</span>, sortValue: (r) => getProduct(r.productId)?.model ?? "" },
          { key: "views", header: "Views", cell: (r) => fmtNumber(r.views), sortValue: (r) => r.views, align: "right" },
          { key: "comparisons", header: "Comparisons", cell: (r) => fmtNumber(r.comparisons), sortValue: (r) => r.comparisons, align: "right", hideBelow: "sm" },
          { key: "win", header: "Win rate", cell: (r) => `${r.winRate}%`, sortValue: (r) => r.winRate, align: "right" },
          { key: "questions", header: "Questions", cell: (r) => `${r.questions} (${r.unanswered} open)`, sortValue: (r) => r.questions, align: "right", hideBelow: "md" },
          { key: "rival", header: "Most compared with", cell: (r) => getProduct(r.topCompetitorId)?.name ?? "—", hideBelow: "lg" },
        ]}
      />
    </PageContainer>
  );
}
