"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CornerDownLeft, MessageSquareText, Search } from "lucide-react";
import { products } from "@/data/products";
import { getBrand } from "@/data/products/brands";
import { customerAccountNav, customerNav } from "@/config/navigation";
import { routes } from "@/config/routes";
import { searchProducts } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { useAppStore } from "@/store/app-store";

const Ctx = createContext<{ open: () => void }>({ open: () => {} });
export const useCommandSearch = () => useContext(Ctx);

/** Global ⌘K search across products, pages and Ask Qeivo. Full-screen on mobile. */
export function CommandSearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const recent = useAppStore((s) => s.recentlyViewed);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => (query ? searchProducts(products, query, 8) : recent.map((id) => products.find((p) => p.id === id)).filter((p) => p !== undefined).slice(0, 5)), [query, recent]);
  const pages = useMemo(() => [...customerNav.flatMap((s) => s.items), ...customerAccountNav].filter((i) => !query || i.label.toLowerCase().includes(query.toLowerCase())).slice(0, query ? 6 : 5), [query]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  const value = useMemo(() => ({ open: () => setOpen(true) }), []);

  return (
    <Ctx.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent hideClose className="top-0 h-dvh max-h-dvh w-full max-w-none translate-y-0 gap-0 overflow-hidden rounded-none p-0 sm:top-[12vh] sm:h-auto sm:max-h-[76vh] sm:max-w-2xl sm:rounded-[20px]">
          <DialogTitle className="sr-only">Search Qeivo</DialogTitle>
          <Command shouldFilter={false} className="h-full">
            <div className="flex items-center gap-2 pr-3">
              <div className="flex-1">
                <CommandInput value={query} onValueChange={setQuery} placeholder="Search products, brands, model numbers…" autoFocus />
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-[8px] px-2 py-1 text-[13px] font-medium text-muted-foreground hover:bg-surface-2 sm:hidden">
                Cancel
              </button>
              <kbd className="hidden rounded-[6px] border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground sm:block">Esc</kbd>
            </div>
            <CommandList className="flex-1 sm:flex-none">
              <CommandEmpty>
                No products match “{query}”. Try a brand, type or model number.
              </CommandEmpty>
              {results.length > 0 && (
                <CommandGroup heading={query ? "Products" : "Recently viewed"}>
                  {results.map((p) => (
                    <CommandItem key={p.id} value={p.id} onSelect={() => go(routes.product(p.slug))}>
                      <ImageWithFallback src={p.images[0]} alt="" aspect="size-10 shrink-0 rounded-[8px] bg-surface-2" sizes="40px" className="p-1" shimmer={false} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="truncate text-[12px] text-muted-foreground">
                          {getBrand(p.brandId).name} · {p.modelNumber} · {p.type}
                        </p>
                      </div>
                      <span className="tabular rounded-full bg-surface-2 px-2 py-0.5 text-[12px] font-semibold">{p.suitabilityScore.toFixed(1)}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {query && (
                <CommandGroup heading="Ask Qeivo">
                  <CommandItem value="ask" onSelect={() => go(`${routes.ask}?q=${encodeURIComponent(query)}`)}>
                    <MessageSquareText className="!text-brand" />
                    <span className="flex-1 truncate">Ask Qeivo: “{query}”</span>
                    <CornerDownLeft />
                  </CommandItem>
                </CommandGroup>
              )}
              {pages.length > 0 && (
                <CommandGroup heading="Go to">
                  {pages.map((i) => (
                    <CommandItem key={i.href} value={i.href} onSelect={() => go(i.href)}>
                      <i.icon />
                      <span className="flex-1">{i.label}</span>
                      <ArrowRight className="opacity-50" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}

export function SearchTrigger({ className, variant = "bar" }: { className?: string; variant?: "bar" | "icon" }) {
  const { open } = useCommandSearch();
  if (variant === "icon")
    return (
      <button type="button" onClick={open} aria-label="Search" className={cn("grid size-10 place-items-center rounded-[10px] text-muted-foreground hover:bg-surface-2 hover:text-foreground", className)}>
        <Search className="size-[18px]" />
      </button>
    );
  return (
    <button
      type="button"
      onClick={open}
      className={cn("flex h-10 w-full items-center gap-2.5 rounded-[10px] border border-border bg-surface-2/70 px-3 text-left text-[13px] text-subtle-foreground transition-colors hover:border-border-strong hover:bg-surface", className)}
    >
      <Search className="size-4" />
      <span className="flex-1 truncate">Search products, brands, models…</span>
      <kbd className="hidden rounded-[6px] border border-border bg-surface px-1.5 py-0.5 font-sans text-[11px] text-muted-foreground md:inline">⌘K</kbd>
    </button>
  );
}
