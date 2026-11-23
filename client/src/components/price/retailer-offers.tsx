"use client";

import { useState } from "react";
import { Clock, Copy, ExternalLink, Info, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import type { Product, RegionCode, RetailerOffer } from "@/types";
import { retailerByName } from "@/data/offers/retailers";
import { formatDate, formatPrice, formatRelative, REGIONS } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SponsoredDisclosure, SponsoredTag } from "@/components/analysis/warnings";
import { STOCK_META } from "./price-utils";

function RetailerMark({ name, className }: { name: string; className?: string }) {
  const r = retailerByName.get(name);
  return (
    <span className={cn("grid size-11 shrink-0 place-items-center rounded-[12px] text-[13px] font-bold tracking-tight text-white shadow-xs", className)} style={{ backgroundColor: r?.color }} aria-hidden>
      {r?.short ?? name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function AffiliateTag() {
  return <span className="inline-flex items-center rounded-full border border-warning/40 bg-warning-soft/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning-foreground">Affiliate</span>;
}

function RetailerDialog({ offer, product, region, onOpenChange }: { offer: RetailerOffer | null; product: Product; region: RegionCode; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={offer !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {offer && (
          <>
            <DialogHeader>
              <DialogTitle>Leaving Qeivo to visit {offer.retailer}</DialogTitle>
              <DialogDescription>This is a demonstration — retailer links don&apos;t open external sites.</DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-3 rounded-[14px] border border-border bg-surface-2/60 p-3">
              <RetailerMark name={offer.retailer} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold">{product.name}</p>
                <p className="text-[12px] text-muted-foreground">{offer.retailer} · observed {formatRelative(offer.observedAt)}</p>
              </div>
              <span className="tabular text-[17px] font-semibold">{formatPrice(offer.price, region)}</span>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              In the live product this button would open {offer.retailer}&apos;s product page in a new tab. Prices are re-checked when you click, so the retailer&apos;s price may differ from the one observed here.
            </p>
            {offer.affiliate ? <SponsoredDisclosure kind="affiliate" /> : <p className="flex items-start gap-2 text-[12px] text-muted-foreground"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-success" /> Qeivo earns nothing from this retailer link.</p>}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  const text = `${product.name} — ${formatPrice(offer.price, region)} at ${offer.retailer} (observed ${formatDate(offer.observedAt.slice(0, 10))}, Qeivo demo)`;
                  navigator.clipboard?.writeText(text).then(
                    () => toast.success("Offer details copied"),
                    () => toast.error("Couldn't access the clipboard"),
                  );
                }}
              >
                <Copy /> Copy offer details
              </Button>
              <Button onClick={() => onOpenChange(false)}>Stay in Qeivo</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function RetailerOfferList({ product, offers, region, fallback }: { product: Product; offers: RetailerOffer[]; region: RegionCode; fallback: boolean }) {
  const [active, setActive] = useState<RetailerOffer | null>(null);
  const lowest = Math.min(...offers.filter((o) => o.stock !== "out-of-stock").map((o) => o.price));
  const anySponsored = offers.some((o) => o.sponsored);
  return (
    <section aria-labelledby="offers-h" className="rounded-[14px] border border-border bg-card shadow-xs">
      <div className="flex flex-wrap items-end justify-between gap-2 p-4 pb-3 sm:p-5 sm:pb-3">
        <div>
          <h2 id="offers-h" className="text-[15px] font-semibold">Retailer offers</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {offers.length} offers · {fallback ? "all regions" : `${REGIONS[region].flag} ${REGIONS[region].name}`} · sorted by price
          </p>
        </div>
        <span className="text-[11px] text-subtle-foreground">Offer order is by price only</span>
      </div>
      <div className="space-y-2 px-4 sm:px-5">
        {fallback && (
          <p className="flex items-start gap-2 rounded-[10px] border border-info/30 bg-info-soft/60 px-3 py-2 text-[12px] leading-relaxed text-info-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" /> No offers observed in {REGIONS[region].name}; showing other regions. Prices are converted to {REGIONS[region].currency} for reference only.
          </p>
        )}
        <SponsoredDisclosure kind="affiliate" detail={`Links marked Affiliate may earn Qeivo a commission${anySponsored ? "; Sponsored offers are paid placements" : ""}. Neither changes the order below, scores or recommendations.`} />
      </div>
      <ul className="mt-3 divide-y divide-border border-t border-border">
        {offers.map((o) => {
          const stock = STOCK_META[o.stock];
          const best = o.price === lowest && o.stock !== "out-of-stock";
          return (
            <li key={o.id} className={cn("flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5", best && "bg-success-soft/25")}>
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <RetailerMark name={o.retailer} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[14px] font-semibold">{o.retailer}</span>
                    {best && <Badge variant="success">Lowest</Badge>}
                    {o.sponsored && <SponsoredTag />}
                    {o.affiliate && <AffiliateTag />}
                    {fallback && <Badge variant="outline">{REGIONS[o.region].flag} {o.region}</Badge>}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Truck className="size-3.5" /> {o.delivery}</span>
                    <span className="inline-flex items-center gap-1 tabular"><Clock className="size-3.5" /> Observed {formatRelative(o.observedAt)}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-subtle-foreground tabular">Valid until {formatDate(o.validUntil)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 pl-14 sm:justify-end sm:pl-0">
                <div className="text-left sm:text-right">
                  <p className={cn("tabular text-[18px] font-semibold leading-tight", o.stock === "out-of-stock" && "text-muted-foreground line-through decoration-1")}>{formatPrice(o.price, region)}</p>
                  <Badge variant={stock.variant} className="mt-1">{stock.label}</Badge>
                </div>
                <Button variant={best ? "brand" : "outline"} className="h-11 sm:h-10" onClick={() => setActive(o)} disabled={o.stock === "out-of-stock"} aria-label={`Go to ${o.retailer}`}>
                  Go to retailer <ExternalLink className="size-3.5" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      <RetailerDialog offer={active} product={product} region={region} onOpenChange={(o) => !o && setActive(null)} />
    </section>
  );
}
