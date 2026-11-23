"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import type { PricePoint } from "@/types";
import { formatCurrency, formatDate, regionalPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/tabs";
import { LineChart } from "./charts";

/** Price history in the selected region's currency with range control. */
export function PriceHistoryChart({ points, height = 240, targetPrice, className }: { points: PricePoint[]; height?: number; targetPrice?: number; className?: string }) {
  const [range, setRange] = useState<"3m" | "6m" | "12m">("12m");
  const hydrated = useHydrated();
  const storeRegion = useAppStore((s) => s.region);
  const region = hydrated ? storeRegion : "US";
  const data = useMemo(() => {
    const n = range === "3m" ? 13 : range === "6m" ? 26 : 52;
    return points.slice(-n).map((p) => ({ date: p.date, price: regionalPrice(p.price, region) }));
  }, [points, range, region]);
  const prices = data.map((d) => d.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-5 text-[12px]">
          <span className="text-muted-foreground">
            Low <strong className="tabular text-foreground">{formatCurrency(low, region)}</strong>
          </span>
          <span className="text-muted-foreground">
            High <strong className="tabular text-foreground">{formatCurrency(high, region)}</strong>
          </span>
        </div>
        <ToggleGroup type="single" value={range} onValueChange={(v) => v && setRange(v as typeof range)} aria-label="Price history range">
          <ToggleGroupItem value="3m">3M</ToggleGroupItem>
          <ToggleGroupItem value="6m">6M</ToggleGroupItem>
          <ToggleGroupItem value="12m">12M</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <LineChart
        data={data}
        xKey="date"
        series={[{ key: "price", label: "Lowest observed price" }]}
        height={height}
        valueFormatter={(v) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v)}
        xFormatter={(v) => formatDate(v, "d MMM")}
        yWidth={52}
        referenceY={targetPrice ? { value: regionalPrice(targetPrice, region), label: "Your target" } : undefined}
      />
    </div>
  );
}

/** Horizontal rating distribution (5★ → 1★). Not a Recharts chart: simple accessible bars. */
export function RatingDistribution({ counts, className, onSelect, selected }: { counts: Record<1 | 2 | 3 | 4 | 5, number>; className?: string; onSelect?: (stars: number | null) => void; selected?: number | null }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return (
    <ul className={cn("space-y-1.5", className)}>
      {([5, 4, 3, 2, 1] as const).map((s) => {
        const pct = (counts[s] / total) * 100;
        const Comp = onSelect ? "button" : "div";
        return (
          <li key={s}>
            <Comp
              {...(onSelect ? { type: "button" as const, onClick: () => onSelect(selected === s ? null : s), "aria-pressed": selected === s } : {})}
              className={cn("flex w-full items-center gap-3 rounded-[8px] px-1 py-0.5 text-[13px]", onSelect && "hover:bg-surface-2", selected === s && "bg-brand-soft/50")}
            >
              <span className="flex w-8 shrink-0 items-center gap-0.5 tabular text-muted-foreground">
                {s}
                <Star className="size-3 text-warning" fill="currentColor" strokeWidth={0} />
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
                <span className="block h-full rounded-full bg-warning" style={{ width: `${pct}%` }} />
              </span>
              <span className="w-10 shrink-0 text-right tabular text-muted-foreground">{Math.round(pct)}%</span>
            </Comp>
          </li>
        );
      })}
    </ul>
  );
}

/** Stacked sentiment bar (positive / mixed / negative), always labelled. */
export function SentimentBar({ positive, mixed, negative, className }: { positive: number; mixed: number; negative: number; className?: string }) {
  const segs = [
    { label: "Positive", value: positive, className: "bg-success" },
    { label: "Mixed", value: mixed, className: "bg-warning" },
    { label: "Negative", value: negative, className: "bg-danger" },
  ];
  return (
    <div className={className}>
      <div className="flex h-2.5 gap-[2px] overflow-hidden rounded-full" role="img" aria-label={`Sentiment: ${positive}% positive, ${mixed}% mixed, ${negative}% negative`}>
        {segs.map((s) => (
          <span key={s.label} className={cn("h-full first:rounded-l-full last:rounded-r-full", s.className)} style={{ width: `${s.value}%` }} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
        {segs.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", s.className)} /> {s.label} <strong className="tabular text-foreground">{s.value}%</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
