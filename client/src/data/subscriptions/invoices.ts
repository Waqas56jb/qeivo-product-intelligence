import type { Invoice } from "@/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ALEX_ADDRESS = ["Alex Morgan", "2214 NE Alberta St", "Portland, OR 97211", "United States"];

/** Monthly Premium invoices for the demo customer, newest first (Jan–Nov 2026). */
export const invoices: Invoice[] = Array.from({ length: 11 }, (_, i) => {
  const month = i + 1;
  const mm = String(month).padStart(2, "0");
  const nextMonth = month === 12 ? 1 : month + 1;
  const status: Invoice["status"] = month === 11 ? "open" : month === 4 ? "refunded" : "paid";
  return {
    id: `inv-2026-${String(month).padStart(3, "0")}`,
    number: `QV-26${mm}-${String(4810 + month * 7).padStart(5, "0")}`,
    date: `2026-${mm}-14`,
    dueDate: `2026-${mm}-28`,
    status,
    amount: 12,
    tax: 0,
    currency: "USD",
    plan: "Premium (monthly)",
    period: `${MONTHS[month - 1]} 14 – ${MONTHS[nextMonth - 1]} 13, 2026`,
    lines: [
      { description: "Qeivo Premium — monthly subscription", quantity: 1, unitPrice: 12 },
      ...(month === 4 ? [{ description: "Refunded: duplicate charge after card update", quantity: 1, unitPrice: 0 }] : []),
    ],
    billedTo: { name: "Alex Morgan", address: ALEX_ADDRESS },
    paymentMethod: month >= 4 ? "Visa ending 4417" : "Mastercard ending 0932",
  } satisfies Invoice;
}).reverse();

const HARBOR = { name: "Harbor Property Group LLC", address: ["Attn: Accounts Payable", "1800 Harbor Way, Suite 400", "Seattle, WA 98121", "United States"] };

function org(id: string, number: string, date: string, due: string, status: Invoice["status"], seats: number, period: string, extra: Invoice["lines"] = []): Invoice {
  const lines = [{ description: "Qeivo Team — seat (monthly)", quantity: seats, unitPrice: 39 }, ...extra];
  const amount = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  return {
    id,
    number,
    date,
    dueDate: due,
    status,
    amount,
    tax: Math.round(amount * 0.101 * 100) / 100,
    currency: "USD",
    plan: "Team (monthly)",
    period,
    lines,
    billedTo: HARBOR,
    paymentMethod: "ACH transfer · Pacific Coast Bank ••6620",
  };
}

/** Workspace (Harbor Property Group) invoices, newest first. */
export const orgInvoices: Invoice[] = [
  org("inv-org-2026-011", "QV-ORG-2611-0207", "2026-11-01", "2026-11-30", "open", 10, "Nov 1 – Nov 30, 2026", [{ description: "API overage — 12,000 requests over plan", quantity: 12, unitPrice: 2 }]),
  org("inv-org-2026-010", "QV-ORG-2610-0188", "2026-10-01", "2026-10-31", "paid", 10, "Oct 1 – Oct 31, 2026"),
  org("inv-org-2026-009", "QV-ORG-2609-0171", "2026-09-01", "2026-09-30", "paid", 9, "Sep 1 – Sep 30, 2026", [{ description: "Seat added mid-cycle (prorated)", quantity: 1, unitPrice: 19.5 }]),
  org("inv-org-2026-008", "QV-ORG-2608-0150", "2026-08-01", "2026-08-31", "paid", 8, "Aug 1 – Aug 31, 2026"),
  org("inv-org-2026-007", "QV-ORG-2607-0139", "2026-07-01", "2026-07-31", "paid", 8, "Jul 1 – Jul 31, 2026"),
  org("inv-org-2026-006", "QV-ORG-2606-0121", "2026-06-01", "2026-06-30", "paid", 8, "Jun 1 – Jun 30, 2026", [{ description: "Onboarding workshop (2 hours)", quantity: 1, unitPrice: 250 }]),
  org("inv-org-2026-005", "QV-ORG-2605-0104", "2026-05-01", "2026-05-31", "paid", 6, "May 1 – May 31, 2026"),
];

export function getInvoice(id: string): Invoice | undefined {
  return invoices.find((i) => i.id === id) ?? orgInvoices.find((i) => i.id === id);
}
