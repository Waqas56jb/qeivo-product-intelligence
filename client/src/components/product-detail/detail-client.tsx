"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, BellRing, Check, MapPin, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { REGIONS, formatPrice } from "@/lib/format";
import { personalScore, hasCustomPriorities } from "@/lib/scoring";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { RegionSelect } from "@/components/common/controls";
import { CompareToggle, SaveButton } from "@/components/product/product-actions";
import { ProductPrice } from "@/components/product/product-bits";

export function TrackView({ productId }: { productId: string }) {
  const track = useAppStore((s) => s.trackView);
  const hydrated = useHydrated();
  useEffect(() => {
    if (hydrated) track(productId);
  }, [hydrated, productId, track]);
  return null;
}

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const src = product.images[active];
  const isRender = src.startsWith("/images/products/");
  return (
    <div className="space-y-3">
      <div className={cn("relative overflow-hidden rounded-[24px] border border-border", isRender ? "bg-gradient-to-b from-surface-2 via-surface-2/60 to-card" : "bg-surface-2")}>
        <ImageWithFallback key={src} src={src} alt={`${product.name} — image ${active + 1}`} aspect="aspect-square sm:aspect-[5/4]" priority sizes="(max-width: 1024px) 100vw, 50vw" className={isRender ? "p-8 sm:p-12" : undefined} />
        <Badge className="absolute left-4 top-4 bg-surface/90 backdrop-blur">{isRender ? "Studio render" : "In context"}</Badge>
      </div>
      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {product.images.map((img, i) => (
          <button
            key={img}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1}`}
            aria-pressed={i === active}
            className={cn("relative size-20 shrink-0 overflow-hidden rounded-[12px] border-2 transition-colors", i === active ? "border-brand" : "border-transparent opacity-80 hover:opacity-100")}
          >
            <ImageWithFallback src={img} alt="" aspect="size-full bg-surface-2" sizes="80px" className={img.startsWith("/images/products/") ? "p-1.5" : undefined} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function VariantAndRegion({ product }: { product: Product }) {
  const [variant, setVariant] = useState(product.variants[0].id);
  const hydrated = useHydrated();
  const storeRegion = useAppStore((s) => s.region);
  const region = hydrated ? storeRegion : "US";
  const v = product.variants.find((x) => x.id === variant)!;
  const available = product.regions.includes(region);
  return (
    <div className="space-y-4">
      {product.variants.length > 0 && (
        <div>
          <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-muted-foreground">Variant · {v.modelNumber}</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Variant">
            {product.variants.map((x) => (
              <button
                key={x.id}
                type="button"
                role="radio"
                aria-checked={x.id === variant}
                onClick={() => setVariant(x.id)}
                className={cn("inline-flex h-10 items-center gap-1.5 rounded-[10px] border px-3.5 text-[13px] font-medium transition-colors", x.id === variant ? "border-brand bg-brand-soft/50 text-foreground" : "border-border bg-surface text-muted-foreground hover:border-border-strong")}
              >
                {x.id === variant && <Check className="size-3.5 text-brand" />} {x.label}
                {x.priceDelta > 0 && <span className="tabular text-subtle-foreground">+{formatPrice(x.priceDelta, region)}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <RegionSelect />
        <span className={cn("inline-flex items-center gap-1.5 text-[13px]", available ? "text-success" : "text-warning-foreground")}>
          <MapPin className="size-4" />
          {available ? `Available in ${REGIONS[region].name}` : `Not sold in ${REGIONS[region].name} — available in ${product.regions.join(", ")}`}
        </span>
      </div>
      {v.priceDelta > 0 && <p className="text-[13px] text-muted-foreground">Selected variant: {formatPrice(product.price + v.priceDelta, region)}</p>}
    </div>
  );
}

function WatchButton({ product, className }: { product: Product; className?: string }) {
  const hydrated = useHydrated();
  const watching = useAppStore((s) => s.watchlist.some((w) => w.productId === product.id));
  const add = useAppStore((s) => s.addWatch);
  const remove = useAppStore((s) => s.removeWatch);
  const on = hydrated && watching;
  return (
    <Button
      variant="outline"
      className={className}
      aria-pressed={on}
      onClick={() => {
        if (on) {
          remove(product.id);
          toast("Price alert removed", { description: product.name });
        } else {
          const target = Math.round((product.price * 0.92) / 10) * 10 - 1;
          add(product.id, target);
          toast.success("Price alert set", { description: `We'll notify you below $${target.toLocaleString("en-US")} (demo — no messages are sent).` });
        }
      }}
    >
      {on ? <BellRing className="text-brand" /> : <Bell />} {on ? "Watching" : "Watch price"}
    </Button>
  );
}

/** Desktop sticky action card + mobile sticky bottom bar. */
export function StickyActions({ product }: { product: Product }) {
  const hydrated = useHydrated();
  const priorities = useAppStore((s) => s.priorities);
  const custom = hydrated && hasCustomPriorities(priorities);
  return (
    <>
      <div className="hidden rounded-[20px] border border-border bg-card p-5 shadow-sm lg:block">
        <ProductPrice product={product} size="lg" />
        {custom && (
          <p className="mt-1 text-[13px] text-muted-foreground">
            Your personalised suitability: <strong className="tabular text-foreground">{personalScore(product, priorities).toFixed(1)}</strong>
          </p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <CompareToggle productId={product.id} variant="button" />
          <SaveButton productId={product.id} variant="button" />
          <Button asChild variant="brand" className="col-span-2">
            <Link href={routes.askAbout(product.slug)}>
              <MessageSquareText /> Ask Qeivo about this
            </Link>
          </Button>
          <WatchButton product={product} className="col-span-2" />
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-background/95 px-3 py-2.5 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <div className="min-w-0 flex-1">
            <ProductPrice product={product} size="sm" showSaving={false} />
          </div>
          <SaveButton productId={product.id} />
          <CompareToggle productId={product.id} variant="button" className="h-10 px-3" />
          <Button asChild variant="brand" size="icon" aria-label="Ask Qeivo about this product">
            <Link href={routes.askAbout(product.slug)}>
              <MessageSquareText />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
