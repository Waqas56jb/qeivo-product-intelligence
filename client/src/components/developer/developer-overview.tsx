"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Activity, AlertOctagon, ArrowRight, BookOpen, Gauge, KeyRound, Timer } from "lucide-react";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/common/display";
import { AreaChart, ChartCard } from "@/components/charts";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { EnvBadge, PreviewNotice, QuotaMeter } from "./api-bits";
import { CodeTabs } from "./code-block";
import { CreateKeyDialog } from "./api-keys";
import { RequestLog } from "./request-log";
import { useApiKeyStore } from "./api-key-store";
import { compact, keyLabel, MTD_REQUESTS, ORG_MONTHLY_QUOTA, pct, previousPeriod, PROJECTED_MONTH, requestLog, shortDate, sliceUsage, summarise } from "./dev-data";
import { requestExamples, SAMPLE_PRODUCT_ID } from "./examples";

const delta = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);

export function DeveloperOverview() {
  const keys = useApiKeyStore((s) => s.keys);
  const rows = sliceUsage(30);
  const cur = summarise(rows);
  const prev = summarise(previousPeriod(30) ?? []);
  const log = useMemo(() => requestLog(10), []);
  const active = keys.filter((k) => k.status === "active");
  const chart = rows.map((d) => ({ date: d.date, requests: d.requests }));
  const quick = requestExamples("GET", `/products/${SAMPLE_PRODUCT_ID}`);

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow="Developer · Harbor Property Group"
        title="API overview"
        description="Programmatic access to Qeivo product records, evidence and prices for your internal tools."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={routes.devDocs}>
                <BookOpen /> Docs
              </Link>
            </Button>
            <CreateKeyDialog />
          </>
        }
      />
      <PreviewNotice className="mb-6" />

      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Requests · 30 days" value={compact(cur.requests)} delta={delta(cur.requests, prev.requests)} deltaLabel="vs previous 30 days" icon={Activity} />
        <StatCard label="Error rate" value={pct(cur.errorRate)} delta={delta(cur.errorRate, prev.errorRate)} invertDelta deltaLabel="4xx and 5xx responses" icon={AlertOctagon} />
        <StatCard label="Avg. p95 latency" value={`${cur.p95} ms`} delta={delta(cur.p95, prev.p95)} invertDelta deltaLabel="Daily p95, averaged" icon={Timer} />
        <StatCard label="Active keys" value={active.length} hint={`${active.filter((k) => k.environment === "live").length} live · ${active.filter((k) => k.environment === "test").length} test`} icon={KeyRound} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <ChartCard
          title="Requests per day"
          description="Last 30 days · all keys"
          action={
            <Button asChild variant="ghost" size="sm" className="h-10 sm:h-8">
              <Link href={routes.devUsage}>
                Usage details <ArrowRight />
              </Link>
            </Button>
          }
        >
          <AreaChart data={chart} xKey="date" series={[{ key: "requests", label: "Requests" }]} xFormatter={shortDate} valueFormatter={compact} height={240} />
        </ChartCard>

        <section aria-labelledby="quota-title" className="rounded-[14px] border border-border bg-card p-4 shadow-xs sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="quota-title" className="text-[15px] font-semibold tracking-tight">Quotas</h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">November cycle · resets 1 Dec</p>
            </div>
            <Gauge className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-4 rounded-[12px] bg-surface-2/60 p-3.5">
            <QuotaMeter label="Organisation (Team plan)" used={MTD_REQUESTS} limit={ORG_MONTHLY_QUOTA} projected={PROJECTED_MONTH} />
            <p className="mt-1 text-[12px] text-muted-foreground">
              Projected <span className="font-semibold tabular text-foreground">{PROJECTED_MONTH.toLocaleString("en-US")}</span> by month end (marker)
            </p>
          </div>
          <dl className="mt-4 divide-y divide-border text-[13px]">
            {[
              ["Rate limit", "20 req/s per key · burst 40"],
              ["Overage", "$2 per 1,000 requests"],
              ["Test keys", "Free · don’t count toward quota"],
              ["Remaining this cycle", `${Math.max(0, ORG_MONTHLY_QUOTA - MTD_REQUESTS).toLocaleString("en-US")} requests`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3 py-2.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium tabular">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section aria-labelledby="log-title" className="min-w-0 rounded-[14px] border border-border bg-card shadow-xs">
          <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
            <div>
              <h2 id="log-title" className="text-[15px] font-semibold tracking-tight">Recent requests</h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">Latest 10 across all keys · times in your timezone</p>
            </div>
          </div>
          <RequestLog entries={log} />
        </section>

        <div className="min-w-0 space-y-6">
          <section aria-labelledby="keys-summary" className="rounded-[14px] border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
              <h2 id="keys-summary" className="text-[15px] font-semibold tracking-tight">API keys</h2>
              <Link href={routes.devKeys} className="inline-flex min-h-8 items-center text-[12px] font-medium text-brand-soft-foreground hover:underline">
                Manage keys
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {active.slice(0, 4).map((k) => (
                <li key={k.id} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium">{k.name}</span>
                    <span className="block font-mono text-[11px] text-muted-foreground">{keyLabel(k)}</span>
                  </span>
                  <EnvBadge env={k.environment} />
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="quickstart" className="min-w-0 space-y-3">
            <div>
              <h2 id="quickstart" className="text-[15px] font-semibold tracking-tight">Quick start</h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">Fetch one product with its suitability, evidence and sources.</p>
            </div>
            <CodeTabs examples={quick} maxHeight={280} />
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
