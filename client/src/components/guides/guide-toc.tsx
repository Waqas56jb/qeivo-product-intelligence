"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ListTree } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  label: string;
}

/** Tracks which section heading is currently in view and overall reading progress of `articleId`. */
export function useActiveSection(items: TocItem[], articleId: string, offset = 140) {
  const [active, setActive] = useState(items[0]?.id);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      let current = items[0]?.id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= offset) current = it.id;
      }
      setActive(current);
      const article = document.getElementById(articleId);
      if (article) {
        const r = article.getBoundingClientRect();
        const total = r.height - window.innerHeight * 0.6;
        setProgress(Math.max(0, Math.min(1, (offset - r.top) / Math.max(1, total))));
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items, articleId, offset]);
  return { active, progress };
}

function go(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top: y, behavior: "smooth" });
  history.replaceState(null, "", `#${id}`);
}

/** Desktop sticky table of contents with active-section indicator and reading progress. */
export function GuideToc({ items, articleId, className }: { items: TocItem[]; articleId: string; className?: string }) {
  const { active, progress } = useActiveSection(items, articleId);
  return (
    <nav aria-label="Table of contents" className={cn("sticky top-24", className)}>
      <p className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">
        <ListTree className="size-3.5" /> On this page
      </p>
      <ol className="relative space-y-0.5 border-l border-border">
        {items.map((it, i) => {
          const isActive = it.id === active;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(it.id);
                }}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "-ml-px flex gap-2.5 border-l-2 py-1.5 pl-3.5 pr-2 text-[13px] leading-snug transition-colors",
                  isActive ? "border-brand font-semibold text-foreground" : "border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground",
                )}
              >
                <span className={cn("tabular", isActive ? "text-brand-soft-foreground" : "text-subtle-foreground")}>{String(i + 1).padStart(2, "0")}</span>
                {it.label}
              </a>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 pl-0.5">
        <div className="flex items-center justify-between text-[11px] font-medium text-subtle-foreground">
          <span>Reading progress</span>
          <span className="tabular">{Math.round(progress * 100)}%</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full rounded-full bg-brand transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </nav>
  );
}

/** Mobile collapsible table of contents that sticks beneath the site header. */
export function GuideTocMobile({ items, articleId, className }: { items: TocItem[]; articleId: string; className?: string }) {
  const { active, progress } = useActiveSection(items, articleId);
  const [open, setOpen] = useState(false);
  const idx = Math.max(0, items.findIndex((i) => i.id === active));
  return (
    <nav aria-label="Table of contents" className={cn("sticky top-16 z-30 border-b border-border bg-background/90 backdrop-blur-xl", className)}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="guide-toc-mobile" className="flex h-12 w-full items-center gap-3 px-4 text-left sm:px-6">
        <ListTree className="size-4 shrink-0 text-brand" />
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground tabular">
            Section {idx + 1} of {items.length}
          </span>
          <span className="block truncate text-[13px] font-semibold">{items[idx]?.label}</span>
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <div aria-hidden className="h-0.5 bg-surface-3">
        <div className="h-full bg-brand transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>
      {open && (
        <ol id="guide-toc-mobile" className="max-h-[60dvh] space-y-0.5 overflow-y-auto px-2 py-2">
          {items.map((it, i) => (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  go(it.id);
                }}
                aria-current={it.id === active ? "location" : undefined}
                className={cn("flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 text-left text-[14px]", it.id === active ? "bg-brand-soft/60 font-semibold" : "text-muted-foreground hover:bg-surface-2")}
              >
                <span className="text-[12px] text-subtle-foreground tabular">{String(i + 1).padStart(2, "0")}</span>
                {it.label}
              </button>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
