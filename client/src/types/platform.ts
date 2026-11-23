import type { CategorySlug, RegionCode, ScoreFactorKey } from "./product";

export type DemoRole = "customer" | "manufacturer" | "supplier" | "creator" | "developer";

export interface UserPreferences {
  budgetMin: number;
  budgetMax: number;
  householdSize: number;
  region: RegionCode;
  interests: CategorySlug[];
  preferredBrandIds: string[];
  energyPriority: "low" | "balanced" | "high";
  space: { widthMm: number; heightMm: number; depthMm: number } | null;
  priorities: Partial<Record<ScoreFactorKey, number>>;
  reviewPreference: "verified-only" | "all";
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
  memberSince: string;
  plan: "free" | "premium";
  preferences: UserPreferences;
}

export interface Company {
  id: string;
  name: string;
  kind: "manufacturer" | "supplier";
  logo: string;
  brandIds?: string[];
  regions: RegionCode[];
  website: string;
  plan: string;
  verified: boolean;
  description: string;
}

export interface TeamMember {
  id: string;
  companyId: string;
  name: string;
  email: string;
  avatar: string;
  role: "Owner" | "Admin" | "Editor" | "Analyst" | "Viewer";
  title: string;
  status: "active" | "invited" | "suspended";
  lastActive: string;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  cover: string;
  bio: string;
  expertise: string[];
  followers: number;
  verified: boolean;
  kind: "independent" | "manufacturer" | "qeivo";
  socials: { label: string; handle: string }[];
  disclosure: string;
}

export type SubmissionStatus = "draft" | "in-review" | "changes-requested" | "approved" | "published" | "rejected";

export interface ContentSubmission {
  id: string;
  creatorId: string;
  type: "video" | "review" | "diy-guide" | "article";
  title: string;
  description: string;
  productIds: string[];
  thumbnail: string;
  submittedAt: string;
  status: SubmissionStatus;
  sponsored: boolean;
  sponsor?: string;
  views: number;
  engagement: number;
  reviewerNote?: string;
}

export interface SavedProduct {
  productId: string;
  savedAt: string;
  folderId: string;
  note?: string;
}

export interface ResearchFolder {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface SavedComparison {
  id: string;
  name: string;
  productIds: string[];
  createdAt: string;
  verdict: string;
}

export interface ProductNote {
  id: string;
  productId: string;
  body: string;
  createdAt: string;
}

export interface OwnedProduct {
  id: string;
  productId: string;
  purchaseDate: string;
  purchasePrice: number;
  retailer: string;
  serialNumber: string;
  receiptId: string;
  warrantyExpires: string;
  extendedWarranty?: string;
  maintenance: { id: string; task: string; dueDate: string; intervalMonths: number; status: "due" | "upcoming" | "done" | "overdue" }[];
  serviceHistory: { date: string; type: string; provider: string; notes: string; cost: number }[];
}

export interface PriceWatch {
  productId: string;
  targetPrice: number;
  createdAt: string;
}

export interface ChatSourceRef {
  sourceId: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** For assistant messages: structured answer blocks with claim typing */
  blocks?: { text: string; claimType: "manufacturer" | "customer" | "measured" | "expert" | "ai"; sourceIds: string[] }[];
  sourceIds?: string[];
  productIds?: string[];
  followUps?: string[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  productIds: string[];
  createdAt: string;
  updatedAt: string;
  saved: boolean;
  messages: ChatMessage[];
}

export type NotificationKind = "price-drop" | "product-update" | "maintenance" | "community" | "research" | "subscription";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  date: string;
  read: boolean;
  href: string;
  productId?: string;
}

export interface Plan {
  id: "free" | "premium" | "team" | "enterprise";
  name: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  highlight?: boolean;
  allowances: { label: string; value: string }[];
  features: string[];
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  status: "paid" | "open" | "refunded";
  amount: number;
  tax: number;
  currency: string;
  plan: string;
  period: string;
  lines: { description: string; quantity: number; unitPrice: number }[];
  billedTo: { name: string; address: string[] };
  paymentMethod: string;
}

export interface Workspace {
  id: string;
  name: string;
  logo: string;
  plan: string;
  seats: number;
  seatsUsed: number;
  industry: string;
  description: string;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "Owner" | "Admin" | "Researcher" | "Approver" | "Viewer";
  title: string;
  lastActive: string;
}

export interface ResearchProject {
  id: string;
  name: string;
  description: string;
  status: "active" | "in-review" | "approved" | "archived";
  owner: string;
  memberIds: string[];
  productIds: string[];
  dueDate: string;
  updatedAt: string;
  budget: number;
  quantity: number;
  category: CategorySlug;
  notes: { id: string; author: string; body: string; date: string }[];
  comments: { id: string; memberId: string; body: string; date: string }[];
  approvals: { id: string; memberId: string; decision: "approved" | "pending" | "changes"; note: string; date: string }[];
  activity: { id: string; memberId: string; action: string; date: string }[];
  snapshotIds: string[];
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsed: string | null;
  environment: "live" | "test";
  monthlyLimit: number;
  used: number;
  status: "active" | "revoked";
}

export interface ApiUsageDay {
  date: string;
  requests: number;
  errors: number;
  p95Ms: number;
}

export interface DataRevision {
  id: string;
  productId: string;
  field: string;
  previous: string;
  next: string;
  sourceId: string;
  date: string;
  actor: string;
  kind: "update" | "correction" | "conflict" | "new-source";
}

export interface ImportRecord {
  id: string;
  name: string;
  source: string;
  date: string;
  rows: number;
  created: number;
  updated: number;
  failed: number;
  status: "completed" | "partial" | "failed";
  actor: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  date: string;
}
