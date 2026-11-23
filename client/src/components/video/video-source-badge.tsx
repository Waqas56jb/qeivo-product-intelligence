import type { Video } from "@/types";
import { cn } from "@/lib/utils";
import { SponsoredDisclosure, SponsoredTag } from "@/components/analysis/warnings";
import { VIDEO_ORIGIN_META, videoOrigin } from "./video-meta";

/** Classification of who made the video, plus sponsorship status. */
export function VideoSourceBadge({ video, className }: { video: Video; className?: string }) {
  const origin = VIDEO_ORIGIN_META[videoOrigin(video)];
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      <span className={cn("inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[11px] font-medium", origin.className)}>
        <origin.icon className="size-3.5" /> {origin.label}
      </span>
      {video.sponsored && <SponsoredTag className="h-6" />}
    </span>
  );
}

/** Full classification panel for a video detail page — origin explanation plus sponsorship disclosure. */
export function VideoClassification({ video, className }: { video: Video; className?: string }) {
  const origin = VIDEO_ORIGIN_META[videoOrigin(video)];
  return (
    <div className={cn("space-y-3 rounded-[16px] border border-border bg-surface p-4", className)}>
      <div className="flex items-start gap-3">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-[10px] border", origin.className)}>
          <origin.icon className="size-4.5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">Source classification</p>
          <p className="text-[14px] font-semibold">{origin.label}</p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{origin.description}</p>
        </div>
      </div>
      {video.sponsored ? (
        <SponsoredDisclosure detail={`${video.disclosure ?? "This video is a paid partnership."} Sponsorship never changes Qeivo scores, verdicts or rankings.`} />
      ) : (
        <p className="text-[12px] text-subtle-foreground">No paid partnership declared for this video.</p>
      )}
    </div>
  );
}
