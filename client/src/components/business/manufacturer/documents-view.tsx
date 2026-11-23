"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { documents } from "@/data/documents/documents";
import { getProduct } from "@/data/products";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { FilterChip } from "@/components/common/controls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { Panel, ScoreIntegrityNotice } from "../primitives";
import { UploadDropzone, UploadRow, useUploadQueue } from "../upload";
import { formatBytes } from "../format";
import { nordvikProducts } from "./shared";

type Kind = "manual" | "spec-sheet" | "warranty" | "certification" | "installation";
const KINDS: { value: Kind; label: string }[] = [
  { value: "manual", label: "Owner's manual" },
  { value: "spec-sheet", label: "Specification sheet" },
  { value: "warranty", label: "Warranty terms" },
  { value: "certification", label: "Certification" },
  { value: "installation", label: "Installation guide" },
];

export function ManufacturerDocumentsView() {
  const [kind, setKind] = useState<Kind>("manual");
  const [productId, setProductId] = useState(nordvikProducts[0].id);
  const [filter, setFilter] = useState<Kind | "all">("all");
  const queue = useUploadQueue<{ kind: Kind; productId: string }>();
  const ids = new Set(nordvikProducts.map((p) => p.id));
  const existing = documents.filter((d) => ids.has(d.productId) && (filter === "all" || d.kind === filter));

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader title="Documents" description="Manuals, specification sheets, warranty terms and certificates. Qeivo extracts values from these documents and flags anything that conflicts with independent data." />
      <ScoreIntegrityNotice variant="inline" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Panel title="Upload documents" description="Demo — files stay in your browser and processing is simulated.">
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <Select value={kind} onValueChange={(v) => setKind(v as Kind)}>
              <SelectTrigger aria-label="Document type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KINDS.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger aria-label="Product">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {nordvikProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <UploadDropzone
            accept=".pdf,.png,.jpg"
            title="Drag & drop PDFs here"
            hint="PDF, PNG or JPG up to 50 MB"
            onFiles={(files) => {
              queue.add(files, () => ({ kind, productId }));
              toast.success(`${files.length} file${files.length > 1 ? "s" : ""} added`, { description: "Simulated upload and extraction (demo)." });
            }}
          />
          <div className="mt-4 space-y-2">
            {queue.items.map((it) => (
              <UploadRow key={it.id} item={it} onRemove={() => queue.remove(it.id)} processingLabel="Extracting technical values…" doneLabel="Extracted · awaiting review">
                <span className="text-[12px] text-muted-foreground">
                  {KINDS.find((k) => k.value === it.meta.kind)?.label} · {getProduct(it.meta.productId)?.model}
                </span>
              </UploadRow>
            ))}
          </div>
        </Panel>
        <Panel title="Document library" flush>
          <div className="scrollbar-none flex gap-2 overflow-x-auto px-5 pb-3">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
              All
            </FilterChip>
            {KINDS.map((k) => (
              <FilterChip key={k.value} active={filter === k.value} onClick={() => setFilter(k.value)}>
                {k.label}
              </FilterChip>
            ))}
          </div>
          <ul className="divide-y divide-border border-t border-border">
            {existing.length === 0 && <li className="p-5 text-sm text-muted-foreground">No documents of this type yet.</li>}
            {existing.map((d) => {
              const contradictions = d.extractions.filter((e) => e.status === "contradiction").length;
              const uncertain = d.extractions.filter((e) => e.status === "uncertain").length;
              return (
                <li key={d.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-info-soft text-info-foreground">
                    <FileText className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{d.title}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {getProduct(d.productId)?.model} · {d.pages} pages · {formatBytes(d.sizeKb * 1024)} · {formatDate(d.uploadedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {contradictions > 0 && (
                      <Badge variant="warning">
                        <AlertTriangle /> {contradictions} conflict{contradictions > 1 ? "s" : ""}
                      </Badge>
                    )}
                    {uncertain > 0 && (
                      <Badge variant="info">
                        <HelpCircle /> {uncertain} uncertain
                      </Badge>
                    )}
                    {d.status === "processed" && !contradictions && (
                      <Badge variant="success">
                        <CheckCircle2 /> Verified
                      </Badge>
                    )}
                    {d.status !== "processed" && <Badge>{d.status.replace("-", " ")}</Badge>}
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </PageContainer>
  );
}
