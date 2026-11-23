"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function isActive(pathname: string, item: Pick<NavItem, "href" | "match">) {
  if (item.match === "exact") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function SidebarLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = isActive(pathname, item);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-9 items-center gap-2.5 rounded-[9px] px-2.5 text-[13.5px] font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/30",
        active ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground",
      )}
    >
      {active && <span className="absolute -left-3 top-1.5 h-6 w-[3px] rounded-r-full bg-brand" aria-hidden />}
      <item.icon className={cn("size-[17px] shrink-0", active ? "text-brand" : "text-subtle-foreground group-hover:text-muted-foreground")} />
      <span className="truncate">{item.label}</span>
      {item.badge && <span className="ml-auto rounded-full bg-brand-soft px-1.5 text-[10px] font-semibold tabular text-brand-soft-foreground">{item.badge}</span>}
    </Link>
  );
}
