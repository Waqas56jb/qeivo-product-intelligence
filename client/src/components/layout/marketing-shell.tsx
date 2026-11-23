"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu } from "lucide-react";
import { marketingNav } from "@/config/navigation";
import { routes } from "@/config/routes";
import { categories } from "@/data/products/categories";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { DemoDataNotice, ThemeToggle } from "@/components/common/controls";

function MarketingHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={cn("sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300", scrolled ? "border-b border-border bg-background/80 backdrop-blur-xl" : "border-b border-transparent")}>
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-6 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden flex-1 items-center gap-1 lg:flex">
          {marketingNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("/").slice(0, 2).join("/") + "/") && item.href.startsWith("/categories"));
            return (
              <Link key={item.href} href={item.href} className={cn("rounded-[8px] px-3 py-2 text-[14px] font-medium transition-colors", active || pathname === item.href ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href={routes.login}>Sign in</Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href={routes.signup}>
              Start free <ArrowRight />
            </Link>
          </Button>
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="grid size-10 place-items-center rounded-[10px] hover:bg-surface-2 lg:hidden">
            <Menu className="size-5" />
          </button>
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[min(360px,100%)]">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-16 items-center px-5">
            <Logo />
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Mobile">
            {marketingNav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="flex h-12 items-center rounded-[10px] px-3 text-[16px] font-medium hover:bg-surface-2">
                {item.label}
              </Link>
            ))}
            <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">Categories</p>
            {categories.map((c) => (
              <Link key={c.slug} href={routes.category(c.slug)} onClick={() => setOpen(false)} className="flex h-11 items-center rounded-[10px] px-3 text-[15px] text-muted-foreground hover:bg-surface-2 hover:text-foreground">
                {c.name}
              </Link>
            ))}
          </nav>
          <div className="grid gap-2 border-t border-border p-4 pb-safe">
            <Button asChild size="lg">
              <Link href={routes.signup} onClick={() => setOpen(false)}>Start free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={routes.login} onClick={() => setOpen(false)}>Sign in</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

const footerCols = [
  { title: "Product", links: [{ label: "How it works", href: routes.howItWorks }, { label: "Pricing", href: routes.pricing }, { label: "Ask Qeivo", href: routes.ask }, { label: "Compare", href: routes.compare }, { label: "Barcode lookup", href: routes.scan }] },
  { title: "Explore", links: categories.map((c) => ({ label: c.name, href: routes.category(c.slug) })).concat([{ label: "Buying guides", href: routes.guides }, { label: "Video library", href: routes.videos }]) },
  { title: "Business", links: [{ label: "Manufacturers", href: routes.manufacturer }, { label: "Retailers & suppliers", href: routes.supplier }, { label: "Creators", href: routes.creator }, { label: "Developer API", href: routes.developer }, { label: "Teams & workspaces", href: routes.workspace }] },
  { title: "Company", links: [{ label: "About", href: routes.about }, { label: "Our methodology", href: routes.howItWorks + "#methodology" }, { label: "Independence policy", href: routes.about + "#independence" }, { label: "Privacy", href: routes.privacy }] },
];

function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="max-w-xs space-y-4">
            <Logo />
            <p className="text-[14px] leading-relaxed text-muted-foreground">Independent intelligence for confident decisions. Every score is explained, every claim is sourced.</p>
            <p className="text-[13px] font-semibold tracking-tight text-foreground">Know Before You Buy.</p>
          </div>
          {footerCols.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[14px] text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] text-subtle-foreground">© 2026 Qeivo. Sponsored content never changes scores, verdicts or rankings.</p>
          <DemoDataNotice className="max-w-xl" />
        </div>
      </div>
    </footer>
  );
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
