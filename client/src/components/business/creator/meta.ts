import type { LucideIcon } from "lucide-react";
import { FileText, Newspaper, PlayCircle, Wrench } from "lucide-react";
import type { ContentSubmission } from "@/types";

export type ContentType = ContentSubmission["type"];

export const CONTENT_TYPE_META: Record<ContentType, { label: string; plural: string; icon: LucideIcon; description: string }> = {
  video: { label: "Video", plural: "Videos", icon: PlayCircle, description: "Reviews, walkthroughs and long-term tests. Chapters and on-screen sources required." },
  review: { label: "Written review", plural: "Reviews", icon: FileText, description: "Long-form review of one product, with your test method and evidence." },
  "diy-guide": { label: "DIY guide", plural: "DIY guides", icon: Wrench, description: "Step-by-step how-to. Safety steps are checked before publishing." },
  article: { label: "Article", plural: "Articles", icon: Newspaper, description: "Explainers and comparisons across several products." },
};

export const CONTENT_TYPES = Object.keys(CONTENT_TYPE_META) as ContentType[];
