"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Bell, BookOpenCheck, CreditCard, MessagesSquare, RefreshCcw, TrendingDown, Wrench } from "lucide-react";
import type { AppNotification, NotificationKind } from "@/types";
import { notifications } from "@/data/notifications/notifications";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/menus";
import { Button } from "@/components/ui/button";
import { DateDisplay } from "@/components/common/display";

export const NOTIFICATION_META: Record<NotificationKind, { icon: LucideIcon; label: string; className: string }> = {
  "price-drop": { icon: TrendingDown, label: "Price drop", className: "bg-success-soft text-success" },
  "product-update": { icon: RefreshCcw, label: "Product update", className: "bg-info-soft text-info-foreground" },
  maintenance: { icon: Wrench, label: "Maintenance", className: "bg-warning-soft text-warning-foreground" },
  community: { icon: MessagesSquare, label: "Community", className: "bg-claim-manufacturer-soft text-claim-manufacturer" },
  research: { icon: BookOpenCheck, label: "Research", className: "bg-brand-soft text-brand-soft-foreground" },
  subscription: { icon: CreditCard, label: "Subscription", className: "bg-surface-3 text-muted-foreground" },
};

export function useNotifications() {
  const hydrated = useHydrated();
  const read = useAppStore((s) => s.readNotifications);
  const dismissed = useAppStore((s) => s.dismissedNotifications);
  const items = notifications.filter((n) => !hydrated || !dismissed.includes(n.id));
  const isRead = (n: AppNotification) => n.read || (hydrated && read.includes(n.id));
  return { items, isRead, unread: items.filter((n) => !isRead(n)).length };
}

export function NotificationRow({ n, read, onClick, className }: { n: AppNotification; read: boolean; onClick?: () => void; className?: string }) {
  const m = NOTIFICATION_META[n.kind];
  return (
    <Link href={n.href} onClick={onClick} className={cn("flex gap-3 rounded-[12px] p-3 transition-colors hover:bg-surface-2", !read && "bg-brand-soft/25", className)}>
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-[10px]", m.className)}>
        <m.icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-[13px] leading-snug", read ? "font-medium" : "font-semibold")}>{n.title}</p>
          {!read && <span className="mt-1 size-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-muted-foreground">{n.body}</p>
        <p className="mt-1 text-[11px] text-subtle-foreground">
          {m.label} · <DateDisplay iso={n.date} relative />
        </p>
      </div>
    </Link>
  );
}

export function NotificationCenter() {
  const { items, isRead, unread } = useNotifications();
  const markRead = useAppStore((s) => s.markRead);
  const markAll = useAppStore((s) => s.markAllRead);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="relative grid size-10 place-items-center rounded-[10px] text-muted-foreground outline-none transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30">
          <Bell className="size-[18px]" />
          {unread > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold tabular text-brand-foreground ring-2 ring-background">{unread}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(380px,calc(100vw-24px))] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-[12px] text-muted-foreground tabular">{unread} unread</p>
          </div>
          <Button variant="ghost" size="sm" disabled={!unread} onClick={() => markAll(items.map((n) => n.id))}>
            Mark all read
          </Button>
        </div>
        <div className="max-h-[420px] space-y-0.5 overflow-y-auto p-1.5 scrollbar-thin">
          {items.slice(0, 8).map((n) => (
            <NotificationRow key={n.id} n={n} read={isRead(n)} onClick={() => markRead(n.id)} />
          ))}
        </div>
        <div className="border-t border-border p-2">
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link href={routes.notifications}>View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
