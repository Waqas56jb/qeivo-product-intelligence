import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Bookmark,
  Building2,
  Code2,
  Compass,
  CreditCard,
  FileStack,
  FileText,
  FolderKanban,
  GitCompareArrows,
  History,
  Home,
  KeyRound,
  LayoutDashboard,
  LineChart,
  MessageSquareText,
  MessagesSquare,
  Package,
  PackageCheck,
  PlaySquare,
  ScanLine,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Upload,
  User,
  Users,
  Video,
  Wrench,
} from "lucide-react";
import type { DemoRole } from "@/types";
import { routes } from "./routes";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Match nested routes as active */
  match?: "exact" | "prefix";
  badge?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const marketingNav = [
  { label: "Explore", href: routes.category("refrigerators") },
  { label: "How it works", href: routes.howItWorks },
  { label: "Guides", href: routes.guides },
  { label: "Videos", href: routes.videos },
  { label: "Pricing", href: routes.pricing },
  { label: "About", href: routes.about },
];

export const customerNav: NavSection[] = [
  {
    items: [
      { label: "Home", href: routes.app, icon: Home, match: "exact" },
      { label: "Explore", href: routes.products, icon: Compass },
      { label: "Compare", href: routes.compare, icon: GitCompareArrows },
      { label: "Recommendations", href: routes.recommendations, icon: Sparkles },
      { label: "Ask Qeivo", href: routes.ask, icon: MessageSquareText },
      { label: "Saved", href: routes.saved, icon: Bookmark },
      { label: "My Products", href: routes.myProducts, icon: PackageCheck },
      { label: "Guides", href: routes.ownershipGuides, icon: Wrench },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "Price intelligence", href: routes.priceIntelligence, icon: Tag },
      { label: "Videos", href: routes.appVideos, icon: PlaySquare },
      { label: "Documents", href: routes.documents, icon: FileText },
      { label: "Data history", href: routes.dataHistory, icon: History },
      { label: "Community", href: routes.community, icon: MessagesSquare },
      { label: "Scan barcode", href: routes.scan, icon: ScanLine },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "Harbor Property Group", href: routes.workspace, icon: Building2, match: "exact" },
      { label: "Projects", href: routes.projects, icon: FolderKanban },
      { label: "Members", href: routes.workspaceMembers, icon: Users },
      { label: "Org billing", href: routes.workspaceBilling, icon: CreditCard },
    ],
  },
];

export const customerAccountNav: NavItem[] = [
  { label: "Notifications", href: routes.notifications, icon: Bell },
  { label: "Profile", href: routes.profile, icon: User },
  { label: "Settings", href: routes.settings, icon: Settings, match: "exact" },
  { label: "Billing", href: routes.billing, icon: CreditCard },
];

export const mobileTabs: NavItem[] = [
  { label: "Home", href: routes.app, icon: Home, match: "exact" },
  { label: "Explore", href: routes.products, icon: Compass },
  { label: "Scan", href: routes.scan, icon: ScanLine },
  { label: "Ask", href: routes.ask, icon: MessageSquareText },
  { label: "Saved", href: routes.saved, icon: Bookmark },
];

export const businessNav: Record<Exclude<DemoRole, "customer">, NavSection[]> = {
  manufacturer: [
    {
      items: [
        { label: "Overview", href: routes.manufacturer, icon: LayoutDashboard, match: "exact" },
        { label: "Products", href: routes.mProducts, icon: Package },
        { label: "Documents", href: routes.mDocuments, icon: FileStack },
        { label: "Bulk import", href: routes.mImport, icon: Upload },
        { label: "Videos", href: routes.mVideos, icon: Video },
        { label: "Reviews", href: routes.mReviews, icon: Star },
        { label: "Team", href: routes.mTeam, icon: Users },
        { label: "Insights", href: routes.mInsights, icon: LineChart },
      ],
    },
  ],
  supplier: [
    {
      items: [
        { label: "Overview", href: routes.supplier, icon: LayoutDashboard, match: "exact" },
        { label: "Products", href: routes.sProducts, icon: Package },
        { label: "Offers", href: routes.sOffers, icon: ShoppingBag },
        { label: "Analytics", href: routes.sAnalytics, icon: BarChart3 },
      ],
    },
  ],
  creator: [
    {
      items: [
        { label: "Overview", href: routes.creator, icon: LayoutDashboard, match: "exact" },
        { label: "Profile", href: routes.cProfile, icon: User },
        { label: "Submissions", href: routes.cSubmissions, icon: FileText },
        { label: "Analytics", href: routes.cAnalytics, icon: BarChart3 },
      ],
    },
  ],
  developer: [
    {
      items: [
        { label: "Overview", href: routes.developer, icon: LayoutDashboard, match: "exact" },
        { label: "API keys", href: routes.devKeys, icon: KeyRound },
        { label: "Usage", href: routes.devUsage, icon: BarChart3 },
        { label: "Documentation", href: routes.devDocs, icon: BookOpen },
      ],
    },
  ],
};

export const roleMeta: Record<DemoRole, { label: string; description: string; home: string; icon: LucideIcon; org: string }> = {
  customer: { label: "Customer", description: "Research, compare and decide", home: routes.app, icon: User, org: "Alex Morgan · Premium" },
  manufacturer: { label: "Manufacturer", description: "Nordvik product team", home: routes.manufacturer, icon: Building2, org: "Nordvik Appliances" },
  supplier: { label: "Supplier", description: "Larder & Co retail", home: routes.supplier, icon: ShoppingBag, org: "Larder & Co" },
  creator: { label: "Creator", description: "Independent reviewer", home: routes.creator, icon: Video, org: "Maya Okafor" },
  developer: { label: "Developer", description: "Qeivo API access", home: routes.developer, icon: Code2, org: "Harbor Property Group" },
};

/** Breadcrumb labels for static path segments. */
export const segmentLabels: Record<string, string> = {
  app: "Home",
  products: "Products",
  analysis: "AI analysis",
  score: "Suitability score",
  reviews: "Reviews",
  "ownership-cost": "Ownership cost",
  compatibility: "Compatibility",
  compare: "Compare",
  recommendations: "Recommendations",
  "ask-qeivo": "Ask Qeivo",
  videos: "Videos",
  guides: "Guides",
  ownership: "Ownership guides",
  documents: "Documents",
  "data-history": "Data history",
  saved: "Saved research",
  "my-products": "My products",
  "price-intelligence": "Price intelligence",
  community: "Community",
  notifications: "Notifications",
  profile: "Profile",
  settings: "Settings",
  privacy: "Privacy & data",
  billing: "Billing",
  invoices: "Invoices",
  scan: "Scan",
  workspace: "Workspace",
  projects: "Projects",
  members: "Members",
  business: "Business",
  manufacturer: "Manufacturer",
  supplier: "Supplier",
  creator: "Creator",
  new: "New",
  edit: "Edit",
  import: "Bulk import",
  team: "Team",
  insights: "Insights",
  offers: "Offers",
  analytics: "Analytics",
  submissions: "Submissions",
  developer: "Developer",
  keys: "API keys",
  usage: "Usage",
  docs: "Documentation",
};
