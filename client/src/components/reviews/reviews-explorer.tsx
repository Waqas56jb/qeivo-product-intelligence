"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Clock, Info, MessageSquareText, PenLine, Play, SlidersHorizontal, Star, X } from "lucide-react";
import type { Product, Review, Video } from "@/types";
import type { RatingBucket, SentimentSummary as SentimentData } from "@/data/reviews";
import { routes } from "@/config/routes";
import { cn, pluralize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch, Label } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { EmptyState } from "@/components/common/states";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { SponsoredTag } from "@/components/analysis/warnings";
import { ReviewCard } from "./review-card";
import { RatingSummary } from "./rating-summary";
import { SentimentSummary } from "./sentiment-summary";
import { WriteReviewSheet } from "./review-form";
import { ReviewMediaGallery, type ReviewMediaItem } from "./review-media-gallery";

type SortKey = "helpful" | "newest" | "highest" | "lowest";
const SORTS: { value: SortKey; label: string }[] = [
  { value: "helpful", label: "Most helpful" },
  { value: "newest", label: "Newest" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
];

function sortReviews(list: Review[], sort: SortKey) {
  const l = [...list];
  switch (sort) {
    case "newest":
      return l.sort((a, b) => b.date.localeCompare(a.date));
    case "highest":
      return l.sort((a, b) => b.rating - a.rating || b.helpful - a.helpful);
    case "lowest":
      return l.sort((a, b) => a.rating - b.rating || b.helpful - a.helpful);
    default:
      return l.sort((a, b) => b.helpful - a.helpful || b.date.localeCompare(a.date));
  }
}

function Chip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <button type="button" onClick={onRemove} className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-primary bg-primary pl-3.5 pr-2.5 text-[13px] font-medium text-primary-foreground sm:h-9">
      {children}
      <X className="size-3.5 opacity-80" aria-hidden />
      <span className="sr-only">Remove filter</span>
    </button>
  );
}

export function ReviewsExplorer({ product, reviews, buckets, sentiment, videos }: { product: Product; reviews: Review[]; buckets: RatingBucket[]; sentiment: SentimentData; videos: Video[] }) {
  const [stars, setStars] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [photosOnly, setPhotosOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("helpful");
  const [pending, setPending] = useState<Review[]>([]);

  const visible = useMemo(() => {
    const filtered = reviews.filter((r) => (stars === null || r.rating === stars) && (!verifiedOnly || r.verifiedPurchase) && (!photosOnly || r.photos.length > 0));
    return sortReviews(filtered, sort);
  }, [reviews, stars, verifiedOnly, photosOnly, sort]);

  const photoItems: ReviewMediaItem[] = useMemo(
    () => reviews.flatMap((r) => r.photos.map((src, i) => ({ src, alt: `Owner photo ${i + 1} from ${r.authorName}`, caption: `${r.authorName} · “${r.title}”` }))),
    [reviews],
  );
  const ownerVideos = reviews.filter((r) => r.videoThumbnail);
  const verifiedCount = reviews.filter((r) => r.verifiedPurchase).length;
  const filtersActive = stars !== null || verifiedOnly || photosOnly;
  const clear = () => {
    setStars(null);
    setVerifiedOnly(false);
    setPhotosOnly(false);
  };

  const writeButton = (
    <WriteReviewSheet
      product={product}
      onSubmitted={(r) => setPending((p) => [r, ...p])}
      trigger={(open) => (
        <Button variant="brand" onClick={open} className="h-11 w-full">
          <PenLine /> Write a review
        </Button>
      )}
    />
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8">
      {/* ---------------------------------------------------------- Summary column */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:pb-2 scrollbar-none">
        <RatingSummary rating={product.rating} reviewCount={product.reviewCount} buckets={buckets} selected={stars} onSelect={setStars} footer={writeButton} />
        <SentimentSummary summary={sentiment} productId={product.id} />
      </aside>

      {/* ------------------------------------------------------------ Review column */}
      <div className="min-w-0 space-y-6">
        {(photoItems.length > 0 || ownerVideos.length > 0 || videos.length > 0) && (
          <section aria-labelledby="media-heading" className="rounded-[20px] border border-border bg-card p-5 shadow-xs">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="media-heading" className="text-[15px] font-semibold tracking-tight">
                Photos &amp; videos from owners and reviewers
              </h2>
              <span className="text-[12px] text-muted-foreground tabular">
                {pluralize(photoItems.length, "photo")} · {pluralize(ownerVideos.length + videos.length, "video")}
              </span>
            </div>
            <div className={cn("grid gap-5", photoItems.length > 0 && (ownerVideos.length > 0 || videos.length > 0) && "md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-6")}>
            {photoItems.length > 0 && (
              <div className="min-w-0">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                  <Camera className="size-3.5" aria-hidden /> Customer photos
                </p>
                <ReviewMediaGallery items={photoItems} max={8} variant="grid" className="grid-cols-4 sm:grid-cols-4" />
              </div>
            )}
            {(ownerVideos.length > 0 || videos.length > 0) && (
              <div className="min-w-0">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                  <Play className="size-3.5" aria-hidden /> Video reviews
                </p>
                <ul className="scrollbar-none -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
                  {videos.map((v) => (
                    <li key={v.id} className="w-[220px] shrink-0 snap-start">
                      <Link href={routes.video(v.slug)} className="group block">
                        <div className="relative overflow-hidden rounded-[12px] border border-border bg-surface-2">
                          <ImageWithFallback src={v.thumbnail} alt="" aspect="aspect-video" sizes="220px" fit="cover" className="transition-transform duration-500 group-hover:scale-[1.04]" />
                          <span className="absolute inset-0 grid place-items-center bg-navy-950/25">
                            <span className="grid size-10 place-items-center rounded-full bg-surface/95 text-foreground shadow-md transition-transform group-hover:scale-110">
                              <Play className="ml-0.5 size-4 fill-current" aria-hidden />
                            </span>
                          </span>
                          <span className="absolute bottom-2 right-2 rounded-[6px] bg-navy-950/80 px-1.5 py-0.5 text-[11px] font-medium text-white tabular">{v.duration}</span>
                          {v.sponsored && <SponsoredTag className="absolute left-2 top-2" />}
                        </div>
                        <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-snug group-hover:text-brand-soft-foreground">{v.title}</p>
                        <p className="text-[11px] text-muted-foreground">Independent review</p>
                      </Link>
                    </li>
                  ))}
                  {ownerVideos.map((r) => (
                    <li key={r.id} className="w-[220px] shrink-0 snap-start">
                      <a href={`#review-${r.id}`} className="group block">
                        <div className="relative overflow-hidden rounded-[12px] border border-border bg-surface-2">
                          <ImageWithFallback src={r.videoThumbnail!} alt="" aspect="aspect-video" sizes="220px" fit="cover" />
                          <span className="absolute inset-0 grid place-items-center bg-navy-950/25">
                            <span className="grid size-10 place-items-center rounded-full bg-surface/95 text-foreground shadow-md">
                              <Play className="ml-0.5 size-4 fill-current" aria-hidden />
                            </span>
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-snug group-hover:text-brand-soft-foreground">“{r.title}”</p>
                        <p className="text-[11px] text-muted-foreground">Owner clip · {r.authorName}</p>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            </div>
          </section>
        )}

        <section aria-labelledby="written-heading" className="space-y-4">
          {/* Sticky filter / sort bar */}
          <div className="sticky top-14 z-20 -mx-4 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-[16px] sm:border sm:px-4 lg:top-[72px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 id="written-heading" className="text-[15px] font-semibold tracking-tight">
                  Written reviews
                </h2>
                <p className="text-[12px] text-muted-foreground tabular" aria-live="polite">
                  Showing {visible.length + pending.length} of {reviews.length + pending.length}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex h-11 items-center gap-2 rounded-[10px] border border-border bg-surface px-3 sm:h-9">
                  <Switch id="verified-only" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
                  <Label htmlFor="verified-only" className="whitespace-nowrap text-[13px]">
                    Verified only
                  </Label>
                </div>
                <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                  <SelectTrigger size="sm" className="h-11 w-[160px] sm:h-9" aria-label="Sort reviews">
                    <SlidersHorizontal className="size-3.5 text-muted-foreground" aria-hidden />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORTS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="scrollbar-none -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {stars !== null ? (
                <Chip onRemove={() => setStars(null)}>
                  {stars} <Star className="size-3.5 fill-current" strokeWidth={0} aria-hidden /> only
                </Chip>
              ) : (
                [5, 4, 3, 2, 1].map((s) => (
                  <button key={s} type="button" onClick={() => setStars(s)} className="inline-flex h-11 shrink-0 items-center gap-1 rounded-full border border-border bg-surface px-3.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground sm:h-9">
                    {s} <Star className="size-3.5 text-warning" fill="currentColor" strokeWidth={0} aria-hidden />
                  </button>
                ))
              )}
              {verifiedOnly && <Chip onRemove={() => setVerifiedOnly(false)}>Verified purchases</Chip>}
              {photosOnly ? (
                <Chip onRemove={() => setPhotosOnly(false)}>With photos</Chip>
              ) : (
                photoItems.length > 0 && (
                  <button type="button" onClick={() => setPhotosOnly(true)} className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground sm:h-9">
                    <Camera className="size-3.5" aria-hidden /> With photos
                  </button>
                )
              )}
              {filtersActive && (
                <button type="button" onClick={clear} className="inline-flex h-11 shrink-0 items-center px-2 text-[13px] font-medium text-brand-soft-foreground hover:underline sm:h-9">
                  Clear all
                </button>
              )}
            </div>
          </div>

          <p className="flex items-start gap-2 px-1 text-[12px] leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              The rating summary covers all {product.reviewCount.toLocaleString("en-US")} owner ratings; {reviews.length} written reviews are shown in this demo ({verifiedCount} verified). Reviews are owner opinions and never change the suitability score directly.
            </span>
          </p>

          <AnimatePresence initial={false}>
            {pending.map((r) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ReviewCard review={r} pending />
              </motion.div>
            ))}
          </AnimatePresence>

          {visible.length === 0 ? (
            <EmptyState
              icon={MessageSquareText}
              title="No reviews match these filters"
              description={reviews.length ? "Try a different star rating or include unverified purchases." : "No written reviews yet. Be the first to share your experience."}
              action={
                filtersActive ? (
                  <Button variant="outline" onClick={clear}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              {visible.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          )}

          <p className="flex items-center gap-1.5 px-1 text-[12px] text-subtle-foreground">
            <Clock className="size-3.5" aria-hidden /> Reviews are moderated for relevance. Manufacturer responses are shown separately and labelled.
          </p>
        </section>
      </div>
    </div>
  );
}
