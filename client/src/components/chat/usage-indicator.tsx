"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { FREE_CHAT_LIMIT, PREMIUM_CHAT_LIMIT, useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Progress } from "@/components/ui/primitives";

export function useChatUsage() {
  const hydrated = useHydrated();
  const used = useAppStore((s) => s.chatUsed);
  const plan = useAppStore((s) => s.plan);
  const effectivePlan = hydrated ? plan : "premium";
  const limit = effectivePlan === "free" ? FREE_CHAT_LIMIT : PREMIUM_CHAT_LIMIT;
  const value = hydrated ? used : 37;
  return { used: value, limit, plan: effectivePlan, remaining: Math.max(0, limit - value), atLimit: value >= limit, hydrated };
}

/** Monthly Ask Qeivo allowance. `compact` is a header pill, `card` sits at the foot of the history panel. */
export function UsageIndicator({ variant = "card", className }: { variant?: "card" | "compact"; className?: string }) {
  const { used, limit, plan, remaining, atLimit } = useChatUsage();
  const pct = Math.min(100, (used / limit) * 100);
  const tone = atLimit ? "bg-danger" : pct >= 80 ? "bg-warning" : "bg-brand";
  if (variant === "compact")
    return (
      <Link
        href={routes.billing}
        className={cn("inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground", className)}
        aria-label={`${used} of ${limit} questions used this month on the ${plan} plan`}
      >
        <span className="relative size-4" aria-hidden>
          <svg viewBox="0 0 20 20" className="size-4 -rotate-90">
            <circle cx="10" cy="10" r="8" fill="none" strokeWidth="3" className="stroke-surface-3" />
            <circle cx="10" cy="10" r="8" fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 50.3} 50.3`} className={atLimit ? "stroke-danger" : pct >= 80 ? "stroke-warning" : "stroke-brand"} />
          </svg>
        </span>
        <span className="tabular">
          {used}/{limit}
        </span>
      </Link>
    );
  return (
    <div className={cn("rounded-[14px] border border-border bg-surface-2/60 p-3", className)}>
      <div className="flex items-center justify-between gap-2 text-[12px]">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <Sparkles className="size-3.5 text-brand" /> {plan === "free" ? "Free plan" : "Premium"}
        </span>
        <span className="tabular text-muted-foreground">
          {used} / {limit} this month
        </span>
      </div>
      <Progress value={pct} className="mt-2 h-1.5" indicatorClassName={tone} />
      <p className="mt-2 text-[12px] text-muted-foreground">
        {atLimit ? (
          <>
            Limit reached.{" "}
            <Link href={routes.billing} className="font-medium text-brand-soft-foreground hover:underline">
              Upgrade
            </Link>
          </>
        ) : (
          <>
            <span className="tabular">{remaining}</span> questions left · resets 14 Dec
          </>
        )}
      </p>
    </div>
  );
}
