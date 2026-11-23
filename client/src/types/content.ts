import type { CategorySlug, RegionCode } from "./product";

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  authorAvatar: string;
  authorLocation: string;
  rating: number;
  title: string;
  body: string;
  /** ISO date */
  date: string;
  verifiedPurchase: boolean;
  helpful: number;
  ownedFor: string;
  sentiment: "positive" | "mixed" | "negative";
  aspects: { label: string; sentiment: "positive" | "negative" }[];
  photos: string[];
  videoThumbnail?: string;
  manufacturerReply?: { author: string; body: string; date: string };
}

export type VideoKind = "manufacturer" | "independent" | "diy" | "installation" | "maintenance";

export interface VideoChapter {
  time: string;
  seconds: number;
  title: string;
}

export interface TranscriptLine {
  time: string;
  seconds: number;
  speaker?: string;
  text: string;
}

export interface Video {
  id: string;
  slug: string;
  title: string;
  description: string;
  kind: VideoKind;
  thumbnail: string;
  duration: string;
  durationSeconds: number;
  creatorId: string;
  publishedAt: string;
  views: number;
  productIds: string[];
  category: CategorySlug;
  chapters: VideoChapter[];
  transcript: TranscriptLine[];
  sponsored: boolean;
  disclosure?: string;
}

export interface GuideSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: { tone: "tip" | "warning" | "info"; text: string };
}

export interface BuyingGuide {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: CategorySlug;
  topic: string;
  heroImage: string;
  author: { name: string; role: string; avatar: string };
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  featured: boolean;
  sections: GuideSection[];
  relatedProductIds: string[];
  relatedGuideSlugs: string[];
  sourceIds: string[];
}

export type DiyCategory =
  | "installation"
  | "setup"
  | "cleaning"
  | "maintenance"
  | "troubleshooting"
  | "parts"
  | "safety";

export interface DiyGuide {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: DiyCategory;
  productCategory: CategorySlug;
  productIds: string[];
  image: string;
  difficulty: "Easy" | "Moderate" | "Advanced";
  durationMinutes: number;
  tools: string[];
  parts: string[];
  safety: string[];
  steps: { title: string; body: string }[];
  checklist: string[];
  videoSlug?: string;
}

export interface CommunityReply {
  id: string;
  questionId: string;
  authorName: string;
  authorAvatar: string;
  role: "customer" | "manufacturer" | "expert" | "moderator";
  company?: string;
  body: string;
  date: string;
  votes: number;
  accepted?: boolean;
}

export interface CommunityQuestion {
  id: string;
  slug: string;
  title: string;
  body: string;
  category: CategorySlug;
  tags: string[];
  authorName: string;
  authorAvatar: string;
  date: string;
  votes: number;
  views: number;
  productIds: string[];
  replies: CommunityReply[];
  hasOfficialReply: boolean;
  solved: boolean;
}

export interface RetailerOffer {
  id: string;
  productId: string;
  retailer: string;
  retailerLogo: string;
  region: RegionCode;
  price: number;
  stock: "in-stock" | "low-stock" | "out-of-stock" | "preorder";
  delivery: string;
  /** ISO datetime the price was observed */
  observedAt: string;
  validUntil: string;
  affiliate: boolean;
  sponsored: boolean;
  supplierId?: string;
  clicks?: number;
}

export interface DocumentExtraction {
  field: string;
  value: string;
  page: number;
  confidence: number;
  status: "confirmed" | "uncertain" | "contradiction";
  note?: string;
}

export interface ProductDocument {
  id: string;
  productId: string;
  title: string;
  kind: "manual" | "spec-sheet" | "warranty" | "certification" | "installation";
  pages: number;
  sizeKb: number;
  uploadedAt: string;
  uploadedBy: string;
  language: string;
  status: "processed" | "processing" | "needs-review";
  extractions: DocumentExtraction[];
  previewPages: { page: number; heading: string; lines: string[] }[];
}
