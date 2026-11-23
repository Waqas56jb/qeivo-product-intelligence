"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Bell, Bookmark, CalendarClock, Check, ChevronRight, CreditCard, FileText, GitCompareArrows, Loader2, Lock, MessageSquare, Pencil, Receipt, Sparkles, Users } from "lucide-react";
import type { Invoice } from "@/types";
import { routes } from "@/config/routes";
import { plans } from "@/data/subscriptions/plans";
import { invoices } from "@/data/subscriptions/invoices";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { FREE_CHAT_LIMIT, MAX_COMPARE, PREMIUM_CHAT_LIMIT, useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/primitives";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmationDialog } from "@/components/common/controls";
import { LoadingSkeleton } from "@/components/common/states";
import { DemoPill, Field, SettingsCard, wait } from "./fields";

const money = (n: number, currency = "USD") => new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(n);
const PERIOD_END = "2026-12-13";
const RENEWAL = "2026-12-14";

export function InvoiceStatusBadge({ status, className }: { status: Invoice["status"]; className?: string }) {
  const map = { paid: { v: "success", l: "Paid" }, open: { v: "warning", l: "Due" }, refunded: { v: "info", l: "Refunded" } } as const;
  const m = map[status];
  return (
    <Badge variant={m.v} className={className}>
      {m.l}
    </Badge>
  );
}

/* ----------------------------------------------------------- current plan */
function CurrentPlan({ cancelled, onCancel, onResume }: { cancelled: boolean; onCancel: () => void; onResume: () => void }) {
  const plan = useAppStore((s) => s.plan);
  const premium = plan === "premium";
  const p = plans.find((x) => x.id === plan)!;
  return (
    <section aria-labelledby="plan-title" className={cn("relative overflow-hidden rounded-[20px] border shadow-sm", premium ? "bg-navy-sheen border-transparent text-white" : "border-border bg-card")}>
      {premium && <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-lime/20 blur-3xl" />}
      <div className="relative flex flex-col gap-6 p-6 sm:p-7 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className={cn("text-[12px] font-semibold uppercase tracking-[0.14em]", premium ? "text-teal-400" : "text-brand-soft-foreground")}>Current plan</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 id="plan-title" className="text-[30px] font-semibold tracking-tight">
              {p.name}
            </h2>
            {premium && !cancelled && (
              <Badge variant="lime">
                <Sparkles /> Active
              </Badge>
            )}
            {cancelled && <Badge variant="warning">Cancels {formatDate(PERIOD_END, "d MMM")}</Badge>}
          </div>
          <p className={cn("mt-1 max-w-md text-[14px] leading-relaxed", premium ? "text-white/70" : "text-muted-foreground")}>{p.description}</p>
          <dl className={cn("mt-5 flex flex-wrap gap-x-8 gap-y-3 text-[13px]", premium ? "text-white/70" : "text-muted-foreground")}>
            <div>
              <dt>Price</dt>
              <dd className={cn("tabular text-[15px] font-semibold", premium ? "text-white" : "text-foreground")}>{premium ? `${money(p.priceMonthly)} / month` : "Free"}</dd>
            </div>
            {premium && (
              <div>
                <dt>{cancelled ? "Access until" : "Renews"}</dt>
                <dd className="text-[15px] font-semibold text-white">{formatDate(cancelled ? PERIOD_END : RENEWAL, "d MMMM yyyy")}</dd>
              </div>
            )}
            {premium && (
              <div>
                <dt>Billing</dt>
                <dd className="text-[15px] font-semibold text-white">Monthly · USD</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="flex flex-wrap gap-2">
          {premium && !cancelled && (
            <Button variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white" onClick={onCancel}>
              Cancel subscription
            </Button>
          )}
          {premium && cancelled && (
            <Button className="bg-white text-navy-900 hover:bg-white/90" onClick={onResume}>
              Resume subscription
            </Button>
          )}
          <Button asChild variant={premium ? "outline" : "brand"} className={premium ? "border-white/20 bg-white/10 text-white hover:bg-white/20" : undefined}>
            <a href="#plans">
              {premium ? "Compare plans" : "Upgrade to Premium"} <ArrowRight />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ usage */
function Usage() {
  const plan = useAppStore((s) => s.plan);
  const chatUsed = useAppStore((s) => s.chatUsed);
  const saved = useAppStore((s) => s.saved.length);
  const compare = useAppStore((s) => s.compare.length);
  const alerts = useAppStore((s) => s.watchlist.length);
  const premium = plan === "premium";
  const meters = [
    { icon: MessageSquare, label: "Ask Qeivo questions", used: chatUsed, limit: premium ? PREMIUM_CHAT_LIMIT : FREE_CHAT_LIMIT, note: "Resets 14 Dec", href: routes.ask },
    { icon: Bookmark, label: "Saved products", used: saved, limit: premium ? null : 15, note: premium ? "Unlimited on Premium" : "Free plan limit", href: routes.saved },
    { icon: Bell, label: "Active price alerts", used: alerts, limit: premium ? 25 : 2, note: "Watchlist targets", href: routes.priceIntelligence },
    { icon: GitCompareArrows, label: "Products in comparison", used: compare, limit: MAX_COMPARE, note: "Side by side at once", href: routes.compare },
  ];
  return (
    <SettingsCard id="usage" icon={Receipt} title="Usage this period" description={`Billing period 14 Nov – 13 Dec 2026 · ${premium ? "Premium" : "Free"} allowances`}>
      <ul className="grid gap-3 sm:grid-cols-2">
        {meters.map((m) => {
          const pct = m.limit ? Math.min(100, (m.used / m.limit) * 100) : 18;
          const over = m.limit !== null && m.used > m.limit;
          const near = m.limit !== null && pct >= 80;
          return (
            <li key={m.label}>
              <Link href={m.href} className="group block rounded-[14px] border border-border p-4 transition-colors hover:border-border-strong hover:bg-surface-2/50">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[13px] font-medium">
                    <m.icon className="size-4 text-muted-foreground" /> {m.label}
                  </span>
                  <ChevronRight className="size-4 text-subtle-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="mt-2 text-[22px] font-semibold tracking-tight">
                  <span className="tabular">{m.used}</span>
                  <span className="text-[14px] font-medium text-subtle-foreground"> / {m.limit === null ? "∞" : <span className="tabular">{m.limit}</span>}</span>
                </p>
                <Progress value={pct} className="mt-2 h-1.5" indicatorClassName={over ? "bg-danger" : near ? "bg-warning" : undefined} aria-label={`${m.label}: ${m.used} of ${m.limit ?? "unlimited"}`} />
                <p className={cn("mt-2 text-[12px]", over ? "text-danger-foreground" : "text-muted-foreground")}>{over ? "Over the Free plan limit — existing items are kept" : m.note}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </SettingsCard>
  );
}

/* ------------------------------------------------------------------ plans */
function Plans() {
  const plan = useAppStore((s) => s.plan);
  const setPlan = useAppStore((s) => s.setPlan);
  const [target, setTarget] = useState<"free" | "premium" | null>(null);
  const shown = plans.filter((p) => p.id === "free" || p.id === "premium");
  const team = plans.find((p) => p.id === "team")!;
  return (
    <SettingsCard id="plans" icon={Sparkles} title="Change plan" description="Switch any time. Upgrades are prorated; downgrades apply at the end of the period.">
      <div className="grid gap-3 md:grid-cols-2">
        {shown.map((p) => {
          const current = p.id === plan;
          return (
            <div key={p.id} className={cn("flex flex-col rounded-[16px] border p-5", current ? "border-brand ring-1 ring-brand" : "border-border")}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[16px] font-semibold">{p.name}</h3>
                {current ? <Badge variant="brand">Current plan</Badge> : p.highlight ? <Badge variant="lime">Most popular</Badge> : null}
              </div>
              <p className="mt-1 text-[24px] font-semibold tracking-tight">
                {p.priceMonthly ? <span className="tabular">{money(p.priceMonthly).replace(".00", "")}</span> : "Free"}
                {p.priceMonthly > 0 && <span className="text-[13px] font-medium text-muted-foreground"> / month</span>}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {p.allowances.slice(0, 4).map((a) => (
                  <li key={a.label} className="flex items-start gap-2 text-[13px]">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-brand" />
                    <span>
                      <span className="text-muted-foreground">{a.label}:</span> <span className="font-medium">{a.label.startsWith("Ask Qeivo") ? `${p.id === "premium" ? PREMIUM_CHAT_LIMIT : FREE_CHAT_LIMIT} per month` : a.value}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Button className="mt-5 w-full" variant={current ? "outline" : p.id === "premium" ? "brand" : "outline"} disabled={current} onClick={() => setTarget(p.id as "free" | "premium")}>
                {current ? "Your current plan" : p.id === "premium" ? "Upgrade to Premium" : "Downgrade to Free"}
              </Button>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-col gap-3 rounded-[14px] border border-dashed border-border-strong p-4 sm:flex-row sm:items-center">
        <Users className="size-5 shrink-0 text-muted-foreground" />
        <p className="flex-1 text-[13px] text-muted-foreground">
          <strong className="font-medium text-foreground">{team.name}</strong> — shared workspaces from {money(team.priceMonthly).replace(".00", "")} per seat / month.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href={routes.pricing}>See all plans</Link>
        </Button>
      </div>
      <ConfirmationDialog
        open={target !== null}
        onOpenChange={(o) => !o && setTarget(null)}
        title={target === "premium" ? "Upgrade to Premium?" : "Downgrade to Free?"}
        description={
          target === "premium"
            ? "You'd be charged a prorated $12.00 today, then $12.00 every month. In this demo no payment is taken."
            : "Premium stays active until 13 December 2026, then Free limits apply. Saved items over the limit are kept but read-only."
        }
        confirmLabel={target === "premium" ? "Upgrade (demo)" : "Downgrade (demo)"}
        onConfirm={() => {
          if (!target) return;
          setPlan(target);
          toast.success(target === "premium" ? "You're on Premium (demo)" : "Switched to Free (demo)", { description: "No payment was taken or refunded — this is a demo." });
          setTarget(null);
        }}
      />
    </SettingsCard>
  );
}

/* --------------------------------------------------------- payment method */
function luhn(num: string) {
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

const cardSchema = z.object({
  name: z.string().trim().min(2, "Enter the name on the card"),
  number: z
    .string()
    .transform((v) => v.replace(/\s/g, ""))
    .pipe(z.string().regex(/^\d{13,19}$/, "Card numbers are 13–19 digits").refine(luhn, "This card number isn't valid — check for typos")),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY")
    .refine((v) => {
      const [m, y] = v.split("/").map(Number);
      return y > 26 || (y === 26 && m >= 11);
    }, "This card has expired"),
  cvc: z.string().regex(/^\d{3,4}$/, "3 or 4 digits"),
  postal: z.string().trim().min(3, "Enter a billing postal code").max(10, "Too long"),
});
type CardIn = z.input<typeof cardSchema>;
type CardOut = z.output<typeof cardSchema>;

function CardVisual({ last4, expiry, name }: { last4: string; expiry: string; name: string }) {
  return (
    <div className="bg-navy-sheen relative aspect-[1.586] w-full max-w-[320px] overflow-hidden rounded-[18px] p-5 text-white shadow-lg" role="img" aria-label={`Card ending ${last4}, expires ${expiry}`}>
      <div aria-hidden className="absolute -bottom-16 -right-10 size-48 rounded-full bg-teal-500/25 blur-2xl" />
      <div aria-hidden className="absolute -left-10 -top-16 size-40 rounded-full border border-white/10" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="block h-7 w-10 rounded-[6px] bg-gradient-to-br from-lime/80 to-lime/40" aria-hidden />
          <CreditCard className="size-5 text-white/60" aria-hidden />
        </div>
        <div>
          <p className="tabular font-mono text-[17px] tracking-[0.18em]">•••• •••• •••• {last4}</p>
          <div className="mt-3 flex items-end justify-between text-[11px] uppercase tracking-wider text-white/60">
            <span className="truncate">
              <span className="block text-[9px]">Cardholder</span>
              <span className="text-[12px] text-white">{name}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-[9px]">Expires</span>
              <span className="tabular text-[12px] text-white">{expiry}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentMethod() {
  const profileName = useAppStore((s) => s.profile.name);
  const [card, setCard] = useState({ last4: "4417", expiry: "08/28", name: profileName });
  const [open, setOpen] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CardIn, unknown, CardOut>({ resolver: zodResolver(cardSchema), defaultValues: { name: profileName, number: "", expiry: "", cvc: "", postal: "" }, mode: "onTouched" });

  const onSubmit = async (v: CardOut) => {
    await wait(800);
    setCard({ last4: v.number.slice(-4), expiry: v.expiry, name: v.name });
    setOpen(false);
    reset({ name: v.name, number: "", expiry: "", cvc: "", postal: "" });
    toast.success(`Card ending ${v.number.slice(-4)} saved (demo)`, { description: "Validated in your browser only — nothing was stored, sent or charged." });
  };

  return (
    <SettingsCard
      id="payment"
      icon={CreditCard}
      title="Payment method"
      description="Used for your Premium subscription."
      actions={
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Pencil /> Update
        </Button>
      }
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <CardVisual {...card} />
        <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 text-[13px] sm:grid-cols-1">
          <div>
            <dt className="text-muted-foreground">Card</dt>
            <dd className="font-medium">
              Ending <span className="tabular">{card.last4}</span>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Expires</dt>
            <dd className="tabular font-medium">{card.expiry}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-muted-foreground">Next charge</dt>
            <dd className="font-medium">
              <span className="tabular">{money(12)}</span> on {formatDate(RENEWAL, "d MMM yyyy")}
            </dd>
          </div>
        </dl>
      </div>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update payment method</DialogTitle>
            <DialogDescription>Demo only — details are validated in your browser and never stored or sent. Try 4242 4242 4242 4242.</DialogDescription>
          </DialogHeader>
          <form id="card-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-2 gap-4">
            <Field id="cd-name" label="Name on card" error={errors.name?.message} className="col-span-2">
              <Input autoComplete="cc-name" {...register("name")} />
            </Field>
            <Controller
              control={control}
              name="number"
              render={({ field }) => (
                <Field id="cd-number" label="Card number" error={errors.number?.message} className="col-span-2">
                  <Input
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 5678 9012 3456"
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 19)
                          .replace(/(.{4})/g, "$1 ")
                          .trim(),
                      )
                    }
                  />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="expiry"
              render={({ field }) => (
                <Field id="cd-exp" label="Expiry" error={errors.expiry?.message}>
                  <Input
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                      field.onChange(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                    }}
                  />
                </Field>
              )}
            />
            <Field id="cd-cvc" label="CVC" error={errors.cvc?.message}>
              <Input inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} {...register("cvc")} />
            </Field>
            <Field id="cd-postal" label="Billing postal code" error={errors.postal?.message} className="col-span-2 sm:col-span-1">
              <Input autoComplete="postal-code" {...register("postal")} />
            </Field>
          </form>
          <DialogFooter>
            <p className="mr-auto hidden items-center gap-1.5 text-[12px] text-muted-foreground sm:flex">
              <Lock className="size-3.5" /> No real processing
            </p>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="card-form" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />} Save card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsCard>
  );
}

/* ---------------------------------------------------------------- history */
function BillingHistory() {
  return (
    <SettingsCard id="history" icon={FileText} title="Billing history" description={`${invoices.length} invoices · Premium (monthly)`} className="overflow-hidden">
      <div className="-mx-5 -my-5 sm:-mx-6">
        {/* Mobile list */}
        <ul className="divide-y divide-border md:hidden">
          {invoices.map((inv) => (
            <li key={inv.id}>
              <Link href={routes.invoice(inv.id)} className="flex min-h-14 items-center gap-3 px-5 py-3 hover:bg-surface-2/60">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium">{formatDate(inv.date, "d MMM yyyy")}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{inv.number}</p>
                </div>
                <span className="tabular text-[14px] font-medium">{money(inv.amount + inv.tax)}</span>
                <InvoiceStatusBadge status={inv.status} />
                <ChevronRight className="size-4 text-subtle-foreground" />
              </Link>
            </li>
          ))}
        </ul>
        {/* Desktop table */}
        <Table className="hidden md:table">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Date</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead className="hidden lg:table-cell">Period</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="pl-6 font-medium">{formatDate(inv.date, "d MMM yyyy")}</TableCell>
                <TableCell className="font-mono text-[12.5px] text-muted-foreground">{inv.number}</TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">{inv.period}</TableCell>
                <TableCell className="tabular text-right font-medium">{money(inv.amount + inv.tax)}</TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={inv.status} />
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={routes.invoice(inv.id)} aria-label={`View invoice ${inv.number}`}>
                      View <ChevronRight />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </SettingsCard>
  );
}

/* ----------------------------------------------------------------- cancel */
const REASONS = ["Too expensive", "I finished my purchase research", "Missing a feature I need", "Not enough products or categories", "I found another service", "Other"];

function CancelDialog({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; onConfirm: () => void }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) {
      setReason("");
      setNote("");
      setError(null);
    }
  };
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Premium?</DialogTitle>
          <DialogDescription>You keep Premium until {formatDate(PERIOD_END, "d MMMM yyyy")}. After that, Free limits apply and nothing you saved is deleted.</DialogDescription>
        </DialogHeader>
        <ul className="space-y-1.5 rounded-[12px] bg-surface-2/70 p-4 text-[13px] text-muted-foreground">
          <li className="flex gap-2"><CalendarClock className="mt-0.5 size-3.5 shrink-0" /> No further charges after this period.</li>
          <li className="flex gap-2"><MessageSquare className="mt-0.5 size-3.5 shrink-0" /> Ask Qeivo drops to {FREE_CHAT_LIMIT} questions a month.</li>
          <li className="flex gap-2"><Bell className="mt-0.5 size-3.5 shrink-0" /> Only 2 price alerts stay active.</li>
        </ul>
        <div className="space-y-2">
          <label htmlFor="cancel-reason" className="text-[13px] font-medium">
            Why are you cancelling?
          </label>
          <Select
            value={reason}
            onValueChange={(v) => {
              setReason(v);
              setError(null);
            }}
          >
            <SelectTrigger id="cancel-reason" className="w-full" aria-invalid={error ? true : undefined} aria-describedby={error ? "cancel-reason-error" : undefined}>
              <SelectValue placeholder="Choose a reason" />
            </SelectTrigger>
            <SelectContent>
              {REASONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p id="cancel-reason-error" role="alert" className="text-[12.5px] text-danger-foreground">
              {error}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="cancel-note" className="text-[13px] font-medium">
            Anything we could do better? <span className="font-normal text-subtle-foreground">(optional)</span>
          </label>
          <Textarea id="cancel-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)}>
            Keep Premium
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={async () => {
              if (!reason) {
                setError("Choose a reason to continue");
                return;
              }
              setBusy(true);
              await wait(600);
              setBusy(false);
              onConfirm();
              close(false);
            }}
          >
            {busy && <Loader2 className="animate-spin" />} Cancel at period end
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BillingView() {
  const hydrated = useHydrated();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  if (!hydrated) return <LoadingSkeleton variant="detail" />;
  return (
    <div className="space-y-6">
      <CurrentPlan
        cancelled={cancelled}
        onCancel={() => setCancelOpen(true)}
        onResume={() => {
          setCancelled(false);
          toast.success("Subscription resumed (demo)", { description: "Premium renews on 14 December 2026. No charge was made." });
        }}
      />
      {cancelled && (
        <div role="status" className="flex flex-col gap-2 rounded-[14px] border border-warning/40 bg-warning-soft p-4 text-[13.5px] text-warning-foreground sm:flex-row sm:items-center">
          <CalendarClock className="size-5 shrink-0" />
          <p className="flex-1">
            Your subscription <strong className="font-semibold">cancels at period end</strong> — Premium stays active until {formatDate(PERIOD_END, "d MMMM yyyy")}. No refund or charge was processed (demo).
          </p>
        </div>
      )}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Usage />
        <PaymentMethod />
      </div>
      <Plans />
      <BillingHistory />
      <p className="flex items-center justify-center gap-2 text-center text-[12px] text-subtle-foreground">
        <DemoPill /> Billing is simulated. No payments are processed and no card data leaves your browser.
      </p>
      <CancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={() => {
          setCancelled(true);
          toast.success("Subscription set to cancel (demo)", { description: `Premium remains active until ${formatDate(PERIOD_END, "d MMM yyyy")}.` });
        }}
      />
    </div>
  );
}
