"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, Download, MoreHorizontal, PackageX, Pencil, Plus, Power, ShoppingBag, Trophy } from "lucide-react";
import { toast } from "sonner";
import type { RegionCode } from "@/types";
import { getProduct } from "@/data/products";
import { REGIONS, formatDate } from "@/lib/format";
import { DEMO_NOW, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/menus";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { ConfirmationDialog, FilterChip, SearchField } from "@/components/common/controls";
import { EmptyState } from "@/components/common/states";
import { DataTable, type Column } from "@/components/tables/data-table";
import { SponsoredDisclosure, SponsoredTag } from "@/components/analysis/warnings";
import { SelectField } from "@/components/forms";
import { BusinessStatCard, DemoTag, ProductThumb, StatusDot } from "../primitives";
import { OfferSheet, type OfferFormValues } from "./offer-form";
import { OFFER_STATUS_META, RETAILER_DOMAIN, STOCK_META, daysUntil, money, offerStatus, priceRank, seededOffers, type SupplierOffer } from "./supplier-data";

const REGION_CODES: RegionCode[] = ["US", "UK", "EU", "AU", "CA"];

function downloadCsv(rows: SupplierOffer[]) {
  const header = ["offer_id", "model_number", "product", "region", "currency", "price", "stock", "valid_from", "valid_until", "retailer_url", "affiliate", "sponsored"];
  const esc = (v: string | number | boolean) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = rows.map((o) => {
    const p = getProduct(o.productId);
    return [o.id, p?.modelNumber ?? "", p?.name ?? "", o.region, REGIONS[o.region].currency, o.price, o.stock, o.validFrom, o.validUntil, `${RETAILER_DOMAIN}/${o.urlPath}`, o.affiliate, o.sponsored].map(esc).join(",");
  });
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "larder-offers-2026-11-23.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function OffersView() {
  const [offers, setOffers] = useState<SupplierOffer[]>(seededOffers);
  const [sheet, setSheet] = useState<{ open: boolean; initial: SupplierOffer | null }>({ open: false, initial: null });
  const [ending, setEnding] = useState<SupplierOffer | null>(null);
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<RegionCode | "all">("all");
  const [stock, setStock] = useState<string>("all");
  const [seq, setSeq] = useState(1);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return offers.filter((o) => {
      const p = getProduct(o.productId);
      if (region !== "all" && o.region !== region) return false;
      if (stock !== "all" && o.stock !== stock) return false;
      if (term && !`${p?.name} ${p?.modelNumber} ${o.urlPath}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [offers, q, region, stock]);

  const active = offers.filter((o) => offerStatus(o) !== "expired");
  const lowest = active.filter((o) => priceRank(o).rank === 1).length;
  const expiring = active.filter((o) => offerStatus(o) === "expiring").length;
  const oos = active.filter((o) => o.stock === "out-of-stock").length;

  const save = (v: OfferFormValues) => {
    const editing = sheet.initial;
    if (editing) {
      setOffers((prev) => prev.map((o) => (o.id === editing.id ? { ...o, ...v, region: v.region as RegionCode } : o)));
      toast.success("Offer updated (demo)", { description: "Saved in this browser session only. Qeivo re-checks the price before shoppers see it." });
    } else {
      const id = `of-demo-${seq}`;
      setSeq((s) => s + 1);
      setOffers((prev) => [{ id, ...v, region: v.region as RegionCode, clicks: 0, impressions: 0, origin: "demo" }, ...prev]);
      toast.success("Offer created (demo)", { description: `${getProduct(v.productId)?.name ?? "Product"} · ${v.region}. Pending Qeivo price verification — nothing was published.` });
    }
    setSheet({ open: false, initial: editing });
  };

  const columns: Column<SupplierOffer>[] = [
    {
      key: "product",
      header: "Product",
      cell: (o) => {
        const p = getProduct(o.productId);
        if (!p) return null;
        return (
          <div className="flex min-w-0 max-w-[260px] flex-col gap-1">
            <ProductThumb product={p} size="sm" />
            <div className="flex flex-wrap items-center gap-1 pl-12 md:hidden">
              <StatusDot tone={STOCK_META[o.stock].tone}>{STOCK_META[o.stock].label}</StatusDot>
              <Badge variant="outline">{o.region}</Badge>
            </div>
          </div>
        );
      },
      sortValue: (o) => getProduct(o.productId)?.name ?? "",
    },
    {
      key: "price",
      header: "Retail price",
      align: "right",
      sortValue: (o) => o.price,
      cell: (o) => {
        const r = priceRank(o);
        return (
          <div className="flex flex-col items-end gap-0.5">
            <span className="tabular font-semibold">{money(o.price, o.region)}</span>
            <span className={cn("inline-flex items-center gap-1 text-[11.5px] tabular", r.rank === 1 ? "text-success" : "text-muted-foreground")}>
              {r.rank === 1 && <Trophy className="size-3" />}#{r.rank} of {r.of}
            </span>
          </div>
        );
      },
    },
    { key: "stock", header: "Stock", hideBelow: "md", sortValue: (o) => o.stock, cell: (o) => <StatusDot tone={STOCK_META[o.stock].tone}>{STOCK_META[o.stock].label}</StatusDot> },
    {
      key: "region",
      header: "Region",
      hideBelow: "md",
      sortValue: (o) => o.region,
      cell: (o) => (
        <span className="inline-flex items-center gap-1.5 text-[13px]">
          <span aria-hidden>{REGIONS[o.region].flag}</span>
          {o.region}
        </span>
      ),
    },
    {
      key: "url",
      header: "Retailer URL",
      hideBelow: "lg",
      cell: (o) => (
        <span className="block max-w-[220px] truncate font-mono text-[12px] text-muted-foreground" title={`${RETAILER_DOMAIN}/${o.urlPath}`}>
          {RETAILER_DOMAIN}/{o.urlPath}
        </span>
      ),
    },
    {
      key: "validity",
      header: "Validity",
      hideBelow: "lg",
      sortValue: (o) => o.validUntil,
      cell: (o) => {
        const s = offerStatus(o);
        const left = daysUntil(o.validUntil);
        return (
          <div className="flex flex-col gap-1">
            <span className="text-[12.5px] tabular">
              {formatDate(o.validFrom, "d MMM")} – {formatDate(o.validUntil, "d MMM yyyy")}
            </span>
            <StatusDot tone={OFFER_STATUS_META[s].tone} className="self-start">
              {OFFER_STATUS_META[s].label}
              {s === "expiring" && ` · ${left}d`}
            </StatusDot>
          </div>
        );
      },
    },
    {
      key: "labels",
      header: "Disclosure",
      hideBelow: "sm",
      cell: (o) => (
        <div className="flex flex-wrap gap-1">
          {o.affiliate && <Badge variant="outline">Affiliate</Badge>}
          {o.sponsored && <SponsoredTag />}
          {!o.affiliate && !o.sponsored && <span className="text-[12px] text-subtle-foreground">None</span>}
          {o.origin === "demo" && <DemoTag>Draft</DemoTag>}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (o) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" className="hidden sm:inline-flex" aria-label={`Edit offer for ${getProduct(o.productId)?.name}`} onClick={() => setSheet({ open: true, initial: o })}>
            <Pencil />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="More actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setSheet({ open: true, initial: o })}>
                <Pencil /> Edit offer
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  const next = o.stock === "out-of-stock" ? "in-stock" : "out-of-stock";
                  setOffers((prev) => prev.map((x) => (x.id === o.id ? { ...x, stock: next } : x)));
                  toast.success(`Marked ${STOCK_META[next].label.toLowerCase()} (demo)`);
                }}
              >
                <PackageX /> {o.stock === "out-of-stock" ? "Mark in stock" : "Mark out of stock"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive disabled={offerStatus(o) === "expired"} onSelect={() => setEnding(o)}>
                <Power /> End offer today
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader
        eyebrow="Larder & Co · Supplier"
        title="Offers"
        description="Prices, stock and validity for every product you sell through Qeivo. Shoppers see offers sorted by price — commissions and sponsorship never change the order of scores or recommendations."
        actions={
          <>
            <Button variant="outline" onClick={() => { downloadCsv(filtered); toast.success(`Exported ${filtered.length} offers`, { description: "CSV generated in your browser." }); }}>
              <Download /> Export CSV
            </Button>
            <Button variant="brand" onClick={() => setSheet({ open: true, initial: null })}>
              <Plus /> Create offer
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <BusinessStatCard label="Active offers" value={active.length} icon={ShoppingBag} hint={`${offers.length - active.length} expired`} />
        <BusinessStatCard label="Lowest price" value={lowest} icon={Trophy} hint={`${Math.round((lowest / Math.max(1, active.length)) * 100)}% of active offers rank #1`} />
        <BusinessStatCard label="Expiring ≤ 14 days" value={expiring} icon={CalendarClock} hint="Re-confirm price to stay listed" />
        <BusinessStatCard label="Out of stock" value={oos} icon={AlertTriangle} hint="Shown below in-stock offers" />
      </div>

      <SponsoredDisclosure kind="affiliate" detail="Offers marked Affiliate earn Qeivo a commission and are labelled to shoppers. Affiliate status and sponsored placements never influence suitability scores, rankings or AI verdicts." />

      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchField value={q} onChange={setQ} placeholder="Search product, model or URL…" className="lg:w-80" />
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            <FilterChip active={region === "all"} onClick={() => setRegion("all")} count={offers.length}>
              All regions
            </FilterChip>
            {REGION_CODES.map((r) => (
              <FilterChip key={r} active={region === r} onClick={() => setRegion(r)} count={offers.filter((o) => o.region === r).length}>
                {r}
              </FilterChip>
            ))}
          </div>
          <SelectField
            value={stock}
            onValueChange={setStock}
            ariaLabel="Filter by stock"
            size="sm"
            className="lg:ml-auto lg:w-44"
            options={[{ value: "all", label: "All stock states" }, ...Object.entries(STOCK_META).map(([k, m]) => ({ value: k, label: m.label }))]}
          />
        </div>
        <p className="text-[12px] text-muted-foreground tabular" aria-live="polite">
          {filtered.length} of {offers.length} offers · prices in each offer&apos;s regional currency · as of {formatDate(DEMO_NOW.toISOString(), "d MMM yyyy")}
        </p>
      </div>

      {filtered.length ? (
        <DataTable data={filtered} columns={columns} rowKey={(o) => o.id} pageSize={12} />
      ) : (
        <EmptyState
          title="No offers match these filters"
          description="Try another region or stock state, or clear the search."
          action={
            <Button variant="outline" onClick={() => { setQ(""); setRegion("all"); setStock("all"); }}>
              Clear filters
            </Button>
          }
        />
      )}

      <OfferSheet open={sheet.open} onOpenChange={(open) => setSheet((s) => ({ ...s, open }))} initial={sheet.initial} onSave={save} />
      <ConfirmationDialog
        open={Boolean(ending)}
        onOpenChange={(o) => !o && setEnding(null)}
        title="End this offer today?"
        description={ending ? `${getProduct(ending.productId)?.name} (${ending.region}) will stop showing to shoppers after today. You can create a new offer at any time.` : undefined}
        confirmLabel="End offer"
        destructive
        onConfirm={() => {
          if (!ending) return;
          const yesterday = new Date(DEMO_NOW.getTime() - 86_400_000).toISOString().slice(0, 10);
          setOffers((prev) => prev.map((x) => (x.id === ending.id ? { ...x, validUntil: yesterday, validFrom: x.validFrom > yesterday ? yesterday : x.validFrom } : x)));
          toast.success("Offer ended (demo)", { description: "Hidden from shoppers in this session." });
        }}
      />
    </PageContainer>
  );
}
