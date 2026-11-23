"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowLeftRight, BadgeCheck, Menu, ShieldCheck } from "lucide-react";
import type { DemoRole } from "@/types";
import { businessNav, roleMeta } from "@/config/navigation";
import { routes } from "@/config/routes";
import { avatarAt } from "@/data/images";
import { Logo } from "@/components/brand/logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { DemoDataNotice, ThemeToggle } from "@/components/common/controls";
import { RoleSwitcher } from "@/components/navigation/role-switcher";
import { SidebarLink } from "./nav-link";
import { AccountMenu } from "./account-menu";
import { Breadcrumbs } from "./page";

type BusinessRole = Exclude<DemoRole, "customer">;

const ORG_AVATAR: Record<BusinessRole, number> = { manufacturer: 17, supplier: 16, creator: 14, developer: 9 };

function roleFromPath(pathname: string): BusinessRole {
  if (pathname.startsWith("/developer")) return "developer";
  if (pathname.startsWith("/business/supplier")) return "supplier";
  if (pathname.startsWith("/business/creator")) return "creator";
  return "manufacturer";
}

function BusinessSidebar({ role, onNavigate }: { role: BusinessRole; onNavigate?: () => void }) {
  const meta = roleMeta[role];
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Logo href={meta.home} size="sm" />
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{role === "developer" ? "API" : "Business"}</span>
      </div>
      <div className="mx-3 mb-3 flex items-center gap-3 rounded-[14px] border border-border bg-surface-2/60 p-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-navy-sheen text-[15px] font-semibold text-white">{meta.org.slice(0, 1)}</span>
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate text-[13px] font-semibold">
            {meta.org} <BadgeCheck className="size-3.5 shrink-0 text-brand" />
          </p>
          <p className="truncate text-[12px] text-muted-foreground">{meta.label} workspace</p>
        </div>
      </div>
      <div className="px-3 pb-2">
        <RoleSwitcher className="w-full" current={role} />
      </div>
      <nav aria-label={`${meta.label} navigation`} className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {businessNav[role].flatMap((s) => s.items).map((item) => (
          <SidebarLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className="space-y-3 border-t border-sidebar-border p-3">
        {role !== "developer" && (
          <div className="flex gap-2.5 rounded-[12px] bg-brand-soft/40 p-3 text-[12px] leading-snug text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
            <span>Business accounts can add data and respond, but can never edit Qeivo scores, rankings or verdicts.</span>
          </div>
        )}
        <Link href={routes.app} className="flex items-center gap-2 rounded-[9px] px-2.5 py-2 text-[13px] font-medium text-muted-foreground hover:bg-surface-2 hover:text-foreground">
          <ArrowLeftRight className="size-4" /> Customer app
        </Link>
        <DemoDataNotice className="px-1 text-[11px]" />
      </div>
    </div>
  );
}

export function BusinessShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const role = roleFromPath(pathname);
  const meta = roleMeta[role];
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-sidebar-border bg-sidebar lg:block">
        <BusinessSidebar role={role} />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="bg-sidebar p-0" hideClose>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <BusinessSidebar role={role} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-3 backdrop-blur-xl sm:px-6 lg:h-16 xl:px-8">
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="grid size-10 place-items-center rounded-[10px] hover:bg-surface-2 lg:hidden">
            <Menu className="size-5" />
          </button>
          <div className="lg:hidden">
            <Logo href={meta.home} size="sm" />
          </div>
          <Breadcrumbs className="hidden min-w-0 flex-1 lg:block" />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <AccountMenu name={role === "creator" ? "Maya Okafor" : role === "supplier" ? "Daniel Reyes" : role === "developer" ? "Priya Raman" : "Sofia Lindqvist"} subtitle={meta.org} avatar={avatarAt(ORG_AVATAR[role])} />
          </div>
        </header>
        <main id="main" className="pb-16 pt-5 sm:pt-7">
          {children}
        </main>
      </div>
    </div>
  );
}
