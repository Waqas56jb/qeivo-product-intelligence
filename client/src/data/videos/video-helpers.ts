import type { CategorySlug, Product, Video, VideoKind } from "@/types";
import { requireProduct } from "@/data/products";
import { getCreator } from "@/data/creators/creators";

export const P = requireProduct;

/** "12:34" or "1:02:03" → seconds */
export function secs(time: string): number {
  return time.split(":").map(Number).reduce((acc, n) => acc * 60 + n, 0);
}

export function usd(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

/** Read a spec value by key (e.g. "usable", "kwh-measured", "noise"). */
export function spec(p: Product, key: string): string | number | boolean {
  for (const g of p.specs) {
    const item = g.items.find((i) => i.key === key);
    if (item) return item.value;
  }
  return "";
}

export interface VideoRow {
  slug: string;
  title: string;
  description: string;
  kind: VideoKind;
  creatorId: string;
  publishedAt: string;
  views: number;
  productIds: string[];
  category: CategorySlug;
  thumbnail: string;
  duration: string;
  chapters: [time: string, title: string][];
  /** [time, text, speaker?] — speaker defaults to the creator's name */
  transcript: [time: string, text: string, speaker?: string][];
  disclosure?: string;
}

export function buildVideos(rows: VideoRow[], startIndex: number): Video[] {
  return rows.map((r, i) => {
    const creatorName = getCreator(r.creatorId)?.name ?? "Narrator";
    return {
      id: `vid-${String(startIndex + i).padStart(3, "0")}`,
      slug: r.slug,
      title: r.title,
      description: r.description,
      kind: r.kind,
      thumbnail: r.thumbnail,
      duration: r.duration,
      durationSeconds: secs(r.duration),
      creatorId: r.creatorId,
      publishedAt: r.publishedAt,
      views: r.views,
      productIds: r.productIds,
      category: r.category,
      chapters: r.chapters.map(([time, title]) => ({ time, seconds: secs(time), title })),
      transcript: r.transcript.map(([time, text, speaker]) => ({ time, seconds: secs(time), speaker: speaker ?? creatorName, text })),
      sponsored: Boolean(r.disclosure),
      disclosure: r.disclosure,
    };
  });
}
