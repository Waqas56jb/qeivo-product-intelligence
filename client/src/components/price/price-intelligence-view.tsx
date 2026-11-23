"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, BellPlus, BellRing, Eye, Pencil, TrendingDown } from "lucide-react";
import { getProduct, requireProduct } from "@/data/products";
import { priceHistory, priceStats } from "@/data/offers/price-history";
import { routes } from "@/config/routes";
import { formatPrice, REGIONS } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartCard, PriceHistoryChart } from "@/components/charts";
import { EmptyState } from "@/components/common/states";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { BrandLabel } from "@/components/product/product-bits";
import { lowestPrice, regionalOffers } from "./price-utils";
import { RetailerOfferList } from "./retailer-offers";
import { AlertPreferencesCard, TargetDialog, WatchlistPanel } from "./watchlist";

function ProductPicker({ ids, watched, selected, onSelect }: { ids: string[]; watched: Set<string>; selected: string; onSelect: (id: string) => void }) {
  return (
    <div role="radiogroup" aria-label="Choose a product" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {ids.map((id) => {
        const p = requireProduct(id);
        const active = id === selected;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(id)}
            className={cn(
              "flex h-12 shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-[13px] font-medium outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/30",
              active ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
            )}
          >
            <ImageWithFallback src={p.images[0]} alt="" aspect="size-10 shrink-0 rounded-full bg-surface-2" sizes="40px" className="p-1" />
            <span className="max-w-[160px] truncate">{p.model}</span>
            {watched.has(id) && <BellRing className={cn("size-3.5", active ? "text-brand" : "text-brand")} aria-label="Watching" />}
          </button>
        );
      })}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0 rounded-[12px] bg-surface-2/70 px-3 py-2.5">
      <dt className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">{label}</dt>
      <dd className={cn("mt-0.5 truncate text-[15px] font-semibold tabular", tone)}>{value}</dd>
    </div>
  );
}

export function PriceIntelligenceView() {
  const hydrated = useHydrated();
  const storeRegion = useAppStore((s) => s.region);
  const watchlist = useAppStore((s) => s.watchlist);
  const saved = useAppStore((s) => s.saved);
  const compareCount = useAppStore((s) => s.compare.length);
  const [picked, setPicked] = useState<string | null>(null);
  const [targetOpen, setTargetOpen] = useState(false);

  if (!hydrated)
    return (
      <div className="space-y-4" aria-busy aria-label="Loading price data">
        <div className="flex gap-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-40 rounded-full" />)}</div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Skeleton className="h-[640px] rounded-[20px]" />
          <Skeleton className="h-[420px] rounded-[14px]" />
        </div>
      </div>
    );

  const region = storeRegion;
  const watched = new Set(watchlist.map((w) => w.productId));
  const ids = Array.from(new Set([...watchlist.map((w) => w.productId), ...saved])).filter((id) => getProduct(id));
  const selectedId = picked && ids.includes(picked) ? picked : ids[0];

  if (!selectedId)
    return <EmptyState icon={TrendingDown} title="Nothing to track yet" description="Save products or add them to your price watch to see retailer offers and price history here." action={<Button asChild><Link href={routes.products}>Browse products</Link></Button>} />;

  const product = requireProduct(selectedId);
  const { offers, fallback } = regionalOffers(product.id, region);
  const lowest = lowestPrice(product.id, region);
  const stats = priceStats(product.id);
  const watch = watchlist.find((w) => w.productId === product.id);
  const atLow = stats.isLow || lowest <= stats.low;
  const vsAvg = (lowest - stats.avg) / stats.avg;
  const trayVisible = compareCount > 0;

  return (
    <>
      <ProductPicker ids={ids} watched={watched} selected={selectedId} onSelect={setPicked} />

      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <section className="overflow-hidden rounded-[20px] border border-border bg-card shadow-xs">
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-6">
              <ImageWithFallback src={product.images[0]} alt={product.name} aspect="aspect-[4/3] w-full shrink-0 rounded-[14px] bg-gradient-to-b from-surface-2 to-surface-3/60 sm:aspect-square sm:w-36" sizes="(max-width: 640px) 100vw, 144px" className="p-3" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <BrandLabel brandId={product.brandId} withMark />
                    <h2 className="mt-1.5 text-[22px] font-semibold leading-tight tracking-tight">
                      <Link href={routes.product(product.slug)} className="hover:underline">{product.model}</Link>
                    </h2>
                    <p className="text-[13px] text-muted-foreground">{product.modelNumber} · {REGIONS[region].flag} {REGIONS[region].name}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">Lowest price now</p>
                    <p className="tabular text-[32px] font-semibold leading-none tracking-tight">{formatPrice(lowest, region)}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5 sm:justify-end">
                      {atLow && <Badge variant="success"><TrendingDown /> At 52-week low</Badge>}
                      <Badge variant={vsAvg <= 0 ? "success" : "warning"} className="tabular">
                        {vsAvg <= 0 ? <ArrowDownRight /> : <ArrowUpRight />}
                        {Math.abs(Math.round(vsAvg * 100))}% {vsAvg <= 0 ? "below" : "above"} avg
                      </Badge>
                    </div>
                  </div>
                </div>
                <dl className="mt-5 grid grid-cols-3 gap-2">
                  <Stat label="52-wk low" value={formatPrice(stats.low, region)} tone="text-success" />
                  <Stat label="52-wk avg" value={formatPrice(stats.avg, region)} />
                  <Stat label="52-wk high" value={formatPrice(stats.high, region)} />
                </dl>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-border bg-surface-2/40 px-5 py-3 sm:px-6">
              {watch ? (
                <>
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <BellRing className="size-4 text-brand" /> Watching · target <strong className="tabular text-foreground">{formatPrice(watch.targetPrice, region)}</strong>
                  </span>
                  <Button size="sm" variant="outline" className="ml-auto h-10 sm:h-8" onClick={() => setTargetOpen(true)}><Pencil /> Edit target</Button>
                </>
              ) : (
                <>
                  <span className="text-[13px] text-muted-foreground">Get alerted when the price drops.</span>
                  <Button size="sm" variant="brand" className="ml-auto hidden h-8 sm:inline-flex" onClick={() => setTargetOpen(true)}><BellPlus /> Watch price</Button>
                </>
              )}
              <Button asChild size="sm" variant="ghost" className="h-10 sm:h-8"><Link href={routes.product(product.slug)}><Eye /> Product</Link></Button>
            </div>
          </section>

          <ChartCard title="Price history" description={`Lowest observed price each week in ${REGIONS[region].currency}${watch ? " · dashed line is your target" : ""}`}>
            <PriceHistoryChart key={product.id} points={priceHistory(product.id)} targetPrice={watch?.targetPrice} height={260} />
          </ChartCard>

          <RetailerOfferList key={`${product.id}-${region}`} product={product} offers={offers} region={region} fallback={fallback} />
        </div>

        <aside className="space-y-5">
          <WatchlistPanel items={watchlist} region={region} selectedId={selectedId} onSelect={setPicked} />
          <AlertPreferencesCard />
          <p className="px-1 text-[12px] leading-relaxed text-subtle-foreground">
            Prices are observed from retailer feeds and may lag the retailer&apos;s site. Qeivo reference price: {formatPrice(product.price, region)}. Affiliate status never affects offer order.
          </p>
        </aside>
      </div>

      <TargetDialog key={`${product.id}-${watch?.targetPrice ?? "new"}`} productId={product.id} region={region} open={targetOpen} onOpenChange={setTargetOpen} initialUsd={watch?.targetPrice} />

      {/* Mobile sticky watch action */}
      {!watch && (
        <div className={cn("fixed inset-x-3 z-30 sm:hidden", trayVisible ? "bottom-[152px]" : "bottom-[84px]")}>
          <div className="flex items-center gap-3 rounded-[16px] border border-border bg-popover/95 p-2 pl-4 shadow-lg backdrop-blur-xl">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] text-muted-foreground">{product.model}</p>
              <p className="tabular text-[15px] font-semibold">{formatPrice(lowest, region)}</p>
            </div>
            <Button variant="brand" className="h-11" onClick={() => setTargetOpen(true)}><BellPlus /> Watch price</Button>
          </div>
        </div>
      )}
    </>
  );
}
