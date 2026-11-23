import Link from "next/link";
import { BadgeCheck, Info } from "lucide-react";
import type { Creator } from "@/types";
import { routes } from "@/config/routes";
import { videosByCreator } from "@/data/videos";
import { compactNumber, cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { VIDEO_ORIGIN_META } from "./video-meta";

/** Creator profile summary with channel classification and their own disclosure statement. */
export function CreatorCard({ creator, className }: { creator: Creator; className?: string }) {
  const origin = VIDEO_ORIGIN_META[creator.kind];
  const count = videosByCreator(creator.id).length;
  return (
    <section aria-label={`About ${creator.name}`} className={cn("overflow-hidden rounded-[20px] border border-border bg-card shadow-xs", className)}>
      <div className="relative h-20 sm:h-24">
        <ImageWithFallback src={creator.cover} alt="" aspect="size-full" sizes="(max-width: 1024px) 100vw, 50vw" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
      </div>
      <div className="relative -mt-10 space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <ImageWithFallback src={creator.avatar} alt="" aspect="size-16 rounded-full ring-4 ring-card" sizes="64px" />
          <span className={cn("inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[11px] font-medium", origin.className)}>
            <origin.icon className="size-3.5" /> {origin.label}
          </span>
        </div>
        <div>
          <h3 className="flex items-center gap-1.5 text-[17px] font-semibold">
            {creator.name}
            {creator.verified && <BadgeCheck className="size-4 text-brand" aria-label="Verified creator" />}
          </h3>
          <p className="text-[13px] text-muted-foreground tabular">
            {creator.handle} · {compactNumber(creator.followers)} followers · {count} {count === 1 ? "video" : "videos"} on Qeivo
          </p>
        </div>
        <p className="text-[14px] leading-relaxed text-muted-foreground">{creator.bio}</p>
        <div className="flex flex-wrap gap-1.5">
          {creator.expertise.map((e) => (
            <span key={e} className="rounded-full bg-surface-2 px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
              {e}
            </span>
          ))}
        </div>
        <div className="flex gap-2.5 rounded-[12px] bg-surface-2 p-3.5 text-[12px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-subtle-foreground" />
          <p>
            <strong className="font-semibold text-foreground">Creator disclosure.</strong> {creator.disclosure}
          </p>
        </div>
        <Link href={routes.videos} className="inline-flex text-[13px] font-semibold text-brand-soft-foreground hover:underline">
          Browse the full video library →
        </Link>
      </div>
    </section>
  );
}
