"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus } from "lucide-react";
import { productPerformance } from "@/data/analytics/manufacturer";
import { routes } from "@/config/routes";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { FilterChip, SearchField } from "@/components/common/controls";
import { DataTable } from "@/components/tables/data-table";
import { ScorePill, EvidenceCoverage } from "@/components/analysis/score";
import { ProductThumb, ScoreIntegrityNotice } from "../primitives";
import { fmtCompact } from "../format";
import { nordvikProducts } from "./shared";

const STATUS = (f: string) => (f === "current" ? { label: "Live · verified", v: "success" as const } : f === "aging" ? { label: "Live · re-verification due", v: "info" as const } : { label: "Needs update", v: "warning" as const });

export function ManufacturerProductsView() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "current" | "aging" | "stale">("all");
  const rows = useMemo(() => nordvikProducts.filter((p) => (status === "all" || p.freshness === status) && (!q || `${p.model} ${p.modelNumber} ${p.type}`.toLowerCase().includes(q.toLowerCase()))), [q, status]);
  const views = (id: string) => productPerformance.find((r) => r.productId === id)?.views ?? 0;

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader
        title="Products"
        description="Your catalogue on Qeivo. Submitted changes are verified against your documents before they go live."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={routes.mImport}>Bulk import</Link>
            </Button>
            <Button asChild>
              <Link href={routes.mProductNew}>
                <Plus /> Add product
              </Link>
            </Button>
          </>
        }
      />
      <ScoreIntegrityNotice variant="inline" />
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchField value={q} onChange={setQ} placeholder="Search model, number or type…" className="md:w-80" />
        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {(["all", "current", "aging", "stale"] as const).map((s) => (
            <FilterChip key={s} active={status === s} onClick={() => setStatus(s)} count={s === "all" ? nordvikProducts.length : nordvikProducts.filter((p) => p.freshness === s).length}>
              {s === "all" ? "All" : STATUS(s).label}
            </FilterChip>
          ))}
        </div>
      </div>
      <DataTable
        data={rows}
        rowKey={(p) => p.id}
        emptyTitle="No products match"
        columns={[
          { key: "product", header: "Product", cell: (p) => <ProductThumb product={p} meta={`${p.modelNumber} · ${p.type}`} />, sortValue: (p) => p.model },
          { key: "status", header: "Status", cell: (p) => <Badge variant={STATUS(p.freshness).v}>{STATUS(p.freshness).label}</Badge>, hideBelow: "md" },
          { key: "score", header: "Qeivo score", cell: (p) => <ScorePill score={p.suitabilityScore} />, sortValue: (p) => p.suitabilityScore, hideBelow: "sm" },
          { key: "evidence", header: "Evidence", cell: (p) => <EvidenceCoverage coverage={p.evidenceCoverage} variant="pill" />, sortValue: (p) => p.evidenceCoverage, hideBelow: "lg" },
          { key: "views", header: "Views", cell: (p) => <span className="tabular">{fmtCompact(views(p.id))}</span>, sortValue: (p) => views(p.id), align: "right", hideBelow: "md" },
          { key: "verified", header: "Last verified", cell: (p) => formatDate(p.lastVerified), sortValue: (p) => p.lastVerified, hideBelow: "lg" },
          {
            key: "actions",
            header: "",
            align: "right",
            cell: (p) => (
              <div className="flex justify-end gap-1">
                <Button asChild variant="ghost" size="icon-sm" aria-label={`View ${p.model} on Qeivo`}>
                  <Link href={routes.product(p.slug)}>
                    <Eye />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" aria-label={`Edit ${p.model}`}>
                  <Link href={routes.mProductEdit(p.id)}>
                    <Pencil /> Edit
                  </Link>
                </Button>
              </div>
            ),
          },
        ]}
      />
    </PageContainer>
  );
}
