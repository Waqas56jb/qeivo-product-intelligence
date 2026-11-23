import Link from "next/link";
import { BadgeCheck, Play } from "lucide-react";
import type { Video } from "@/types";
import { routes } from "@/config/routes";
import { compactNumber, cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { SponsoredTag } from "@/components/analysis/warnings";
import { VIDEO_KIND_META, videoCreator } from "./video-meta";

export function VideoKindBadge({ kind, className, onDark }: { kind: Video["kind"]; className?: string; onDark?: boolean }) {
  const m = VIDEO_KIND_META[kind];
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full border px-2 text-[11px] font-medium",
        onDark ? "border-white/15 bg-navy-950/70 text-white backdrop-blur-md" : m.className,
        className,
      )}
    >
      <m.icon className="size-3.5" aria-hidden /> {m.label}
    </span>
  );
}

function Thumb({ video, sizes, priority, large }: { video: Video; sizes: string; priority?: boolean; large?: boolean }) {
  return (
    <div className="relative">
      <ImageWithFallback src={video.thumbnail} alt="" aspect="aspect-video" sizes={sizes} priority={priority} className="transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-navy-950/0 to-navy-950/10" />
      <span
        aria-hidden
        className={cn(
          "absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy-950 shadow-lg backdrop-blur transition-transform duration-300 group-hover:scale-110",
          large ? "size-16" : "size-11",
        )}
      >
        <Play className={cn("translate-x-[1px] fill-current", large ? "size-6" : "size-4")} />
      </span>
      <span className="absolute bottom-2.5 right-2.5 rounded-[6px] bg-navy-950/80 px-1.5 py-0.5 text-[11px] font-semibold text-white tabular backdrop-blur">{video.duration}</span>
      <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
        <VideoKindBadge kind={video.kind} onDark />
        {video.sponsored && <SponsoredTag className="h-6 shadow-sm" />}
      </div>
    </div>
  );
}

/**
 * Generic video card used across the public library, product pages and the
 * customer app. `grid` for galleries, `list` for side rails, `feature` for heroes.
 */
export function VideoCard({ video, variant = "grid", href, className, priority, showCreator = true }: { video: Video; variant?: "grid" | "list" | "feature"; href?: string; className?: string; priority?: boolean; showCreator?: boolean }) {
  const link = href ?? routes.video(video.slug);
  const creator = videoCreator(video);

  if (variant === "list")
    return (
      <Link href={link} className={cn("group flex gap-3 rounded-[14px] p-2 transition-colors hover:bg-surface-2", className)}>
        <div className="relative w-36 shrink-0 overflow-hidden rounded-[10px] sm:w-40">
          <ImageWithFallback src={video.thumbnail} alt="" aspect="aspect-video" sizes="160px" className="transition-transform duration-500 group-hover:scale-105" />
          <span className="absolute bottom-1.5 right-1.5 rounded-[5px] bg-navy-950/80 px-1 py-px text-[10px] font-semibold text-white tabular">{video.duration}</span>
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <p className="line-clamp-2 text-[13px] font-semibold leading-snug group-hover:text-brand-soft-foreground">{video.title}</p>
          {showCreator && creator && <p className="mt-1 truncate text-[12px] text-muted-foreground">{creator.name}</p>}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-subtle-foreground tabular">{compactNumber(video.views)} views</span>
            {video.sponsored && <SponsoredTag className="py-0" />}
          </div>
        </div>
      </Link>
    );

  if (variant === "feature")
    return (
      <Link href={link} className={cn("group relative block overflow-hidden rounded-[24px] border border-border bg-card shadow-sm transition-shadow hover:shadow-lg", className)}>
        <Thumb video={video} sizes="(max-width: 1024px) 100vw, 60vw" priority={priority} large />
        <div className="space-y-3 p-5 sm:p-6">
          <h3 className="text-balance text-[20px] font-semibold leading-snug sm:text-[24px]">{video.title}</h3>
          <p className="line-clamp-2 text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">{video.description}</p>
          {creator && <CreatorLine video={video} />}
        </div>
      </Link>
    );

  return (
    <Link href={link} className={cn("group flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-xs transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md", className)}>
      <Thumb video={video} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" priority={priority} />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">{video.title}</h3>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{video.description}</p>
        {showCreator && creator && <CreatorLine video={video} className="mt-auto pt-2" />}
      </div>
    </Link>
  );
}

function CreatorLine({ video, className }: { video: Video; className?: string }) {
  const creator = videoCreator(video);
  if (!creator) return null;
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <ImageWithFallback src={creator.avatar} alt="" aspect="size-7 shrink-0 rounded-full" sizes="28px" />
      <div className="min-w-0 flex-1 text-[12px] leading-tight">
        <p className="flex items-center gap-1 truncate font-semibold">
          {creator.name}
          {creator.verified && <BadgeCheck className="size-3.5 shrink-0 text-brand" aria-label="Verified creator" />}
        </p>
        <p className="truncate text-subtle-foreground tabular">
          {compactNumber(video.views)} views · {formatDate(video.publishedAt)}
        </p>
      </div>
    </div>
  );
}
