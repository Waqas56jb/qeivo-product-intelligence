import type { BuyingGuide } from "@/types";
import { buildGuide, type GuideInput } from "./guide-helpers";
import { extraSections } from "./buying-guides-extra";
import { refrigeratorGuides } from "./buying-guides-refrigerators";
import { laptopGuides, tvGuides, washerGuides } from "./buying-guides-other";

function withExtras(g: GuideInput): GuideInput {
  const extra = extraSections[g.slug];
  if (!extra) return g;
  const head = g.sections.slice(0, -1);
  const last = g.sections[g.sections.length - 1];
  return { ...g, sections: [...head, ...extra, last] };
}

/** Editorial buying guides. Ids `bg-001`…; every product, source and guide reference is validated by scripts/validate-data.ts. */
export const buyingGuides: BuyingGuide[] = [...refrigeratorGuides, ...washerGuides, ...tvGuides, ...laptopGuides]
  .map(withExtras)
  .map(buildGuide);

export const guideBySlug = new Map(buyingGuides.map((g) => [g.slug, g]));

export function getGuide(slug: string): BuyingGuide | undefined {
  return guideBySlug.get(slug);
}

export function guidesForProduct(productId: string): BuyingGuide[] {
  return buyingGuides.filter((g) => g.relatedProductIds.includes(productId));
}

export const featuredGuides: BuyingGuide[] = buyingGuides.filter((g) => g.featured);
