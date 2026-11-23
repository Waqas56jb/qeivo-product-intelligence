"use client";

import { useEffect, useRef, useState } from "react";
import { Check, FileUp, Info, Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import type { ProductDocument } from "@/types";
import { products } from "@/data/products";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { Label, Progress } from "@/components/ui/primitives";
import { DOC_KIND_META, formatSize } from "./meta";

const STAGES = ["Checking file type and size", "Reading page structure", "Extracting technical values", "Cross-checking against the product record"];

type Phase = "select" | "processing" | "done";

export function UploadDocumentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [file, setFile] = useState<{ name: string; sizeKb: number } | null>(null);
  const [productId, setProductId] = useState(products[0].id);
  const [kind, setKind] = useState<ProductDocument["kind"]>("manual");
  const [phase, setPhase] = useState<Phase>("select");
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase !== "processing") return;
    const id = window.setInterval(() => setProgress((p) => Math.min(100, p + 4)), 110);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "processing" || progress < 100) return;
    setPhase("done");
    toast.success("Document queued (demo)", { description: "Nothing was uploaded — this simulates how Qeivo would process the file." });
  }, [phase, progress]);

  const reset = () => {
    setFile(null);
    setPhase("select");
    setProgress(0);
    setDragging(false);
  };

  const close = () => {
    reset();
    onOpenChange(false);
  };

  const pick = (f: File | undefined) => {
    if (!f) return;
    // Only the name and size are shown; file contents are never read.
    setFile({ name: f.name, sizeKb: Math.max(1, Math.round(f.size / 1024)) });
  };

  const stage = Math.min(STAGES.length - 1, Math.floor(progress / (100 / STAGES.length)));
  const product = products.find((p) => p.id === productId);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload a document</DialogTitle>
          <DialogDescription>Add a manual, spec sheet or certificate and Qeivo will extract technical values with page references.</DialogDescription>
        </DialogHeader>

        <p className="flex items-start gap-2 rounded-[10px] border border-info/25 bg-info-soft/60 px-3 py-2 text-[12px] leading-relaxed text-info-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>
            <strong className="font-semibold">Demo mode.</strong> Your file never leaves this browser — it isn&apos;t read, uploaded or stored. The processing steps below are simulated.
          </span>
        </p>

        {phase === "select" && (
          <>
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pick(e.dataTransfer.files[0]);
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-[14px] border-2 border-dashed px-4 py-8 text-center outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/30",
                dragging ? "border-brand bg-brand-soft/40" : "border-border-strong bg-surface-2/50 hover:border-brand/60",
              )}
            >
              <span className="grid size-12 place-items-center rounded-[14px] bg-surface text-brand shadow-sm">
                <UploadCloud className="size-6" />
              </span>
              <p className="text-[14px] font-semibold">Drop a PDF here or browse</p>
              <p className="text-[12px] text-muted-foreground">PDF, up to 50 MB · manuals, spec sheets, warranty terms, certificates</p>
              <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="sr-only" tabIndex={-1} onChange={(e) => pick(e.target.files?.[0])} />
            </div>

            {file && (
              <div className="flex items-center gap-3 rounded-[12px] border border-border bg-card p-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-danger-soft text-danger-foreground">
                  <FileUp className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{file.name}</p>
                  <p className="text-[12px] text-muted-foreground tabular">{formatSize(file.sizeKb)}</p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Remove file" onClick={() => setFile(null)}>
                  <X />
                </Button>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="upload-product">Product</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger id="upload-product">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="upload-kind">Document type</Label>
                <Select value={kind} onValueChange={(v) => setKind(v as ProductDocument["kind"])}>
                  <SelectTrigger id="upload-kind">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(DOC_KIND_META) as ProductDocument["kind"][]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {DOC_KIND_META[k].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {phase !== "select" && (
          <div className="space-y-4">
            <div className="rounded-[12px] border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-[13px] font-semibold">{file?.name}</p>
                <span className="text-[13px] font-semibold tabular">{progress}%</span>
              </div>
              <Progress value={progress} className="mt-2" indicatorClassName={phase === "done" ? "bg-success" : undefined} />
              <p className="mt-2 text-[12px] text-muted-foreground">
                {DOC_KIND_META[kind].label} for {product?.name}
              </p>
            </div>
            <ol className="space-y-2" aria-live="polite">
              {STAGES.map((s, i) => {
                const doneStage = phase === "done" || i < stage;
                const current = phase === "processing" && i === stage;
                return (
                  <li key={s} className={cn("flex items-center gap-2.5 text-[13px]", doneStage ? "text-foreground" : current ? "font-medium text-foreground" : "text-subtle-foreground")}>
                    <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", doneStage ? "bg-success-soft text-success" : current ? "bg-brand-soft text-brand-soft-foreground" : "bg-surface-2")}>
                      {doneStage ? <Check className="size-3.5" /> : current ? <Loader2 className="size-3.5 animate-spin" /> : <span className="size-1.5 rounded-full bg-border-strong" />}
                    </span>
                    {s}
                  </li>
                );
              })}
            </ol>
            {phase === "done" && (
              <p className="rounded-[10px] bg-success-soft/70 px-3 py-2 text-[12px] leading-relaxed text-success">
                Simulation complete. In the live product this document would appear in your list with status &ldquo;Processing&rdquo; until a reviewer confirms the extracted values.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {phase === "select" ? (
            <>
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button variant="brand" disabled={!file} onClick={() => setPhase("processing")}>
                <UploadCloud /> Process document
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" disabled={phase === "processing"} onClick={reset}>
                Add another
              </Button>
              <Button disabled={phase === "processing"} onClick={close}>
                Done
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
