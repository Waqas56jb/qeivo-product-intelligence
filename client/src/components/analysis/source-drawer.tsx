"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ExternalLink, Quote, ShieldCheck } from "lucide-react";
import type { SourceReference } from "@/types";
import { getSource } from "@/data/sources/sources";
import { getProduct } from "@/data/products";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SOURCE_META } from "./meta";

interface SourceDrawerCtx {
  openSources: (ids: string[], focusId?: string) => void;
}

const Ctx = createContext<SourceDrawerCtx>({ openSources: () => {} });

export function useSourceDrawer() {
  return useContext(Ctx);
}

function reliabilityLabel(r: number) {
  if (r >= 0.9) return { label: "High reliability", variant: "success" as const };
  if (r >= 0.75) return { label: "Good reliability", variant: "info" as const };
  if (r >= 0.65) return { label: "Moderate reliability", variant: "warning" as const };
  return { label: "Low reliability · marketing", variant: "danger" as const };
}

function SourceCard({ source, focused, index }: { source: SourceReference; focused: boolean; index: number }) {
  const meta = SOURCE_META[source.type];
  const rel = reliabilityLabel(source.reliability);
  const product = source.productIds[0] ? getProduct(source.productIds[0]) : undefined;
  return (
    <article id={`source-${source.id}`} className={cn("rounded-[14px] border bg-card p-4 transition-shadow", focused ? "border-brand ring-2 ring-brand/20" : "border-border")}>
      <div className="mb-3 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2">
          <meta.icon className={cn("size-[18px]", meta.tone)} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="tabular text-[11px] font-semibold text-subtle-foreground">[{index + 1}]</span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{meta.label}</span>
          </div>
          <h3 className="mt-0.5 text-[14px] font-semibold leading-snug">{source.title}</h3>
          <p className="text-[12px] text-muted-foreground">
            {source.publisher} · <span className="font-medium text-foreground">{source.locator}</span>
          </p>
        </div>
      </div>
      <blockquote className="relative rounded-[10px] bg-surface-2 px-3.5 py-3 text-[13px] leading-relaxed text-foreground">
        <Quote className="absolute -left-1 -top-1.5 size-4 rotate-180 text-brand" />
        {source.excerpt}
      </blockquote>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
        <Badge variant={rel.variant}>
          <ShieldCheck /> {rel.label}
        </Badge>
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3.5" /> Published {formatDate(source.publishedAt)}
        </span>
        <span>· Retrieved {formatDate(source.retrievedAt)}</span>
      </div>
      {product && (
        <Link href={routes.product(product.slug)} className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-brand-soft-foreground hover:underline">
          {product.name} <ExternalLink className="size-3" />
        </Link>
      )}
    </article>
  );
}

/** Global panel that shows local source metadata. No external URLs are used. */
export function SourceDrawerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ ids: string[]; focus?: string } | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)", true);
  const openSources = useCallback((ids: string[], focusId?: string) => {
    setState({ ids: Array.from(new Set(ids)), focus: focusId });
    if (focusId) setTimeout(() => document.getElementById(`source-${focusId}`)?.scrollIntoView({ block: "center", behavior: "smooth" }), 250);
  }, []);
  const value = useMemo(() => ({ openSources }), [openSources]);
  const sources = (state?.ids ?? []).map((id) => getSource(id)).filter((s): s is SourceReference => Boolean(s));

  return (
    <Ctx.Provider value={value}>
      {children}
      <Sheet open={state !== null} onOpenChange={(o) => !o && setState(null)}>
        <SheetContent side={isDesktop ? "right" : "bottom"} className={isDesktop ? "w-[min(480px,100%)]" : undefined}>
          <SheetHeader>
            <SheetTitle>Sources</SheetTitle>
            <SheetDescription>
              {sources.length} {sources.length === 1 ? "reference" : "references"} supporting this statement. Sponsored content never influences scores or verdicts.
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="space-y-3 bg-background/50">
            {sources.map((s, i) => (
              <SourceCard key={s.id} source={s} index={i} focused={s.id === state?.focus} />
            ))}
            {!sources.length && <p className="text-sm text-muted-foreground">Source metadata unavailable.</p>}
          </SheetBody>
        </SheetContent>
      </Sheet>
    </Ctx.Provider>
  );
}
