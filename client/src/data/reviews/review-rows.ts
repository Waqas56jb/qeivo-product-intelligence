/**
 * Compact authoring format for hand-written reviews.
 * [rating, title, body, ownedFor, aspects ("+Label,-Label"), options]
 */
export interface ReviewRowOptions {
  /** Attach owner photos (product lifestyle images). */
  photo?: boolean;
  /** Attach a short owner video. */
  video?: boolean;
  /** Not a verified purchase. */
  unverified?: boolean;
  /** Manufacturer customer-care reply. */
  reply?: string;
}

export type ReviewRow = [rating: number, title: string, body: string, ownedFor: string, aspects: string, options?: ReviewRowOptions];

export type ReviewRowSet = Record<string, ReviewRow[]>;
