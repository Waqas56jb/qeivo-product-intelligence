"use client";

import { useState } from "react";
import { Flag, MessageSquareReply, Play, Star } from "lucide-react";
import { toast } from "sonner";
import type { Review } from "@/types";
import { getBrand, getProduct } from "@/data/products";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/primitives";
import { ConfirmationDialog } from "@/components/common/controls";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { ClaimTypeBadge } from "@/components/analysis/badges";
import { HelpfulVote } from "./helpful-vote";
import { VerifiedPurchaseBadge } from "./verified-purchase-badge";
import { ReviewMediaGallery } from "./review-media-gallery";

export function StarRow({ rating, size = "sm", className }: { rating: number; size?: "sm" | "md"; className?: string }) {
  return (
    <span className={cn("inline-flex", className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn(size === "md" ? "size-4" : "size-3.5", i <= rating ? "text-warning" : "text-border-strong")} fill="currentColor" strokeWidth={0} aria-hidden />
      ))}
    </span>
  );
}

export interface ReviewCardProps {
  review: Review;
  /** Shorter body and no media — for previews on other screens. */
  compact?: boolean;
  /** Locally submitted review awaiting moderation (demo). Disables voting and reporting. */
  pending?: boolean;
  /** Called after the user confirms a report (the store is already updated). */
  onReport?: (reviewId: string) => void;
  className?: string;
}

/**
 * Owner review. Customer text is always classified as "customer opinion"; a manufacturer
 * reply is rendered in a visually separate, labelled panel so it is never mistaken for owner text.
 */
export function ReviewCard({ review, compact, pending, onReport, className }: ReviewCardProps) {
  const hydrated = useHydrated();
  const reportedIds = useAppStore((s) => s.reported);
  const report = useAppStore((s) => s.report);
  const [confirm, setConfirm] = useState(false);
  const reported = hydrated && reportedIds.includes(review.id);
  const product = getProduct(review.productId);
  const brand = product ? getBrand(product.brandId) : undefined;
  const photos = review.photos.map((src, i) => ({ src, alt: `Photo ${i + 1} from ${review.authorName}'s review`, caption: `${review.authorName} · owned ${review.ownedFor}` }));

  return (
    <article id={`review-${review.id}`} aria-labelledby={`review-${review.id}-title`} className={cn("scroll-mt-32 rounded-[20px] border border-border bg-card p-5 shadow-xs transition-opacity sm:p-6", pending && "border-dashed border-warning/50", reported && "opacity-75", className)}>
      <header className="flex items-start gap-3">
        <UserAvatar src={review.authorAvatar || undefined} name={review.authorName} className="size-10" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <p className="truncate text-[14px] font-semibold">{review.authorName}</p>
            <time dateTime={review.date} className="shrink-0 text-[12px] text-subtle-foreground tabular">
              {formatDate(review.date)}
            </time>
          </div>
          <p className="truncate text-[12px] text-muted-foreground">
            {review.authorLocation} · Owned {review.ownedFor}
          </p>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StarRow rating={review.rating} size="md" />
        {pending ? <Badge variant="warning">Pending moderation</Badge> : <VerifiedPurchaseBadge verified={review.verifiedPurchase} />}
        <ClaimTypeBadge type="customer" size="xs" />
      </div>

      <h3 id={`review-${review.id}-title`} className="mt-3 text-[16px] font-semibold leading-snug">
        {review.title}
      </h3>
      <p className={cn("mt-1.5 text-[14px] leading-relaxed text-foreground/90", compact && "line-clamp-4")}>{review.body}</p>

      {!compact && review.aspects.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Aspects mentioned">
          {review.aspects.map((a) => (
            <li key={a.label} className={cn("inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-medium", a.sentiment === "positive" ? "bg-success-soft text-success" : "bg-danger-soft text-danger-foreground")}>
              <span aria-hidden>{a.sentiment === "positive" ? "+" : "−"}</span>
              <span className="sr-only">{a.sentiment === "positive" ? "Liked:" : "Disliked:"}</span>
              {a.label}
            </li>
          ))}
        </ul>
      )}

      {!compact && (photos.length > 0 || review.videoThumbnail) && (
        <div className="mt-4 flex flex-wrap items-start gap-2">
          <ReviewMediaGallery items={photos} />
          {review.videoThumbnail && (
            <button
              type="button"
              onClick={() => toast.info("Owner video playback isn't available in this demo", { description: "In the live product the clip would open here." })}
              className="group relative size-[72px] overflow-hidden rounded-[12px] border border-border bg-surface-2 sm:size-20"
              aria-label={`Play video attached by ${review.authorName}`}
            >
              <ImageWithFallback src={review.videoThumbnail} alt="" aspect="size-full" sizes="80px" fit="cover" />
              <span className="absolute inset-0 grid place-items-center bg-navy-950/40">
                <span className="grid size-8 place-items-center rounded-full bg-surface/95 text-foreground shadow-md transition-transform group-hover:scale-110">
                  <Play className="ml-0.5 size-3.5 fill-current" />
                </span>
              </span>
            </button>
          )}
        </div>
      )}

      {review.manufacturerReply && (
        <aside aria-label={`Response from ${review.manufacturerReply.author}`} className="mt-5 rounded-[14px] border border-claim-manufacturer/25 bg-claim-manufacturer-soft/45 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {brand ? (
              <span className="grid size-6 place-items-center rounded-[7px] text-[9px] font-bold text-white" style={{ backgroundColor: brand.color }} aria-hidden>
                {brand.mark}
              </span>
            ) : (
              <MessageSquareReply className="size-4 text-claim-manufacturer" aria-hidden />
            )}
            <span className="text-[13px] font-semibold">{review.manufacturerReply.author}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-claim-manufacturer">Manufacturer response</span>
            <time dateTime={review.manufacturerReply.date} className="ml-auto text-[12px] text-subtle-foreground tabular">
              {formatDate(review.manufacturerReply.date)}
            </time>
          </div>
          <p className={cn("mt-2 text-[13px] leading-relaxed text-muted-foreground", compact && "line-clamp-3")}>{review.manufacturerReply.body}</p>
        </aside>
      )}

      {!pending && (
        <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          <HelpfulVote reviewId={review.id} baseCount={review.helpful} />
          {reported ? (
            <span className="inline-flex h-11 items-center gap-1.5 text-[12px] font-medium text-muted-foreground sm:h-9">
              <Flag className="size-3.5" aria-hidden /> Reported · awaiting moderator review (demo)
            </span>
          ) : (
            <button type="button" onClick={() => setConfirm(true)} className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground sm:h-9">
              <Flag className="size-3.5" aria-hidden /> Report
            </button>
          )}
        </footer>
      )}

      <ConfirmationDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Report this review?"
        description="Flag reviews that are spam, offensive, off-topic or appear to be written by someone who doesn't own the product. Moderators check every report."
        confirmLabel="Report review"
        destructive
        onConfirm={() => {
          report(review.id);
          onReport?.(review.id);
          toast.success("Report received (demo)", { description: "A moderator would review it. Nothing has been sent in this demo." });
        }}
      />
    </article>
  );
}
