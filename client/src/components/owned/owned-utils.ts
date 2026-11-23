import { addMonths, format } from "date-fns";

/** Whole-day difference using UTC calendar days, so server and browser always agree. */
function utcDayDiff(a: Date, b: Date) {
  const day = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((day(a) - day(b)) / 86_400_000);
}
import type { OwnedProduct } from "@/types";
import { DEMO_NOW } from "@/lib/utils";

export type MaintenanceTask = OwnedProduct["maintenance"][number];
export type TaskStatus = MaintenanceTask["status"];

export const TODAY_ISO = "2026-11-23";

export function daysUntil(iso: string) {
  // UTC day difference — identical on server and in every browser timezone.
  return Math.round((Date.parse(iso.slice(0, 10)) - Date.parse(DEMO_NOW.toISOString().slice(0, 10))) / 86_400_000);
}

export type WarrantyState = "active" | "expiring" | "expired";

export function warrantyInfo(o: OwnedProduct) {
  const start = new Date(o.purchaseDate);
  const end = new Date(o.warrantyExpires);
  const total = Math.max(1, utcDayDiff(end, start));
  const elapsed = Math.min(total, Math.max(0, utcDayDiff(DEMO_NOW, start)));
  const daysLeft = utcDayDiff(end, DEMO_NOW);
  const state: WarrantyState = daysLeft < 0 ? "expired" : daysLeft <= 60 ? "expiring" : "active";
  return { total, elapsed, daysLeft, state, pct: Math.round((elapsed / total) * 100) };
}

export const WARRANTY_META: Record<WarrantyState, { label: string; badge: "success" | "warning" | "danger"; bar: string }> = {
  active: { label: "Under warranty", badge: "success", bar: "bg-success" },
  expiring: { label: "Expiring soon", badge: "warning", bar: "bg-warning" },
  expired: { label: "Warranty expired", badge: "danger", bar: "bg-danger" },
};

export const TASK_META: Record<TaskStatus, { label: string; badge: "danger" | "warning" | "info" | "success"; dot: string }> = {
  overdue: { label: "Overdue", badge: "danger", dot: "bg-danger" },
  due: { label: "Due soon", badge: "warning", dot: "bg-warning" },
  upcoming: { label: "Upcoming", badge: "info", dot: "bg-info" },
  done: { label: "Done", badge: "success", dot: "bg-success" },
};

const ORDER: Record<TaskStatus, number> = { overdue: 0, due: 1, upcoming: 2, done: 3 };
export function sortTasks(tasks: MaintenanceTask[]) {
  return [...tasks].sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.dueDate.localeCompare(b.dueDate));
}

/** Completing a task schedules the next occurrence from today. */
export function completeTask(t: MaintenanceTask): MaintenanceTask {
  return { ...t, status: "done", dueDate: format(addMonths(DEMO_NOW, t.intervalMonths), "yyyy-MM-dd") };
}

export function maskSerial(serial: string) {
  const visible = serial.slice(-4);
  return `${"•".repeat(Math.max(4, serial.length - 4))}${visible}`;
}

export function relativeDays(days: number) {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${days} days` : `${Math.abs(days)} days ago`;
}

export function addYearsIso(iso: string, years: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y + years}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
