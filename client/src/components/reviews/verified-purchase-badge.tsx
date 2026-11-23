import { BadgeCheck, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";

/** Purchase verification marker. Unverified reviews are labelled, never hidden. */
export function VerifiedPurchaseBadge({ verified = true, className }: { verified?: boolean; className?: string }) {
  if (!verified)
    return (
      <span className={cn("inline-flex h-6 items-center gap-1 rounded-full border border-border bg-surface px-2 text-[11px] font-medium text-muted-foreground", className)}>
        <CircleDashed className="size-3.5" aria-hidden /> Purchase not verified
      </span>
    );
  return (
    <span className={cn("inline-flex h-6 items-center gap-1 rounded-full bg-success-soft px-2 text-[11px] font-semibold text-success", className)}>
      <BadgeCheck className="size-3.5" aria-hidden /> Verified purchase
    </span>
  );
}
