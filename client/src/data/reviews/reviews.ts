import type { Product, Review } from "@/types";
import { requireProduct, products } from "@/data/products";
import { getBrand } from "@/data/products";
import { avatarAt, images, pick } from "@/data/images";
import { hash } from "@/lib/utils";
import type { ReviewRow, ReviewRowSet } from "./review-rows";
import { fridgeReviewsA } from "./reviews-fridges-a";
import { fridgeReviewsB } from "./reviews-fridges-b";
import { otherReviews } from "./reviews-other";

/** Diverse reviewer identities: [name, location]. */
const AUTHORS: [string, string][] = [
  ["Priya Raman", "Austin, TX"],
  ["Tom Hallworth", "Leeds, UK"],
  ["Sofia Marchetti", "Bologna, IT"],
  ["Daniel Okoye", "Atlanta, GA"],
  ["Mei-Ling Chen", "Vancouver, BC"],
  ["Jonas Lindqvist", "Gothenburg, SE"],
  ["Aisha Bello", "Manchester, UK"],
  ["Ryan Gallagher", "Brisbane, QLD"],
  ["Carmen Ruiz", "Phoenix, AZ"],
  ["Hiroshi Tanaka", "Seattle, WA"],
  ["Fatima Haddad", "Montreal, QC"],
  ["Liam O'Connell", "Dublin, IE"],
  ["Grace Whitfield", "Bath, UK"],
  ["Marcus Bell", "Chicago, IL"],
  ["Anika Patel", "Leicester, UK"],
  ["Lucas Moreau", "Lyon, FR"],
  ["Helen Kowalski", "Milwaukee, WI"],
  ["Samuel Adeyemi", "Toronto, ON"],
  ["Isabel Fernandes", "Lisbon, PT"],
  ["Ben Carter", "Melbourne, VIC"],
  ["Nora Albrecht", "Munich, DE"],
  ["Diego Santos", "San Diego, CA"],
  ["Emily Zhang", "Boston, MA"],
  ["Kwame Mensah", "Birmingham, UK"],
  ["Ingrid Solberg", "Oslo, NO"],
  ["Patrick Dunne", "Cork, IE"],
  ["Laura Bianchi", "Turin, IT"],
  ["Omar Farouk", "Calgary, AB"],
  ["Rachel Goldberg", "Brooklyn, NY"],
  ["Ethan Brooks", "Denver, CO"],
  ["Yuki Morita", "Perth, WA"],
  ["Chloé Durand", "Bordeaux, FR"],
  ["Ahmed Siddiqui", "Houston, TX"],
  ["Margaret Hughes", "Cardiff, UK"],
  ["Tomasz Nowak", "Kraków, PL"],
  ["Jessica Nguyen", "San Jose, CA"],
  ["Peter van Dijk", "Utrecht, NL"],
  ["Zara Khan", "Bradford, UK"],
  ["Michael Ferraro", "Philadelphia, PA"],
  ["Elena Popescu", "Vienna, AT"],
  ["Gareth Price", "Swansea, UK"],
  ["Hannah Schmidt", "Hamburg, DE"],
  ["Jamal Washington", "Charlotte, NC"],
  ["Olivia Martin", "Adelaide, SA"],
  ["Raj Malhotra", "Edison, NJ"],
  ["Sarah Thompson", "Halifax, NS"],
  ["Mateo García", "Valencia, ES"],
  ["Linda Park", "Portland, OR"],
  ["Ewan MacLeod", "Edinburgh, UK"],
  ["Nadia Rahman", "Ottawa, ON"],
  ["Charlotte Evans", "Bristol, UK"],
  ["Kenji Watanabe", "Sydney, NSW"],
  ["Beatriz Lima", "Porto, PT"],
  ["George Whitaker", "Sarasota, FL"],
  ["Amara Nwosu", "Houston, TX"],
  ["Felix Bauer", "Berlin, DE"],
  ["Rosa Delgado", "Albuquerque, NM"],
  ["Connor Murphy", "Galway, IE"],
  ["Leah Cohen", "Minneapolis, MN"],
  ["Viktor Petrov", "Rotterdam, NL"],
  ["Megan Foster", "Nashville, TN"],
  ["Arjun Desai", "Auckland, NZ"],
  ["Claire Dubois", "Brussels, BE"],
  ["Walter Jensen", "Copenhagen, DK"],
  ["Tamsin Clarke", "Norwich, UK"],
  ["Andre Williams", "Baltimore, MD"],
];

const ROW_SETS: ReviewRowSet[] = [fridgeReviewsA, fridgeReviewsB, otherReviews];

const DAY = 86_400_000;
const START = Date.UTC(2025, 0, 6);
const END = Date.UTC(2026, 10, 20);

function ownedMonths(ownedFor: string): number {
  const [n, unit] = ownedFor.split(" ");
  const value = Number(n);
  if (unit.startsWith("year")) return value * 12;
  if (unit.startsWith("week")) return Math.max(1, Math.round(value / 4));
  return value;
}

/** Review date: after the product had been on sale long enough for the stated ownership period. */
function reviewDate(id: string, product: Product, ownedFor: string): number {
  const earliest = Math.max(START, Date.UTC(product.releaseYear, 1, 1) + ownedMonths(ownedFor) * 30 * DAY);
  const start = Math.min(earliest, END - 20 * DAY);
  const span = Math.max(1, Math.floor((END - start) / DAY));
  return start + (hash(`${id}-date`) % span) * DAY;
}

const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

function parseAspects(spec: string): Review["aspects"] {
  return spec
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({ label: s.slice(1), sentiment: s.startsWith("-") ? ("negative" as const) : ("positive" as const) }));
}

function sentimentFor(rating: number): Review["sentiment"] {
  if (rating >= 4) return "positive";
  if (rating === 3) return "mixed";
  return "negative";
}

let authorCursor = 0;

function expand(key: string, row: ReviewRow, n: number): Review {
  const [rating, title, body, ownedFor, aspects, opts = {}] = row;
  const product = requireProduct(`p-${key}`);
  const brand = getBrand(product.brandId);
  const id = `rv-${key}-${n + 1}`;
  const authorIndex = (authorCursor * 17 + 5) % AUTHORS.length;
  authorCursor++;
  const [authorName, authorLocation] = AUTHORS[authorIndex];
  const h = hash(id);
  const dateMs = reviewDate(id, product, ownedFor);
  const verifiedPurchase = !opts.unverified && h % 7 !== 0;
  const helpfulBase = rating <= 3 ? 30 : 4;
  const photos = opts.photo
    ? [product.images[1 + (h % 3)], product.images[1 + ((h + 1) % 3)]].filter((src, i, arr) => arr.indexOf(src) === i)
    : [];
  const review: Review = {
    id,
    productId: product.id,
    authorName,
    authorAvatar: avatarAt(hash(authorName)),
    authorLocation,
    rating,
    title,
    body,
    date: iso(dateMs),
    verifiedPurchase,
    helpful: helpfulBase + (h % 140),
    ownedFor,
    sentiment: sentimentFor(rating),
    aspects: parseAspects(aspects),
    photos,
  };
  if (opts.video) {
    review.videoThumbnail = product.category === "refrigerators" ? pick(images.kitchens, h) : product.images[3];
  }
  if (opts.reply) {
    const replyMs = Math.min(dateMs + (2 + (h % 5)) * DAY, Date.UTC(2026, 10, 22));
    review.manufacturerReply = { author: `${brand.name} Customer Care`, body: opts.reply, date: iso(replyMs) };
  }
  return review;
}

export const reviews: Review[] = ROW_SETS.flatMap((set) =>
  Object.entries(set).flatMap(([key, rows]) => rows.map((row, n) => expand(key, row, n))),
);

export const reviewById = new Map(reviews.map((r) => [r.id, r]));

const byProduct = new Map<string, Review[]>();
for (const r of reviews) {
  const list = byProduct.get(r.productId) ?? [];
  list.push(r);
  byProduct.set(r.productId, list);
}
for (const list of byProduct.values()) list.sort((a, b) => b.date.localeCompare(a.date));

/** Displayed owner reviews for a product, newest first. */
export function reviewsForProduct(productId: string): Review[] {
  return byProduct.get(productId) ?? [];
}

/** Average of the displayed (hand-written) reviews for a product, or null if none. */
export function displayedAverage(productId: string): number | null {
  const list = reviewsForProduct(productId);
  if (!list.length) return null;
  return Math.round((list.reduce((s, r) => s + r.rating, 0) / list.length) * 10) / 10;
}

export interface RatingBucket {
  stars: 5 | 4 | 3 | 2 | 1;
  count: number;
  /** Share of all reviews, one decimal place */
  percent: number;
}

/**
 * Star distribution for the full review population (product.reviewCount), modelled
 * deterministically so that the weighted mean matches product.rating.
 */
export function ratingDistribution(productId: string): RatingBucket[] {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];
  const n = product.reviewCount;
  const r = product.rating;
  const x = Math.min(1, Math.max(0, (r - 3) / 2));
  const p1 = 0.12 * (1 - x);
  const p2 = 0.07 * (1 - x);
  const p3 = 0.14 * (1 - x);
  const top = 1 - p1 - p2 - p3;
  const p5 = Math.min(top, Math.max(0, r - 4 * top - 3 * p3 - 2 * p2 - p1));
  const p4 = top - p5;
  const shares: [RatingBucket["stars"], number][] = [[5, p5], [4, p4], [3, p3], [2, p2], [1, p1]];
  const raw = shares.map(([stars, share]) => ({ stars, exact: share * n }));
  const counts = raw.map((b) => Math.floor(b.exact));
  let remainder = n - counts.reduce((a, b) => a + b, 0);
  const order = raw.map((b, i) => ({ i, frac: b.exact - Math.floor(b.exact) })).sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; remainder > 0; k++, remainder--) counts[order[k % order.length].i]++;
  return raw.map((b, i) => ({ stars: b.stars, count: counts[i], percent: n ? Math.round((counts[i] / n) * 1000) / 10 : 0 }));
}
