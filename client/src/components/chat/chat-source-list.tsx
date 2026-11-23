"use client";

import { useState } from "react";
import { ChevronDown, Library } from "lucide-react";
import type { SourceReference } from "@/types";
import { getSource } from "@/data/sources/sources";
import { getProduct } from "@/data/products";
import { cn } from "@/lib/utils";
import { SOURCE_META } from "@/components/analysis/meta";
import { useSourceDrawer } from "@/components/analysis/source-drawer";

/** Numbered per-answer source list. Numbers match the inline citations; clicking opens the source panel. */
export function ChatSourceList({ ids, className }: { ids: string[]; className?: string }) {
  const { openSources } = useSourceDrawer();
  const [open, setOpen] = useState(false);
  const sources = ids.map((id) => getSource(id)).filter((s): s is SourceReference => Boolean(s));
  if (!sources.length) return null;
  const shown = open ? sources : sources.slice(0, 3);
  return (
    <div className={cn("rounded-[12px] border border-border bg-surface-2/50", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center gap-2 px-3 text-left text-[12px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <Library className="size-3.5" />
        <span>
          {sources.length} {sources.length === 1 ? "source" : "sources"}
        </span>
        <span className="flex items-center gap-1 font-normal" aria-hidden>
          {Array.from(new Set(sources.map((s) => s.type)))
            .slice(0, 4)
            .map((t) => {
              const M = SOURCE_META[t];
              return <M.icon key={t} className={cn("size-3.5", M.tone)} />;
            })}
        </span>
        {sources.length > 3 && <ChevronDown className={cn("ml-auto size-4 transition-transform", open && "rotate-180")} />}
      </button>
      <ol className="space-y-0.5 px-1.5 pb-1.5">
        {shown.map((s, i) => {
          const meta = SOURCE_META[s.type];
          const product = s.productIds[0] ? getProduct(s.productIds[0]) : undefined;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => openSources(ids, s.id)}
                className="group flex min-h-11 w-full items-center gap-2.5 rounded-[9px] px-1.5 py-1.5 text-left transition-colors hover:bg-surface"
                aria-label={`Source ${i + 1}: ${s.title}, ${s.locator}. Open source details`}
              >
                <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-[5px] bg-brand-soft px-1 text-[10px] font-semibold tabular text-brand-soft-foreground">{i + 1}</span>
                <meta.icon className={cn("size-4 shrink-0", meta.tone)} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-foreground group-hover:underline">{s.title}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {meta.label} · {s.publisher} · <span className="tabular">{s.locator}</span>
                    {product && !s.title.includes(product.model) ? ` · ${product.model}` : ""}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
