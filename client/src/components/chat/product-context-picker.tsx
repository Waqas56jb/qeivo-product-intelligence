"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, PackageSearch, X } from "lucide-react";
import type { Product } from "@/types";
import { getProduct, products } from "@/data/products";
import { getBrand } from "@/data/products/brands";
import { searchProducts } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchField } from "@/components/common/controls";
import { ImageWithFallback } from "@/components/common/image-with-fallback";

function Row({ p, active, onPick }: { p: Product; active: boolean; onPick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        aria-pressed={active}
        className={cn("flex min-h-14 w-full items-center gap-3 rounded-[12px] p-2 text-left transition-colors hover:bg-surface-2", active && "bg-brand-soft/50")}
      >
        <ImageWithFallback src={p.images[0]} alt="" aspect="size-11 shrink-0 rounded-[9px] bg-surface-2" sizes="44px" className="p-1" shimmer={false} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-medium">{p.name}</span>
          <span className="block truncate text-[12px] text-muted-foreground">
            {p.modelNumber} · {p.tagline}
          </span>
        </span>
        <span className="tabular rounded-full bg-navy-900 px-2 py-0.5 text-[12px] font-semibold text-white dark:bg-surface-3">{p.suitabilityScore.toFixed(1)}</span>
        {active && <Check className="size-4 text-brand" />}
      </button>
    </li>
  );
}

/** Choose the product Ask Qeivo should research. */
export function ProductContextPicker({ value, onChange, className, trigger = "full" }: { value: string | null; onChange: (id: string | null) => void; className?: string; trigger?: "full" | "link" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const hydrated = useHydrated();
  const recent = useAppStore((s) => s.recentlyViewed);
  const saved = useAppStore((s) => s.saved);
  const selected = value ? getProduct(value) : undefined;

  const results = useMemo(() => (q.trim() ? searchProducts(products, q, 12) : []), [q]);
  const quick = useMemo(() => {
    const ids = hydrated ? Array.from(new Set([...recent, ...saved])) : [];
    return ids.map((id) => getProduct(id)).filter((p): p is Product => Boolean(p)).slice(0, 8);
  }, [hydrated, recent, saved]);

  const pick = (id: string | null) => {
    onChange(id);
    setOpen(false);
    setQ("");
  };

  return (
    <>
      {trigger === "link" ? (
        <button type="button" onClick={() => setOpen(true)} className={cn("inline-flex min-h-11 shrink-0 items-center rounded-[10px] px-3 text-[13px] font-medium text-brand-soft-foreground hover:bg-surface-2", className)}>
          Change
        </button>
      ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group inline-flex h-11 min-w-0 max-w-full items-center gap-2 rounded-[12px] border border-border bg-surface pl-1.5 pr-2.5 text-left shadow-xs transition-colors hover:border-border-strong",
          className,
        )}
        aria-label={selected ? `Researching ${selected.name}. Change product` : "Choose a product to research"}
      >
        {selected ? (
          <ImageWithFallback src={selected.images[0]} alt="" aspect="size-8 shrink-0 rounded-[8px] bg-surface-2" sizes="32px" className="p-0.5" shimmer={false} />
        ) : (
          <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-surface-2 text-muted-foreground">
            <PackageSearch className="size-4" />
          </span>
        )}
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground">{selected ? getBrand(selected.brandId).name : "Product context"}</span>
          <span className="block truncate text-[13px] font-semibold leading-tight">{selected ? selected.model : "Choose a product"}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg gap-0 p-0">
          <DialogHeader className="border-b border-border p-5 pb-4">
            <DialogTitle>Research a product</DialogTitle>
            <DialogDescription>Ask Qeivo answers from the selected product&apos;s manuals, lab tests, reviews and offers.</DialogDescription>
            <SearchField value={q} onChange={setQ} placeholder="Search brand, model or model number" className="mt-3" autoFocus ariaLabel="Search products" />
          </DialogHeader>
          <div className="max-h-[min(60dvh,460px)] overflow-y-auto p-2 scrollbar-thin">
            {q.trim() ? (
              results.length ? (
                <ul className="space-y-0.5">
                  {results.map((p) => (
                    <Row key={p.id} p={p} active={p.id === value} onPick={() => pick(p.id)} />
                  ))}
                </ul>
              ) : (
                <p className="px-3 py-8 text-center text-[14px] text-muted-foreground">No products match “{q}”. Try a brand such as Halden or a model number like NV-FD600SS.</p>
              )
            ) : (
              <>
                {quick.length > 0 && <p className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">Recently viewed & saved</p>}
                <ul className="space-y-0.5">
                  {quick.map((p) => (
                    <Row key={p.id} p={p} active={p.id === value} onPick={() => pick(p.id)} />
                  ))}
                </ul>
              </>
            )}
          </div>
          {value && (
            <div className="border-t border-border p-3">
              <button type="button" onClick={() => pick(null)} className="inline-flex min-h-11 items-center gap-2 rounded-[10px] px-3 text-[13px] font-medium text-muted-foreground hover:bg-surface-2 hover:text-foreground">
                <X className="size-4" /> Clear product — ask a general question
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
