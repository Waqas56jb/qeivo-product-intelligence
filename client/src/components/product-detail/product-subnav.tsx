"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Calculator, LayoutGrid, MessageSquareText, Ruler, Sparkles } from "lucide-react";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

/** Product research sub-navigation: Overview · AI analysis · Score · Reviews · Ownership cost · Compatibility. */
export function ProductSubnav({ slug, className }: { slug: string; className?: string }) {
  const pathname = usePathname();
  const items = [
    { href: routes.product(slug), label: "Overview", icon: LayoutGrid },
    { href: routes.productAnalysis(slug), label: "AI analysis", icon: Sparkles },
    { href: routes.productScore(slug), label: "Score", icon: BarChart3 },
    { href: routes.productReviews(slug), label: "Reviews", icon: MessageSquareText },
    { href: routes.productOwnership(slug), label: "Ownership cost", icon: Calculator },
    { href: routes.productCompatibility(slug), label: "Compatibility", icon: Ruler },
  ];
  return (
    <nav aria-label="Product research" className={cn("-mx-4 border-b border-border px-4 sm:mx-0 sm:px-0", className)}>
      <ul className="scrollbar-none flex gap-1 overflow-x-auto">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-11 items-center gap-1.5 whitespace-nowrap px-3 text-[13px] font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className={cn("size-4", active ? "text-brand" : "text-subtle-foreground")} />
                {item.label}
                {active && <span aria-hidden className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
