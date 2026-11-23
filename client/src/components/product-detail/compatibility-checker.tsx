"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleHelp, Droplets, Eraser, Laptop, MapPin, Ruler, Save, X } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { checkCompatibility, overallFit, type CompatibilityCheck, type FitStatus, type SpaceInput } from "@/lib/compatibility";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/primitives";
import { MissingDataWarning } from "@/components/analysis/warnings";
import { ClaimTypeBadge, SourceCitation } from "@/components/analysis/badges";

/* ------------------------------------------------------------------ status */

export const FIT_META: Record<FitStatus, { label: string; icon: typeof Check; chip: string; banner: string; iconWrap: string }> = {
  fits: { label: "Fits", icon: Check, chip: "bg-success-soft text-success border-success/25", banner: "border-success/30 bg-success-soft/60", iconWrap: "bg-success text-white" },
  "no-fit": { label: "Does not fit", icon: X, chip: "bg-danger-soft text-danger-foreground border-danger/25", banner: "border-danger/30 bg-danger-soft/60", iconWrap: "bg-danger text-white" },
  unknown: { label: "Unknown", icon: CircleHelp, chip: "bg-surface-2 text-muted-foreground border-border-strong", banner: "border-border-strong bg-surface-2/70", iconWrap: "bg-surface-3 text-muted-foreground" },
};

export function FitStatusChip({ status, className }: { status: FitStatus; className?: string }) {
  const m = FIT_META[status];
  return (
    <span className={cn("inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-semibold", m.chip, className)}>
      <m.icon className="size-3.5" aria-hidden />
      {m.label}
    </span>
  );
}

/* ------------------------------------------------------------------ inputs */

type FieldKey = "widthMm" | "heightMm" | "depthMm" | "doorClearanceMm" | "accessWidthMm";
type Fields = Record<FieldKey, string> & { water: "yes" | "no" | "unknown" };

const EMPTY: Fields = { widthMm: "", heightMm: "", depthMm: "", doorClearanceMm: "", accessWidthMm: "", water: "unknown" };

function toNum(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function MmField({ id, label, hint, value, onChange }: { id: string; label: string; hint?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type="number" inputMode="numeric" min={0} step={1} placeholder="Not measured" value={value} onChange={(e) => onChange(e.target.value)} className="tabular pr-12" aria-describedby={hint ? `${id}-hint` : undefined} />
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-subtle-foreground">mm</span>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-[11px] leading-snug text-subtle-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- diagram */

function safeId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "");
}

interface DiagramProps {
  /** horizontal size of the appliance */
  a: number;
  /** vertical size of the appliance */
  b: number;
  /** available opening, null = not measured */
  openA: number | null;
  openB: number | null;
  /** ventilation per side on the horizontal axis (each side), and on the far vertical edge */
  ventSide: number | null;
  ventFar: number | null;
  /** clearance in front (top-down view only, drawn below the appliance) */
  front?: number | null;
  labelA: string;
  labelB: string;
  title: string;
  /** "front": appliance stands on the floor (bottom aligned). "top": wall at the top edge. */
  mode: "front" | "top";
  statusA: FitStatus;
  statusB: FitStatus;
}

function FitView({ a, b, openA, openB, ventSide, ventFar, front, labelA, labelB, title, mode, statusA, statusB }: DiagramProps) {
  const pid = safeId(useId());
  const vs = ventSide ?? 0;
  const vf = ventFar ?? 0;
  const fr = front ?? 0;
  const needA = a + vs * 2;
  const needB = b + vf;
  const hasOpening = openA !== null && openB !== null;
  const extA = Math.max(needA, openA ?? 0);
  const extB = Math.max(needB + fr, openB ?? 0);
  const pad = Math.max(extA, extB) * 0.16;
  const W = extA + pad * 2.2;
  const H = extB + pad * 2.2;
  const fs = Math.max(extA, extB) * 0.045;
  // origin: centre horizontally; for "front" the floor is at the bottom, for "top" the wall at the top
  const cx = W / 2;
  const baseY = mode === "front" ? H - pad * 1.1 : pad * 1.1;
  const appX = cx - a / 2;
  const appY = mode === "front" ? baseY - b : baseY + vf;
  const openX = openA !== null ? cx - openA / 2 : 0;
  const openY = mode === "front" ? baseY - (openB ?? 0) : baseY;
  const tone = (s: FitStatus) => (s === "no-fit" ? "fill-danger" : s === "fits" ? "fill-success" : "fill-muted-foreground");

  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 flex items-center justify-between gap-2 text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{title}</figcaption>
      <div className="rounded-[14px] border border-border bg-surface-2/50 p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto max-h-[300px] w-full" role="img" aria-label={`${title}: appliance ${labelA} by ${labelB}${hasOpening ? `, opening ${openA} by ${openB} mm` : ", opening not measured"}`}>
          <defs>
            <pattern id={`${pid}-hatch`} patternUnits="userSpaceOnUse" width={fs * 0.7} height={fs * 0.7} patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2={fs * 0.7} className="stroke-warning" strokeWidth={fs * 0.18} />
            </pattern>
          </defs>
          {/* floor / wall */}
          <line x1={pad * 0.4} x2={W - pad * 0.4} y1={baseY} y2={baseY} className="stroke-border-strong" strokeWidth={2} vectorEffect="non-scaling-stroke" />
          <text x={pad * 0.45} y={mode === "front" ? baseY + fs * 1.3 : baseY - fs * 0.5} fontSize={fs * 0.8} className="fill-subtle-foreground">
            {mode === "front" ? "Floor" : "Wall"}
          </text>
          {/* ventilation zones */}
          {ventSide !== null && vs > 0 && (
            <>
              <rect x={appX - vs} y={appY} width={vs} height={b} fill={`url(#${pid}-hatch)`} opacity={0.55} />
              <rect x={appX + a} y={appY} width={vs} height={b} fill={`url(#${pid}-hatch)`} opacity={0.55} />
            </>
          )}
          {ventFar !== null && vf > 0 && <rect x={appX - vs} y={mode === "front" ? appY - vf : baseY} width={needA} height={vf} fill={`url(#${pid}-hatch)`} opacity={0.55} />}
          {/* door swing / front clearance */}
          {mode === "top" && fr > 0 && (
            <rect x={appX} y={appY + b} width={a} height={fr} className="fill-info/10 stroke-info" strokeDasharray="4 4" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
          )}
          {mode === "top" && fr > 0 && (
            <text x={cx} y={appY + b + fr / 2 + fs * 0.35} textAnchor="middle" fontSize={fs * 0.8} className="fill-info">
              Door swing {fr} mm
            </text>
          )}
          {/* appliance */}
          <rect x={appX} y={appY} width={a} height={b} rx={Math.min(a, b) * 0.04} className="fill-brand/15 stroke-brand" strokeWidth={2} vectorEffect="non-scaling-stroke" />
          <text x={cx} y={appY + b / 2 + fs * 0.35} textAnchor="middle" fontSize={fs} fontWeight={600} className="fill-foreground">
            Appliance
          </text>
          {/* opening */}
          {hasOpening && (
            <rect x={openX} y={openY} width={openA!} height={openB!} className="fill-none stroke-foreground" strokeDasharray="7 5" strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
          )}
          {/* dimension labels */}
          <text x={cx} y={mode === "front" ? appY - vf - fs * 0.6 : appY + b + fr + fs * 1.4} textAnchor="middle" fontSize={fs * 0.95} fontWeight={600} className={tone(statusA)}>
            {labelA}
            {openA !== null ? ` / ${openA.toLocaleString("en-US")} available` : ""}
          </text>
          <text
            x={appX + a + vs + fs * 0.6}
            y={appY + b / 2}
            fontSize={fs * 0.95}
            fontWeight={600}
            className={tone(statusB)}
            textAnchor="start"
            transform={`rotate(90 ${appX + a + vs + fs * 0.6} ${appY + b / 2})`}
            dominantBaseline="hanging"
          >
            <tspan x={appX + a + vs + fs * 0.6} textAnchor="middle">
              {labelB}
              {openB !== null ? ` / ${openB.toLocaleString("en-US")}` : ""}
            </tspan>
          </text>
        </svg>
      </div>
    </figure>
  );
}

/** Front and top-down views of the appliance (solid), its ventilation (hatched) and the user's opening (dashed). */
export function FitDiagram({ product, space, checks }: { product: Product; space: SpaceInput; checks: CompatibilityCheck[] }) {
  const { widthMm: w, heightMm: h, depthMm: d } = product.dimensions;
  const vent = product.installation.ventilationMm;
  const st = (id: string): FitStatus => checks.find((c) => c.id === id)?.status ?? "unknown";
  const fmt = (v: number) => `${v.toLocaleString("en-US")} mm`;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FitView title="Front view" mode="front" a={w} b={h} openA={space.widthMm} openB={space.heightMm} ventSide={vent?.sides ?? null} ventFar={vent?.top ?? null} labelA={`W ${fmt(w)}`} labelB={`H ${fmt(h)}`} statusA={st("width")} statusB={st("height")} />
        <FitView title="Top-down view" mode="top" a={w} b={d} openA={space.widthMm} openB={space.depthMm} ventSide={vent?.sides ?? null} ventFar={vent?.back ?? null} front={product.installation.doorSwingMm} labelA={`W ${fmt(w)}`} labelB={`D ${fmt(d)}`} statusA={st("width")} statusB={st("depth")} />
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-muted-foreground">
        <li className="inline-flex items-center gap-1.5">
          <span className="h-3 w-4 rounded-[3px] border-2 border-brand bg-brand/15" aria-hidden /> Appliance
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="h-3 w-4 rounded-[3px] border-2 border-dashed border-foreground" aria-hidden /> Your opening
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="h-3 w-4 rounded-[3px] border border-warning/50 bg-[repeating-linear-gradient(45deg,var(--warning)_0_2px,transparent_2px_5px)] opacity-70" aria-hidden /> Ventilation {vent ? "clearance" : "(not published)"}
        </li>
        {product.installation.doorSwingMm !== null && (
          <li className="inline-flex items-center gap-1.5">
            <span className="h-3 w-4 rounded-[3px] border border-dashed border-info bg-info/10" aria-hidden /> Door swing
          </li>
        )}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ verdict */

function Verdict({ status, checks }: { status: FitStatus; checks: CompatibilityCheck[] }) {
  const m = FIT_META[status];
  const failing = checks.filter((c) => c.status === "no-fit");
  const unknown = checks.filter((c) => c.status === "unknown");
  const title = status === "fits" ? "Fits your space" : status === "no-fit" ? "Does not fit your space" : "Can't confirm fit yet";
  const body =
    status === "fits"
      ? "Every check passed, including published ventilation and door clearances. Re-measure on installation day — walls and floors are rarely perfectly square."
      : status === "no-fit"
        ? `${failing.map((c) => c.label.toLowerCase()).join(", ")} ${failing.length === 1 ? "fails" : "fail"} the check.${unknown.length ? ` ${unknown.length} other ${unknown.length === 1 ? "check is" : "checks are"} still unknown.` : ""}`
        : `${unknown.length} ${unknown.length === 1 ? "check is" : "checks are"} unknown — ${unknown.map((c) => c.label.toLowerCase()).join(", ")}. Unknown is never treated as a fit.`;
  return (
    <motion.div key={status} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} role="status" className={cn("flex items-start gap-4 rounded-[20px] border p-5 sm:p-6", m.banner)}>
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-[12px]", m.iconWrap)}>
        <m.icon className="size-5" />
      </span>
      <div className="min-w-0 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Overall verdict</p>
        <h2 className="text-[20px] font-semibold leading-tight">{title}</h2>
        <p className="text-[14px] leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------- main widget */

export function CompatibilityChecker({ product }: { product: Product }) {
  const uid = useId();
  const hydrated = useHydrated();
  const prefSpace = useAppStore((s) => s.preferences.space);
  const setPreferences = useAppStore((s) => s.setPreferences);
  const [edited, setEdited] = useState<Fields | null>(null);

  // Prefill from saved preferences once hydrated; after the first edit the local state wins.
  const prefilled: Fields =
    hydrated && prefSpace ? { ...EMPTY, widthMm: String(prefSpace.widthMm), heightMm: String(prefSpace.heightMm), depthMm: String(prefSpace.depthMm) } : EMPTY;
  const fields = edited ?? prefilled;
  const set = (patch: Partial<Fields>) => setEdited({ ...fields, ...patch });

  const space: SpaceInput = {
    widthMm: toNum(fields.widthMm),
    heightMm: toNum(fields.heightMm),
    depthMm: toNum(fields.depthMm),
    doorClearanceMm: toNum(fields.doorClearanceMm),
    accessWidthMm: toNum(fields.accessWidthMm),
    hasWaterSupply: fields.water === "unknown" ? null : fields.water === "yes",
  };
  const checks = checkCompatibility(product, space);
  const overall = overallFit(checks);
  const vent = product.installation.ventilationMm;
  const needsWater = product.features.some((f) => /ice maker|dispenser/i.test(f));
  const { widthMm: w, heightMm: h, depthMm: d, weightKg } = product.dimensions;
  const anyInput = Object.values(space).some((v) => v !== null);
  const canSave = space.widthMm !== null && space.heightMm !== null && space.depthMm !== null;

  const saveSpace = () => {
    if (!canSave) return;
    setPreferences({ space: { widthMm: space.widthMm!, heightMm: space.heightMm!, depthMm: space.depthMm! } });
    toast.success("Saved as your space", { description: "Stored in this browser for the demo. Catalogue filters and recommendations can now use it." });
  };

  if (product.category === "laptops")
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="flex items-start gap-4 rounded-[20px] border border-border bg-card p-5 shadow-xs sm:p-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-brand-soft text-brand-soft-foreground">
            <Laptop className="size-5" />
          </span>
          <div className="space-y-2">
            <h2 className="text-[18px] font-semibold">Installation checks don&apos;t apply to laptops</h2>
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              There is no opening, ventilation gap or water connection to verify. What matters is whether it fits your bag and desk — compare the footprint below with your laptop sleeve or bag compartment, and keep the vents unobstructed on soft surfaces.
            </p>
            <ul className="space-y-1 pt-1 text-[13px] text-muted-foreground">
              {product.installation.notes.map((n) => (
                <li key={n} className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-brand" /> {n}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <DimensionsCard product={product} rows={[["Width", `${w} mm`], ["Depth", `${d} mm`], ["Thickness", `${h} mm`], ["Weight", `${weightKg} kg`]]} />
      </div>
    );

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
      {/* ------------------------------------------------------------ inputs */}
      <section aria-labelledby={`${uid}-in`} className="h-fit space-y-5 rounded-[20px] border border-border bg-card p-5 shadow-xs sm:p-6 lg:sticky lg:top-24">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-[10px] bg-brand-soft text-brand-soft-foreground">
              <Ruler className="size-[18px]" />
            </span>
            <div>
              <h2 id={`${uid}-in`} className="text-[16px] font-semibold">Your space</h2>
              <p className="text-[12px] text-muted-foreground">Leave blank anything you haven&apos;t measured.</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-9" onClick={() => setEdited(EMPTY)} disabled={!anyInput}>
            <Eraser /> Clear
          </Button>
        </div>

        <fieldset className="space-y-4">
          <legend className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">Available opening</legend>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 xl:grid-cols-3">
            <MmField id={`${uid}-w`} label="Width" value={fields.widthMm} onChange={(v) => set({ widthMm: v })} />
            <MmField id={`${uid}-h`} label="Height" value={fields.heightMm} onChange={(v) => set({ heightMm: v })} />
            <MmField id={`${uid}-d`} label="Depth" value={fields.depthMm} onChange={(v) => set({ depthMm: v })} />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">Access & clearance</legend>
          {product.installation.doorSwingMm !== null && <MmField id={`${uid}-door`} label="Door clearance" hint="Free floor space in front of the opening." value={fields.doorClearanceMm} onChange={(v) => set({ doorClearanceMm: v })} />}
          <MmField id={`${uid}-acc`} label="Narrowest access width" hint="Doorway, hallway or stair turn on the delivery route." value={fields.accessWidthMm} onChange={(v) => set({ accessWidthMm: v })} />
        </fieldset>

        <div className="space-y-2">
          <p id={`${uid}-water`} className="flex items-center gap-1.5 text-[13px] font-medium">
            <Droplets className="size-4 text-info" /> Water supply nearby
          </p>
          <div role="radiogroup" aria-labelledby={`${uid}-water`} className="grid grid-cols-3 gap-1 rounded-[12px] bg-surface-2 p-1">
            {(["yes", "no", "unknown"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={fields.water === v}
                onClick={() => set({ water: v })}
                className={cn("h-10 rounded-[9px] text-[13px] font-medium capitalize text-muted-foreground transition-colors hover:text-foreground", fields.water === v && "bg-surface text-foreground shadow-sm")}
              >
                {v === "unknown" ? "Not sure" : v}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-subtle-foreground">{needsWater ? "Required — this model has a plumbed ice maker or dispenser." : "Not required for this model."}</p>
        </div>

        <Button variant="outline" className="h-11 w-full" onClick={saveSpace} disabled={!canSave}>
          <Save /> Save as my space
        </Button>
        {!canSave && <p className="-mt-3 text-center text-[11px] text-subtle-foreground">Enter width, height and depth to save.</p>}
      </section>

      {/* ----------------------------------------------------------- results */}
      <div className="min-w-0 space-y-6">
        <Verdict status={overall} checks={checks} />

        <section className="rounded-[20px] border border-border bg-card p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-semibold tracking-tight">Fit diagram</h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{anyInput ? "Drawn to scale from your measurements and the published dimensions." : "Enter your measurements to overlay your opening on the appliance."}</p>
            </div>
          </div>
          <FitDiagram product={product} space={space} checks={checks} />
        </section>

        <section className="rounded-[20px] border border-border bg-card p-5 shadow-xs sm:p-6">
          <h2 className="mb-1 text-[18px] font-semibold tracking-tight">Checks</h2>
          <p className="mb-4 text-[13px] text-muted-foreground">Each check compares what the appliance needs with what you have.</p>
          <ul className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {checks.map((c) => (
                <motion.li key={c.id} layout className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold">{c.label}</span>
                      <FitStatusChip status={c.status} className="sm:hidden" />
                    </div>
                    <dl className="flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
                      <div className="flex gap-1.5">
                        <dt className="text-muted-foreground">Needs</dt>
                        <dd className="tabular font-medium">{c.required}</dd>
                      </div>
                      <div className="flex gap-1.5">
                        <dt className="text-muted-foreground">You have</dt>
                        <dd className={cn("tabular font-medium", c.available === "Not provided" && "text-subtle-foreground")}>{c.available}</dd>
                      </div>
                    </dl>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">{c.detail}</p>
                  </div>
                  <FitStatusChip status={c.status} className="hidden self-start sm:inline-flex" />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <DimensionsCard
            product={product}
            rows={[
              ["Width", `${w} mm`],
              ["Height", `${h} mm`],
              ["Depth", `${d} mm`],
              ["Weight", `${weightKg} kg`],
              ...(product.installation.doorSwingMm !== null ? ([["Door swing clearance", `${product.installation.doorSwingMm} mm`]] as [string, string][]) : []),
            ]}
          />
          <section className="space-y-4 rounded-[20px] border border-border bg-card p-5 shadow-xs sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[16px] font-semibold">Ventilation & installation</h2>
              <SourceCitation sourceId={`${product.id}:manual`} />
            </div>
            {vent ? (
              <dl className="grid grid-cols-3 gap-2">
                {[
                  ["Each side", vent.sides],
                  ["Above", vent.top],
                  ["Behind", vent.back],
                ].map(([label, v]) => (
                  <div key={label} className="rounded-[12px] bg-surface-2 px-3 py-2.5">
                    <dt className="text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">{label}</dt>
                    <dd className="tabular text-[17px] font-semibold">{v} mm</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <MissingDataWarning
                title="Ventilation clearance not published"
                detail="The manufacturer has not published minimum ventilation gaps, so width, height and depth checks stay unknown even when the cabinet itself fits. Allow at least 25 mm on all sides until confirmed."
                sourceIds={[`${product.id}:manual`]}
              />
            )}
            <ul className="space-y-2">
              {product.installation.notes.map((n) => (
                <li key={n} className="flex gap-2 text-[13px] leading-relaxed text-muted-foreground">
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-brand" /> {n}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 border-t border-border pt-3">
              <ClaimTypeBadge type="manufacturer" size="xs" />
              <span className="text-[12px] text-muted-foreground">Installation requirements as published in the owner&apos;s manual.</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DimensionsCard({ product, rows }: { product: Product; rows: [string, string][] }) {
  return (
    <section className="h-fit rounded-[20px] border border-border bg-card p-5 shadow-xs sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[16px] font-semibold">Product dimensions</h2>
        <SourceCitation sourceId={`${product.id}:spec`} />
      </div>
      <dl className="divide-y divide-border">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 py-2.5 text-[14px]">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="tabular font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex items-center gap-2">
        <ClaimTypeBadge type="manufacturer" size="xs" />
        <span className="text-[12px] text-muted-foreground">Published by {product.name.split(" ")[0]}; excludes handles unless stated.</span>
      </div>
    </section>
  );
}
