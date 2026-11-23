"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  BellRing,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  PackageCheck,
  Plus,
  Receipt,
  ShieldCheck,
  ShieldAlert,
  Store,
  Wallet,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import type { OwnedProduct, Product } from "@/types";
import { ownedProducts as seedOwned } from "@/data/research/owned-products";
import { requireProduct } from "@/data/products";
import { routes } from "@/config/routes";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { useIsDesktop } from "@/hooks/use-media-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/primitives";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatCard } from "@/components/common/display";
import { EmptyState } from "@/components/common/states";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { PageHeader } from "@/components/layout/page";
import { BrandLabel } from "@/components/product/product-bits";
import { AddOwnedDialog } from "./add-owned-dialog";
import { ReceiptDialog } from "./receipt-dialog";
import { completeTask, daysUntil, maskSerial, relativeDays, sortTasks, TASK_META, WARRANTY_META, warrantyInfo, type MaintenanceTask } from "./owned-utils";

const usd = (v: number) => formatCurrency(v, "US");

/* --------------------------------------------------------------- list item */

function OwnedListItem({ owned, product, active, onSelect }: { owned: OwnedProduct; product: Product; active: boolean; onSelect: () => void }) {
  const w = warrantyInfo(owned);
  const open = owned.maintenance.filter((t) => t.status === "overdue" || t.status === "due").length;
  const overdue = owned.maintenance.some((t) => t.status === "overdue");
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "group flex w-full items-center gap-3 rounded-[14px] border bg-card p-3 text-left shadow-xs outline-none transition-all hover:border-border-strong hover:shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/30",
        active ? "border-brand ring-1 ring-brand lg:bg-brand-soft/25" : "border-border",
      )}
    >
      <ImageWithFallback src={product.images[0]} alt="" aspect="size-16 shrink-0 rounded-[10px] bg-gradient-to-b from-surface-2 to-surface-3/60" sizes="64px" className="p-1.5" />
      <span className="min-w-0 flex-1">
        <BrandLabel brandId={product.brandId} className="text-[10px]" />
        <span className="block truncate text-[14px] font-semibold leading-snug">{product.model}</span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge variant={WARRANTY_META[w.state].badge}>{w.state === "expired" ? "Expired" : w.state === "expiring" ? `${w.daysLeft}d left` : "Warranty"}</Badge>
          {open > 0 && <Badge variant={overdue ? "danger" : "warning"}><Wrench /> {open} {overdue ? "overdue" : "due"}</Badge>}
        </span>
      </span>
      <ChevronRight className={cn("size-4 shrink-0 text-subtle-foreground transition-transform group-hover:translate-x-0.5", active && "text-brand")} />
    </button>
  );
}

/* --------------------------------------------------------------- warranty */

function WarrantyCard({ owned }: { owned: OwnedProduct }) {
  const w = warrantyInfo(owned);
  const m = WARRANTY_META[w.state];
  const Icon = w.state === "active" ? ShieldCheck : ShieldAlert;
  return (
    <section aria-labelledby={`w-${owned.id}`} className="rounded-[14px] border border-border bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("grid size-10 place-items-center rounded-[11px]", w.state === "active" ? "bg-success-soft text-success" : w.state === "expiring" ? "bg-warning-soft text-warning-foreground" : "bg-danger-soft text-danger-foreground")}>
            <Icon className="size-5" />
          </span>
          <div>
            <h3 id={`w-${owned.id}`} className="text-[15px] font-semibold">Warranty</h3>
            <p className="text-[12px] text-muted-foreground">Manufacturer cover from purchase date</p>
          </div>
        </div>
        <Badge variant={m.badge}>{m.label}</Badge>
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="tabular text-[32px] font-semibold leading-none tracking-tight">{w.daysLeft < 0 ? 0 : w.daysLeft}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">{w.daysLeft < 0 ? `days left — ended ${Math.abs(w.daysLeft)} days ago` : "days left"}</p>
        </div>
        <p className="text-right text-[12px] text-muted-foreground">
          Expires
          <br />
          <strong className="tabular text-[13px] text-foreground">{formatDate(owned.warrantyExpires)}</strong>
        </p>
      </div>
      <Progress value={w.pct} className="mt-4 h-2" indicatorClassName={m.bar} aria-label={`${w.pct}% of warranty period elapsed`} />
      <div className="mt-1.5 flex justify-between text-[11px] text-subtle-foreground tabular">
        <span>{formatDate(owned.purchaseDate)}</span>
        <span>{w.pct}% elapsed</span>
      </div>
      {owned.extendedWarranty && (
        <p className="mt-4 flex items-start gap-2 rounded-[10px] bg-brand-soft/50 px-3 py-2 text-[12px] text-brand-soft-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" /> Extended cover: {owned.extendedWarranty}
        </p>
      )}
    </section>
  );
}

/* --------------------------------------------------------------- maintenance */

function MaintenanceList({ tasks, onDone }: { tasks: MaintenanceTask[]; onDone: (t: MaintenanceTask) => void }) {
  if (!tasks.length)
    return <EmptyState compact icon={Wrench} title="No maintenance scheduled yet" description="Follow an ownership guide to add recurring care tasks for this product." action={<Button asChild size="sm" variant="outline"><Link href={routes.ownershipGuides}>Browse guides</Link></Button>} />;
  return (
    <ul className="divide-y divide-border">
      {sortTasks(tasks).map((t) => {
        const m = TASK_META[t.status];
        const d = daysUntil(t.dueDate);
        return (
          <li key={t.id} className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 gap-3">
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", m.dot)} aria-hidden />
              <div className="min-w-0">
                <p className={cn("text-[14px] font-medium leading-snug", t.status === "done" && "text-muted-foreground")}>{t.task}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground tabular">
                  {t.status === "done" ? `Next due ${formatDate(t.dueDate)}` : `Due ${formatDate(t.dueDate)} · ${relativeDays(d)}`} · every {t.intervalMonths} {t.intervalMonths === 1 ? "month" : "months"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-5 sm:pl-0">
              <Badge variant={m.badge}>{m.label}</Badge>
              {t.status !== "done" ? (
                <Button size="sm" variant="outline" className="h-11 sm:h-8" onClick={() => onDone(t)}>
                  <CheckCircle2 /> Mark done
                </Button>
              ) : (
                <span className="inline-flex h-8 items-center gap-1 text-[12px] font-medium text-success"><CheckCircle2 className="size-4" /> Completed</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ServiceHistory({ owned }: { owned: OwnedProduct }) {
  if (!owned.serviceHistory.length) return <p className="text-[13px] text-muted-foreground">No repairs or service visits recorded. That&apos;s a good sign.</p>;
  const items = [...owned.serviceHistory].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <ol className="relative space-y-5 border-l border-border pl-5">
      {items.map((s, i) => (
        <li key={`${s.date}-${i}`} className="relative">
          <span className="absolute -left-[26px] top-1 grid size-3 place-items-center rounded-full border-2 border-card bg-brand ring-1 ring-border" aria-hidden />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[13px] font-semibold">{s.type}</span>
            <span className="text-[12px] text-muted-foreground">· {s.provider}</span>
            <span className="ml-auto text-[12px] tabular text-subtle-foreground">{formatDate(s.date)}</span>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.notes}</p>
          <p className="mt-1 text-[12px] font-medium tabular">{s.cost === 0 ? <span className="text-success">No charge</span> : usd(s.cost)}</p>
        </li>
      ))}
    </ol>
  );
}

/* --------------------------------------------------------------- detail */

function OwnedDetail({ owned, product, onTaskDone, onReceipt }: { owned: OwnedProduct; product: Product; onTaskDone: (t: MaintenanceTask) => void; onReceipt: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const hasSerial = !owned.serialNumber.startsWith("Not");
  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[20px] border border-border bg-card shadow-xs">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
          <ImageWithFallback src={product.images[0]} alt={product.name} aspect="aspect-[4/3] w-full shrink-0 rounded-[14px] bg-gradient-to-b from-surface-2 to-surface-3/60 sm:aspect-square sm:w-40" sizes="(max-width: 640px) 100vw, 160px" className="p-3" />
          <div className="min-w-0 flex-1">
            <BrandLabel brandId={product.brandId} withMark />
            <h2 className="mt-1.5 text-[22px] font-semibold leading-tight tracking-tight">{product.model}</h2>
            <p className="text-[13px] text-muted-foreground">{product.modelNumber} · {product.type}</p>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-3">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">Purchased</dt>
                <dd className="mt-0.5 font-medium tabular">{formatDate(owned.purchaseDate)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">Price paid</dt>
                <dd className="mt-0.5 font-medium tabular">{usd(owned.purchasePrice)}</dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">Retailer</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 font-medium"><Store className="size-3.5 text-muted-foreground" /> {owned.retailer}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[10px] bg-surface-2 px-3 py-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">Serial</span>
              <code className="min-w-0 flex-1 truncate font-mono text-[13px] tabular">{hasSerial ? (revealed ? owned.serialNumber : maskSerial(owned.serialNumber)) : "Not recorded"}</code>
              {hasSerial && (
                <Button size="sm" variant="ghost" className="h-9" onClick={() => setRevealed((r) => !r)} aria-pressed={revealed} aria-label={revealed ? "Hide serial number" : "Reveal serial number"}>
                  {revealed ? <EyeOff /> : <Eye />} {revealed ? "Hide" : "Reveal"}
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border bg-surface-2/40 px-5 py-3 sm:px-6">
          <Button size="sm" variant="outline" className="h-10 sm:h-8" onClick={onReceipt}><Receipt /> View receipt</Button>
          <Button asChild size="sm" variant="outline" className="h-10 sm:h-8"><Link href={routes.product(product.slug)}><ArrowUpRight /> Product page</Link></Button>
          <Button asChild size="sm" variant="ghost" className="h-10 sm:h-8"><Link href={routes.ownershipGuides}><BookOpenCheck /> Care guides</Link></Button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <WarrantyCard owned={owned} />
        <section className="rounded-[14px] border border-border bg-card p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-[15px] font-semibold">Maintenance schedule</h3>
            <span className="text-[12px] text-muted-foreground tabular">{owned.maintenance.filter((t) => t.status !== "done").length} open</span>
          </div>
          <MaintenanceList tasks={owned.maintenance} onDone={onTaskDone} />
        </section>
      </div>

      <section className="rounded-[14px] border border-border bg-card p-5 shadow-xs">
        <h3 className="mb-4 text-[15px] font-semibold">Service history</h3>
        <ServiceHistory owned={owned} />
      </section>
    </div>
  );
}

/* --------------------------------------------------------------- reminders */

function Reminders({ owned, onSelect }: { owned: OwnedProduct[]; onSelect: (id: string) => void }) {
  const tasks = owned
    .flatMap((o) => o.maintenance.filter((t) => t.status !== "done").map((t) => ({ o, t, d: daysUntil(t.dueDate) })))
    .filter((x) => x.d <= 45)
    .map((x) => ({ key: x.t.id, ownedId: x.o.id, title: x.t.task, product: requireProduct(x.o.productId).model, d: x.d, kind: "task" as const }));
  const warranties = owned
    .map((o) => ({ o, w: warrantyInfo(o) }))
    .filter((x) => x.w.daysLeft >= 0 && x.w.daysLeft <= 90)
    .map((x) => ({ key: `w-${x.o.id}`, ownedId: x.o.id, title: "Warranty ends", product: requireProduct(x.o.productId).model, d: x.w.daysLeft, kind: "warranty" as const }));
  const items = [...tasks, ...warranties].sort((a, b) => a.d - b.d);
  return (
    <section aria-labelledby="reminders-h" className="rounded-[14px] border border-border bg-card p-4 shadow-xs">
      <div className="mb-3 flex items-center gap-2">
        <BellRing className="size-4 text-brand" />
        <h2 id="reminders-h" className="text-[14px] font-semibold">Reminders</h2>
        <span className="ml-auto text-[12px] tabular text-muted-foreground">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">You&apos;re all caught up. Nothing due in the next 45 days.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((r) => (
            <li key={r.key}>
              <button type="button" onClick={() => onSelect(r.ownedId)} className="flex min-h-11 w-full items-start gap-3 rounded-[10px] px-2 py-2 text-left transition-colors hover:bg-surface-2">
                <span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-[8px]", r.kind === "warranty" ? "bg-warning-soft text-warning-foreground" : r.d < 0 ? "bg-danger-soft text-danger-foreground" : "bg-info-soft text-info-foreground")}>
                  {r.kind === "warranty" ? <ShieldAlert className="size-3.5" /> : <CalendarClock className="size-3.5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-[13px] font-medium leading-snug">{r.title}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">{r.product}</span>
                </span>
                <span className={cn("shrink-0 text-[11px] font-semibold tabular", r.d < 0 ? "text-danger-foreground" : "text-muted-foreground")}>{r.d < 0 ? `${Math.abs(r.d)}d late` : r.d === 0 ? "Today" : `${r.d}d`}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* --------------------------------------------------------------- view */

export function MyProductsView() {
  const [owned, setOwned] = useState<OwnedProduct[]>(seedOwned);
  const [selectedId, setSelectedId] = useState(seedOwned[0]?.id);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const hydrated = useHydrated();
  const compareCount = useAppStore((s) => s.compare.length);
  const trayVisible = hydrated && compareCount > 0;

  const selected = owned.find((o) => o.id === selectedId) ?? owned[0];
  const selectedProduct = selected ? requireProduct(selected.productId) : undefined;

  const select = (id: string) => {
    setSelectedId(id);
    if (!isDesktop) setSheetOpen(true);
  };

  const markDone = (ownedId: string, task: MaintenanceTask) => {
    setOwned((list) => list.map((o) => (o.id === ownedId ? { ...o, maintenance: o.maintenance.map((t) => (t.id === task.id ? completeTask(t) : t)) } : o)));
    toast.success("Maintenance logged", {
      description: `${task.task}. Next reminder ${formatDate(completeTask(task).dueDate)} (demo, this session only).`,
      action: { label: "Undo", onClick: () => setOwned((list) => list.map((o) => (o.id === ownedId ? { ...o, maintenance: o.maintenance.map((t) => (t.id === task.id ? task : t)) } : o))) },
    });
  };

  const add = (o: OwnedProduct) => {
    setOwned((list) => [o, ...list]);
    setSelectedId(o.id);
  };

  const underWarranty = owned.filter((o) => warrantyInfo(o).state !== "expired").length;
  const openTasks = owned.flatMap((o) => o.maintenance).filter((t) => t.status === "overdue" || t.status === "due");
  const overdue = openTasks.filter((t) => t.status === "overdue").length;
  const spent = owned.reduce((a, o) => a + o.purchasePrice, 0);

  const detail = selected && selectedProduct && (
    <OwnedDetail key={selected.id} owned={selected} product={selectedProduct} onTaskDone={(t) => markDone(selected.id, t)} onReceipt={() => setReceiptOpen(true)} />
  );

  return (
    <>
      <PageHeader
        title="My products"
        description="Everything you own in one place: warranty countdowns, receipts, care schedules and service history."
        actions={
          <Button variant="brand" onClick={() => setAddOpen(true)} className="hidden sm:inline-flex">
            <Plus /> Add a product you own
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Products owned" value={owned.length} icon={PackageCheck} hint="Tracked in this account" />
        <StatCard label="Under warranty" value={`${underWarranty}/${owned.length}`} icon={ShieldCheck} hint={`${owned.length - underWarranty} out of cover`} />
        <StatCard label="Tasks due" value={openTasks.length} icon={Wrench} hint={overdue ? `${overdue} overdue` : "Nothing overdue"} className={overdue ? "[&_p]:text-danger-foreground" : undefined} />
        <StatCard label="Total spent" value={usd(spent)} icon={Wallet} hint="Purchase prices, excl. tax" />
      </div>

      {owned.length === 0 ? (
        <EmptyState className="mt-6" icon={PackageCheck} title="No products yet" description="Add the appliances and devices you own to track warranties and maintenance." action={<Button onClick={() => setAddOpen(true)}><Plus /> Add a product</Button>} />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div>
              <h2 className="mb-2.5 px-1 text-[12px] font-semibold uppercase tracking-wider text-subtle-foreground">Your products</h2>
              <div className="grid gap-2.5">
                {owned.map((o) => (
                  <OwnedListItem key={o.id} owned={o} product={requireProduct(o.productId)} active={o.id === selected?.id} onSelect={() => select(o.id)} />
                ))}
              </div>
            </div>
            <Reminders owned={owned} onSelect={select} />
          </aside>
          <div className="hidden min-w-0 lg:block">{detail}</div>
        </div>
      )}

      {!isDesktop && selected && selectedProduct && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="max-h-[92dvh]">
            <SheetHeader>
              <SheetTitle>{selectedProduct.model}</SheetTitle>
              <SheetDescription>Owned since {formatDate(selected.purchaseDate)}</SheetDescription>
            </SheetHeader>
            <SheetBody className="bg-background">{detail}</SheetBody>
          </SheetContent>
        </Sheet>
      )}

      {selected && selectedProduct && <ReceiptDialog owned={selected} product={selectedProduct} open={receiptOpen} onOpenChange={setReceiptOpen} />}
      <AddOwnedDialog open={addOpen} onOpenChange={setAddOpen} ownedIds={owned.map((o) => o.productId)} onAdd={add} />

      {/* Mobile sticky add action — sits above the compare tray when it's visible */}
      <div className={cn("fixed right-4 z-30 sm:hidden", trayVisible ? "bottom-[156px]" : "bottom-[88px]")}>
        <Button variant="brand" size="lg" onClick={() => setAddOpen(true)} className="rounded-full shadow-lg">
          <Plus /> Add product
        </Button>
      </div>
    </>
  );
}
