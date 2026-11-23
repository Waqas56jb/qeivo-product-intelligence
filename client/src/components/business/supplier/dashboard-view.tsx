"use client";

import Link from "next/link";
import { AlertTriangle, BadgeCheck, CalendarClock, Eye, MapPin, MousePointerClick, PackageX, Plus, ShoppingCart, Trophy, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { offerPerformance, supplierDaily, supplierKpis } from "@/data/analytics/supplier";
import { currentSupplier } from "@/data/companies/suppliers";
import { getProduct } from "@/data/products";
import { routes } from "@/config/routes";
import { REGIONS } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { AreaChart, ChartCard, DonutChart } from "@/components/charts";
import { BusinessStatCard, Panel, PanelLink, ProductThumb, ScoreIntegrityNotice, StatusDot } from "../primitives";
import { fmtCompact, fmtNumber, formatKpi, shortDate } from "../format";
import { STOCK_META, daysUntil, marketLow, money, offerStatus, seededOffers } from "./supplier-data";

const KPI_ICONS: LucideIcon[] = [Eye, MousePointerClick, ShoppingCart, Trophy];
const KPI_SPARK: (keyof (typeof supplierDaily)[number])[] = ["views", "clicks", "conversions", "views"];

interface Attention {
  id: string;
  icon: LucideIcon;
  tone: "danger" | "warning" | "info";
  title: string;
  detail: string;
}

export function SupplierDashboardView() {
  const last14 = supplierDaily.slice(-14);
  const views = supplierDaily.map((d) => ({ ...d }));
  const active = seededOffers.filter((o) => offerStatus(o) !== "expired");
  const stockMix = (Object.keys(STOCK_META) as (keyof typeof STOCK_META)[])
    .map((k, i) => ({ name: STOCK_META[k].label, value: active.filter((o) => o.stock === k).length, color: [0, 2, 3, 1][i] }))
    .filter((d) => d.value > 0);

  const attention: Attention[] = [
    ...active
      .filter((o) => o.stock === "out-of-stock")
      .slice(0, 2)
      .map((o) => ({ id: `oos-${o.id}`, icon: PackageX, tone: "danger" as const, title: `${getProduct(o.productId)?.name} is out of stock (${o.region})`, detail: `${fmtNumber(o.clicks)} shoppers clicked this offer in the last 30 days.` })),
    ...active
      .filter((o) => offerStatus(o) === "expiring")
      .slice(0, 2)
      .map((o) => ({ id: `exp-${o.id}`, icon: CalendarClock, tone: "warning" as const, title: `Offer expires in ${daysUntil(o.validUntil)} days`, detail: `${getProduct(o.productId)?.name} · ${o.region}. Re-confirm the price to stay listed.` })),
    ...active
      .map((o) => ({ o, low: marketLow(o.productId, o.region) }))
      .filter(({ o, low }) => low > 0 && o.price > low * 1.05)
      .slice(0, 2)
      .map(({ o, low }) => ({ id: `price-${o.id}`, icon: TrendingUp, tone: "info" as const, title: `${Math.round(((o.price - low) / low) * 100)}% above market low`, detail: `${getProduct(o.productId)?.name} (${o.region}) at ${money(o.price, o.region)} vs ${money(low, o.region)}.` })),
  ];

  const top = offerPerformance.slice(0, 5);
  const engagement = {
    ctr: (supplierDaily.reduce((s, d) => s + d.clicks, 0) / supplierDaily.reduce((s, d) => s + d.views, 0)) * 100,
    conv: (supplierDaily.reduce((s, d) => s + d.conversions, 0) / supplierDaily.reduce((s, d) => s + d.clicks, 0)) * 100,
  };

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader
        eyebrow="Supplier workspace"
        title="Larder & Co overview"
        description="Offer performance, listings and shopper engagement for the last 7 days, compared with the week before."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={routes.sAnalytics}>View analytics</Link>
            </Button>
            <Button asChild variant="brand">
              <Link href={routes.sOffers}>
                <Plus /> Manage offers
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        {supplierKpis.map((k, i) => (
          <BusinessStatCard key={k.label} label={k.label} value={formatKpi(k)} change={k.change} icon={KPI_ICONS[i]} spark={i < 3 ? last14.map((d) => d[KPI_SPARK[i]] as number) : undefined} sparkColor={i % 3} hint={i === 3 ? "Offers where you are the cheapest retailer" : "vs previous 7 days"} href={i === 3 ? routes.sOffers : routes.sAnalytics} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <ChartCard
          title="Offer views"
          description="Daily views of your offers across Qeivo product pages · last 30 days"
          action={
            <div className="flex gap-4 text-right">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-subtle-foreground">CTR</p>
                <p className="tabular text-[15px] font-semibold">{engagement.ctr.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-subtle-foreground">Click → sale</p>
                <p className="tabular text-[15px] font-semibold">{engagement.conv.toFixed(1)}%</p>
              </div>
            </div>
          }
        >
          <AreaChart data={views} xKey="date" series={[{ key: "views", label: "Views" }]} xFormatter={shortDate} valueFormatter={fmtCompact} height={250} />
        </ChartCard>
        <ChartCard title="Listing health" description={`${active.length} active offers by stock status`}>
          <DonutChart data={stockMix} centerValue={String(active.length)} centerLabel="offers" height={170} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Top offers" description="By click-throughs, last 30 days" action={<PanelLink href={routes.sAnalytics}>All offers</PanelLink>} flush>
          <ul className="divide-y divide-border">
            {top.map((o, i) => {
              const p = getProduct(o.productId);
              if (!p) return null;
              return (
                <li key={o.offerId} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <span className="w-4 shrink-0 text-[12px] font-semibold text-subtle-foreground tabular">{i + 1}</span>
                  <ProductThumb product={p} size="sm" className="flex-1" />
                  <div className="shrink-0 text-right">
                    <p className="tabular text-[13.5px] font-semibold">{fmtNumber(o.clicks)}</p>
                    <p className={cn("text-[11.5px] tabular", o.rank === 1 ? "text-success" : "text-muted-foreground")}>
                      {o.ctr.toFixed(1)}% CTR · #{o.rank}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Needs attention" description="Issues that cost you clicks right now" action={<PanelLink href={routes.sOffers}>Fix in offers</PanelLink>} flush>
          {attention.length ? (
            <ul className="divide-y divide-border">
              {attention.map((a) => (
                <li key={a.id} className="flex gap-3 px-4 py-3 sm:px-5">
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-[9px]", a.tone === "danger" ? "bg-danger-soft text-danger-foreground" : a.tone === "warning" ? "bg-warning-soft text-warning-foreground" : "bg-info-soft text-info-foreground")}>
                    <a.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium leading-snug">{a.title}</p>
                    <p className="text-[12.5px] leading-snug text-muted-foreground">{a.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-2 px-5 pb-5 text-[13px] text-muted-foreground">
              <AlertTriangle className="size-4" /> Nothing needs attention.
            </p>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Panel title="Store profile" description="As shown to shoppers next to your offers">
          <div className="flex items-start gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-[12px] bg-navy-sheen text-[15px] font-semibold text-white">{currentSupplier.logo}</span>
            <div className="min-w-0 space-y-1">
              <p className="flex items-center gap-1.5 font-semibold">
                {currentSupplier.name} {currentSupplier.verified && <BadgeCheck className="size-4 text-brand" aria-label="Verified supplier" />}
              </p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{currentSupplier.description}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="brand">{currentSupplier.plan}</Badge>
            {currentSupplier.regions.map((r) => (
              <Badge key={r} variant="outline">
                <MapPin /> {REGIONS[r].name}
              </Badge>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
            <div>
              <p className="tabular text-[18px] font-semibold">{new Set(seededOffers.map((o) => o.productId)).size}</p>
              <p className="text-[11.5px] text-muted-foreground">Products</p>
            </div>
            <div>
              <p className="tabular text-[18px] font-semibold">{active.length}</p>
              <p className="text-[11.5px] text-muted-foreground">Active offers</p>
            </div>
            <div>
              <p className="tabular text-[18px] font-semibold">{seededOffers.filter((o) => o.affiliate).length}</p>
              <p className="text-[11.5px] text-muted-foreground">Affiliate</p>
            </div>
          </div>
        </Panel>
        <div className="space-y-4">
          <ScoreIntegrityNotice role="Suppliers">You manage price, stock and availability. Offers are listed by price; affiliate commissions and sponsored placements are always labelled and never change suitability scores, rankings or verdicts.</ScoreIntegrityNotice>
          <Panel title="Stock at a glance">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STOCK_META) as (keyof typeof STOCK_META)[]).map((k) => (
                <StatusDot key={k} tone={STOCK_META[k].tone}>
                  {STOCK_META[k].label} · {active.filter((o) => o.stock === k).length}
                </StatusDot>
              ))}
            </div>
            <Button asChild variant="link" className="mt-3">
              <Link href={routes.sProducts}>Review listed products</Link>
            </Button>
          </Panel>
        </div>
      </div>
    </PageContainer>
  );
}
