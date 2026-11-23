"use client";

import { useState } from "react";
import { Activity, AlertOctagon, CalendarRange, Timer, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/common/display";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/tabs";
import { AreaChart, BarChart, ChartCard, DonutChart, LineChart } from "@/components/charts";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { MethodBadge, PreviewNotice, QuotaMeter } from "./api-bits";
import { useApiKeyStore } from "./api-key-store";
import { compact, endpointsForRange, ERROR_GROUPS, errorsForRange, keyUsage, MTD_REQUESTS, ORG_MONTHLY_QUOTA, pct, previousPeriod, PROJECTED_MONTH, shortDate, sliceUsage, summarise, type RangeDays } from "./dev-data";

const RANGES: RangeDays[] = [7, 30, 90];
const delta = (a: number, b: number) => (b ? ((a - b) / b) * 100 : undefined);
const shortPath = (p: string) => p.replace("/v1", "").replace("{id}", ":id");

export function UsageDashboard() {
  const [range, setRange] = useState<RangeDays>(30);
  const keys = useApiKeyStore((s) => s.keys);
  const rows = sliceUsage(range);
  const cur = summarise(rows);
  const prevRows = previousPeriod(range);
  const prev = prevRows ? summarise(prevRows) : null;
  const endpoints = endpointsForRange(rows);
  const errs = errorsForRange(rows);
  const groups = ERROR_GROUPS.map((g) => ({ name: g.name, value: errs.filter((e) => g.codes.includes(e.code)).reduce((s, e) => s + e.count, 0), color: g.color }));
  const errTotal = groups.reduce((s, g) => s + g.value, 0);
  const deltaLabel = prev ? `vs previous ${range} days` : "No earlier data in the 90-day window";

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow="Developer"
        title="Usage & performance"
        description="Request volume, latency, quota and errors for every key in the workspace."
        actions={
          <div className="flex items-center gap-2">
            <CalendarRange className="hidden size-4 text-muted-foreground sm:block" />
            <ToggleGroup type="single" value={String(range)} onValueChange={(v) => v && setRange(Number(v) as RangeDays)} aria-label="Date range">
              {RANGES.map((r) => (
                <ToggleGroupItem key={r} value={String(r)} className="h-10 px-3.5 sm:h-9" aria-label={`Last ${r} days`}>
                  {r} days
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        }
      />
      <PreviewNotice className="mb-6" />

      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
        <StatCard label={`Requests · ${range} days`} value={compact(cur.requests)} delta={prev ? delta(cur.requests, prev.requests) : undefined} deltaLabel={deltaLabel} icon={Activity} />
        <StatCard label="Error rate" value={pct(cur.errorRate)} delta={prev ? delta(cur.errorRate, prev.errorRate) : undefined} invertDelta deltaLabel={`${cur.errors.toLocaleString("en-US")} failed requests`} icon={AlertOctagon} />
        <StatCard label="Avg. p95 latency" value={`${cur.p95} ms`} delta={prev ? delta(cur.p95, prev.p95) : undefined} invertDelta deltaLabel="Target under 500 ms" icon={Timer} />
        <StatCard label="Busiest day" value={compact(cur.peak.requests)} hint={cur.peak.date ? shortDate(cur.peak.date) : "—"} icon={TrendingUp} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartCard title="Requests per day" description={`Last ${range} days · all keys`}>
          <AreaChart key={`req-${range}`} data={rows.map((d) => ({ date: d.date, requests: d.requests }))} xKey="date" series={[{ key: "requests", label: "Requests" }]} xFormatter={shortDate} valueFormatter={compact} height={260} />
        </ChartCard>
        <ChartCard title="p95 latency" description={range === 90 ? "The 14 Oct spike was a regional outage (resolved in 2 h)" : "Daily 95th-percentile response time"}>
          <LineChart key={`lat-${range}`} data={rows.map((d) => ({ date: d.date, p95: d.p95Ms }))} xKey="date" series={[{ key: "p95", label: "p95 latency", color: 1 }]} xFormatter={shortDate} valueFormatter={(v) => `${Math.round(v)} ms`} yWidth={60} height={260} referenceY={{ value: 500, label: "500 ms target" }} />
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <section aria-labelledby="quota-util" className="rounded-[14px] border border-border bg-card p-4 shadow-xs sm:p-5">
          <h2 id="quota-util" className="text-[15px] font-semibold tracking-tight">Quota utilisation</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Current cycle (1–30 Nov) — independent of the range filter</p>
          <div className="mt-4 rounded-[12px] bg-surface-2/60 p-3.5">
            <QuotaMeter label="Organisation quota" used={MTD_REQUESTS} limit={ORG_MONTHLY_QUOTA} projected={PROJECTED_MONTH} />
            <p className="mt-1 text-[12px] text-muted-foreground">
              Marker shows the projected month-end total of <span className="font-semibold tabular text-foreground">{PROJECTED_MONTH.toLocaleString("en-US")}</span>.
            </p>
          </div>
          <h3 className="mt-5 text-[12px] font-medium uppercase tracking-wider text-subtle-foreground">Per-key limits</h3>
          <ul className="mt-3 space-y-4">
            {keys
              .filter((k) => k.status === "active")
              .map((k) => (
                <li key={k.id}>
                  <QuotaMeter label={`${k.name}${k.environment === "test" ? " (test)" : ""}`} used={keyUsage(k)} limit={k.monthlyLimit} />
                </li>
              ))}
          </ul>
        </section>

        <div className="min-w-0 space-y-6">
          <ChartCard title="Requests by endpoint" description={`Last ${range} days`}>
            <BarChart
              key={`ep-${range}`}
              data={endpoints.map((e) => ({ endpoint: shortPath(e.endpoint), requests: e.requests }))}
              xKey="endpoint"
              series={[{ key: "requests", label: "Requests" }]}
              layout="horizontal-bars"
              valueFormatter={compact}
              yWidth={150}
              height={300}
            />
          </ChartCard>
          <ChartCard title="Error distribution" description={`${errTotal.toLocaleString("en-US")} errors in the last ${range} days`}>
            <DonutChart key={`err-${range}`} data={groups} centerValue={compact(errTotal)} centerLabel="errors" valueFormatter={(v) => v.toLocaleString("en-US")} height={180} />
          </ChartCard>
        </div>
      </div>

      <section aria-labelledby="endpoint-table" className="mt-6 rounded-[14px] border border-border bg-card shadow-xs">
        <div className="border-b border-border px-4 py-3.5 sm:px-5">
          <h2 id="endpoint-table" className="text-[15px] font-semibold tracking-tight">Endpoint performance</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Volume for the last {range} days; p95 and error rate are 90-day figures per endpoint.</p>
        </div>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface-2/50 text-[11px] uppercase tracking-wider text-subtle-foreground">
                <th scope="col" className="px-5 py-2.5 text-left font-medium">Endpoint</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">Requests</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">Share</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">p95</th>
                <th scope="col" className="px-5 py-2.5 text-right font-medium">Error rate</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((e) => (
                <tr key={e.endpoint} className="border-b border-border last:border-0 hover:bg-surface-2/50">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2.5">
                      <MethodBadge method={e.method} />
                      <span className="font-mono text-[12px]">{e.endpoint}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-medium tabular">{e.requests.toLocaleString("en-US")}</td>
                  <td className="px-3 py-3 text-right tabular text-muted-foreground">{cur.requests ? pct(e.requests / cur.requests, 1) : "—"}</td>
                  <td className={cn("px-3 py-3 text-right tabular", e.p95Ms > 400 ? "text-warning-foreground" : "text-muted-foreground")}>{e.p95Ms} ms</td>
                  <td className="px-5 py-3 text-right">
                    <span className={cn("inline-flex items-center gap-1.5 tabular", e.errorRate >= 0.01 ? "text-danger-foreground" : "text-muted-foreground")}>
                      <span className={cn("size-1.5 rounded-full", e.errorRate >= 0.01 ? "bg-danger" : "bg-success")} aria-hidden />
                      {pct(e.errorRate, 1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="error-codes" className="mt-6 rounded-[14px] border border-border bg-card shadow-xs">
        <div className="border-b border-border px-4 py-3.5 sm:px-5">
          <h2 id="error-codes" className="text-[15px] font-semibold tracking-tight">Errors by status code</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Last {range} days</p>
        </div>
        <ul className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {errs.map((e) => (
            <li key={e.code} className={cn("flex items-start gap-3 px-4 py-3.5 sm:border-b sm:border-border sm:px-5", e.count === 0 && "opacity-60")}>
              <span className={cn("mt-0.5 rounded-[6px] px-1.5 py-0.5 font-mono text-[12px] font-semibold", e.code >= 500 ? "bg-danger-soft text-danger-foreground" : "bg-warning-soft text-warning-foreground")}>{e.code}</span>
              <span className="min-w-0">
                <span className="block text-[18px] font-semibold leading-tight tabular">{e.count.toLocaleString("en-US")}</span>
                <span className="block text-[12px] leading-snug text-muted-foreground">{e.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  );
}
