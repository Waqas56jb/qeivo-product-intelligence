"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import type { Product } from "@/types";
import { products as allProducts } from "@/data/products";
import { getBrand } from "@/data/products/brands";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/menus";
import { ImageWithFallback } from "@/components/common/image-with-fallback";

const CATEGORY_LABEL: Record<string, string> = { refrigerators: "Refrigerators", "washing-machines": "Washing machines", televisions: "Televisions", laptops: "Laptops" };

/** Searchable multi-select of catalogue products with removable chips. */
export function ProductMultiSelect({
  id,
  value,
  onChange,
  products = allProducts,
  max = 5,
  error,
  placeholder = "Search products by name or model…",
  className,
}: {
  id?: string;
  value: string[];
  onChange: (ids: string[]) => void;
  products?: Product[];
  max?: number;
  error?: string;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const groups = useMemo(() => {
    const g = new Map<string, Product[]>();
    for (const p of products) g.set(p.category, [...(g.get(p.category) ?? []), p]);
    return [...g.entries()];
  }, [products]);
  const toggle = (pid: string) => {
    if (value.includes(pid)) onChange(value.filter((v) => v !== pid));
    else if (value.length < max) onChange([...value, pid]);
  };

  return (
    <div className={cn("space-y-2.5", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls={id ? `${id}-listbox` : "product-picker-listbox"}
            aria-invalid={error ? true : undefined}
            aria-describedby={error && id ? `${id}-error` : undefined}
            className={cn(
              "flex h-11 w-full items-center justify-between gap-2 rounded-[10px] border border-input bg-surface px-3.5 text-left text-sm shadow-xs outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 sm:h-10",
              error && "border-danger",
            )}
          >
            <span className={cn("truncate", !value.length && "text-subtle-foreground")}>{value.length ? `${value.length} of ${max} products selected` : placeholder}</span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(var(--radix-popover-trigger-width),calc(100vw-32px))] min-w-[min(320px,calc(100vw-32px))] p-0">
          <Command>
            <CommandInput placeholder="Search products…" className="h-11" />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No products match.</CommandEmpty>
              {groups.map(([cat, list]) => (
                <CommandGroup key={cat} heading={CATEGORY_LABEL[cat] ?? cat}>
                  {list.map((p) => {
                    const selected = value.includes(p.id);
                    const disabled = !selected && value.length >= max;
                    return (
                      <CommandItem key={p.id} value={`${p.name} ${p.modelNumber}`} onSelect={() => toggle(p.id)} disabled={disabled}>
                        <span className={cn("grid size-[18px] shrink-0 place-items-center rounded-[5px] border", selected ? "border-brand bg-brand text-brand-foreground [&_svg]:!text-brand-foreground" : "border-border-strong")}>
                          {selected && <Check className="!size-3" strokeWidth={3} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px]">{p.name}</span>
                          <span className="block truncate font-mono text-[11px] text-muted-foreground">
                            {p.modelNumber} · {getBrand(p.brandId).name}
                          </span>
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Selected products">
          {value.map((pid) => {
            const p = byId.get(pid);
            if (!p) return null;
            return (
              <li key={pid} className="flex max-w-full items-center gap-2 rounded-full border border-border bg-surface-2/60 py-1 pl-1 pr-1.5">
                <ImageWithFallback src={p.images[0]} alt="" fit="contain" sizes="24px" wrapperClassName="size-6 shrink-0 rounded-full bg-surface" />
                <span className="truncate text-[12.5px] font-medium">{p.name}</span>
                <button type="button" onClick={() => toggle(pid)} aria-label={`Remove ${p.name}`} className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-surface-3 hover:text-foreground">
                  <X className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
