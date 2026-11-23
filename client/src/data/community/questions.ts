import type { CommunityQuestion } from "@/types";
import { buildQuestion } from "./question-helpers";
import { refrigeratorQuestions } from "./questions-refrigerators";
import { otherQuestions } from "./questions-other";

/** Community Q&A threads (ids `q-001`…), newest first. Replies are nested; see ./replies for a flat list. */
export const questions: CommunityQuestion[] = [...refrigeratorQuestions, ...otherQuestions]
  .map(buildQuestion)
  .sort((a, b) => b.date.localeCompare(a.date));

export const questionBySlug = new Map(questions.map((q) => [q.slug, q]));

export function getQuestion(slug: string): CommunityQuestion | undefined {
  return questionBySlug.get(slug);
}

export function questionsForProduct(productId: string): CommunityQuestion[] {
  return questions.filter((q) => q.productIds.includes(productId));
}
