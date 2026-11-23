"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ImageWithFallback } from "@/components/common/image-with-fallback";

export interface ReviewMediaItem {
  src: string;
  alt: string;
  /** e.g. "Priya Raman · 8 months owned" */
  caption?: string;
}

/** Full-screen photo viewer with previous/next buttons and arrow-key navigation. */
export function ReviewLightbox({ items, index, open, onOpenChange, onIndexChange }: { items: ReviewMediaItem[]; index: number; open: boolean; onOpenChange: (o: boolean) => void; onIndexChange: (i: number) => void }) {
  const item = items[index];
  const many = items.length > 1;
  const go = (d: number) => onIndexChange((index + d + items.length) % items.length);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl gap-0 overflow-hidden p-0"
        onKeyDown={(e) => {
          if (!many) return;
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        <DialogTitle className="sr-only">Customer photo {index + 1} of {items.length}</DialogTitle>
        <DialogDescription className="sr-only">Use the left and right arrow keys to browse photos.</DialogDescription>
        {item && (
          <>
            <div className="relative bg-navy-950">
              <ImageWithFallback key={item.src} src={item.src} alt={item.alt} fit="contain" aspect="aspect-[4/3] w-full" sizes="(max-width: 1024px) 100vw, 900px" />
              {many && (
                <>
                  <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-foreground shadow-md backdrop-blur transition-colors hover:bg-surface">
                    <ChevronLeft className="size-5" />
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-foreground shadow-md backdrop-blur transition-colors hover:bg-surface">
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-3.5">
              <p className="min-w-0 truncate text-[13px] text-muted-foreground">{item.caption ?? item.alt}</p>
              <span className="shrink-0 tabular text-[12px] font-medium text-subtle-foreground">
                {index + 1} / {items.length}
              </span>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Thumbnail strip or grid of customer photos; each opens the lightbox. */
export function ReviewMediaGallery({ items, variant = "strip", max, className }: { items: ReviewMediaItem[]; variant?: "strip" | "grid"; max?: number; className?: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  if (!items.length) return null;
  const shown = max ? items.slice(0, max) : items;
  const hidden = items.length - shown.length;
  return (
    <>
      <ul className={cn(variant === "grid" ? "grid grid-cols-3 gap-2 sm:grid-cols-4" : "flex flex-wrap gap-2", className)}>
        {shown.map((item, i) => {
          const isLast = hidden > 0 && i === shown.length - 1;
          return (
            <li key={`${item.src}-${i}`}>
              <button
                type="button"
                onClick={() => {
                  setIndex(i);
                  setOpen(true);
                }}
                aria-label={isLast ? `View all ${items.length} photos` : `Open photo: ${item.alt}`}
                className={cn("group relative block overflow-hidden rounded-[12px] border border-border bg-surface-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40", variant === "grid" ? "aspect-square w-full" : "size-[72px] sm:size-20")}
              >
                <ImageWithFallback src={item.src} alt="" aspect="size-full" sizes="160px" fit="cover" className="transition-transform duration-500 group-hover:scale-[1.06]" />
                <span className="absolute inset-0 grid place-items-center bg-navy-950/0 text-white opacity-0 transition-all group-hover:bg-navy-950/35 group-hover:opacity-100">
                  <Expand className="size-4" aria-hidden />
                </span>
                {isLast && <span className="absolute inset-0 grid place-items-center bg-navy-950/60 text-[15px] font-semibold text-white tabular">+{hidden + 1}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <ReviewLightbox items={items} index={index} open={open} onOpenChange={setOpen} onIndexChange={setIndex} />
    </>
  );
}
