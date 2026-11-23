"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CornerDownLeft, MessageSquareText, Search } from "lucide-react";
import { products } from "@/data/products";
import { getBrand } from "@/data/products/brands";
import { routes } from "@/config/routes";
import { searchProducts } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/common/image-with-fallback";

const SUGGESTIONS = ["French door under $2,500", "Quiet fridge for open-plan", "Halden", "Counter-depth", "OLED 65"];

/** Prominent product search with live, keyboard-navigable results. */
export function HeroSearch({ className, size = "lg" }: { className?: string; size?: "lg" | "md" }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => (q.trim() ? searchProducts(products, q.replace(/under \$[\d,]+/i, ""), 5) : []), [q]);
  const open = focus && q.trim().length > 0;

  const submit = () => {
    const p = results[active];
    if (p) router.push(routes.product(p.slug));
    else router.push(`${routes.products}?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className={cn("relative z-20", className)}>
      <div className="relative">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className={cn(
          "group flex items-center gap-2 rounded-[16px] border border-border-strong bg-surface p-1.5 pl-4 shadow-md transition-[box-shadow,border-color] focus-within:border-brand focus-within:shadow-lg focus-within:ring-4 focus-within:ring-brand/10",
          size === "lg" ? "h-[60px]" : "h-[52px]",
        )}
      >
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, Math.max(0, results.length - 1)));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            }
          }}
          placeholder="Search a product, brand or model number…"
          aria-label="Search products"
          aria-expanded={open}
          aria-controls="hero-search-results"
          role="combobox"
          aria-autocomplete="list"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-subtle-foreground sm:text-base"
        />
        <button type="submit" className="inline-flex h-full shrink-0 items-center gap-2 rounded-[11px] bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:px-5">
          <span className="hidden sm:inline">Research</span>
          <ArrowRight className="size-4" />
        </button>
      </form>
      <AnimatePresence>
        {open && (
          <motion.div
            id="hero-search-results"
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-full z-50 mt-2 max-h-[min(420px,60vh)] overflow-y-auto overscroll-contain rounded-[16px] border border-border bg-popover p-1.5 text-left shadow-lg"
          >
            {results.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => router.push(routes.product(p.slug))}
                className={cn("flex w-full items-center gap-3 rounded-[11px] p-2 text-left", i === active && "bg-surface-2")}
              >
                <ImageWithFallback src={p.images[0]} alt="" aspect="size-11 shrink-0 rounded-[9px] bg-surface-2" sizes="44px" className="p-1" shimmer={false} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium">{p.name}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">
                    {getBrand(p.brandId).name} · {p.modelNumber} · {p.tagline}
                  </span>
                </span>
                <span className="tabular rounded-full bg-navy-900 px-2 py-0.5 text-[12px] font-semibold text-white dark:bg-surface-3">{p.suitabilityScore.toFixed(1)}</span>
              </button>
            ))}
            <button type="button" onClick={() => router.push(`${routes.ask}?q=${encodeURIComponent(q)}`)} className="flex w-full items-center gap-3 rounded-[11px] p-2.5 text-left text-[14px] hover:bg-surface-2">
              <span className="grid size-11 place-items-center rounded-[9px] bg-brand-soft text-brand-soft-foreground">
                <MessageSquareText className="size-5" />
              </span>
              <span className="flex-1">
                Ask Qeivo: <span className="font-medium">“{q}”</span>
              </span>
              <CornerDownLeft className="size-4 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
        <span className="text-subtle-foreground">Try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQ(s);
              inputRef.current?.focus();
            }}
            className="rounded-full border border-border bg-surface/70 px-3 py-1 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
