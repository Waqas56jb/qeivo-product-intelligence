"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Eye, Layers, MousePointerClick, PackageSearch, Plus, Trophy } from "lucide-react";
import { toast } from "sonner";
import type { Product, RegionCode } from "@/types";
import { getProduct } from "@/data/products";
import { getBrand } from "@/data/products/brands";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { FilterChip, SearchField } from "@/components/common/controls";
import { DataTable, type Column } from "@/components/tables/data-table";
import { ProductRating } from "@/components/product/product-bits";
import { BusinessStatCard, ProductThumb, ScoreIntegrityNotice, StatusDot, type Tone } from "../primitives";
import { OfferSheet, SUPPLIER_PRODUCTS, type OfferFormValues } from "./offer-form";
import { STOCK_META, marketLow, money, offerStatus, priceRank, seededOffers, type SupplierOffer } from "./supplier-data";

interface ListedRow {
  product: Product;
  offers: SupplierOffer[];
  clicks: number;
  impressions: number;
  bestRank: number;
  status: { label: string; tone: Tone };
}

function rowStatus(offers: SupplierOffer[]): ListedRow["status"] {
  const live = offers.filter((o) => offerStatus(o) !== "expired");
  if (!live.length) return { label: "No active offer", tone: "neutral" };
  if (live.every((o) => o.stock === "out-of-stock")) return { label: "Out of stock", tone: "danger" };
  if (live.some((o) => offerStatus(o) === "expiring")) return { label: "Needs renewal", tone: "warning" };
  if (live.some((o) => o.stock === "low-stock")) return { label: "Low stock", tone: "warning" };
  return { label: "Live", tone: "success" };
}

const CATEGORY = { refrigerators: "Refrigerators", "washing-machines": "Washing machines" } as Record<string, string>;

export function ProductsView() {
  const [offers, setOffers] = useState<SupplierOffer[]>(seededOffers);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | "refrigerators" | "washing-machines">("all");
  const [sheet, setSheet] = useState<{ open: boolean; productId?: string }>({ open: false });
  const [seq, setSeq] = useState(1);

  const matches = (p: Product) => (cat === "all" || p.category === cat) && (!q.trim() || `${p.name} ${p.modelNumber} ${getBrand(p.brandId).name}`.toLowerCase().includes(q.trim().toLowerCase()));

  const listed: ListedRow[] = useMemo(() => {
    const by = new Map<string, SupplierOffer[]>();
    for (const o of offers) by.set(o.productId, [...(by.get(o.productId) ?? []), o]);
    return [...by.entries()]
      .map(([pid, list]) => {
        const product = getProduct(pid) as Product;
        return {
          product,
          offers: list,
          clicks: list.reduce((s, o) => s + o.clicks, 0),
          impressions: list.reduce((s, o) => s + o.impressions, 0),
          bestRank: Math.min(...list.map((o) => priceRank(o).rank)),
          status: rowStatus(list),
        };
      })
      .filter((r) => r.product);
  }, [offers]);

  const listedIds = new Set(listed.map((r) => r.product.id));
  const available = SUPPLIER_PRODUCTS.filter((p) => !listedIds.has(p.id));
  const listedShown = listed.filter((r) => matches(r.product));
  const availableShown = available.filter(matches);

  const save = (v: OfferFormValues) => {
    setOffers((prev) => [{ id: `of-demo-${seq}`, ...v, region: v.region as RegionCode, clicks: 0, impressions: 0, origin: "demo" }, ...prev]);
    setSeq((s) => s + 1);
    setSheet((s) => ({ ...s, open: false }));
    toast.success("Offer created (demo)", { description: `${getProduct(v.productId)?.name} is now listed in this session. Qeivo verifies the price before shoppers see it.` });
  };

  const listedCols: Column<ListedRow>[] = [
    {
      key: "product",
      header: "Product",
      sortValue: (r) => r.product.name,
      cell: (r) => (
        <div className="flex max-w-[280px] flex-col gap-1">
          <ProductThumb product={r.product} size="sm" />
          <span className="pl-12 sm:hidden">
            <StatusDot tone={r.status.tone}>{r.status.label}</StatusDot>
          </span>
        </div>
      ),
    },
    { key: "cat", header: "Category", hideBelow: "lg", sortValue: (r) => r.product.category, cell: (r) => <span className="text-[13px] text-muted-foreground">{CATEGORY[r.product.category]}</span> },
    {
      key: "regions",
      header: "Offers",
      hideBelow: "md",
      sortValue: (r) => r.offers.length,
      cell: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.offers.map((o) => (
            <Badge key={o.id} variant="outline" className={cn(o.stock === "out-of-stock" && "line-through opacity-60")} title={`${STOCK_META[o.stock].label} · ${money(o.price, o.region)}`}>
              {o.region} {money(o.price, o.region)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "rank",
      header: "Best price rank",
      align: "right",
      hideBelow: "sm",
      sortValue: (r) => r.bestRank,
      cell: (r) => (
        <span className={cn("inline-flex items-center gap-1 tabular font-medium", r.bestRank === 1 ? "text-success" : "text-foreground")}>
          {r.bestRank === 1 && <Trophy className="size-3.5" />}#{r.bestRank}
        </span>
      ),
    },
    { key: "clicks", header: "Clicks (30d)", align: "right", hideBelow: "md", sortValue: (r) => r.clicks, cell: (r) => <span className="tabular">{r.clicks.toLocaleString("en-US")}</span> },
    { key: "status", header: "Offer status", hideBelow: "sm", sortValue: (r) => r.status.label, cell: (r) => <StatusDot tone={r.status.tone}>{r.status.label}</StatusDot> },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (r) => (
        <div className="flex justify-end gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setSheet({ open: true, productId: r.product.id })} aria-label={`Add offer for ${r.product.name}`}>
            <Plus /> <span className="hidden xl:inline">Add offer</span>
          </Button>
          <Button asChild variant="ghost" size="icon-sm" aria-label={`View ${r.product.name} on Qeivo`}>
            <Link href={routes.product(r.product.slug)}>
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  const availableCols: Column<Product>[] = [
    { key: "product", header: "Product", sortValue: (p) => p.name, cell: (p) => <ProductThumb product={p} size="sm" className="max-w-[280px]" /> },
    { key: "cat", header: "Category", hideBelow: "md", cell: (p) => <span className="text-[13px] text-muted-foreground">{CATEGORY[p.category]}</span> },
    { key: "rating", header: "Owner rating", hideBelow: "lg", sortValue: (p) => p.rating, cell: (p) => <ProductRating rating={p.rating} count={p.reviewCount} /> },
    {
      key: "low",
      header: "Market low",
      align: "right",
      hideBelow: "sm",
      sortValue: (p) => p.price,
      cell: (p) => {
        const r = (p.regions.includes("US") ? "US" : p.regions[0]) as RegionCode;
        const low = marketLow(p.id, r);
        return low ? <span className="tabular">{money(low, r)} <span className="text-[11px] text-muted-foreground">{r}</span></span> : <span className="text-subtle-foreground">No offers yet</span>;
      },
    },
    { key: "regions", header: "Sold in", hideBelow: "lg", cell: (p) => <span className="text-[12.5px] text-muted-foreground">{p.regions.join(" · ")}</span> },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (p) => (
        <Button variant="subtle" size="sm" onClick={() => setSheet({ open: true, productId: p.id })} aria-label={`List ${p.name}`}>
          <Plus /> List
        </Button>
      ),
    },
  ];

  const totalClicks = listed.reduce((s, r) => s + r.clicks, 0);
  const totalImpr = listed.reduce((s, r) => s + r.impressions, 0);

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader
        eyebrow="Larder & Co · Supplier"
        title="Products"
        description="Catalogue products you sell, with the status of your offers. Product data, scores and verdicts are maintained by Qeivo and the manufacturer — you manage price, stock and availability."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={routes.sOffers}>Manage offers</Link>
            </Button>
            <Button variant="brand" onClick={() => setSheet({ open: true })}>
              <Plus /> List a product
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <BusinessStatCard label="Products listed" value={listed.length} icon={Layers} hint={`${available.length} more you could list`} />
        <BusinessStatCard label="Offer impressions" value={totalImpr.toLocaleString("en-US")} icon={Eye} hint="Last 30 days" />
        <BusinessStatCard label="Click-throughs" value={totalClicks.toLocaleString("en-US")} icon={MousePointerClick} hint={`${((totalClicks / Math.max(1, totalImpr)) * 100).toFixed(1)}% click-through rate`} />
        <BusinessStatCard label="Cheapest retailer" value={listed.filter((r) => r.bestRank === 1).length} icon={Trophy} hint="Products where you rank #1 on price" />
      </div>

      <Tabs defaultValue="listed" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <TabsList>
            <TabsTrigger value="listed">
              Listed <span className="tabular text-subtle-foreground">{listedShown.length}</span>
            </TabsTrigger>
            <TabsTrigger value="available">
              Available to list <span className="tabular text-subtle-foreground">{availableShown.length}</span>
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="scrollbar-none flex gap-2 overflow-x-auto">
              <FilterChip active={cat === "all"} onClick={() => setCat("all")}>All</FilterChip>
              <FilterChip active={cat === "refrigerators"} onClick={() => setCat("refrigerators")}>Refrigerators</FilterChip>
              <FilterChip active={cat === "washing-machines"} onClick={() => setCat("washing-machines")}>Washing machines</FilterChip>
            </div>
            <SearchField value={q} onChange={setQ} placeholder="Search products…" className="sm:w-64" />
          </div>
        </div>
        <TabsContent value="listed">
          <DataTable data={listedShown} columns={listedCols} rowKey={(r) => r.product.id} pageSize={10} initialSort={{ key: "clicks", dir: "desc" }} emptyTitle="No listed products match" emptyDescription="Clear the search or switch category." />
        </TabsContent>
        <TabsContent value="available" className="space-y-3">
          <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <PackageSearch className="size-4 text-brand" /> Products in your categories that you don&apos;t sell yet. Listing a product never affects its Qeivo score or ranking.
          </p>
          <DataTable data={availableShown} columns={availableCols} rowKey={(p) => p.id} pageSize={10} emptyTitle="Nothing else to list" emptyDescription="You already list every product that matches." />
        </TabsContent>
      </Tabs>

      <ScoreIntegrityNotice role="Suppliers">Suitability scores, evidence coverage, rankings and verdicts are calculated independently. Suppliers can manage price, stock and availability only — offers are shown to shoppers sorted by price, never by commission.</ScoreIntegrityNotice>

      <OfferSheet open={sheet.open} onOpenChange={(open) => setSheet((s) => ({ ...s, open }))} defaultProductId={sheet.productId} onSave={save} />
    </PageContainer>
  );
}
