"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, FileText, Film, ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { cn, hash } from "@/lib/utils";
import { Progress } from "@/components/ui/primitives";
import { formatBytes } from "./format";

/* ----------------------------------------------------------------- Dropzone */

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  return accept
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .some((a) => (a.startsWith(".") ? name.endsWith(a) : a.endsWith("/*") ? file.type.startsWith(a.slice(0, -1)) : file.type === a));
}

/**
 * Drag-and-drop + click-to-browse file picker. Files never leave the browser —
 * callers keep them in local state for preview only.
 */
export function UploadDropzone({
  onFiles,
  accept,
  multiple = true,
  maxSizeMb = 50,
  title = "Drag & drop files here",
  hint,
  icon: Icon = UploadCloud,
  compact,
  className,
  disabled,
  id,
  children,
}: {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  title?: string;
  hint?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  compact?: boolean;
  className?: string;
  disabled?: boolean;
  id?: string;
  children?: React.ReactNode;
}) {
  const autoId = useId();
  const inputId = id ?? `upload-${autoId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);

  const accept_ = useCallback(
    (list: FileList | File[] | null) => {
      if (!list) return;
      const files = Array.from(list);
      const ok: File[] = [];
      for (const f of files) {
        if (!matchesAccept(f, accept)) toast.error(`${f.name} isn't a supported file type`, { description: `Accepted: ${accept}` });
        else if (f.size > maxSizeMb * 1024 * 1024) toast.error(`${f.name} is larger than ${maxSizeMb} MB`);
        else ok.push(f);
      }
      if (ok.length) onFiles(multiple ? ok : ok.slice(0, 1));
    },
    [accept, maxSizeMb, multiple, onFiles],
  );

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        if (disabled) return;
        depth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        e.preventDefault();
        depth.current -= 1;
        if (depth.current <= 0) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        depth.current = 0;
        setDragging(false);
        if (!disabled) accept_(e.dataTransfer.files);
      }}
      data-dragging={dragging || undefined}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-3 rounded-[14px] border-[1.5px] border-dashed border-border-strong bg-surface-2/40 text-center transition-colors",
        compact ? "px-4 py-5 sm:flex-row sm:text-left" : "px-6 py-9",
        dragging && "border-brand bg-brand-soft/40",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <span className={cn("grid shrink-0 place-items-center rounded-[12px] border border-border bg-surface text-brand shadow-xs transition-transform", compact ? "size-10" : "size-12", dragging && "scale-110")}>
        <Icon className={compact ? "size-5" : "size-6"} />
      </span>
      <div className={cn("min-w-0 space-y-1", compact && "sm:flex-1")}>
        <p className="text-[14px] font-semibold">{dragging ? "Drop to add" : title}</p>
        <p className="text-[12.5px] text-muted-foreground">
          or{" "}
          <label htmlFor={inputId} className="cursor-pointer font-medium text-brand-soft-foreground underline-offset-2 hover:underline">
            browse your computer
          </label>
          {hint ? <span className="block pt-0.5 text-subtle-foreground">{hint}</span> : null}
        </p>
      </div>
      {children}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          accept_(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------ Upload queue */

export type UploadStatus = "uploading" | "processing" | "done";

export interface UploadItem<M = Record<string, string>> {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  progress: number;
  status: UploadStatus;
  /** Ticks spent in "processing" */
  phase: number;
  meta: M;
}

const PROCESS_TICKS = 7;

/**
 * Local upload queue with a deterministic, simulated upload → processing → done lifecycle.
 * Nothing is sent anywhere; image/video files get an object-URL preview.
 */
export function useUploadQueue<M = Record<string, string>>({ processing = true, tickMs = 180 }: { processing?: boolean; tickMs?: number } = {}) {
  const [items, setItems] = useState<UploadItem<M>[]>([]);
  const urls = useRef<string[]>([]);
  const seq = useRef(0);
  const active = items.some((i) => i.status !== "done");

  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => {
      setItems((prev) =>
        prev.map((it) => {
          if (it.status === "uploading") {
            const step = 8 + (hash(it.id) % 10);
            const progress = Math.min(100, it.progress + step);
            return progress >= 100 ? { ...it, progress: 100, status: processing ? "processing" : "done" } : { ...it, progress };
          }
          if (it.status === "processing") {
            const phase = it.phase + 1;
            return phase >= PROCESS_TICKS ? { ...it, phase, status: "done" } : { ...it, phase };
          }
          return it;
        }),
      );
    }, tickMs);
    return () => window.clearInterval(t);
  }, [active, processing, tickMs]);

  useEffect(() => {
    const list = urls.current;
    return () => list.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const add = useCallback((files: File[], meta: (f: File) => M) => {
    const next = files.map((f) => {
      seq.current += 1;
      const previewable = f.type.startsWith("image/") || f.type.startsWith("video/");
      const previewUrl = previewable ? URL.createObjectURL(f) : undefined;
      if (previewUrl) urls.current.push(previewUrl);
      return { id: `up-${seq.current}-${f.name}`, name: f.name, size: f.size, type: f.type, previewUrl, progress: 0, status: "uploading" as const, phase: 0, meta: meta(f) };
    });
    setItems((prev) => [...next, ...prev]);
    return next;
  }, []);

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const update = useCallback((id: string, patch: Partial<UploadItem<M>>) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i))), []);
  const clear = useCallback(() => setItems([]), []);

  return { items, add, remove, update, clear, busy: active };
}

export function fileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.startsWith("video/")) return Film;
  return FileText;
}

/** One row in an upload list with progress and status. */
export function UploadRow({
  item,
  onRemove,
  processingLabel = "Extracting data…",
  doneLabel = "Ready",
  children,
  className,
}: {
  item: UploadItem<unknown>;
  onRemove?: () => void;
  processingLabel?: string;
  doneLabel?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const Icon = fileIcon(item.type);
  const pct = item.status === "uploading" ? item.progress : item.status === "processing" ? Math.round((item.phase / PROCESS_TICKS) * 100) : 100;
  return (
    <div className={cn("flex gap-3 rounded-[12px] border border-border bg-surface p-3", className)}>
      {item.previewUrl && item.type.startsWith("image/") ? (
        // eslint-disable-next-line @next/next/no-img-element -- local object-URL preview
        <img src={item.previewUrl} alt="" className="size-11 shrink-0 rounded-[9px] border border-border object-cover" />
      ) : (
        <span className="grid size-11 shrink-0 place-items-center rounded-[9px] bg-surface-2 text-muted-foreground">
          <Icon className="size-5" />
        </span>
      )}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-medium">{item.name}</p>
            <p className="text-[12px] text-muted-foreground tabular">
              {formatBytes(item.size)} ·{" "}
              {item.status === "uploading" ? (
                <span>Uploading {item.progress}%</span>
              ) : item.status === "processing" ? (
                <span className="inline-flex items-center gap-1 text-info-foreground">
                  <Loader2 className="size-3 animate-spin" /> {processingLabel}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-success">
                  <CheckCircle2 className="size-3" /> {doneLabel}
                </span>
              )}
            </p>
          </div>
          {onRemove && (
            <button type="button" onClick={onRemove} aria-label={`Remove ${item.name}`} className="grid size-8 shrink-0 place-items-center rounded-[8px] text-muted-foreground hover:bg-surface-2 hover:text-foreground">
              <X className="size-4" />
            </button>
          )}
        </div>
        {item.status !== "done" && <Progress value={pct} className="h-1.5" indicatorClassName={item.status === "processing" ? "bg-info" : undefined} aria-label={`${item.name} progress`} />}
        {children}
      </div>
    </div>
  );
}
