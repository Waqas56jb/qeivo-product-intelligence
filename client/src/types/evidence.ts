/** Evidence & trust system — the defining feature of Qeivo. */

/** How a claim should be visually classified. Never present manufacturer marketing as verified fact. */
export type ClaimType =
  | "manufacturer"
  | "customer"
  | "measured"
  | "expert"
  | "ai";

export type SourceType =
  | "manual"
  | "spec-sheet"
  | "independent-review"
  | "customer-review"
  | "manufacturer-statement"
  | "video"
  | "certification"
  | "lab-test";

export interface SourceReference {
  id: string;
  type: SourceType;
  title: string;
  publisher: string;
  /** e.g. "Page 14", "Section 3.2", "06:42", "Review #R-1043" */
  locator: string;
  excerpt: string;
  /** ISO date */
  publishedAt: string;
  /** ISO date */
  retrievedAt: string;
  productIds: string[];
  /** Reliability of the source, 0–1 */
  reliability: number;
  /** Optional link to a local entity (review id, video slug, document id) */
  relatedEntity?: { kind: "review" | "video" | "document"; id: string };
}

export interface Claim {
  id: string;
  text: string;
  type: ClaimType;
  sourceIds: string[];
}

export type DataFreshness = "current" | "aging" | "stale";

export type WarningKind =
  | "missing"
  | "conflict"
  | "stale"
  | "unverified"
  | "low-evidence"
  | "unknown-compatibility";

export interface DataWarning {
  kind: WarningKind;
  title: string;
  detail: string;
  sourceIds?: string[];
}

export type Confidence = "high" | "moderate" | "low";
