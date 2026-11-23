import type { CategorySlug, CommunityQuestion, CommunityReply } from "@/types";
import { avatarAt } from "@/data/images";

export interface ReplyInput {
  by: string;
  av: number;
  role: CommunityReply["role"];
  company?: string;
  body: string;
  date: string;
  votes: number;
  accepted?: boolean;
}

export interface QuestionInput {
  slug: string;
  title: string;
  body: string;
  category: CategorySlug;
  tags: string[];
  by: string;
  av: number;
  date: string;
  votes: number;
  views: number;
  productIds: string[];
  replies: ReplyInput[];
}

export function buildQuestion(q: QuestionInput, index: number): CommunityQuestion {
  const id = `q-${String(index + 1).padStart(3, "0")}`;
  const replies: CommunityReply[] = q.replies.map((r, i) => ({
    id: `${id}-r${i + 1}`,
    questionId: id,
    authorName: r.by,
    authorAvatar: avatarAt(r.av),
    role: r.role,
    ...(r.company ? { company: r.company } : {}),
    body: r.body,
    date: r.date,
    votes: r.votes,
    ...(r.accepted ? { accepted: true } : {}),
  }));
  return {
    id,
    slug: q.slug,
    title: q.title,
    body: q.body,
    category: q.category,
    tags: q.tags,
    authorName: q.by,
    authorAvatar: avatarAt(q.av),
    date: q.date,
    votes: q.votes,
    views: q.views,
    productIds: q.productIds,
    replies,
    hasOfficialReply: replies.some((r) => r.role === "manufacturer"),
    solved: replies.some((r) => r.accepted === true),
  };
}

/** Recurring staff and expert identities used across threads. */
export const staff = {
  tomas: { by: "Tomás Ferreira", av: 1, role: "expert" as const },
  priya: { by: "Priya Raman", av: 0, role: "expert" as const },
  daniel: { by: "Daniel Okoye", av: 3, role: "expert" as const },
  mei: { by: "Mei Tanaka", av: 4, role: "expert" as const },
  samuel: { by: "Samuel Adeyemi", av: 5, role: "expert" as const },
  mod: { by: "Qeivo Community Team", av: 13, role: "moderator" as const },
};
