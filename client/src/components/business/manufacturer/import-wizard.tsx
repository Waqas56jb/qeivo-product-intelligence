"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Copy, Download, FileSpreadsheet, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { products } from "@/data/products";
import { importHistory } from "@/data/imports/import-history";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Panel, Stepper } from "../primitives";
import { UploadDropzone } from "../upload";

const FIELDS = [
  { key: "modelNumber", label: "Model number", required: true },
  { key: "model", label: "Model name", required: true },
  { key: "category", label: "Category", required: true },
  { key: "price", label: "Price (USD)", required: true },
  { key: "width", label: "Width (mm)", required: true },
  { key: "height", label: "Height (mm)", required: true },
  { key: "depth", label: "Depth (mm)", required: true },
  { key: "capacity", label: "Capacity", required: false },
  { key: "energy", label: "Energy class", required: false },
] as const;
type FieldKey = (typeof FIELDS)[number]["key"];

const SAMPLE = `model_number,name,category,rrp_usd,width_mm,height_mm,depth_mm,capacity,energy_class
NV-FD700SS,Frostline FD700,refrigerators,2899,912,1790,735,688,D
NV-FD600SS,Frostline FD600,refrigerators,2449,908,1780,730,603,D
NV-BF420W,Ellipse BF420,refrigerators,1299,700,2010,690,421,B
NV-C450IX,Column C450,refrigerators,,600,1940,650,446,A
NV-SW9W,SilkWash W9,washing-machines,829,599,850,600,9,A
NV-SB650SS,Frostline SBS650,refrigerators,2149,910,1790,,652,E
NV-BF380W,Ellipse BF380,refrigerators,1199,700,2010,680,382,B
NV-TF300W,Studio TF300,fridges,749,600,1720,640,301,H
NV-FD700SS,Frostline FD700,refrigerators,2899,912,1790,735,688,D`;

function parseCsv(text: string): string[][] {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(",").map((c) => c.trim()));
}

interface RowIssue {
  level: "error" | "warning";
  message: string;
}

export function ImportWizard() {
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<FieldKey, number>>({} as Record<FieldKey, number>);
  const [done, setDone] = useState(false);

  const header = rows[0] ?? [];
  const data = rows.slice(1);

  const load = (name: string, text: string) => {
    const parsed = parseCsv(text);
    setFileName(name);
    setRows(parsed);
    const guess = {} as Record<FieldKey, number>;
    const aliases: Record<FieldKey, RegExp> = { modelNumber: /model.?num|sku/i, model: /^name|model.?name/i, category: /categ/i, price: /price|rrp/i, width: /width/i, height: /height/i, depth: /depth/i, capacity: /capac/i, energy: /energy/i };
    FIELDS.forEach((f) => {
      const idx = parsed[0].findIndex((h) => aliases[f.key].test(h));
      if (idx >= 0) guess[f.key] = idx;
    });
    setMapping(guess);
    setStep(1);
    setDone(false);
  };

  const validation = useMemo(() => {
    const existing = new Set(products.map((p) => p.modelNumber));
    const seen = new Map<string, number>();
    return data.map((r, i) => {
      const issues: RowIssue[] = [];
      const get = (k: FieldKey) => (mapping[k] !== undefined ? (r[mapping[k]] ?? "") : "");
      FIELDS.filter((f) => f.required).forEach((f) => {
        if (!get(f.key)) issues.push({ level: "error", message: `${f.label} is missing` });
      });
      const cat = get("category");
      if (cat && !["refrigerators", "washing-machines", "televisions", "laptops"].includes(cat)) issues.push({ level: "error", message: `Unknown category “${cat}”` });
      const energy = get("energy");
      if (energy && !/^[A-G]$/.test(energy)) issues.push({ level: "error", message: `Energy class “${energy}” is not A–G` });
      ["price", "width", "height", "depth"].forEach((k) => {
        const v = get(k as FieldKey);
        if (v && Number.isNaN(Number(v))) issues.push({ level: "error", message: `${k} must be a number` });
      });
      const mn = get("modelNumber");
      if (mn && seen.has(mn)) issues.push({ level: "error", message: `Duplicate of row ${(seen.get(mn) ?? 0) + 2} in this file` });
      else if (mn) seen.set(mn, i);
      if (mn && existing.has(mn)) issues.push({ level: "warning", message: "Already on Qeivo — will update the existing product" });
      return { row: r, issues, status: issues.some((x) => x.level === "error") ? "error" : issues.length ? "warning" : "ok" } as const;
    });
  }, [data, mapping]);

  const counts = { ok: validation.filter((v) => v.status === "ok").length, warning: validation.filter((v) => v.status === "warning").length, error: validation.filter((v) => v.status === "error").length };
  const requiredMapped = FIELDS.filter((f) => f.required).every((f) => mapping[f.key] !== undefined);

  const downloadSample = () => {
    const blob = new Blob([SAMPLE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qeivo-product-import-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader
        title="Bulk CSV import"
        description="Upload a spreadsheet of products, map the columns, fix validation issues and import. Imported data is verified before publication."
        actions={
          <Button variant="outline" onClick={downloadSample}>
            <Download /> Sample CSV
          </Button>
        }
      />
      <Stepper steps={["Upload", "Map columns", "Validate", "Summary"]} current={step} />

      {step === 0 && (
        <Panel>
          <UploadDropzone
            accept=".csv,text/csv"
            multiple={false}
            title="Drop a CSV file here"
            hint="UTF-8, comma separated, first row as headers"
            icon={FileSpreadsheet}
            onFiles={async (files) => {
              const f = files[0];
              if (!f) return;
              load(f.name, await f.text());
            }}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="subtle" onClick={() => load("qeivo-product-import-sample.csv", SAMPLE)}>
              Use the sample file
            </Button>
            <span className="text-[13px] text-muted-foreground">The sample deliberately contains errors, a duplicate and existing models so you can see validation in action.</span>
          </div>
        </Panel>
      )}

      {step === 1 && (
        <Panel title="Map columns" description={`${fileName} · ${data.length} rows · ${header.length} columns`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <p className="text-[13px] font-medium">
                  {f.label} {f.required && <span className="text-danger">*</span>}
                </p>
                <Select value={mapping[f.key] !== undefined ? String(mapping[f.key]) : "none"} onValueChange={(v) => setMapping((m) => { const next = { ...m }; if (v === "none") delete next[f.key]; else next[f.key] = Number(v); return next; })}>
                  <SelectTrigger aria-label={`Column for ${f.label}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Not mapped —</SelectItem>
                    {header.map((h, i) => (
                      <SelectItem key={h + i} value={String(i)}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between gap-2">
            <Button variant="outline" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button disabled={!requiredMapped} onClick={() => setStep(2)}>
              Validate {data.length} rows
            </Button>
          </div>
        </Panel>
      )}

      {step === 2 && (
        <Panel title="Validation preview" description="Rows with errors will be skipped. Warnings will import." flush>
          <div className="flex flex-wrap gap-2 px-5 pb-4">
            <Badge variant="success">
              <CheckCircle2 /> {counts.ok} ready
            </Badge>
            <Badge variant="warning">
              <AlertTriangle /> {counts.warning} warnings
            </Badge>
            <Badge variant="danger">
              <XCircle /> {counts.error} errors
            </Badge>
            <Badge variant="info">
              <Copy /> {validation.filter((v) => v.issues.some((i) => i.message.startsWith("Duplicate"))).length} duplicates
            </Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Row</TableHead>
                <TableHead>Model number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validation.map((v, i) => (
                <TableRow key={i} className={cn(v.status === "error" && "bg-danger-soft/30")}>
                  <TableCell className="tabular">{i + 2}</TableCell>
                  <TableCell className="font-mono text-[13px]">{v.row[mapping.modelNumber] || "—"}</TableCell>
                  <TableCell>{v.row[mapping.model] || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={v.status === "ok" ? "success" : v.status === "warning" ? "warning" : "danger"}>{v.status === "ok" ? "Ready" : v.status === "warning" ? "Warning" : "Error"}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-normal text-[13px] text-muted-foreground">{v.issues.map((x) => x.message).join(" · ") || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between gap-2 p-5">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back to mapping
            </Button>
            <Button
              disabled={counts.ok + counts.warning === 0}
              onClick={() => {
                setStep(3);
                setDone(true);
                toast.success("Import queued for verification (demo)", { description: `${counts.ok + counts.warning} rows accepted, ${counts.error} skipped.` });
              }}
            >
              Import {counts.ok + counts.warning} rows
            </Button>
          </div>
        </Panel>
      )}

      {step === 3 && done && (
        <Panel>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="size-7" />
            </span>
            <h2 className="text-[20px] font-semibold">Import summary</h2>
            <p className="max-w-md text-[14px] text-muted-foreground">Demo only — no data was changed. In production, accepted rows enter the verification queue before going live.</p>
            <div className="mt-2 grid w-full max-w-lg grid-cols-3 gap-3">
              {[
                { label: "New products", value: validation.filter((v) => v.status === "ok").length },
                { label: "Updates", value: counts.warning },
                { label: "Skipped", value: counts.error },
              ].map((s) => (
                <div key={s.label} className="rounded-[14px] border border-border p-3">
                  <p className="tabular text-[24px] font-semibold">{s.value}</p>
                  <p className="text-[12px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-3" onClick={() => { setStep(0); setRows([]); setDone(false); }}>
              <RotateCcw /> Start another import
            </Button>
          </div>
        </Panel>
      )}

      <Panel title="Import history" flush>
        <ul className="divide-y divide-border">
          {importHistory.slice(0, 6).map((h) => (
            <li key={h.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-[13px]">
              <FileSpreadsheet className="size-4 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-medium">{h.name}</span>
              <span className="text-muted-foreground">{formatDate(h.date)}</span>
              <span className="tabular text-muted-foreground">
                {h.created} new · {h.updated} updated · {h.failed} failed
              </span>
              <Badge variant={h.status === "completed" ? "success" : h.status === "partial" ? "warning" : "danger"}>{h.status}</Badge>
            </li>
          ))}
        </ul>
      </Panel>
    </PageContainer>
  );
}
