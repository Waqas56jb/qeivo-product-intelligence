import type { AuditLogEntry } from "@/types";

const a = (id: string, actor: string, action: string, target: string, date: string): AuditLogEntry => ({ id, actor, action, target, date });

/** Platform audit log, newest first. */
export const auditLog: AuditLogEntry[] = [
  a("al-020", "Daniel Okoye", "published product data", "Ovea Eco FD520 (OV-EC520SS)", "2026-11-23T08:47:00Z"),
  a("al-019", "Rafael Costa", "hid review", "rv report #RPT-1042 · Kestrel Dorm C90", "2026-11-23T07:58:00Z"),
  a("al-018", "Lars Holmberg", "uploaded document", "NV-C400IX integrated column installation (draft)", "2026-11-21T15:40:00Z"),
  a("al-017", "System", "flagged conflict", "Nordvik Column C400 · energy class B vs A", "2026-11-21T16:02:00Z"),
  a("al-016", "Inès Marchetti", "changed plan", "Harbor Property Group · Team, 9 → 10 seats", "2026-11-20T10:14:00Z"),
  a("al-015", "Grace Liu", "dismissed report", "Community answer q-007-r2 (not spam)", "2026-11-19T17:20:00Z"),
  a("al-014", "Owen Fitzgerald", "issued refund", "Invoice inv-2026-004 · Alex Morgan · $12.00", "2026-11-18T12:05:00Z"),
  a("al-013", "Anika Sharma", "verified company", "Ovea Appliances (co-ovea)", "2026-11-15T14:30:00Z"),
  a("al-012", "Daniel Okoye", "ran import", "HomeLab Review Q4 fridge lab results (18 rows)", "2026-11-14T10:22:00Z"),
  a("al-011", "Rafael Costa", "approved content", "sub-004 · Maya Okafor · Maru Flex QD640 video", "2026-11-12T11:00:00Z"),
  a("al-010", "Imogen Price", "updated offers", "Larder & Co · 188 offers", "2026-11-12T09:12:00Z"),
  a("al-009", "Elin Sandberg", "invited team member", "sara.bergqvist@nordvik.example (Editor)", "2026-11-11T09:00:00Z"),
  a("al-008", "Inès Marchetti", "revoked API key", "qv_live_Kv8n… (Harbor Property Group)", "2026-11-10T16:45:00Z"),
  a("al-007", "Elin Sandberg", "corrected specification", "Nordvik Ellipse BF380 · height 2000 → 2010 mm", "2026-11-10T13:10:00Z"),
  a("al-006", "Grace Liu", "requested changes", "sub-006 · Ovea Eco BF370 one-year check-in", "2026-11-08T15:40:00Z"),
  a("al-005", "Mei Tanaka", "merged duplicate", "Kestrel KS-TF450W / KS-TF450WH", "2026-11-06T10:10:00Z"),
  a("al-004", "Elin Sandberg", "suspended team member", "Viktor Nyström (Nordvik)", "2026-11-04T08:30:00Z"),
  a("al-003", "System", "import failed", "Maru connected-appliance feed (token expired)", "2026-10-22T04:00:00Z"),
  a("al-002", "Anika Sharma", "created API key", "qv_live_c4Px… (Harbor Property Group)", "2026-07-11T14:12:00Z"),
  a("al-001", "Inès Marchetti", "granted role", "Rafael Costa → Content moderator", "2026-06-01T09:00:00Z"),
].sort((x, y) => y.date.localeCompare(x.date));
