"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, BellOff, CheckCheck, Inbox, Mail, MailOpen, Settings2, Smartphone, X } from "lucide-react";
import { toast } from "sonner";
import type { AppNotification, NotificationKind } from "@/types";
import { getProduct } from "@/data/products";
import { routes } from "@/config/routes";
import { cn, DEMO_NOW } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import { Label, Switch } from "@/components/ui/primitives";
import { Hint } from "@/components/ui/tooltip";
import { DateDisplay } from "@/components/common/display";
import { EmptyState } from "@/components/common/states";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { NOTIFICATION_META, useNotifications } from "@/components/layout/notification-center";

const KINDS: NotificationKind[] = ["price-drop", "product-update", "maintenance", "community", "research", "subscription"];
const TAB_LABEL: Record<NotificationKind, string> = {
  "price-drop": "Price drops",
  "product-update": "Product updates",
  maintenance: "Maintenance",
  community: "Community",
  research: "Research",
  subscription: "Subscription",
};

type Group = "Today" | "This week" | "Earlier";
const TODAY = DEMO_NOW.toISOString().slice(0, 10);

function groupOf(iso: string): Group {
  if (iso.slice(0, 10) === TODAY) return "Today";
  const days = (DEMO_NOW.getTime() - new Date(iso).getTime()) / 86_400_000;
  return days < 7 ? "This week" : "Earlier";
}

function IconAction({ label, onClick, children, testId }: { label: string; onClick: () => void; children: React.ReactNode; testId?: string }) {
  return (
    <Hint label={label}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        data-testid={testId}
        className="grid size-11 place-items-center rounded-[10px] text-muted-foreground outline-none transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30 sm:size-9"
      >
        {children}
      </button>
    </Hint>
  );
}

function InboxRow({ n, read, onOpen, onToggleRead, onDismiss }: { n: AppNotification; read: boolean; onOpen: () => void; onToggleRead: () => void; onDismiss: () => void }) {
  const m = NOTIFICATION_META[n.kind];
  const product = n.productId ? getProduct(n.productId) : undefined;
  return (
    <li className={cn("group relative flex gap-3 px-3 py-3.5 transition-colors hover:bg-surface-2/60 sm:gap-4 sm:px-5 sm:py-4", !read && "bg-brand-soft/20")}>
      {!read && <span aria-hidden className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-brand" />}
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-[12px]", m.className)}>
        <m.icon className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <Link href={n.href} onClick={onOpen} className="min-w-0 flex-1 outline-none after:absolute after:inset-0 focus-visible:underline">
            <p className={cn("text-[14px] leading-snug", read ? "font-medium text-foreground/90" : "font-semibold")}>
              {!read && <span className="sr-only">Unread: </span>}
              {n.title}
            </p>
          </Link>
          <span className="shrink-0 pt-0.5 text-[11px] text-subtle-foreground">
            <DateDisplay iso={n.date} relative />
          </span>
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{n.body}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className={cn("inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-medium", m.className)}>{m.label}</span>
          {product && (
            <span className="inline-flex h-6 max-w-[220px] items-center gap-1.5 rounded-full border border-border bg-surface pl-0.5 pr-2 text-[11px] font-medium">
              <ImageWithFallback src={product.images[0]} alt="" aspect="size-5 shrink-0 rounded-full bg-surface-2" sizes="20px" fit="contain" shimmer={false} />
              <span className="truncate">{product.model}</span>
            </span>
          )}
          <span className="hidden items-center gap-0.5 text-[12px] font-medium text-brand-soft-foreground sm:inline-flex">
            Open <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>
      <div className="relative z-10 flex shrink-0 flex-col items-center gap-0.5 sm:flex-row sm:opacity-70 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <IconAction label={read ? "Mark as unread" : "Mark as read"} onClick={onToggleRead} testId={`toggle-read-${n.id}`}>
          {read ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
        </IconAction>
        <IconAction label="Dismiss" onClick={onDismiss}>
          <X className="size-4" />
        </IconAction>
      </div>
    </li>
  );
}

export function NotificationsInbox() {
  const hydrated = useHydrated();
  const { items, isRead } = useNotifications();
  const markRead = useAppStore((s) => s.markRead);
  const markAllRead = useAppStore((s) => s.markAllRead);
  const dismiss = useAppStore((s) => s.dismissNotification);
  const alertPrefs = useAppStore((s) => s.alertPrefs);
  const [kind, setKind] = useState<NotificationKind | "all">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  /** The store has no "mark unread" action, so unread overrides live in component state for this session. */
  const [unreadOverride, setUnreadOverride] = useState<Set<string>>(new Set());

  const read = (n: AppNotification) => !unreadOverride.has(n.id) && isRead(n);
  const unreadTotal = items.filter((n) => !read(n)).length;

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const n of items) c[n.kind] = (c[n.kind] ?? 0) + 1;
    return c;
  }, [items]);

  const visible = items.filter((n) => (kind === "all" || n.kind === kind) && (!unreadOnly || !read(n)));
  const groups = (["Today", "This week", "Earlier"] as Group[]).map((g) => ({ g, rows: visible.filter((n) => groupOf(n.date) === g) })).filter((x) => x.rows.length);

  const setRead = (id: string) => {
    markRead(id);
    setUnreadOverride((s) => {
      if (!s.has(id)) return s;
      const next = new Set(s);
      next.delete(id);
      return next;
    });
  };
  const toggleRead = (n: AppNotification) => {
    if (read(n)) setUnreadOverride((s) => new Set(s).add(n.id));
    else setRead(n.id);
  };
  const markAll = () => {
    const ids = visible.map((n) => n.id);
    markAllRead(ids);
    setUnreadOverride((s) => new Set([...s].filter((id) => !ids.includes(id))));
    toast.success(kind === "all" ? "All notifications marked as read" : `${TAB_LABEL[kind]} marked as read`);
  };

  const priceDrops = items.filter((n) => n.kind === "price-drop" && groupOf(n.date) !== "Earlier").length;
  const maintenance = items.filter((n) => n.kind === "maintenance" && !read(n)).length;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-8">
      <div className="min-w-0 space-y-4">
        {/* toolbar */}
        <div className="rounded-[16px] border border-border bg-card p-2 shadow-xs">
          <div role="tablist" aria-label="Filter notifications" className="scrollbar-none flex gap-1 overflow-x-auto">
            {(["all", ...KINDS] as const).map((k) => {
              const active = kind === k;
              const Icon = k === "all" ? Inbox : NOTIFICATION_META[k].icon;
              return (
                <button
                  key={k}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => setKind(k)}
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium transition-colors",
                    active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {k === "all" ? "All" : TAB_LABEL[k]}
                  <span className={cn("tabular text-[11px]", active ? "opacity-75" : "text-subtle-foreground")}>{counts[k] ?? 0}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2.5">
            <Switch id="unread-only" checked={unreadOnly} onCheckedChange={setUnreadOnly} />
            <Label htmlFor="unread-only" className="cursor-pointer text-[13px]">
              Unread only
            </Label>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-soft-foreground tabular">{hydrated ? unreadTotal : "–"} unread</span>
          </div>
          <Button variant="outline" size="sm" className="h-10 sm:h-9" onClick={markAll} disabled={!visible.some((n) => !read(n))}>
            <CheckCheck /> Mark {kind === "all" ? "all" : "these"} read
          </Button>
        </div>

        {groups.length === 0 ? (
          <EmptyState
            icon={unreadOnly ? CheckCheck : BellOff}
            title={unreadOnly ? "You're all caught up" : "No notifications here"}
            description={unreadOnly ? "Nothing unread in this view. Turn off “Unread only” to see everything." : "Notifications of this type will appear here when something changes."}
            action={
              (unreadOnly || kind !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setUnreadOnly(false);
                    setKind("all");
                  }}
                >
                  Show all notifications
                </Button>
              )
            }
          />
        ) : (
          groups.map(({ g, rows }) => (
            <section key={g} aria-labelledby={`grp-${g}`} className="overflow-hidden rounded-[16px] border border-border bg-card shadow-xs">
              <h2 id={`grp-${g}`} className="flex items-center justify-between border-b border-border bg-surface-2/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground sm:px-5">
                {g}
                <span className="tabular normal-case tracking-normal">{rows.length}</span>
              </h2>
              <ul className="divide-y divide-border">
                {rows.map((n) => (
                  <InboxRow
                    key={n.id}
                    n={n}
                    read={read(n)}
                    onOpen={() => setRead(n.id)}
                    onToggleRead={() => toggleRead(n)}
                    onDismiss={() => {
                      dismiss(n.id);
                      toast.success("Notification dismissed", { description: n.title });
                    }}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      <aside className="min-w-0 space-y-4 xl:sticky xl:top-24 xl:self-start">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-[14px] border border-border bg-card p-4 shadow-xs">
            <p className="text-[24px] font-semibold leading-none tabular">{priceDrops}</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground">Price alerts this week</p>
          </div>
          <div className="rounded-[14px] border border-border bg-card p-4 shadow-xs">
            <p className="text-[24px] font-semibold leading-none tabular">{hydrated ? maintenance : "–"}</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground">Unread maintenance</p>
          </div>
        </div>
        <div className="rounded-[16px] border border-border bg-card p-4 shadow-xs">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold">
            <Settings2 className="size-4 text-brand" /> Delivery
          </p>
          <ul className="mt-3 space-y-2.5 text-[13px]">
            <li className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" /> Email
              </span>
              <span className={cn("text-[12px] font-medium", hydrated && alertPrefs.email ? "text-success" : "text-subtle-foreground")}>{hydrated && alertPrefs.email ? "On" : "Off"}</span>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Smartphone className="size-4" /> Push
              </span>
              <span className={cn("text-[12px] font-medium", hydrated && alertPrefs.push ? "text-success" : "text-subtle-foreground")}>{hydrated && alertPrefs.push ? "On" : "Off"}</span>
            </li>
            <li className="flex items-center justify-between gap-2 text-muted-foreground">
              Price-drop threshold <span className="font-medium text-foreground tabular">{hydrated ? alertPrefs.threshold : 5}%</span>
            </li>
          </ul>
          <div className="mt-4 grid gap-2">
            <Button asChild variant="outline" size="sm" className="h-10">
              <Link href={routes.priceIntelligence}>Price alert settings</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="h-10">
              <Link href={routes.settings}>All notification settings</Link>
            </Button>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-subtle-foreground">Demo: no emails or push messages are actually sent.</p>
        </div>
      </aside>
    </div>
  );
}
