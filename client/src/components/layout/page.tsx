"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { segmentLabels } from "@/config/navigation";
import { getProduct } from "@/data/products";
import { cn } from "@/lib/utils";
import { useIsDesktop } from "@/hooks/use-media-query";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function PageContainer({ children, className, size = "default" }: { children: React.ReactNode; className?: string; size?: "default" | "wide" | "narrow" | "full" }) {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", size === "narrow" ? "max-w-3xl" : size === "wide" ? "max-w-[1440px]" : size === "full" ? "" : "max-w-[1240px]", className)}>
      {children}
    </div>
  );
}

export interface Crumb {
  label: string;
  href?: string;
}

/** Intermediate path segments that have no page of their own — rendered as plain text, not links. */
const NO_PAGE = [/^\/business$/, /^\/app\/guides$/, /^\/app\/billing\/invoices$/, /^\/business\/manufacturer\/products\/[^/]+$/];

function titleCase(seg: string) {
  return seg.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

/** Auto-generated breadcrumbs from the pathname; dynamic product slugs resolve to product names. */
export function Breadcrumbs({ items, className }: { items?: Crumb[]; className?: string }) {
  const pathname = usePathname();
  const crumbs: Crumb[] =
    items ??
    (() => {
      const segs = pathname.split("/").filter(Boolean);
      return segs.map((seg, i) => {
        const href = "/" + segs.slice(0, i + 1).join("/");
        const product = segs[i - 1] === "products" ? getProduct(seg) : undefined;
        const label = product ? product.model : segmentLabels[seg] ?? (/^[a-z]+-[\w-]+$/.test(seg) && seg.length > 14 ? titleCase(seg).slice(0, 36) : titleCase(seg));
        return { label, href: i === segs.length - 1 || NO_PAGE.some((r) => r.test(href)) ? undefined : href };
      });
    })();
  if (crumbs.length < 2) return null;
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="scrollbar-none flex items-center gap-1 overflow-x-auto whitespace-nowrap text-[12px] text-muted-foreground">
        {crumbs.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3 shrink-0 text-subtle-foreground" aria-hidden />}
            {c.href ? (
              <Link href={c.href} className="rounded px-0.5 transition-colors hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-foreground">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  breadcrumbs = true,
  crumbs,
  className,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: boolean;
  crumbs?: Crumb[];
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={cn("mb-6 space-y-3 sm:mb-8", className)}>
      {breadcrumbs && <Breadcrumbs items={crumbs} className="hidden sm:block" />}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-1.5">
          {eyebrow && <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-soft-foreground">{eyebrow}</div>}
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[32px]">{title}</h1>
          {description && <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  );
}

/** Sticky in-page section navigation: vertical list on desktop, scrolling chips on mobile. Tracks the active section. */
export function SectionNavigation({ sections, className, orientation = "auto" }: { sections: { id: string; label: string }[]; className?: string; orientation?: "auto" | "horizontal" }) {
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => Boolean(e));
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [sections]);

  const go = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav aria-label="On this page" className={cn("min-w-0", className)}>
      <ul className={cn("scrollbar-none flex gap-1.5 overflow-x-auto", orientation === "auto" && "lg:flex-col lg:gap-0.5 lg:overflow-visible")}>
        {sections.map((s) => (
          <li key={s.id} className="shrink-0">
            <button
              type="button"
              onClick={() => go(s.id)}
              aria-current={active === s.id ? "true" : undefined}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                orientation === "auto" && "lg:w-full lg:rounded-[8px] lg:border-l-2 lg:border-transparent lg:px-3 lg:py-1.5 lg:text-left",
                active === s.id
                  ? cn("bg-primary text-primary-foreground", orientation === "auto" && "lg:border-brand lg:rounded-l-none lg:bg-brand-soft/50 lg:text-foreground")
                  : "bg-surface-2 text-muted-foreground hover:text-foreground lg:bg-transparent",
              )}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Bottom sheet on mobile, side sheet on desktop. */
export function ResponsiveSheet({ open, onOpenChange, title, description, children, footer }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  const isDesktop = useIsDesktop();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isDesktop ? "right" : "bottom"}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <SheetBody>{children}</SheetBody>
        {footer && <div className="flex gap-2 border-t border-border px-5 py-3 pb-safe">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}
