"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowUpRight, Building, CalendarClock, ChevronRight, CreditCard, Download, FileText, Landmark, Receipt, Save, ShieldCheck, Sparkles } from "lucide-react";
import type { Invoice } from "@/types";
import { routes } from "@/config/routes";
import { currentWorkspace } from "@/data/workspaces/workspaces";
import { getPlan } from "@/data/subscriptions/plans";
import { orgInvoices } from "@/data/subscriptions/invoices";
import { apiUsage } from "@/data/api/usage";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label, Progress } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { PanelHeader } from "./project-bits";
import { useWorkspaceStore } from "./workspace-store";

const money = (v: number) => formatCurrency(v, "US", { decimals: 2 });
const STATUS_BADGE: Record<Invoice["status"], { label: string; variant: "success" | "warning" | "info" }> = {
  paid: { label: "Paid", variant: "success" },
  open: { label: "Open", variant: "warning" },
  refunded: { label: "Refunded", variant: "info" },
};

const API_QUOTA = 50_000;
const API_MTD = apiUsage.filter((d) => d.date >= "2026-11-01").reduce((s, d) => s + d.requests, 0);

const COUNTRIES = ["United States", "Canada", "United Kingdom", "Australia"] as const;

const schema = z.object({
  legalName: z.string().trim().min(2, "Enter the legal company name.").max(100),
  email: z.string().trim().pipe(z.email("Enter a valid billing email.")),
  taxId: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{2}-\d{7}$/.test(v), "Use the EIN format 12-3456789, or leave blank."),
  line1: z.string().trim().min(3, "Enter the street address."),
  line2: z.string().trim(),
  city: z.string().trim().min(2, "Enter the city."),
  region: z.string().trim().min(2, "Enter the state or region."),
  postal: z.string().trim().regex(/^[A-Za-z0-9 -]{3,10}$/, "Enter a valid postal code."),
  country: z.enum(COUNTRIES),
});
type BillingForm = z.infer<typeof schema>;

function Meter({ label, used, total, format = (v: number) => v.toLocaleString("en-US"), hint }: { label: string; used: number; total: number; format?: (v: number) => string; hint?: string }) {
  const pct = Math.min(100, (used / total) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="font-medium">{label}</span>
        <span className="tabular text-muted-foreground">
          <span className="font-semibold text-foreground">{format(used)}</span> / {format(total)}
        </span>
      </div>
      <Progress value={pct} className="mt-2" indicatorClassName={pct >= 90 ? "bg-warning" : undefined} aria-label={`${label}: ${Math.round(pct)}% used`} />
      {hint && <p className="mt-1.5 text-[12px] text-subtle-foreground">{hint}</p>}
    </div>
  );
}

export function OrgBilling() {
  const plan = getPlan("team");
  const members = useWorkspaceStore((s) => s.members);
  const ws = currentWorkspace;
  const seatPrice = plan?.priceMonthly ?? 39;
  const billedSeats = members.length;
  const subtotal = billedSeats * seatPrice;
  const tax = Math.round(subtotal * 0.101 * 100) / 100;
  const askUsed = 6148;
  const askTotal = 2000 * billedSeats;

  const { register, handleSubmit, control, formState, reset } = useForm<BillingForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      legalName: "Harbor Property Group LLC",
      email: "accounts.payable@harborpg.example",
      taxId: "91-4820615",
      line1: "1800 Harbor Way, Suite 400",
      line2: "Attn: Accounts Payable",
      city: "Seattle",
      region: "WA",
      postal: "98121",
      country: "United States",
    },
  });
  const e = formState.errors;

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow="Harbor Property Group"
        title="Organisation billing"
        description="Plan, seats, usage and invoices for the whole workspace. Individual Premium subscriptions are billed separately."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.pricing}>
              Compare plans <ArrowUpRight />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Plan card */}
        <section aria-label="Current plan" className="relative overflow-hidden rounded-[20px] bg-navy-sheen p-5 text-white shadow-md sm:p-7">
          <div aria-hidden className="surface-grid pointer-events-none absolute inset-0 opacity-20" />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-teal-400">
                  <Sparkles className="size-3.5" /> Current plan
                </p>
                <h2 className="mt-2 text-[28px] font-semibold tracking-tight">{plan?.name ?? "Team"}</h2>
                <p className="mt-1 max-w-md text-[14px] leading-relaxed text-white/70">{plan?.description}</p>
              </div>
              <div className="text-right">
                <p className="text-[30px] font-semibold leading-none tracking-tight tabular">{formatCurrency(seatPrice, "US", { decimals: 0 })}</p>
                <p className="mt-1 text-[12px] text-white/60">per seat / month</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { k: "Seats billed", v: `${billedSeats}`, s: `of ${ws.seats} allowance` },
                { k: "Monthly total", v: money(subtotal), s: "before tax" },
                { k: "Next invoice", v: "1 Dec 2026", s: `${money(subtotal + tax)} incl. tax` },
                { k: "Billing cycle", v: "Monthly", s: "ACH, net 30" },
              ].map((x) => (
                <div key={x.k} className="rounded-[12px] bg-white/[0.07] px-3.5 py-3 ring-1 ring-white/10">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-white/55">{x.k}</dt>
                  <dd className="mt-1 text-[16px] font-semibold tabular">{x.v}</dd>
                  <dd className="text-[11px] text-white/55">{x.s}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="brand"
                className="h-11 sm:h-10"
                onClick={() => toast("Seat changes are simulated", { description: "In the live product, added seats are prorated on the next invoice. Nothing was charged." })}
              >
                Add seats
              </Button>
              <Button
                variant="ghost"
                className="h-11 text-white hover:bg-white/10 hover:text-white sm:h-10"
                onClick={() => toast("Annual billing preview", { description: `Annual Team pricing is ${formatCurrency(plan?.priceYearly ?? 374, "US", { decimals: 0 })} per seat per year (about 20% less). Demo only — no change made.` })}
              >
                Switch to annual
              </Button>
            </div>
          </div>
        </section>

        {/* Usage */}
        <section aria-labelledby="usage-title" className="rounded-[14px] border border-border bg-card shadow-xs">
          <PanelHeader id="usage-title" icon={CalendarClock} title="Usage this cycle" description="1 Nov – 30 Nov 2026 · updated 23 Nov" />
          <div className="space-y-5 p-4 sm:p-5">
            <Meter label="Seats assigned" used={billedSeats} total={ws.seats} hint="Billed per assigned seat, prorated mid-cycle" />
            <Meter label="API requests" used={API_MTD} total={API_QUOTA} hint="Overage is billed at $2 per 1,000 requests" />
            <Meter label="Ask Qeivo messages" used={askUsed} total={askTotal} hint={`2,000 per seat per month, pooled across ${billedSeats} seats`} />
            <div className="flex items-center justify-between rounded-[10px] bg-surface-2 px-3.5 py-2.5 text-[13px]">
              <span className="text-muted-foreground">Research projects</span>
              <span className="font-semibold">Unlimited</span>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Billing details */}
        <section aria-labelledby="billing-details" className="rounded-[14px] border border-border bg-card shadow-xs">
          <PanelHeader id="billing-details" icon={Building} title="Billing details" description="Shown on every invoice" />
          <form
            noValidate
            className="space-y-4 p-4 sm:p-5"
            onSubmit={handleSubmit((v) => {
              reset(v);
              toast.success("Billing details saved", { description: "Stored in this demo session — future invoices are not regenerated." });
            })}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="b-legal" label="Legal name" error={e.legalName?.message}>
                <Input id="b-legal" aria-invalid={!!e.legalName} {...register("legalName")} />
              </Field>
              <Field id="b-email" label="Billing email" error={e.email?.message}>
                <Input id="b-email" type="email" aria-invalid={!!e.email} {...register("email")} />
              </Field>
              <Field id="b-tax" label="Tax ID (EIN)" error={e.taxId?.message} hint="Optional">
                <Input id="b-tax" className="tabular" aria-invalid={!!e.taxId} {...register("taxId")} />
              </Field>
              <Field id="b-country" label="Country" error={e.country?.message}>
                <Controller
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="b-country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field id="b-line1" label="Address" error={e.line1?.message} className="sm:col-span-2">
                <Input id="b-line1" aria-invalid={!!e.line1} {...register("line1")} />
              </Field>
              <Field id="b-line2" label="Address line 2" hint="Optional" className="sm:col-span-2">
                <Input id="b-line2" {...register("line2")} />
              </Field>
              <div className="grid grid-cols-2 gap-4 sm:col-span-2 sm:grid-cols-3">
                <Field id="b-city" label="City" error={e.city?.message} className="col-span-2 sm:col-span-1">
                  <Input id="b-city" aria-invalid={!!e.city} {...register("city")} />
                </Field>
                <Field id="b-region" label="State" error={e.region?.message}>
                  <Input id="b-region" aria-invalid={!!e.region} {...register("region")} />
                </Field>
                <Field id="b-postal" label="ZIP / postal code" error={e.postal?.message}>
                  <Input id="b-postal" className="tabular" aria-invalid={!!e.postal} {...register("postal")} />
                </Field>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12px] text-subtle-foreground">{formState.isDirty ? "You have unsaved changes." : "All changes saved."}</p>
              <div className="flex gap-2">
                <Button variant="outline" disabled={!formState.isDirty} onClick={() => reset()} className="h-11 flex-1 sm:h-10 sm:flex-none">
                  Discard
                </Button>
                <Button type="submit" variant="brand" disabled={!formState.isDirty} className="h-11 flex-1 sm:h-10 sm:flex-none">
                  <Save /> Save details
                </Button>
              </div>
            </div>
          </form>
        </section>

        {/* Payment method */}
        <section aria-labelledby="payment-method" className="rounded-[14px] border border-border bg-card shadow-xs">
          <PanelHeader id="payment-method" icon={CreditCard} title="Payment method" />
          <div className="space-y-4 p-4 sm:p-5">
            <div className="relative overflow-hidden rounded-[16px] border border-border bg-gradient-to-br from-surface-2 to-surface-3 p-5">
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-[10px] bg-card text-foreground shadow-xs">
                  <Landmark className="size-5" />
                </span>
                <Badge variant="success">Default</Badge>
              </div>
              <p className="mt-6 text-[12px] font-medium uppercase tracking-wider text-subtle-foreground">ACH bank transfer</p>
              <p className="mt-1 font-mono text-[17px] font-semibold tracking-widest tabular">•••• •••• 6620</p>
              <p className="mt-1 text-[13px] text-muted-foreground">Pacific Coast Bank · Business checking</p>
            </div>
            <div className="flex items-start gap-2.5 rounded-[12px] bg-surface-2/70 p-3 text-[12px] leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
              Only the last four digits are ever displayed. This demo stores no account or card numbers.
            </div>
            <Button variant="outline" className="h-11 w-full sm:h-10" onClick={() => toast("Payment methods can’t be changed in the demo", { description: "No banking details are collected or stored." })}>
              Update payment method
            </Button>
          </div>
        </section>
      </div>

      {/* Invoices */}
      <section aria-labelledby="org-invoices" className="mt-6 rounded-[14px] border border-border bg-card shadow-xs">
        <PanelHeader
          id="org-invoices"
          icon={Receipt}
          title="Invoices"
          description={`${orgInvoices.length} invoices · amounts include ${"10.1%"} Washington sales tax`}
          action={
            <Button variant="ghost" size="sm" className="h-10 sm:h-8" onClick={() => toast("Export prepared (demo)", { description: "In the live product this downloads a CSV of all invoices." })}>
              <Download /> Export CSV
            </Button>
          }
        />
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface-2/50 text-[11px] uppercase tracking-wider text-subtle-foreground">
                <th scope="col" className="px-5 py-2.5 text-left font-medium">Invoice</th>
                <th scope="col" className="px-4 py-2.5 text-left font-medium">Period</th>
                <th scope="col" className="px-4 py-2.5 text-left font-medium">Issued</th>
                <th scope="col" className="px-4 py-2.5 text-left font-medium">Status</th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">Total</th>
                <th scope="col" className="px-5 py-2.5"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {orgInvoices.map((inv) => (
                <tr key={inv.id} className="group border-b border-border transition-colors last:border-0 hover:bg-surface-2/60">
                  <td className="px-5 py-3">
                    <Link href={routes.invoice(inv.id)} className="flex items-center gap-2.5 font-medium outline-none focus-visible:underline">
                      <FileText className="size-4 text-subtle-foreground" />
                      <span className="font-mono text-[12px]">{inv.number}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.period}</td>
                  <td className="px-4 py-3 tabular text-muted-foreground">{formatDate(inv.date)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE[inv.status].variant}>{STATUS_BADGE[inv.status].label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular">{money(inv.amount + inv.tax)}</td>
                  <td className="px-5 py-3 text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={routes.invoice(inv.id)} aria-label={`View invoice ${inv.number}`}>
                        View <ChevronRight />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile cards */}
        <ul className="divide-y divide-border md:hidden">
          {orgInvoices.map((inv) => (
            <li key={inv.id}>
              <Link href={routes.invoice(inv.id)} className="flex min-h-16 items-center gap-3 px-4 py-3 active:bg-surface-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-muted-foreground">
                  <FileText className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-[12px] font-medium">{inv.number}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">{inv.period}</span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <span className="text-[14px] font-semibold tabular">{money(inv.amount + inv.tax)}</span>
                  <Badge variant={STATUS_BADGE[inv.status].variant}>{STATUS_BADGE[inv.status].label}</Badge>
                </span>
                <ChevronRight className="size-4 shrink-0 text-subtle-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  );
}

function Field({ id, label, error, hint, className, children }: { id: string; label: string; error?: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label} {hint && <span className="font-normal text-subtle-foreground">({hint.toLowerCase()})</span>}
      </Label>
      {children}
      {error && (
        <p role="alert" className="text-[12px] text-danger-foreground">
          {error}
        </p>
      )}
    </div>
  );
}
