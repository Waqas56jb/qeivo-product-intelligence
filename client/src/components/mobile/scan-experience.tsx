"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Barcode as BarcodeIcon, Camera, Clock, Keyboard, Lock, PackageCheck, ScanSearch, Trash2 } from "lucide-react";
import type { Product } from "@/types";
import { getProduct, products } from "@/data/products";
import { routes } from "@/config/routes";
import { formatRelative } from "@/lib/format";
import { cn, DEMO_NOW, hash } from "@/lib/utils";
import { rehydrateChatStore, useChatHydrated, useChatStore } from "@/store/chat-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/primitives";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { ScorePill } from "@/components/analysis/score";
import { HideCompareTray } from "./hide-compare-tray";
import { validateEan13 } from "./barcode";
import { ScanMatchCard, ScanNotFoundCard } from "./scan-result-card";
import { ScanViewfinder, type ScanPhase } from "./scan-viewfinder";

const SAMPLE_IDS = ["p-nordvik-frostline-fd600", "p-halden-pureclean-w9", "p-lumora-vivid-oled65", "p-tervo-air-14"];
/** Valid EAN-13 that isn't in the catalogue — demonstrates the not-found state. */
const UNKNOWN_SAMPLE = "5012345678900";
const SCAN_MS = 1600;

const byBarcode = new Map(products.map((p) => [p.barcode, p]));

export function ScanExperience() {
  const samples = SAMPLE_IDS.map((id) => getProduct(id)).filter((p): p is Product => Boolean(p));
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [code, setCode] = useState<string | null>(null);
  const [method, setMethod] = useState<"camera" | "manual">("camera");
  const [manual, setManual] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const resultRefDesk = useRef<HTMLDivElement>(null);
  const hydrated = useChatHydrated();
  const recent = useChatStore((s) => s.recentScans);
  const addScan = useChatStore((s) => s.addScan);
  const clearScans = useChatStore((s) => s.clearScans);

  useEffect(() => {
    rehydrateChatStore();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const found = code ? byBarcode.get(code) : undefined;

  const start = (c: string, how: "camera" | "manual") => {
    if (phase === "scanning") return;
    if (timer.current) clearTimeout(timer.current);
    setError(null);
    setCode(c);
    setMethod(how);
    setPhase("scanning");
    timer.current = setTimeout(() => {
      const p = byBarcode.get(c);
      setPhase(p ? "found" : "not-found");
      addScan(c, p?.id ?? null, DEMO_NOW.toISOString());
      requestAnimationFrame(() => {
        const el = [resultRef.current, resultRefDesk.current].find((x) => x && x.offsetParent !== null);
        el?.focus({ preventScroll: true });
        el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }, SCAN_MS);
  };

  const tapViewfinder = () => {
    const sample = samples[rotation % samples.length];
    setRotation((r) => r + 1);
    if (sample) start(sample.barcode, "camera");
  };

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const c = manual.replace(/\s/g, "");
    const v = validateEan13(c);
    if (!v.ok) {
      setError(v.reason);
      return;
    }
    start(c, "manual");
  };

  const reset = () => {
    setPhase("idle");
    setCode(null);
    setManual("");
    setError(null);
  };

  const confidence = code ? (method === "manual" ? 100 : 96 + (hash(code) % 38) / 10) : 0;

  const result =
    phase === "found" && found && code ? (
      <ScanMatchCard product={found} code={code} confidence={confidence} method={method} onReset={reset} />
    ) : phase === "not-found" && code ? (
      <ScanNotFoundCard code={code} onReset={reset} />
    ) : null;

  const manualForm = (k: string) => (
    <form onSubmit={submitManual} noValidate className="space-y-2">
      <Label htmlFor={`${k}-ean-input`} className="inline-flex items-center gap-1.5">
        <Keyboard className="size-4 text-muted-foreground" /> Enter barcode number
      </Label>
      <div className="flex gap-2">
        <Input
          id={`${k}-ean-input`}
          inputMode="numeric"
          autoComplete="off"
          placeholder="13 digits, e.g. 5012345678900"
          value={manual}
          maxLength={16}
          onChange={(e) => {
            setManual(e.target.value.replace(/[^\d\s]/g, ""));
            if (error) setError(null);
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={`${k}-ean-help`}
          className="tabular tracking-wider"
        />
        <Button type="submit" className="h-11 shrink-0 sm:h-10" disabled={phase === "scanning"}>
          Look up
        </Button>
      </div>
      <p id={`${k}-ean-help`} role={error ? "alert" : undefined} className={cn("text-[12px]", error ? "text-danger-foreground" : "text-subtle-foreground")}>
        {error ?? `${manual.replace(/\s/g, "").length}/13 digits · the check digit is verified before lookup`}
      </p>
    </form>
  );

  const sampleChips = (
    <div>
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">Try a sample barcode</p>
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {samples.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={phase === "scanning"}
            onClick={() => {
              setManual(p.barcode);
              start(p.barcode, "camera");
            }}
            className="flex min-h-12 shrink-0 items-center gap-2 rounded-[12px] border border-border bg-surface py-1.5 pl-1.5 pr-3 text-left transition-colors hover:border-brand/50 disabled:opacity-50"
          >
            <ImageWithFallback src={p.images[0]} alt="" aspect="size-9 rounded-[8px] bg-surface-2" sizes="36px" className="p-0.5" shimmer={false} />
            <span>
              <span className="block text-[12.5px] font-medium leading-tight">{p.model}</span>
              <span className="block text-[11px] text-muted-foreground tabular">{p.barcode}</span>
            </span>
          </button>
        ))}
        <button
          type="button"
          disabled={phase === "scanning"}
          onClick={() => {
            setManual(UNKNOWN_SAMPLE);
            start(UNKNOWN_SAMPLE, "manual");
          }}
          className="flex min-h-12 shrink-0 items-center gap-2 rounded-[12px] border border-dashed border-border-strong bg-surface py-1.5 pl-1.5 pr-3 text-left transition-colors hover:border-warning/60 disabled:opacity-50"
        >
          <span className="grid size-9 place-items-center rounded-[8px] bg-surface-2 text-muted-foreground">
            <BarcodeIcon className="size-4" />
          </span>
          <span>
            <span className="block text-[12.5px] font-medium leading-tight">Unlisted product</span>
            <span className="block text-[11px] text-muted-foreground tabular">{UNKNOWN_SAMPLE}</span>
          </span>
        </button>
      </div>
    </div>
  );

  const recentList = (k: string) => (
    <section aria-labelledby={`${k}-recent-scans`}>
      <div className="mb-2 flex items-center justify-between">
        <h2 id={`${k}-recent-scans`} className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">
          <Clock className="size-3.5" /> Recent scans
        </h2>
        {hydrated && recent.length > 0 && (
          <button type="button" onClick={clearScans} className="inline-flex min-h-11 items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground sm:min-h-0">
            <Trash2 className="size-3.5" /> Clear
          </button>
        )}
      </div>
      {hydrated && recent.length ? (
        <ul className="divide-y divide-border rounded-[16px] border border-border bg-card">
          {recent.map((s) => {
            const p = s.productId ? getProduct(s.productId) : undefined;
            return (
              <li key={s.code}>
                {p ? (
                  <Link href={routes.product(p.slug)} className="flex min-h-14 items-center gap-3 p-2.5 transition-colors hover:bg-surface-2/60">
                    <ImageWithFallback src={p.images[0]} alt="" aspect="size-10 shrink-0 rounded-[9px] bg-surface-2" sizes="40px" className="p-0.5" shimmer={false} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium">{p.name}</span>
                      <span className="block text-[11px] text-muted-foreground tabular">
                        {s.code} · {formatRelative(s.at)}
                      </span>
                    </span>
                    <ScorePill score={p.suitabilityScore} />
                  </Link>
                ) : (
                  <button type="button" onClick={() => start(s.code, "manual")} className="flex min-h-14 w-full items-center gap-3 p-2.5 text-left transition-colors hover:bg-surface-2/60">
                    <span className="grid size-10 shrink-0 place-items-center rounded-[9px] bg-surface-2 text-muted-foreground">
                      <BarcodeIcon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-medium">Not in catalogue</span>
                      <span className="block text-[11px] text-muted-foreground tabular">
                        {s.code} · {formatRelative(s.at)}
                      </span>
                    </span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-[16px] border border-dashed border-border-strong p-4 text-center text-[13px] text-muted-foreground">Your scans appear here, stored only in this browser.</p>
      )}
    </section>
  );

  const viewfinder = <ScanViewfinder phase={phase} code={code} onTap={tapViewfinder} className="h-full w-full" />;

  return (
    <>
      <HideCompareTray scope="mobile" />
      <div aria-live="polite" className="sr-only">
        {phase === "scanning" ? "Scanning barcode" : phase === "found" && found ? `Identified ${found.name}` : phase === "not-found" ? "Barcode not found in the catalogue" : ""}
      </div>

      {/* ------------------------------------------------ Mobile: native-app layout */}
      <div className="lg:hidden">
        <div className="-mx-4 -mt-5 h-[min(56dvh,460px)] min-h-[340px] overflow-hidden rounded-b-[28px] sm:-mx-6 sm:-mt-7">{viewfinder}</div>
        <div className="relative -mt-6 space-y-5 rounded-t-[24px] bg-background pt-5">
          <div ref={resultRef} tabIndex={-1} className="outline-none">
            <AnimatePresence mode="wait">{result && <motion.div key={`${phase}-${code}`}>{result}</motion.div>}</AnimatePresence>
          </div>
          {!result && (
            <>
              <div>
                <h1 className="text-[22px] font-semibold tracking-tight">Scan a barcode</h1>
                <p className="mt-1 text-[14px] text-muted-foreground">Identify a product in store and jump straight to its evidence.</p>
              </div>
              {sampleChips}
              {manualForm("m")}
            </>
          )}
          {recentList("m")}
        </div>
      </div>

      {/* ------------------------------------------------ Desktop: explanatory two-column */}
      <div className="hidden gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-14">
        <div className="min-w-0 space-y-6">
          <header>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-soft-foreground">Barcode lookup</p>
            <h1 className="mt-1.5 text-[32px] font-semibold leading-tight tracking-tight">Scan in store. Know before you buy.</h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">On your phone, Qeivo reads the EAN-13 barcode on the box or shelf label and opens the full evidence for that exact model — score, sources and price history.</p>
          </header>
          <ol className="grid gap-3 xl:grid-cols-3">
            {[
              { icon: Camera, t: "Point", d: "Hold the barcode inside the frame. Works on boxes, shelf tags and energy labels." },
              { icon: ScanSearch, t: "Identify", d: "We match the exact model and variant — no fuzzy guesses for unknown codes." },
              { icon: PackageCheck, t: "Decide", d: "See suitability, evidence coverage and the best price before you reach the till." },
            ].map((s, i) => (
              <li key={s.t} className="rounded-[16px] border border-border bg-card p-4 shadow-xs">
                <span className="flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-[10px] bg-brand-soft text-brand-soft-foreground">
                    <s.icon className="size-4" />
                  </span>
                  <span className="text-[11px] font-semibold text-subtle-foreground tabular">0{i + 1}</span>
                </span>
                <p className="mt-3 text-[15px] font-semibold">{s.t}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
          <div className="space-y-5 rounded-[20px] border border-border bg-card p-5 shadow-xs">
            {manualForm("d")}
            {sampleChips}
          </div>
          <div ref={resultRefDesk} tabIndex={-1} className="outline-none">
            <AnimatePresence mode="wait">{result && <motion.div key={`${phase}-${code}`}>{result}</motion.div>}</AnimatePresence>
          </div>
          {recentList("d")}
          <p className="flex items-start gap-2 text-[12px] text-subtle-foreground">
            <Lock className="mt-0.5 size-3.5 shrink-0" /> This demo never requests camera access. Scans are simulated and stored only in your browser.
          </p>
        </div>
        <div className="sticky top-24 self-start">
          <div className="relative mx-auto w-[340px]">
            <div aria-hidden className="absolute -inset-10 -z-10 rounded-full bg-brand/15 blur-3xl" />
            <div className="overflow-hidden rounded-[48px] border-[10px] border-navy-900 bg-navy-950 shadow-2xl dark:border-surface-3">
              <div className="relative h-[640px]">
                <div aria-hidden className="absolute left-1/2 top-2.5 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
                {viewfinder}
              </div>
            </div>
            <p className="mt-4 text-center text-[12px] text-muted-foreground">Click the frame to simulate a scan</p>
          </div>
        </div>
      </div>
    </>
  );
}
