import type { Workspace, WorkspaceMember } from "@/types";
import { avatarAt } from "../images";

export const workspaces: Workspace[] = [
  {
    id: "ws-harbor",
    name: "Harbor Property Group",
    logo: "HP",
    plan: "Team",
    seats: 12,
    seatsUsed: 10,
    industry: "Residential property management",
    description: "Manages 1,420 rental units across 31 buildings in the Pacific Northwest. Uses Qeivo to standardise appliance specifications for unit turnovers and renovations.",
  },
];

export const currentWorkspace: Workspace = workspaces[0];

type Row = [id: string, name: string, role: WorkspaceMember["role"], title: string, lastActive: string, avatar: number];

const rows: Row[] = [
  ["wm-dana", "Dana Whitmore", "Owner", "VP, Asset Management", "2026-11-22T17:05:00Z", 4],
  ["wm-alex", "Alex Morgan", "Admin", "Procurement Manager", "2026-11-23T09:20:00Z", 3],
  ["wm-carlos", "Carlos Mendoza", "Researcher", "Facilities Coordinator", "2026-11-23T08:02:00Z", 1],
  ["wm-yuki", "Yuki Sato", "Researcher", "Renovation Project Manager", "2026-11-22T14:48:00Z", 6],
  ["wm-grace", "Grace Thompson", "Approver", "Director of Finance", "2026-11-21T19:30:00Z", 12],
  ["wm-andre", "André Baptiste", "Approver", "Regional Property Manager, Tacoma", "2026-11-20T16:12:00Z", 17],
  ["wm-fatima", "Fatima Al-Rashid", "Researcher", "Sustainability Analyst", "2026-11-22T10:40:00Z", 20],
  ["wm-tom", "Tom Kowalski", "Viewer", "Maintenance Supervisor", "2026-11-19T07:15:00Z", 13],
  ["wm-nina", "Nina Petrova", "Viewer", "Leasing Manager", "2026-11-14T13:22:00Z", 8],
  ["wm-owen", "Owen Reyes", "Researcher", "Capital Projects Analyst", "2026-11-23T06:58:00Z", 21],
];

export const workspaceMembers: WorkspaceMember[] = rows.map(([id, name, role, title, lastActive, avatar]) => ({
  id,
  name,
  email: `${name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]+/g, ".")}@harborpg.example`,
  avatar: avatarAt(avatar),
  role,
  title,
  lastActive,
}));

export const memberById = new Map(workspaceMembers.map((m) => [m.id, m]));

export function getMember(id: string): WorkspaceMember | undefined {
  return memberById.get(id);
}
