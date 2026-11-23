"use client";

import { create } from "zustand";
import type { ResearchProject, WorkspaceMember } from "@/types";
import { projects as seedProjects } from "@/data/workspaces/projects";
import { memberById, workspaceMembers } from "@/data/workspaces/workspaces";
import { DEMO_NOW } from "@/lib/utils";

/**
 * Session-only workspace state (not persisted). Seeded from `src/data/workspaces` so every page
 * of the workspace sees the same approvals, notes and members while the tab is open.
 * Nothing is sent anywhere — every mutation is a local demo change.
 */

export const CURRENT_MEMBER_ID = "wm-alex";

type Approval = ResearchProject["approvals"][number];

export interface LocalProject extends ResearchProject {
  /** Created in this session — no seeded detail page exists. */
  local?: boolean;
}

interface WorkspaceState {
  projects: LocalProject[];
  members: WorkspaceMember[];
  /** Counter so generated ids stay deterministic within a session. */
  seq: number;
  addProject: (p: Omit<LocalProject, "id" | "notes" | "comments" | "approvals" | "activity" | "snapshotIds" | "updatedAt" | "local">) => string;
  addNote: (projectId: string, body: string) => void;
  addComment: (projectId: string, body: string) => void;
  decide: (projectId: string, approvalId: string, decision: Exclude<Approval["decision"], "pending">, note: string) => void;
  /** Alex (Admin) records their own decision on a project. */
  recordDecision: (projectId: string, decision: Exclude<Approval["decision"], "pending">, note: string) => void;
  inviteMember: (m: { name: string; email: string; role: WorkspaceMember["role"]; title: string }) => void;
  setRole: (memberId: string, role: WorkspaceMember["role"]) => void;
  removeMember: (memberId: string) => void;
}

const nowIso = (offsetMin: number) => new Date(DEMO_NOW.getTime() + offsetMin * 60_000).toISOString();

function touch(p: LocalProject, seq: number, action: string): LocalProject {
  return {
    ...p,
    updatedAt: nowIso(seq),
    activity: [...p.activity, { id: `${p.id}-lx${seq}`, memberId: CURRENT_MEMBER_ID, action, date: nowIso(seq) }],
  };
}

function nextStatus(p: LocalProject): LocalProject["status"] {
  if (p.status === "archived") return p.status;
  if (!p.approvals.length) return p.status;
  if (p.approvals.every((a) => a.decision === "approved")) return "approved";
  return "in-review";
}

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
  projects: seedProjects,
  members: workspaceMembers,
  seq: 1,

  addProject: (input) => {
    const seq = get().seq;
    const id = `prj-local-${seq}`;
    const project: LocalProject = {
      ...input,
      id,
      notes: [],
      comments: [],
      approvals: [],
      activity: [{ id: `${id}-x1`, memberId: CURRENT_MEMBER_ID, action: "created the project", date: nowIso(seq) }],
      snapshotIds: [],
      updatedAt: nowIso(seq),
      local: true,
    };
    set((s) => ({ projects: [project, ...s.projects], seq: s.seq + 1 }));
    return id;
  },

  addNote: (projectId, body) =>
    set((s) => ({
      seq: s.seq + 1,
      projects: s.projects.map((p) =>
        p.id === projectId ? touch({ ...p, notes: [...p.notes, { id: `${p.id}-ln${s.seq}`, author: "Alex Morgan", body, date: nowIso(s.seq) }] }, s.seq, "added a note") : p,
      ),
    })),

  addComment: (projectId, body) =>
    set((s) => ({
      seq: s.seq + 1,
      projects: s.projects.map((p) =>
        p.id === projectId ? touch({ ...p, comments: [...p.comments, { id: `${p.id}-lc${s.seq}`, memberId: CURRENT_MEMBER_ID, body, date: nowIso(s.seq) }] }, s.seq, "commented") : p,
      ),
    })),

  decide: (projectId, approvalId, decision, note) =>
    set((s) => ({
      seq: s.seq + 1,
      projects: s.projects.map((p) => {
        if (p.id !== projectId) return p;
        const approval = p.approvals.find((a) => a.id === approvalId);
        const approvals = p.approvals.map((a) => (a.id === approvalId ? { ...a, decision, note, date: nowIso(s.seq) } : a));
        const who = approval ? get().members.find((m) => m.id === approval.memberId)?.name ?? "approver" : "approver";
        const next = touch({ ...p, approvals }, s.seq, decision === "approved" ? `recorded approval on behalf of ${who}` : `requested changes on behalf of ${who}`);
        return { ...next, status: nextStatus(next) };
      }),
    })),

  recordDecision: (projectId, decision, note) =>
    set((s) => ({
      seq: s.seq + 1,
      projects: s.projects.map((p) => {
        if (p.id !== projectId) return p;
        const existing = p.approvals.find((a) => a.memberId === CURRENT_MEMBER_ID);
        const entry = { id: existing?.id ?? `${p.id}-la${s.seq}`, memberId: CURRENT_MEMBER_ID, decision, note, date: nowIso(s.seq) };
        const approvals = existing ? p.approvals.map((a) => (a.id === existing.id ? entry : a)) : [...p.approvals, entry];
        const next = touch({ ...p, approvals }, s.seq, decision === "approved" ? "approved the shortlist" : "requested changes");
        return { ...next, status: nextStatus(next) };
      }),
    })),

  inviteMember: (m) =>
    set((s) => ({
      seq: s.seq + 1,
      members: [...s.members, { id: `wm-invite-${s.seq}`, name: m.name, email: m.email, role: m.role, title: m.title, avatar: "", lastActive: "" }],
    })),

  setRole: (memberId, role) => set((s) => ({ members: s.members.map((m) => (m.id === memberId ? { ...m, role } : m)) })),

  removeMember: (memberId) => set((s) => ({ members: s.members.filter((m) => m.id !== memberId) })),
}));

export function useProject(id: string) {
  return useWorkspaceStore((s) => s.projects.find((p) => p.id === id));
}

export function useMemberLookup() {
  const members = useWorkspaceStore((s) => s.members);
  return (id: string) => members.find((m) => m.id === id) ?? memberById.get(id);
}
