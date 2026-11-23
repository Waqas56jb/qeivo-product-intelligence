import type { Invoice } from "@/types";
import { formatDate } from "@/lib/format";
import { LogoMark } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";

const money = (n: number, currency: string) => new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(n);

const STATUS = {
  paid: { variant: "success", label: "Paid" },
  open: { variant: "warning", label: "Payment due" },
  refunded: { variant: "info", label: "Refunded" },
} as const;

/** Print-ready invoice sheet. Server component — no interactivity. */
export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const subtotal = invoice.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const total = subtotal + invoice.tax;
  const paid = invoice.status === "paid" ? total : 0;
  const status = STATUS[invoice.status];
  const taxRate = subtotal ? Math.round((invoice.tax / subtotal) * 1000) / 10 : 0;

  return (
    <article
      aria-label={`Invoice ${invoice.number}`}
      className="invoice-sheet relative overflow-hidden rounded-[20px] border border-border bg-card shadow-sm print:rounded-none print:border-0 print:bg-white print:text-black print:shadow-none"
    >
      <div aria-hidden className="bg-navy-sheen h-1.5 print:hidden" />
      <div className="p-6 sm:p-10 print:p-0">
        {/* Letterhead */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2.5">
              <LogoMark className="size-9" />
              <span className="text-[24px] font-semibold tracking-[-0.04em]">qeivo</span>
            </span>
            <address className="mt-4 text-[12.5px] not-italic leading-relaxed text-muted-foreground print:text-neutral-600">
              Qeivo Labs, Inc.
              <br />
              350 Mission Street, Floor 9
              <br />
              San Francisco, CA 94105, United States
              <br />
              billing@qeivo.example
            </address>
          </div>
          <div className="sm:text-right">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-subtle-foreground">Invoice</p>
            <p className="mt-1 font-mono text-[18px] font-semibold tracking-tight">{invoice.number}</p>
            <Badge variant={status.variant} className="mt-2 h-6 px-2.5 text-[12px] print:border print:border-neutral-400 print:bg-transparent print:text-black">
              {status.label}
            </Badge>
          </div>
        </header>

        {/* Meta */}
        <div className="mt-10 grid gap-6 border-y border-border py-6 sm:grid-cols-3 print:border-neutral-300">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">Billed to</p>
            <address className="mt-2 text-[13.5px] not-italic leading-relaxed">
              {invoice.billedTo.address.map((line, i) => (
                <span key={line} className={i === 0 ? "block font-medium" : "block text-muted-foreground print:text-neutral-700"}>
                  {line}
                </span>
              ))}
            </address>
          </div>
          <dl className="space-y-3 text-[13.5px]">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">Issued</dt>
              <dd className="mt-0.5 font-medium">{formatDate(invoice.date, "d MMMM yyyy")}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">Due</dt>
              <dd className="mt-0.5 font-medium">{formatDate(invoice.dueDate, "d MMMM yyyy")}</dd>
            </div>
          </dl>
          <dl className="space-y-3 text-[13.5px]">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">Plan</dt>
              <dd className="mt-0.5 font-medium">{invoice.plan}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">Service period</dt>
              <dd className="mt-0.5 font-medium">{invoice.period}</dd>
            </div>
          </dl>
        </div>

        {/* Lines */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] text-[13.5px]">
            <caption className="sr-only">Line items</caption>
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-subtle-foreground print:border-neutral-300">
                <th scope="col" className="pb-3 font-semibold">Description</th>
                <th scope="col" className="w-16 pb-3 text-right font-semibold">Qty</th>
                <th scope="col" className="w-28 pb-3 text-right font-semibold">Unit price</th>
                <th scope="col" className="w-28 pb-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((l) => (
                <tr key={l.description} className="border-b border-border print:border-neutral-200">
                  <td className="py-3.5 pr-4">{l.description}</td>
                  <td className="tabular py-3.5 text-right">{l.quantity}</td>
                  <td className="tabular py-3.5 text-right">{money(l.unitPrice, invoice.currency)}</td>
                  <td className="tabular py-3.5 text-right font-medium">{money(l.quantity * l.unitPrice, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 flex flex-col-reverse gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-sm text-[12.5px] leading-relaxed text-muted-foreground print:text-neutral-600">
            <p>
              <span className="font-medium text-foreground print:text-black">Payment method:</span> {invoice.paymentMethod}
            </p>
            {invoice.status === "refunded" && <p className="mt-1">A refund for this period was issued to the original payment method.</p>}
            {invoice.status === "open" && <p className="mt-1">This invoice will be charged automatically on the due date.</p>}
            <p className="mt-3">Questions? Reply to your billing email or visit Settings → Billing. Amounts in {invoice.currency}.</p>
          </div>
          <dl className="w-full space-y-2 text-[13.5px] sm:w-[280px]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground print:text-neutral-600">Subtotal</dt>
              <dd className="tabular">{money(subtotal, invoice.currency)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground print:text-neutral-600">Tax{taxRate ? ` (${taxRate}%)` : ""}</dt>
              <dd className="tabular">{money(invoice.tax, invoice.currency)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-2 text-[15px] font-semibold print:border-neutral-300">
              <dt>Total</dt>
              <dd className="tabular">{money(total, invoice.currency)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground print:text-neutral-600">Amount paid</dt>
              <dd className="tabular">{money(paid, invoice.currency)}</dd>
            </div>
            <div className="flex justify-between gap-4 rounded-[10px] bg-surface-2 px-3 py-2 font-semibold print:bg-transparent print:px-0">
              <dt>{invoice.status === "refunded" ? "Refunded" : "Balance due"}</dt>
              <dd className="tabular">{money(invoice.status === "refunded" ? total : total - paid, invoice.currency)}</dd>
            </div>
          </dl>
        </div>

        <footer className="mt-10 border-t border-border pt-5 text-[11.5px] leading-relaxed text-subtle-foreground print:border-neutral-300 print:text-neutral-500">
          Demonstration invoice generated from fictional seed data. Qeivo Labs, Inc. is a fictional entity; no payment was processed.
        </footer>
      </div>
    </article>
  );
}
