import type { LucideIcon } from "lucide-react";
import { Award, BadgeCheck, BookOpen, Building2, FileSpreadsheet, FlaskConical, Megaphone, PlayCircle, ScrollText, Sparkles, Users } from "lucide-react";
import type { ClaimType, SourceType } from "@/types";

export const CLAIM_META: Record<ClaimType, { label: string; short: string; description: string; icon: LucideIcon; className: string; dot: string }> = {
  measured: {
    label: "Measured fact",
    short: "Measured",
    description: "Verified by an independent laboratory measurement or official registry.",
    icon: FlaskConical,
    className: "bg-claim-measured-soft text-claim-measured border-claim-measured/25",
    dot: "bg-claim-measured",
  },
  expert: {
    label: "Expert assessment",
    short: "Expert",
    description: "Judgement from an independent reviewer or testing organisation.",
    icon: Award,
    className: "bg-claim-expert-soft text-claim-expert border-claim-expert/25",
    dot: "bg-claim-expert",
  },
  customer: {
    label: "Customer opinion",
    short: "Owners",
    description: "Themes reported by owners in reviews. Subjective and not independently verified.",
    icon: Users,
    className: "bg-claim-customer-soft text-claim-customer border-claim-customer/25",
    dot: "bg-claim-customer",
  },
  manufacturer: {
    label: "Manufacturer claim",
    short: "Manufacturer",
    description: "Stated by the manufacturer. Not independently verified by Qeivo.",
    icon: Building2,
    className: "bg-claim-manufacturer-soft text-claim-manufacturer border-claim-manufacturer/25",
    dot: "bg-claim-manufacturer",
  },
  ai: {
    label: "AI interpretation",
    short: "AI",
    description: "Qeivo's synthesis of the cited sources. Check the citations for the underlying evidence.",
    icon: Sparkles,
    className: "bg-claim-ai-soft text-claim-ai border-claim-ai/25",
    dot: "bg-claim-ai",
  },
};

export const CLAIM_ORDER: ClaimType[] = ["measured", "expert", "customer", "manufacturer", "ai"];

export const SOURCE_META: Record<SourceType, { label: string; icon: LucideIcon; tone: string }> = {
  manual: { label: "Manual", icon: BookOpen, tone: "text-info" },
  "spec-sheet": { label: "Specification sheet", icon: FileSpreadsheet, tone: "text-info" },
  "independent-review": { label: "Independent review", icon: Award, tone: "text-claim-expert" },
  "customer-review": { label: "Customer reviews", icon: Users, tone: "text-claim-customer" },
  "manufacturer-statement": { label: "Manufacturer statement", icon: Megaphone, tone: "text-claim-manufacturer" },
  video: { label: "Video", icon: PlayCircle, tone: "text-danger" },
  certification: { label: "Certification", icon: BadgeCheck, tone: "text-success" },
  "lab-test": { label: "Lab test", icon: FlaskConical, tone: "text-claim-measured" },
};

export const SOURCE_FALLBACK_ICON = ScrollText;
