"use client";

import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";

/** "Helpful" toggle persisted in the demo store. Count = seeded votes + your vote. */
export function HelpfulVote({ reviewId, baseCount, disabled, className }: { reviewId: string; baseCount: number; disabled?: boolean; className?: string }) {
  const hydrated = useHydrated();
  const voted = useAppStore((s) => Boolean(s.helpful[reviewId]));
  const toggle = useAppStore((s) => s.toggleHelpful);
  const active = hydrated && voted;
  const count = baseCount + (active ? 1 : 0);
  return (
    <button
      type="button"
      onClick={() => toggle(reviewId)}
      disabled={disabled}
      aria-pressed={active}
      aria-label={`${active ? "Remove helpful vote" : "Mark as helpful"} (${count} people found this helpful)`}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 sm:h-9",
        active ? "border-brand/40 bg-brand-soft text-brand-soft-foreground" : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
        className,
      )}
    >
      <ThumbsUp className={cn("size-4", active && "fill-current")} aria-hidden />
      Helpful
      <span className="tabular text-[12px] opacity-80">{count.toLocaleString("en-US")}</span>
    </button>
  );
}
