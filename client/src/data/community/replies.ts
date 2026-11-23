import type { CommunityReply } from "@/types";
import { questions } from "./questions";

/** Flattened list of every community reply across all questions. */
export const replies: CommunityReply[] = questions.flatMap((q) => q.replies);

export function repliesForQuestion(questionId: string): CommunityReply[] {
  return replies.filter((r) => r.questionId === questionId);
}
