import type { Video } from "@/types";
import { refrigeratorVideos } from "./videos-refrigerators";
import { otherVideos } from "./videos-other";

/** All videos, ids renumbered sequentially (vid-001…). */
export const videos: Video[] = [...refrigeratorVideos, ...otherVideos].map((v, i) => ({
  ...v,
  id: `vid-${String(i + 1).padStart(3, "0")}`,
}));

export const videoBySlug = new Map(videos.map((v) => [v.slug, v]));

export function getVideo(slug: string): Video | undefined {
  return videoBySlug.get(slug);
}

export function videosForProduct(productId: string): Video[] {
  return videos.filter((v) => v.productIds.includes(productId));
}

export function videosByCreator(creatorId: string): Video[] {
  return videos.filter((v) => v.creatorId === creatorId);
}
