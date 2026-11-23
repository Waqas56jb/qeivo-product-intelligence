"use client";

import { useMemo, useState } from "react";
import { Download, Eye, MousePointerClick, Percent, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { offerPerformance, supplierDaily } from "@/data/analytics/supplier";
import { getProduct } from "@/data/products";
import { cn, round } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { AreaChart, BarChart, ChartCard, DonutChart, LineChart } from "@/components/charts";
import { DataTable, type Column } from "@/components/tables/data-table";
import { BusinessStatCard, DemoTag, ProductThumb, RangeFilter, ScoreIntegrityNotice, StatusDot } from "../primitives";
import { fmtCompact, fmtNumber, pctChange, shortDate, sum } from "../format";
import { STOCK_META, seededOffers } from "./supplier-data";

type Range = "7" | "14" | "30";
const RANGES: { value: Range; label: string }[] = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
];

const TOTAL_VIEWS = sum(supplierDaily, (d) => d.views);
const regionById = new Map(seededOffers.map((o) => [o.id, o.region]));

interface PerfRow {
  offerId: string;
  productId: string;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  rank: number;
  stock: keyof typeof STOCK_META;
}

export function SupplierAnalyticsView() {
  const [range, setRange] = useState<Range>("30");
  const days = Number(range);

  const { current, previous, rows, perf, byRegion } = useMemo(() => {
    const current = supplierDaily.slice(-days);
    const previous = supplierDaily.slice(-days * 2, -days);
    const rows = current.map((d) => ({ ...d, ctr: round((d.clicks / d.views) * 100, 2) }));
    // Offer-level data is apportioned to the period by its share of total views (demo approximation).
    const share = sum(current, (d) => d.views) / TOTAL_VIEWS;
    const perf: PerfRow[] = offerPerformance.map((o) => {
      const impressions = Math.round(o.impressions * share);
      const clicks = Math.round(o.clicks * share);
      return { offerId: o.offerId, productId: o.productId, impressions, clicks, ctr: o.ctr, conversions: Math.round(o.conversions * share), rank: o.rank, stock: o.stock };
    });
    const regionTotals = new Map<string, number>();
    for (const p of perf) {
      const r = regionById.get(p.offerId) ?? "US";
      regionTotals.set(r, (regionTotals.get(r) ?? 0) + p.clicks);
    }
    const byRegion = [...regionTotals.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
    return { current, previous, rows, perf, byRegion };
  }, [days]);

  const total = (k: "views" | "clicks" | "conversions" | "revenue", list = current) => sum(list, (d) => d[k]);
  const hasPrev = previous.length === current.length;
  const delta = (k: "views" | "clicks" | "conversions" | "revenue") => (hasPrev ? pctChange(total(k), total(k, previous)) : undefined);
  const ctr = (total("clicks") / total("views")) * 100;
  const prevCtr = hasPrev ? (total("clicks", previous) / total("views", previous)) * 100 : 0;
  const hint = hasPrev ? `vs previous ${days} days` : "Full demo period — no earlier data";

  const topOffers = [...perf].sort((a, b) => b.clicks - a.clicks).slice(0, 8).map((p) => ({ name: getProduct(p.productId)?.model ?? p.productId, clicks: p.clicks }));

  const columns: Column<PerfRow>[] = [
    { key: "product", header: "Offer", sortValue: (r) => getProduct(r.productId)?.name ?? "", cell: (r) => { const p = getProduct(r.productId); return p ? <ProductThumb product={p} size="sm" meta={`${p.modelNumber} · ${regionById.get(r.offerId) ?? ""}`} className="max-w-[260px]" /> : null; } },
    { key: "impr", header: "Impressions", align: "right", hideBelow: "md", sortValue: (r) => r.impressions, cell: (r) => <span className="tabular">{fmtNumber(r.impressions)}</span> },
    { key: "clicks", header: "Clicks", align: "right", sortValue: (r) => r.clicks, cell: (r) => <span className="tabular font-medium">{fmtNumber(r.clicks)}</span> },
    { key: "ctr", header: "CTR", align: "right", hideBelow: "sm", sortValue: (r) => r.ctr, cell: (r) => <span className="tabular">{r.ctr.toFixed(1)}%</span> },
    { key: "conv", header: "Sales", align: "right", hideBelow: "md", sortValue: (r) => r.conversions, cell: (r) => <span className="tabular">{r.conversions}</span> },
    { key: "rank", header: "Price rank", align: "right", hideBelow: "lg", sortValue: (r) => r.rank, cell: (r) => <span className={cn("tabular", r.rank === 1 && "font-semibold text-success")}>#{r.rank}</span> },
    { key: "stock", header: "Stock", hideBelow: "lg", cell: (r) => <StatusDot tone={STOCK_META[r.stock].tone}>{STOCK_META[r.stock].label}</StatusDot> },
  ];

  const exportCsv = () => {
    const lines = ["date,views,clicks,ctr_pct,sales,revenue_usd", ...rows.map((r) => [r.date, r.views, r.clicks, r.ctr, r.conversions, r.revenue].join(","))];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `larder-analytics-${days}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} days of analytics`, { description: "CSV generated in your browser." });
  };

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader
        eyebrow="Larder & Co · Supplier"
        title="Analytics"
        description="How shoppers engage with your offers on Qeivo: views, click-throughs to larderandco.example and attributed sales."
        actions={
          <>
            <RangeFilter value={range} onChange={setRange} options={RANGES} />
            <Button variant="outline" onClick={exportCsv}>
              <Download /> Export
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <BusinessStatCard label="Offer views" value={fmtNumber(total("views"))} change={delta("views")} hint={hint} icon={Eye} spark={current.map((d) => d.views)} />
        <BusinessStatCard label="Click-throughs" value={fmtNumber(total("clicks"))} change={delta("clicks")} hint={hint} icon={MousePointerClick} spark={current.map((d) => d.clicks)} sparkColor={1} />
        <BusinessStatCard label="Click-through rate" value={`${ctr.toFixed(2)}%`} change={hasPrev ? round(ctr - prevCtr, 2) : undefined} changeUnit=" pts" changeDigits={2} hint={hint} icon={Percent} />
        <BusinessStatCard label="Attributed sales" value={fmtNumber(total("conversions"))} change={delta("conversions")} hint={`$${fmtCompact(total("revenue"))} order value · ${hasPrev ? `vs previous ${days} days` : "full period"}`} icon={ShoppingCart} spark={current.map((d) => d.conversions)} sparkColor={2} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Offer views" description={`Daily views of your offers on product pages · last ${days} days`}>
          <AreaChart data={rows} xKey="date" series={[{ key: "views", label: "Views" }]} xFormatter={shortDate} valueFormatter={fmtCompact} height={240} />
        </ChartCard>
        <ChartCard title="Click-throughs" description="Shoppers who followed an offer to your store">
          <BarChart data={rows} xKey="date" series={[{ key: "clicks", label: "Clicks", color: 1 }]} xFormatter={shortDate} valueFormatter={fmtCompact} height={240} highlightIndex={rows.length - 1} />
        </ChartCard>
        <ChartCard title="Click-through rate" description="Clicks ÷ views, per day">
          <LineChart data={rows} xKey="date" series={[{ key: "ctr", label: "CTR" }]} xFormatter={shortDate} valueFormatter={(v) => `${v.toFixed(1)}%`} height={220} referenceY={{ value: round(ctr, 2), label: `avg ${ctr.toFixed(1)}%` }} />
        </ChartCard>
        <ChartCard title="Attributed order value" description="Sales reported back through tracked links (USD)" action={<DemoTag>Estimated</DemoTag>}>
          <AreaChart data={rows} xKey="date" series={[{ key: "revenue", label: "Order value", color: 2 }]} xFormatter={shortDate} valueFormatter={(v) => `$${fmtCompact(v)}`} height={220} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <ChartCard title="Top offers by clicks" description={`Last ${days} days · offer data apportioned by period traffic`}>
          <BarChart data={topOffers} xKey="name" series={[{ key: "clicks", label: "Clicks" }]} layout="horizontal-bars" yWidth={118} valueFormatter={fmtCompact} height={300} />
        </ChartCard>
        <ChartCard title="Clicks by region" description="Where shoppers clicked through from">
          <DonutChart data={byRegion} valueFormatter={fmtNumber} centerValue={fmtCompact(sum(byRegion, (r) => r.value))} centerLabel="clicks" height={180} />
        </ChartCard>
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight">Offer performance</h2>
            <p className="text-[13px] text-muted-foreground">Price rank is your position among all retailers for that product (1 = cheapest).</p>
          </div>
        </div>
        <DataTable data={perf} columns={columns} rowKey={(r) => r.offerId} pageSize={10} initialSort={{ key: "clicks", dir: "desc" }} />
      </section>

      <ScoreIntegrityNotice role="Suppliers">Engagement with your offers is reported for your benefit only. Clicks, sales and paid placements are never inputs to Qeivo suitability scores, evidence coverage, rankings or AI verdicts.</ScoreIntegrityNotice>
    </PageContainer>
  );
}
