import type { DemoRole } from "@/types";
import { avatarAt } from "../images";

/** Staff / role-preview users used by the admin preview and the role switcher. */
export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "Platform admin" | "Data steward" | "Content moderator" | "Support lead" | "Solutions engineer";
  team: string;
  permissions: string[];
  lastActive: string;
}

export const staffProfiles: StaffProfile[] = [
  { id: "st-ines", name: "Inès Marchetti", email: "ines.marchetti@qeivo.example", avatar: avatarAt(16), role: "Platform admin", team: "Platform", permissions: ["users:manage", "billing:manage", "data:publish", "audit:read"], lastActive: "2026-11-23T09:12:00Z" },
  { id: "st-daniel", name: "Daniel Okoye", email: "daniel.okoye@qeivo.example", avatar: avatarAt(9), role: "Data steward", team: "Product data", permissions: ["data:edit", "data:publish", "imports:run", "audit:read"], lastActive: "2026-11-23T08:47:00Z" },
  { id: "st-mei", name: "Mei Tanaka", email: "mei.tanaka@qeivo.example", avatar: avatarAt(4), role: "Data steward", team: "Product data", permissions: ["data:edit", "imports:run"], lastActive: "2026-11-22T17:30:00Z" },
  { id: "st-rafael", name: "Rafael Costa", email: "rafael.costa@qeivo.example", avatar: avatarAt(11), role: "Content moderator", team: "Trust & safety", permissions: ["reports:resolve", "content:hide", "creators:review"], lastActive: "2026-11-23T07:58:00Z" },
  { id: "st-grace", name: "Grace Liu", email: "grace.liu@qeivo.example", avatar: avatarAt(12), role: "Content moderator", team: "Trust & safety", permissions: ["reports:resolve", "content:hide"], lastActive: "2026-11-21T15:05:00Z" },
  { id: "st-owen", name: "Owen Fitzgerald", email: "owen.fitzgerald@qeivo.example", avatar: avatarAt(5), role: "Support lead", team: "Customer success", permissions: ["users:read", "billing:refund"], lastActive: "2026-11-22T19:40:00Z" },
  { id: "st-anika", name: "Anika Sharma", email: "anika.sharma@qeivo.example", avatar: avatarAt(20), role: "Solutions engineer", team: "Partnerships", permissions: ["companies:manage", "api:keys"], lastActive: "2026-11-20T11:22:00Z" },
];

/** Demo personas available in the role switcher. */
export const demoPersonas: { role: DemoRole; name: string; subtitle: string; avatar: string; home: string }[] = [
  { role: "customer", name: "Alex Morgan", subtitle: "Premium customer · Portland, US", avatar: avatarAt(3), home: "/app" },
  { role: "manufacturer", name: "Elin Sandberg", subtitle: "Nordvik · Product data lead", avatar: avatarAt(2), home: "/app/manufacturer" },
  { role: "supplier", name: "Marcus Hale", subtitle: "Larder & Co · Commercial manager", avatar: avatarAt(7), home: "/app/supplier" },
  { role: "creator", name: "Maya Okafor", subtitle: "Independent kitchen-appliance reviewer", avatar: avatarAt(0), home: "/app/creator" },
  { role: "developer", name: "Harbor Property Group", subtitle: "API workspace · Team plan", avatar: avatarAt(17), home: "/app/developer" },
];
