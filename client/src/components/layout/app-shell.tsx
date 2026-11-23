"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, Menu, Sparkles } from "lucide-react";
import { customerAccountNav, customerNav, mobileTabs } from "@/config/navigation";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useAppStore, PREMIUM_CHAT_LIMIT, FREE_CHAT_LIMIT } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Logo } from "@/components/brand/logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/primitives";
import { DemoDataNotice, RegionSelect, ThemeToggle } from "@/components/common/controls";
import { CommandSearchProvider, SearchTrigger } from "@/components/navigation/command-search";
import { RoleSwitcher } from "@/components/navigation/role-switcher";
import { CompareTray } from "@/components/product/product-actions";
import { isActive, SidebarLink } from "./nav-link";
import { NotificationCenter } from "./notification-center";
import { AccountMenu } from "./account-menu";
import { Breadcrumbs } from "./page";

function UsageCard() {
  const hydrated = useHydrated();
  const used = useAppStore((s) => s.chatUsed);
  const plan = useAppStore((s) => s.plan);
  const limit = hydrated && plan === "free" ? FREE_CHAT_LIMIT : PREMIUM_CHAT_LIMIT;
  const value = hydrated ? used : 37;
  return (
    <div className="rounded-[14px] border border-border bg-surface-2/60 p-3">
      <div className="flex items-center justify-between text-[12px]">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <Sparkles className="size-3.5 text-brand" /> {hydrated && plan === "free" ? "Free" : "Premium"}
        </span>
        <span className="tabular text-muted-foreground">
          {value}/{limit} questions
        </span>
      </div>
      <Progress value={(value / limit) * 100} className="mt-2 h-1.5" />
      <Link href={routes.billing} className="mt-2 block text-[12px] font-medium text-brand-soft-foreground hover:underline">
        Manage plan
      </Link>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo href={routes.app} size="sm" />
      </div>
      <div className="px-3 pb-2">
        <RoleSwitcher className="w-full" current="customer" />
      </div>
      <nav aria-label="Main" className="flex-1 space-y-5 overflow-y-auto px-3 py-3 scrollbar-thin">
        {customerNav.map((section, i) => (
          <div key={i}>
            {section.title && <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">{section.title}</p>}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarLink key={item.href} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
        <div>
          <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">Account</p>
          <div className="space-y-0.5">
            {customerAccountNav.map((item) => (
              <SidebarLink key={item.href} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </nav>
      <div className="space-y-3 border-t border-sidebar-border p-3">
        <UsageCard />
        <DemoDataNotice className="px-1 text-[11px]" />
      </div>
    </div>
  );
}

function MobileBottomNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 pb-safe backdrop-blur-xl lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {mobileTabs.map((t) => {
          const active = isActive(pathname, t);
          const center = t.href === routes.scan;
          return (
            <li key={t.href}>
              <Link href={t.href} aria-current={active ? "page" : undefined} className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium">
                {center ? (
                  <span className={cn("grid size-11 -translate-y-1 place-items-center rounded-[14px] shadow-md transition-colors", active ? "bg-brand text-brand-foreground" : "bg-primary text-primary-foreground")}>
                    <t.icon className="size-5" />
                  </span>
                ) : (
                  <>
                    <span className={cn("grid h-7 w-12 place-items-center rounded-full transition-colors", active ? "bg-brand-soft text-brand-soft-foreground" : "text-muted-foreground")}>
                      <t.icon className="size-[19px]" />
                    </span>
                    <span className={active ? "text-foreground" : "text-muted-foreground"}>{t.label}</span>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Compact mobile header: back button on nested pages, search and notifications. */
function MobileHeader({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const nested = pathname.split("/").filter(Boolean).length > 2 || (pathname.split("/").length > 2 && !mobileTabs.some((t) => t.href === pathname));
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-1 border-b border-border bg-background/85 px-2 backdrop-blur-xl lg:hidden">
      {nested ? (
        <button type="button" onClick={() => router.back()} aria-label="Go back" className="grid size-10 place-items-center rounded-[10px] text-foreground hover:bg-surface-2">
          <ChevronLeft className="size-5" />
        </button>
      ) : (
        <button type="button" onClick={onMenu} aria-label="Open menu" className="grid size-10 place-items-center rounded-[10px] text-foreground hover:bg-surface-2">
          <Menu className="size-5" />
        </button>
      )}
      <div className="min-w-0 flex-1 px-1">
        <Logo href={routes.app} size="sm" />
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        <SearchTrigger variant="icon" />
        <ThemeToggle />
        <NotificationCenter />
        <div className="ml-1">
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <CommandSearchProvider>
      <div className="min-h-dvh bg-background">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-sidebar-border bg-sidebar lg:block">
          <SidebarContent />
        </aside>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent side="left" className="bg-sidebar p-0" hideClose>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="lg:pl-[264px]">
          <MobileHeader onMenu={() => setMenuOpen(true)} />
          <header className="sticky top-0 z-30 hidden h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-xl lg:flex xl:px-8">
            <div className="min-w-0 flex-1">
              <Breadcrumbs />
            </div>
            <SearchTrigger className="w-[260px] shrink-0 xl:w-[360px]" />
            <div className="ml-auto flex shrink-0 items-center gap-1">
              <RegionSelect compact />
              <ThemeToggle />
              <NotificationCenter />
              <div className="ml-1">
                <AccountMenu />
              </div>
            </div>
          </header>
          <main id="main" className="pb-28 pt-5 sm:pt-7 lg:pb-16">
            {children}
          </main>
        </div>
        <MobileBottomNavigation />
        <CompareTray />
      </div>
    </CommandSearchProvider>
  );
}
