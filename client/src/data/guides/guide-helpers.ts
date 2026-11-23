import type { BuyingGuide, CategorySlug, GuideSection, Product } from "@/types";
import { requireProduct } from "@/data/products";
import { avatarAt } from "@/data/images";
import { slugify } from "@/lib/utils";

export const authors = {
  priya: { name: "Priya Raman", role: "Senior appliance editor", avatar: avatarAt(0) },
  tomas: { name: "Tomás Ferreira", role: "Lab lead, refrigeration", avatar: avatarAt(1) },
  hannah: { name: "Hannah Lindqvist", role: "Kitchen designer & contributor", avatar: avatarAt(2) },
  daniel: { name: "Daniel Okoye", role: "Laundry specialist", avatar: avatarAt(3) },
  mei: { name: "Mei Tanaka", role: "Display editor", avatar: avatarAt(4) },
  samuel: { name: "Samuel Adeyemi", role: "Computing editor", avatar: avatarAt(5) },
} as const;

export type AuthorKey = keyof typeof authors;

/** Short-hand product lookup by catalog key (without the `p-` prefix). */
export const P = (key: string): Product => requireProduct(`p-${key}`);

export const dims = (p: Product) => `${p.dimensions.widthMm} × ${p.dimensions.heightMm} × ${p.dimensions.depthMm} mm`;
export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
export const kwh = (p: Product) => `${p.energy.annualKwh} kWh/yr`;

export interface SectionInput {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: GuideSection["callout"];
}

export interface GuideInput {
  slug: string;
  title: string;
  excerpt: string;
  category: CategorySlug;
  topic: string;
  heroImage: string;
  author: AuthorKey;
  publishedAt: string;
  updatedAt: string;
  featured?: boolean;
  sections: SectionInput[];
  relatedProductIds: string[];
  relatedGuideSlugs: string[];
  sourceIds: string[];
}

export function buildGuide(input: GuideInput, index: number): BuyingGuide {
  const sections: GuideSection[] = input.sections.map((s) => ({ id: slugify(s.heading), ...s }));
  const words = sections.reduce(
    (n, s) => n + [...s.paragraphs, ...(s.bullets ?? []), s.callout?.text ?? ""].join(" ").split(/\s+/).length,
    input.excerpt.split(/\s+/).length,
  );
  return {
    id: `bg-${String(index + 1).padStart(3, "0")}`,
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    category: input.category,
    topic: input.topic,
    heroImage: input.heroImage,
    author: { ...authors[input.author] },
    publishedAt: input.publishedAt,
    updatedAt: input.updatedAt,
    readingMinutes: Math.max(4, Math.round(words / 110)),
    featured: input.featured ?? false,
    sections,
    relatedProductIds: input.relatedProductIds,
    relatedGuideSlugs: input.relatedGuideSlugs,
    sourceIds: input.sourceIds,
  };
}
