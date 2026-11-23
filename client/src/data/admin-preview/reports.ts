/** Content reports raised by users or automated checks, for the admin-preview moderation queue. */
export interface ContentReport {
  id: string;
  targetKind: "review" | "question" | "reply" | "video";
  targetId: string;
  productId?: string;
  reason: "spam" | "off-topic" | "abusive" | "undisclosed-sponsorship" | "inaccurate" | "personal-info" | "duplicate";
  detail: string;
  reportedBy: string;
  reportedAt: string;
  status: "open" | "investigating" | "resolved-removed" | "resolved-kept";
  resolution?: string;
  moderator?: string;
}

export const contentReports: ContentReport[] = [
  { id: "RPT-1048", targetKind: "review", targetId: "rv-maru-smartview-fd620-1", productId: "p-maru-smartview-fd620", reason: "undisclosed-sponsorship", detail: "Reviewer's profile links to a Maru affiliate store. Possible undisclosed relationship.", reportedBy: "Automated: affiliate-link check", reportedAt: "2026-11-23T05:12:00Z", status: "open" },
  { id: "RPT-1047", targetKind: "question", targetId: "q-012", reason: "duplicate", detail: "Same question as an existing thread about black-finish fingerprints.", reportedBy: "Hannah Okoro", reportedAt: "2026-11-22T21:40:00Z", status: "open" },
  { id: "RPT-1046", targetKind: "reply", targetId: "q-002-r2", reason: "inaccurate", detail: "Reply says the filter can be skipped with a bypass plug. The manufacturer advises against this.", reportedBy: "Nordvik Customer Care", reportedAt: "2026-11-22T10:05:00Z", status: "investigating", moderator: "Rafael Costa" },
  { id: "RPT-1045", targetKind: "review", targetId: "rv-kestrel-homebase-sbs650-1", productId: "p-kestrel-homebase-sbs650", reason: "abusive", detail: "Contains insulting language aimed at a delivery driver.", reportedBy: "James Whitaker", reportedAt: "2026-11-21T17:33:00Z", status: "investigating", moderator: "Grace Liu" },
  { id: "RPT-1044", targetKind: "video", targetId: "compact-fridges-for-studios-maru-ovea-kestrel", reason: "undisclosed-sponsorship", detail: "Viewer says the sponsor isn't mentioned until the end of the video.", reportedBy: "Tom Gallagher", reportedAt: "2026-11-20T12:18:00Z", status: "resolved-kept", resolution: "Disclosure appears in the first 10 seconds and in the description. Meets policy.", moderator: "Rafael Costa" },
  { id: "RPT-1043", targetKind: "review", targetId: "rv-brightwater-family-fd560-2", productId: "p-brightwater-family-fd560", reason: "personal-info", detail: "Review includes the reviewer's full street address.", reportedBy: "Automated: PII detector", reportedAt: "2026-11-19T08:02:00Z", status: "resolved-kept", resolution: "Address redacted; review kept.", moderator: "Grace Liu" },
  { id: "RPT-1042", targetKind: "review", targetId: "rv-kestrel-dorm-c90-2", productId: "p-kestrel-dorm-c90", reason: "spam", detail: "Promotional text pointing to a third-party repair service.", reportedBy: "Automated: link spam", reportedAt: "2026-11-18T23:50:00Z", status: "resolved-removed", resolution: "Promotional link removed and review hidden pending edit.", moderator: "Rafael Costa" },
  { id: "RPT-1041", targetKind: "reply", targetId: "q-007-r2", reason: "spam", detail: "Flagged by a user for recommending the same brand repeatedly.", reportedBy: "Lucas Moreau", reportedAt: "2026-11-17T14:00:00Z", status: "resolved-kept", resolution: "Recommendation is reasoned and relevant. Not spam.", moderator: "Grace Liu" },
  { id: "RPT-1040", targetKind: "question", targetId: "q-024", reason: "off-topic", detail: "Thread drifted into a debate about streaming subscriptions.", reportedBy: "Kenji Watanabe", reportedAt: "2026-11-15T09:30:00Z", status: "resolved-kept", resolution: "Off-topic replies collapsed; question kept.", moderator: "Rafael Costa" },
  { id: "RPT-1039", targetKind: "review", targetId: "rv-aurelle-petite-u130-1", productId: "p-aurelle-petite-u130", reason: "inaccurate", detail: "Claims the fridge is frost-free. The manual says manual defrost.", reportedBy: "Aurelle Customer Care", reportedAt: "2026-11-12T11:45:00Z", status: "open" },
];

export function reportsByStatus(status: ContentReport["status"]): ContentReport[] {
  return contentReports.filter((r) => r.status === status);
}
