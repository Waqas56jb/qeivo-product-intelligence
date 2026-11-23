"use client";

import { History, RotateCcw } from "lucide-react";
import { getProduct } from "@/data/products";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/common/image-with-fallback";

export interface ComparisonSnapshotItem {
  id: string;
  name: string;
  productIds: string[];
  /** ISO datetime */
  createdAt: string;
  verdict?: string;
  /** true for snapshots saved in this session (demo, not persisted) */
  local?: boolean;
}

/** Saved comparison snapshots with a one-tap restore. */
export function ComparisonSnapshot({ snapshots, currentIds, onRestore, className }: { snapshots: ComparisonSnapshotItem[]; currentIds: string[]; onRestore: (s: ComparisonSnapshotItem) => void; className?: string }) {
  const currentKey = [...currentIds].sort().join("|");
  return (
    <section className={cn("rounded-[20px] border border-border bg-card p-5 shadow-xs sm:p-6", className)} aria-labelledby="snapshots-title">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-[9px] bg-surface-2 text-muted-foreground">
          <History className="size-4" />
        </span>
        <div>
          <h3 id="snapshots-title" className="text-[15px] font-semibold">Saved comparisons</h3>
          <p className="text-[12px] text-muted-foreground">Snapshots saved in this demo session appear first. They are not stored on a server.</p>
        </div>
      </div>
      <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {snapshots.map((s) => {
          const items = s.productIds.map((id) => getProduct(id)).filter((p) => p !== undefined);
          const isCurrent = [...s.productIds].sort().join("|") === currentKey;
          return (
            <li key={s.id} className="flex min-w-0 items-center gap-3 rounded-[14px] border border-border bg-surface p-3">
              <div className="flex shrink-0 -space-x-2">
                {items.slice(0, 4).map((p) => (
                  <ImageWithFallback key={p.id} src={p.images[0]} alt="" aspect="size-10 rounded-[9px] border-2 border-surface bg-surface-2" sizes="40px" className="p-0.5" />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold">
                  <span className="truncate">{s.name}</span>
                  {s.local && <Badge variant="brand" className="shrink-0">New</Badge>}
                </p>
                <p className="truncate text-[12px] text-muted-foreground tabular">
                  {items.length} products · {formatDate(s.createdAt)}
                </p>
              </div>
              <Button variant={isCurrent ? "subtle" : "outline"} size="sm" className="h-11 shrink-0 sm:h-9" onClick={() => onRestore(s)} disabled={isCurrent}>
                <RotateCcw /> {isCurrent ? "Current" : "Restore"}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
