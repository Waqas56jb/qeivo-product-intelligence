import type { LucideIcon } from "lucide-react";
import { Award, Building2, Hammer, Sparkles, SprayCan, Wrench } from "lucide-react";
import type { Creator, Video, VideoKind } from "@/types";
import { getCreator } from "@/data/creators/creators";

export const VIDEO_KIND_META: Record<VideoKind, { label: string; plural: string; description: string; icon: LucideIcon; className: string }> = {
  independent: {
    label: "Independent review",
    plural: "Independent reviews",
    description: "Hands-on testing by creators with no commercial tie to the brand. Measurements are cited by timestamp.",
    icon: Award,
    className: "bg-claim-expert-soft text-claim-expert border-claim-expert/25",
  },
  manufacturer: {
    label: "Manufacturer demo",
    plural: "Manufacturer demos",
    description: "Published by the brand. Useful for features and setup — every claim is treated as a manufacturer claim.",
    icon: Building2,
    className: "bg-claim-manufacturer-soft text-claim-manufacturer border-claim-manufacturer/25",
  },
  diy: {
    label: "DIY & repair",
    plural: "DIY & repair",
    description: "Owner-level fixes and part swaps, with safety notes on when to call a technician.",
    icon: Wrench,
    className: "bg-claim-customer-soft text-claim-customer border-claim-customer/25",
  },
  installation: {
    label: "Installation",
    plural: "Installation",
    description: "Delivery, levelling, plumbing and wall-mounting walkthroughs matched to specific models.",
    icon: Hammer,
    className: "bg-info-soft text-info-foreground border-info/25",
  },
  maintenance: {
    label: "Maintenance",
    plural: "Maintenance",
    description: "Cleaning, filter changes and care routines that keep running costs and faults down.",
    icon: SprayCan,
    className: "bg-success-soft text-success border-success/25",
  },
};

export const VIDEO_KIND_ORDER: VideoKind[] = ["independent", "manufacturer", "diy", "installation", "maintenance"];

export type VideoOrigin = "manufacturer" | "independent" | "qeivo";

export const VIDEO_ORIGIN_META: Record<VideoOrigin, { label: string; description: string; icon: LucideIcon; className: string }> = {
  independent: {
    label: "Independent creator",
    description: "Produced without brand control. Measurements are classified as expert or measured evidence when the method is shown on screen.",
    icon: Award,
    className: "bg-claim-expert-soft text-claim-expert border-claim-expert/25",
  },
  manufacturer: {
    label: "Manufacturer channel",
    description: "Published by the brand. Performance statements are shown as manufacturer claims and never as verified fact.",
    icon: Building2,
    className: "bg-claim-manufacturer-soft text-claim-manufacturer border-claim-manufacturer/25",
  },
  qeivo: {
    label: "Qeivo Studio",
    description: "Produced by Qeivo's in-house lab team. Our own videos never feature paid placements.",
    icon: Sparkles,
    className: "bg-brand-soft text-brand-soft-foreground border-brand/25",
  },
};

export function videoCreator(video: Video): Creator | undefined {
  return getCreator(video.creatorId);
}

export function videoOrigin(video: Video): VideoOrigin {
  return getCreator(video.creatorId)?.kind ?? "independent";
}

/** "12:34" style formatting for a number of seconds. */
export function formatTimestamp(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}
