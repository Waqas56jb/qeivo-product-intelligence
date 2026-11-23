"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronRight, FileStack, GitPullRequestArrow, HelpCircle, ScanText, Upload } from "lucide-react";
import type { ProductDocument } from "@/types";
import { documents } from "@/data/documents/documents";
import { getProduct } from "@/data/products";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useIsDesktop, useMediaQuery } from "@/hooks/use-media-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterChip, SearchField } from "@/components/common/controls";
import { DateDisplay } from "@/components/common/display";
import { EmptyState } from "@/components/common/states";
import { DocumentPreview, pagesOfInterest } from "./document-preview";
import { ExtractionPanel } from "./extraction-panel";
import { DOC_KIND_META, DOC_STATUS_META, formatSize } from "./meta";
import { UploadDocumentDialog } from "./upload-dialog";

type KindFilter = ProductDocument["kind"] | "all";
type StatusFilter = ProductDocument["status"] | "all";

function DocumentListItem({ doc, active, onSelect }: { doc: ProductDocument; active: boolean; onSelect: () => void }) {
  const k = DOC_KIND_META[doc.kind];
  const st = DOC_STATUS_META[doc.status];
  const product = getProduct(doc.productId);
  const clashes = doc.extractions.filter((e) => e.status === "contradiction").length;
  const unsure = doc.extractions.filter((e) => e.status === "uncertain").length;
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className={cn(
          "group relative flex w-full gap-3 rounded-[14px] border p-3 text-left outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/30",
          active ? "border-brand/60 bg-brand-soft/25 shadow-sm" : "border-border bg-card hover:border-border-strong hover:shadow-xs",
        )}
      >
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-[10px]", k.className)}>
          <k.icon className="size-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle-foreground">{k.label}</span>
          <span className="mt-0.5 line-clamp-2 block text-[13.5px] font-semibold leading-snug">{doc.title}</span>
          <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">{product?.name}</span>
          <span className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant={st.variant}>
              <st.icon className={cn(doc.status === "processing" && "animate-spin")} /> {st.label}
            </Badge>
            {clashes > 0 && (
              <Badge variant="danger">
                <GitPullRequestArrow /> {clashes}
              </Badge>
            )}
            {unsure > 0 && (
              <Badge variant="warning">
                <HelpCircle /> {unsure}
              </Badge>
            )}
            <span className="text-[11px] text-subtle-foreground tabular">
              {doc.pages} pp · {formatSize(doc.sizeKb)}
            </span>
          </span>
        </span>
        <ChevronRight className="mt-3 size-4 shrink-0 text-subtle-foreground lg:hidden" />
      </button>
    </li>
  );
}

function DocumentMeta({ doc, className }: { doc: ProductDocument; className?: string }) {
  const product = getProduct(doc.productId);
  const k = DOC_KIND_META[doc.kind];
  const st = DOC_STATUS_META[doc.status];
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline">
          <k.icon /> {k.label}
        </Badge>
        <Badge variant={st.variant}>
          <st.icon className={cn(doc.status === "processing" && "animate-spin")} /> {st.label}
        </Badge>
      </div>
      <h2 className="text-[17px] font-semibold leading-snug tracking-tight">{doc.title}</h2>
      <p className="text-[12px] text-muted-foreground">
        Uploaded <DateDisplay iso={doc.uploadedAt} /> by {doc.uploadedBy} · {doc.language} · <span className="tabular">{doc.pages} pages</span>
      </p>
      {product && (
        <Link href={routes.product(product.slug)} className="inline-flex min-h-8 items-center gap-1 text-[12px] font-medium text-brand-soft-foreground hover:underline">
          {product.name} <ArrowUpRight className="size-3.5" />
        </Link>
      )}
      {doc.status === "processing" && <p className="rounded-[10px] bg-info-soft/60 px-3 py-2 text-[12px] text-info-foreground">Extraction is still running. Values shown so far are provisional and are not yet used in scores.</p>}
      {doc.status === "needs-review" && <p className="rounded-[10px] bg-warning-soft/60 px-3 py-2 text-[12px] text-warning-foreground">A Qeivo reviewer must confirm this document before its values are published to the product record.</p>}
    </div>
  );
}

export function DocumentWorkspace() {
  const isXl = useMediaQuery("(min-width: 1280px)", true);
  const isDesktop = useIsDesktop();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState(documents[0].id);
  const [page, setPage] = useState(pagesOfInterest(documents[0])[0] ?? 1);
  const [zoom, setZoom] = useState(1);
  const [focusField, setFocusField] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [tab, setTab] = useState("preview");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter((d) => {
      if (kind !== "all" && d.kind !== kind) return false;
      if (status !== "all" && d.status !== status) return false;
      if (!q) return true;
      const p = getProduct(d.productId);
      return `${d.title} ${p?.name ?? ""} ${p?.modelNumber ?? ""}`.toLowerCase().includes(q);
    });
  }, [query, kind, status]);

  const doc = documents.find((d) => d.id === selectedId) ?? documents[0];
  const totals = useMemo(() => {
    const ex = documents.flatMap((d) => d.extractions);
    return { docs: documents.length, values: ex.length, unsure: ex.filter((e) => e.status === "uncertain").length, clashes: ex.filter((e) => e.status === "contradiction").length };
  }, []);

  const select = (d: ProductDocument) => {
    setSelectedId(d.id);
    setPage(pagesOfInterest(d)[0] ?? 1);
    setFocusField(null);
    setTab("preview");
    if (!isDesktop) setSheetOpen(true);
  };
  const jump = (p: number, field: string) => {
    setPage(p);
    setFocusField(field);
    setTab("preview");
  };
  const changePage = (p: number) => {
    setPage(p);
    setFocusField(null);
  };

  const preview = <DocumentPreview doc={doc} page={page} onPageChange={changePage} zoom={zoom} onZoomChange={setZoom} focusField={focusField} className="h-full" />;
  const extraction = <ExtractionPanel doc={doc} page={page} onJump={jump} />;

  const kindCounts = (k: KindFilter) => documents.filter((d) => k === "all" || d.kind === k).length;

  const list = (
    <div className="flex min-h-0 flex-col gap-3">
      <SearchField value={query} onChange={setQuery} placeholder="Search documents or models" />
      <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {(["all", ...Object.keys(DOC_KIND_META)] as KindFilter[]).map((k) => (
          <FilterChip key={k} active={kind === k} onClick={() => setKind(k)} count={kindCounts(k)}>
            {k === "all" ? "All" : DOC_KIND_META[k].label}
          </FilterChip>
        ))}
      </div>
      <div role="radiogroup" aria-label="Status" className="grid grid-cols-4 gap-1 rounded-[12px] bg-surface-2 p-1">
        {(["all", "processed", "processing", "needs-review"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={status === s}
            onClick={() => setStatus(s)}
            className={cn("h-9 truncate rounded-[9px] px-1 text-[12px] font-medium text-muted-foreground transition-colors", status === s && "bg-surface text-foreground shadow-sm")}
          >
            {s === "all" ? "Any" : s === "needs-review" ? "Review" : DOC_STATUS_META[s].label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          compact
          icon={FileStack}
          title="No documents match"
          description="Try another type or status, or clear the search."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery("");
                setKind("all");
                setStatus("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2" aria-label="Documents">
          {filtered.map((d) => (
            <DocumentListItem key={d.id} doc={d} active={isDesktop && d.id === doc.id} onSelect={() => select(d)} />
          ))}
        </ul>
      )}
    </div>
  );

  const tabbedDetail = (
    <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border px-4 py-2">
        <TabsList className="w-full">
          <TabsTrigger value="preview" className="h-9 flex-1">
            <ScanText /> Preview
          </TabsTrigger>
          <TabsTrigger value="values" className="h-9 flex-1">
            Extracted values <span className="tabular text-subtle-foreground">{doc.extractions.length}</span>
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="preview" className="min-h-0 flex-1">
        {preview}
      </TabsContent>
      <TabsContent value="values" className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin">
        {extraction}
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <dl className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-6">
          {[
            { label: "Documents", value: totals.docs },
            { label: "Values extracted", value: totals.values },
            { label: "Uncertain", value: totals.unsure, tone: "text-warning-foreground" },
            { label: "Contradictions", value: totals.clashes, tone: "text-danger-foreground" },
          ].map((s) => (
            <div key={s.label} className="rounded-[12px] border border-border bg-card px-3 py-2 sm:border-0 sm:bg-transparent sm:p-0">
              <dt className="text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">{s.label}</dt>
              <dd className={cn("text-[20px] font-semibold tabular", s.tone)}>{s.value}</dd>
            </div>
          ))}
        </dl>
        <Button variant="brand" onClick={() => setUploadOpen(true)} className="h-11 sm:h-10">
          <Upload /> Upload document
        </Button>
      </div>

      {isDesktop ? (
        <div className={cn("grid items-start gap-4", isXl ? "grid-cols-[300px_minmax(0,1fr)_360px]" : "grid-cols-[280px_minmax(0,1fr)]")}>
          <aside className="sticky top-20 max-h-[calc(100dvh-104px)] overflow-y-auto pr-1 scrollbar-thin">{list}</aside>
          {isXl ? (
            <>
              <section aria-label="Document preview" className="sticky top-20 flex h-[calc(100dvh-104px)] min-h-[560px] flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-xs">
                <DocumentMeta doc={doc} className="border-b border-border p-4" />
                <div className="min-h-0 flex-1">{preview}</div>
              </section>
              <section aria-label="Extracted values" className="sticky top-20 max-h-[calc(100dvh-104px)] overflow-y-auto rounded-[20px] border border-border bg-card p-4 shadow-xs scrollbar-thin">
                {extraction}
              </section>
            </>
          ) : (
            <section aria-label="Document detail" className="sticky top-20 flex h-[calc(100dvh-104px)] min-h-[560px] flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-xs">
              <DocumentMeta doc={doc} className="border-b border-border p-4" />
              {tabbedDetail}
            </section>
          )}
        </div>
      ) : (
        <>
          {list}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="bottom" className="h-[92dvh] max-h-[92dvh]">
              <SheetTitle className="sr-only">{doc.title}</SheetTitle>
              <SheetDescription className="sr-only">Document preview and extracted technical values</SheetDescription>
              <DocumentMeta doc={doc} className="border-b border-border px-4 pb-3 pr-14 pt-2" />
              {tabbedDetail}
            </SheetContent>
          </Sheet>
        </>
      )}

      <UploadDocumentDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
