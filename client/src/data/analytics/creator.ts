import type { ContentPerformanceRow, CreatorWeeklyPoint, KpiStat } from "@/types";
import { hash, round } from "@/lib/utils";
import { submissionsForCreator } from "../creators/submissions";
import { creatorById } from "../creators/creators";

/** Analytics for the demo creator cr-maya (Maya Okafor). */
export const CREATOR_ID = "cr-maya";

const WEEK = 7 * 86_400_000;
const FIRST_WEEK = Date.UTC(2026, 4, 25);
const followersNow = creatorById.get(CREATOR_ID)?.followers ?? 284_000;

export const creatorWeekly: CreatorWeeklyPoint[] = Array.from({ length: 26 }, (_, i) => {
  const week = new Date(FIRST_WEEK + i * WEEK).toISOString().slice(0, 10);
  const h = hash(`maya-${week}`);
  // Release spikes on weeks when a new video went out.
  const release = [3, 8, 14, 19, 24].includes(i) ? 1.9 : 1;
  const views = Math.round((21_000 + (h % 6000) + i * 420) * release);
  return {
    week,
    views,
    watchHours: Math.round(views * (0.082 + (h % 20) / 1000)),
    engagement: round(5.1 + (h % 30) / 10 + (release > 1 ? 0.8 : 0), 1),
    followers: Math.round(followersNow - (25 - i) * (1350 + (h % 300))),
  };
});

export const contentPerformance: ContentPerformanceRow[] = submissionsForCreator(CREATOR_ID)
  .filter((s) => s.status === "published")
  .map((s) => {
    const h = hash(`cp-${s.id}`);
    return {
      submissionId: s.id,
      title: s.title,
      type: s.type,
      views: s.views,
      engagement: s.engagement,
      avgWatchPct: s.type === "video" ? 44 + (h % 22) : 0,
      productClicks: Math.round(s.views * (0.021 + (h % 12) / 1000)),
      publishedAt: s.submittedAt,
    };
  });

const last4 = creatorWeekly.slice(-4);
const prev4 = creatorWeekly.slice(-8, -4);
const total = (rows: CreatorWeeklyPoint[], k: "views" | "watchHours") => rows.reduce((s, r) => s + r[k], 0);

export const creatorKpis: KpiStat[] = [
  { label: "Views (28 days)", value: total(last4, "views"), change: round((total(last4, "views") / total(prev4, "views") - 1) * 100, 1), format: "number" },
  { label: "Watch hours", value: total(last4, "watchHours"), change: round((total(last4, "watchHours") / total(prev4, "watchHours") - 1) * 100, 1), format: "number" },
  { label: "Followers", value: followersNow, change: round(((followersNow - creatorWeekly[21].followers) / creatorWeekly[21].followers) * 100, 1), format: "number" },
  { label: "Avg engagement", value: round(last4.reduce((s, r) => s + r.engagement, 0) / 4, 1), change: 0.4, format: "percent" },
];
