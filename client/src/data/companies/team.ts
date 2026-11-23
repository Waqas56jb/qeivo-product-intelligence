import type { TeamMember } from "@/types";
import { avatarAt } from "../images";

type Row = [id: string, companyId: string, name: string, role: TeamMember["role"], title: string, status: TeamMember["status"], lastActive: string, avatar: number];

const rows: Row[] = [
  ["tm-elin", "co-nordvik", "Elin Sandberg", "Owner", "Head of Product Data", "active", "2026-11-23T08:55:00Z", 2],
  ["tm-johan", "co-nordvik", "Johan Ekström", "Admin", "Digital Commerce Manager", "active", "2026-11-23T07:41:00Z", 5],
  ["tm-aisha", "co-nordvik", "Aisha Karimi", "Editor", "Product Content Specialist", "active", "2026-11-22T16:20:00Z", 14],
  ["tm-lars", "co-nordvik", "Lars Holmberg", "Editor", "Refrigeration Product Manager", "active", "2026-11-21T13:02:00Z", 7],
  ["tm-noor", "co-nordvik", "Noor Haddad", "Analyst", "Consumer Insights Analyst", "active", "2026-11-23T09:30:00Z", 18],
  ["tm-felix", "co-nordvik", "Felix Lundgren", "Viewer", "Customer Care Team Lead", "active", "2026-11-19T10:15:00Z", 11],
  ["tm-sara", "co-nordvik", "Sara Bergqvist", "Editor", "Laundry Category Manager", "invited", "2026-11-18T09:00:00Z", 22],
  ["tm-viktor", "co-nordvik", "Viktor Nyström", "Viewer", "Regional Sales Director, North America", "suspended", "2026-08-04T14:40:00Z", 23],
  ["tm-marcus", "co-larder", "Marcus Hale", "Owner", "Commercial Manager", "active", "2026-11-23T08:10:00Z", 7],
  ["tm-imogen", "co-larder", "Imogen Price", "Admin", "E-commerce Lead", "active", "2026-11-22T18:44:00Z", 8],
  ["tm-raj", "co-larder", "Raj Patel", "Analyst", "Pricing Analyst", "active", "2026-11-23T06:55:00Z", 9],
  ["tm-chloe", "co-larder", "Chloé Martin", "Editor", "Merchandising Coordinator", "invited", "2026-11-20T12:00:00Z", 16],
  ["tm-katrin", "co-halden", "Katrin Vogel", "Owner", "Digital Product Information Manager", "active", "2026-11-22T15:12:00Z", 20],
  ["tm-minjun", "co-maru", "Min-jun Park", "Admin", "Global Content Operations", "active", "2026-11-21T03:25:00Z", 15],
  ["tm-ben", "co-brightcart", "Ben Carter", "Owner", "Marketplace Partnerships", "active", "2026-11-20T17:48:00Z", 1],
  ["tm-lucia", "co-voltmart", "Lucía Romero", "Analyst", "Category Analyst, Appliances", "active", "2026-11-17T11:31:00Z", 4],
];

export const teamMembers: TeamMember[] = rows.map(([id, companyId, name, role, title, status, lastActive, avatar]) => ({
  id,
  companyId,
  name,
  email: `${name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]+/g, ".")}@${companyId.slice(3)}.example`,
  avatar: avatarAt(avatar),
  role,
  title,
  status,
  lastActive,
}));

export function teamForCompany(companyId: string): TeamMember[] {
  return teamMembers.filter((m) => m.companyId === companyId);
}
