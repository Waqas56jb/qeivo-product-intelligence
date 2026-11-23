"use client";

import type { RatingBucket } from "@/data/reviews";
import { cn } from "@/lib/utils";
import { RatingDistribution } from "@/components/charts/domain-charts";
import { ProductRating } from "@/components/product/product-bits";

export function distributionRecord(buckets: RatingBucket[]): Record<1 | 2 | 3 | 4 | 5, number> {
  const rec = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
  for (const b of buckets) rec[b.stars] = b.count;
  return rec;
}

/** Average rating, total count and clickable star distribution. */
export function RatingSummary({ rating, reviewCount, buckets, selected, onSelect, footer, className }: { rating: number; reviewCount: number; buckets: RatingBucket[]; selected?: number | null; onSelect?: (stars: number | null) => void; footer?: React.ReactNode; className?: string }) {
  const recommend = Math.round(buckets.filter((b) => b.stars >= 4).reduce((s, b) => s + b.percent, 0));
  return (
    <section aria-labelledby="rating-summary-heading" className={cn("rounded-[20px] border border-border bg-card p-5 shadow-xs", className)}>
      <h2 id="rating-summary-heading" className="sr-only">
        Rating summary
      </h2>
      <div className="flex items-end gap-4">
        <span className="tabular text-[48px] font-semibold leading-none tracking-tight">{rating.toFixed(1)}</span>
        <div className="space-y-1 pb-1">
          <ProductRating rating={rating} size="md" className="[&>span:nth-child(2)]:sr-only" />
          <p className="text-[12px] text-muted-foreground tabular">{reviewCount.toLocaleString("en-US")} owner ratings</p>
        </div>
      </div>
      <p className="mt-3 text-[13px] text-muted-foreground">
        <strong className="tabular font-semibold text-foreground">{recommend}%</strong> of owners rate it 4 stars or higher.
      </p>
      <div className="mt-4">
        <RatingDistribution counts={distributionRecord(buckets)} onSelect={onSelect} selected={selected} />
        {onSelect && <p className="mt-2 text-[11px] text-subtle-foreground">Select a row to filter written reviews by star rating.</p>}
      </div>
      {footer && <div className="mt-5 border-t border-border pt-4">{footer}</div>}
    </section>
  );
}
