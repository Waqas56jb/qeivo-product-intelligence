"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, BookmarkCheck, GitCompareArrows, X } from "lucide-react";
import { toast } from "sonner";
import { getProduct } from "@/data/products";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import { MAX_COMPARE, useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/primitives";
import { Hint } from "@/components/ui/tooltip";
import { ImageWithFallback } from "@/components/common/image-with-fallback";

export function useSaved(productId: string) {
  const hydrated = useHydrated();
  const saved = useAppStore((s) => s.saved.includes(productId));
  const toggle = useAppStore((s) => s.toggleSaved);
  return {
    saved: hydrated && saved,
    toggle: () => {
      const now = toggle(productId);
      const p = getProduct(productId);
      toast.success(now ? "Saved to research" : "Removed from saved", { description: p?.name, action: now ? { label: "View", onClick: () => (window.location.href = routes.saved) } : undefined });
    },
  };
}

export function useCompare(productId: string) {
  const hydrated = useHydrated();
  const inCompare = useAppStore((s) => s.compare.includes(productId));
  const toggle = useAppStore((s) => s.toggleCompare);
  return {
    inCompare: hydrated && inCompare,
    toggle: () => {
      const r = toggle(productId);
      if (r === "full") toast.error(`You can compare up to ${MAX_COMPARE} products`, { description: "Remove one from the comparison tray first." });
      else if (r === "added") toast.success("Added to comparison", { description: getProduct(productId)?.name });
    },
  };
}

export function SaveButton({ productId, variant = "icon", className }: { productId: string; variant?: "icon" | "button" | "overlay"; className?: string }) {
  const { saved, toggle } = useSaved(productId);
  const Icon = saved ? BookmarkCheck : Bookmark;
  if (variant === "button")
    return (
      <Button variant={saved ? "subtle" : "outline"} onClick={toggle} className={className} aria-pressed={saved}>
        <Icon /> {saved ? "Saved" : "Save"}
      </Button>
    );
  return (
    <Hint label={saved ? "Remove from saved" : "Save to research"}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle();
        }}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save product"}
        className={cn(
          "grid size-9 place-items-center rounded-full transition-all",
          variant === "overlay" ? "bg-surface/90 shadow-sm backdrop-blur hover:bg-surface" : "hover:bg-surface-2",
          saved ? "text-brand" : "text-muted-foreground hover:text-foreground",
          className,
        )}
      >
        <Icon className={cn("size-[18px]", saved && "fill-brand/15")} />
      </button>
    </Hint>
  );
}

export function CompareToggle({ productId, variant = "checkbox", className }: { productId: string; variant?: "checkbox" | "button"; className?: string }) {
  const { inCompare, toggle } = useCompare(productId);
  if (variant === "button")
    return (
      <Button variant={inCompare ? "subtle" : "outline"} onClick={toggle} className={className} aria-pressed={inCompare}>
        <GitCompareArrows /> {inCompare ? "In comparison" : "Compare"}
      </Button>
    );
  return (
    <label
      className={cn("inline-flex cursor-pointer select-none items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox checked={inCompare} onCheckedChange={toggle} aria-label="Add to comparison" />
      Compare
    </label>
  );
}

/** Floating tray summarising products queued for comparison. */
export function CompareTray({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const ids = useAppStore((s) => s.compare);
  const toggle = useAppStore((s) => s.toggleCompare);
  const clear = useAppStore((s) => s.clearCompare);
  const items = hydrated ? ids.map((id) => getProduct(id)).filter((p) => p !== undefined) : [];
  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className={cn("fixed inset-x-3 bottom-[76px] z-40 mx-auto max-w-2xl lg:bottom-5", className)}
        >
          <div className="flex items-center gap-3 rounded-[18px] border border-border bg-popover/95 p-2.5 pl-3 shadow-lg backdrop-blur-xl">
            <div className="flex -space-x-2">
              {items.map((p) => (
                <div key={p.id} className="group relative size-11 overflow-hidden rounded-[10px] border-2 border-popover bg-surface-2">
                  <ImageWithFallback src={p.images[0]} alt={p.name} aspect="size-full" sizes="44px" fit="contain" className="p-1" />
                  <button type="button" onClick={() => toggle(p.id)} aria-label={`Remove ${p.name} from comparison`} className="absolute inset-0 grid place-items-center bg-navy-950/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100">
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              {Array.from({ length: MAX_COMPARE - items.length }, (_, i) => (
                <div key={i} className="hidden size-11 rounded-[10px] border-2 border-dashed border-border-strong bg-surface sm:block" aria-hidden />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold tabular">{items.length} of {MAX_COMPARE} selected</p>
              <p className="truncate text-[12px] text-muted-foreground">{items.length < 2 ? "Add at least one more product" : items.map((p) => p.model).join(" · ")}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={clear} className="hidden sm:inline-flex">
              Clear
            </Button>
            <Button asChild size="sm" variant="brand" className={cn(items.length < 2 && "pointer-events-none opacity-50")} aria-disabled={items.length < 2}>
              <Link href={routes.compare}>
                <GitCompareArrows /> Compare
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
