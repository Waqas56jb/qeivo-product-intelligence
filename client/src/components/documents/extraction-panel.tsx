"use client";

import { ArrowRight, FileText, HelpCircle } from "lucide-react";
import type { DocumentExtraction, ProductDocument } from "@/types";
import { getProduct } from "@/data/products";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ConfidenceIndicator } from "@/components/analysis/badges";
import { ConflictingDataWarning } from "@/components/analysis/warnings";
import { EXTRACTION_STATUS_META, confidenceLevel, recordSourceIds, recordValue } from "./meta";

function PageRef({ page, active, onClick }: { page: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Show page ${page} in the preview`}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1 rounded-[7px] border px-2 text-[11px] font-semibold tabular transition-colors",
        active ? "border-brand bg-brand-soft text-brand-soft-foreground" : "border-border bg-surface text-muted-foreground hover:border-brand/50 hover:text-foreground",
      )}
    >
      <FileText className="size-3" /> p.{page}
    </button>
  );
}

function ExtractionRow({ e, active, onJump }: { e: DocumentExtraction; active: boolean; onJump: () => void }) {
  const st = EXTRACTION_STATUS_META[e.status];
  return (
    <li className={cn("rounded-[12px] border p-3 transition-colors", active ? "border-brand/50 bg-brand-soft/20" : "border-border bg-card", e.status === "uncertain" && !active && "border-warning/30")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">{e.field}</p>
          <p className="mt-0.5 break-words text-[14px] font-semibold leading-snug tabular">{e.value}</p>
        </div>
        <PageRef page={e.page} active={active} onClick={onJump} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <Badge variant={st.variant}>{st.label}</Badge>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ConfidenceIndicator level={confidenceLevel(e.confidence)} />
          <span className="tabular font-medium text-foreground">{Math.round(e.confidence * 100)}%</span> extraction confidence
        </span>
      </div>
      {e.note && e.status === "uncertain" && (
        <p className="mt-2 flex gap-1.5 rounded-[8px] bg-warning-soft/60 px-2.5 py-2 text-[12px] leading-relaxed text-warning-foreground">
          <HelpCircle className="mt-0.5 size-3.5 shrink-0" />
          {e.note}
        </p>
      )}
    </li>
  );
}

export function ContradictionCard({ doc, e, onJump }: { doc: ProductDocument; e: DocumentExtraction; onJump: () => void }) {
  const product = getProduct(doc.productId);
  const record = product ? recordValue(product, e.field) : null;
  return (
    <div className="space-y-2">
      <ConflictingDataWarning title={`${e.field}: document and product record disagree`} detail={e.note ?? "The value in this document differs from the product record."} sourceIds={recordSourceIds(doc.productId)} />
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
        <button type="button" onClick={onJump} className="rounded-[10px] border border-danger/25 bg-danger-soft/50 p-2.5 text-left transition-colors hover:border-danger/50">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-danger-foreground">This document · p.{e.page}</span>
          <span className="mt-0.5 block text-[14px] font-semibold tabular">{e.value}</span>
        </button>
        <span className="grid place-items-center text-subtle-foreground" aria-hidden>
          <ArrowRight className="size-4" />
        </span>
        <div className="rounded-[10px] border border-border bg-surface-2/70 p-2.5">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Product record</span>
          <span className="mt-0.5 block text-[14px] font-semibold tabular">{record ?? "See note"}</span>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed text-subtle-foreground">Both values are kept and flagged until a reviewer resolves the contradiction. Scores never silently pick one.</p>
    </div>
  );
}

export function ExtractionPanel({ doc, page, onJump, className }: { doc: ProductDocument; page: number; onJump: (page: number, field: string) => void; className?: string }) {
  const clashes = doc.extractions.filter((e) => e.status === "contradiction");
  const others = doc.extractions.filter((e) => e.status !== "contradiction");
  const uncertain = others.filter((e) => e.status === "uncertain").length;
  return (
    <div className={cn("space-y-5", className)}>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Confirmed", value: others.length - uncertain, className: "text-success" },
          { label: "Uncertain", value: uncertain, className: "text-warning-foreground" },
          { label: "Conflicts", value: clashes.length, className: "text-danger-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-[10px] bg-surface-2 px-2 py-2">
            <p className={cn("text-[18px] font-semibold leading-none tabular", s.className)}>{s.value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {clashes.length > 0 && (
        <section aria-labelledby={`clash-${doc.id}`} className="space-y-3">
          <h3 id={`clash-${doc.id}`} className="text-[13px] font-semibold">
            Flagged contradictions
          </h3>
          {clashes.map((e) => (
            <ContradictionCard key={e.field} doc={doc} e={e} onJump={() => onJump(e.page, e.field)} />
          ))}
        </section>
      )}

      <section aria-labelledby={`ex-${doc.id}`} className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 id={`ex-${doc.id}`} className="text-[13px] font-semibold">
            Extracted technical values
          </h3>
          <span className="text-[11px] text-subtle-foreground tabular">{doc.extractions.length} values</span>
        </div>
        {doc.extractions.length === 0 ? (
          <p className="rounded-[12px] border border-dashed border-border-strong p-4 text-center text-[13px] text-muted-foreground">No values have been extracted yet. Extraction runs once processing finishes.</p>
        ) : (
          <ul className="space-y-2">
            {others.map((e) => (
              <ExtractionRow key={e.field} e={e} active={e.page === page} onJump={() => onJump(e.page, e.field)} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
