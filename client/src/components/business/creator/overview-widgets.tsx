"use client";

import { Clock, Eye, Sparkles, UsersRound } from "lucide-react";
import type { CreatorWeeklyPoint } from "@/types";
import { creatorKpis, creatorWeekly } from "@/data/analytics/creator";
import { routes } from "@/config/routes";
import { compactNumber } from "@/lib/utils";
import { AreaChart, ChartCard, LineChart } from "@/components/charts/charts";
import { BusinessStatCard, PanelLink } from "@/components/business/primitives";
import { formatKpi, shortDate } from "@/components/business/format";

const KPI_ICONS = [Eye, Clock, UsersRound, Sparkles];
const KPI_SPARK: (keyof CreatorWeeklyPoint)[] = ["views", "watchHours", "followers", "engagement"];
const recent = creatorWeekly.slice(-12).map((w) => ({ ...w }));

export function CreatorKpiGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
      {creatorKpis.map((k, i) => (
        <BusinessStatCard
          key={k.label}
          label={k.label}
          value={formatKpi(k)}
          change={k.change}
          changeUnit={k.format === "percent" ? " pts" : "%"}
          icon={KPI_ICONS[i]}
          hint={i === 2 ? "vs 4 weeks ago" : "vs previous 28 days"}
          spark={recent.map((w) => Number(w[KPI_SPARK[i]]))}
          sparkColor={i}
          href={routes.cAnalytics}
        />
      ))}
    </div>
  );
}

export function CreatorViewsChart() {
  return (
    <ChartCard title="Views per week" description="Last 12 weeks · spikes are new video releases" action={<PanelLink href={routes.cAnalytics}>Analytics</PanelLink>}>
      <AreaChart data={recent} xKey="week" series={[{ key: "views", label: "Views" }]} xFormatter={shortDate} valueFormatter={compactNumber} height={260} />
    </ChartCard>
  );
}

export function CreatorEngagementChart() {
  return (
    <ChartCard title="Engagement rate" description="Weekly, last 12 weeks">
      <LineChart data={recent} xKey="week" series={[{ key: "engagement", label: "Engagement", color: 2 }]} xFormatter={shortDate} valueFormatter={(v) => `${v}%`} height={250} />
    </ChartCard>
  );
}
