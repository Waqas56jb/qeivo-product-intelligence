"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Flashlight, ScanLine, SearchX, SwitchCamera } from "lucide-react";
import { toast } from "sonner";
import { images } from "@/data/images";
import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { Barcode } from "./barcode";

export type ScanPhase = "idle" | "scanning" | "found" | "not-found";

const STATUS: Record<ScanPhase, { label: string; className: string }> = {
  idle: { label: "Align the barcode inside the frame", className: "bg-black/45 text-white" },
  scanning: { label: "Reading barcode…", className: "bg-black/45 text-white" },
  found: { label: "Product identified", className: "bg-success text-white" },
  "not-found": { label: "Not in the Qeivo catalogue", className: "bg-warning text-navy-950" },
};

/** Simulated camera viewfinder — pure CSS/SVG. No camera API is used. */
export function ScanViewfinder({ phase, code, onTap, className }: { phase: ScanPhase; code: string | null; onTap: () => void; className?: string }) {
  const st = STATUS[phase];
  const cameraOnly = () => toast("Camera controls are illustrative", { description: "This demo never accesses your camera — try a sample barcode instead." });
  return (
    <div className={cn("relative isolate overflow-hidden bg-navy-950", className)}>
      {/* "Camera feed": a softened kitchen photo */}
      <ImageWithFallback src={images.kitchens[3]} alt="" aspect="absolute inset-0" sizes="(max-width: 1024px) 100vw, 360px" className="scale-110 opacity-60 blur-[3px]" priority />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/65" />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
        <button type="button" onClick={cameraOnly} aria-label="Toggle torch (illustrative)" className="grid size-11 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/50">
          <Flashlight className="size-5" />
        </button>
        <motion.span key={phase} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} role="status" className={cn("inline-flex h-8 max-w-[62%] items-center gap-1.5 truncate rounded-full px-3 text-[12px] font-medium backdrop-blur-md", st.className)}>
          {phase === "found" ? <CheckCircle2 className="size-3.5" /> : phase === "not-found" ? <SearchX className="size-3.5" /> : <ScanLine className="size-3.5" />}
          {st.label}
        </motion.span>
        <button type="button" onClick={cameraOnly} aria-label="Switch camera (illustrative)" className="grid size-11 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/50">
          <SwitchCamera className="size-5" />
        </button>
      </div>

      {/* Frame */}
      <button
        type="button"
        onClick={onTap}
        disabled={phase === "scanning"}
        aria-label={phase === "scanning" ? "Scanning" : "Simulate scanning the barcode in the frame"}
        className="absolute left-1/2 top-1/2 aspect-[1.45] w-[78%] max-w-[340px] -translate-x-1/2 -translate-y-1/2 outline-none focus-visible:ring-4 focus-visible:ring-brand/60 rounded-[18px]"
      >
        {/* dimmed surround */}
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[18px] shadow-[0_0_0_9999px_rgb(0_0_0/0.38)]" />
        <svg aria-hidden viewBox="0 0 100 69" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
          {[
            "M2 16 V6 Q2 2 6 2 H16",
            "M84 2 H94 Q98 2 98 6 V16",
            "M98 53 V63 Q98 67 94 67 H84",
            "M16 67 H6 Q2 67 2 63 V53",
          ].map((d) => (
            <path key={d} d={d} fill="none" strokeWidth="2.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" className={cn("transition-colors duration-300", phase === "found" ? "stroke-success" : phase === "not-found" ? "stroke-warning" : "stroke-white")} style={{ strokeWidth: 4 }} />
          ))}
        </svg>
        <AnimatePresence>
          {code && (
            <motion.span key={code} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-[16%_12%] grid place-items-center">
              <Barcode code={code} className="w-full rounded-[4px] shadow-lg [transform:perspective(500px)_rotateX(8deg)_rotate(-2deg)]" />
            </motion.span>
          )}
        </AnimatePresence>
        {!code && phase === "idle" && <span className="absolute inset-x-0 bottom-3 text-center text-[12px] font-medium text-white/75">Tap to simulate a scan</span>}
        {(phase === "scanning" || phase === "idle") && (
          <motion.span
            aria-hidden
            className={cn("absolute inset-x-[6%] h-[3px] rounded-full bg-brand shadow-[0_0_18px_4px_var(--brand)]", phase !== "scanning" && "opacity-70")}
            initial={{ top: "6%" }}
            animate={{ top: ["6%", "92%", "6%"] }}
            transition={{ duration: phase === "scanning" ? 1.1 : 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </button>

      <div className="absolute inset-x-0 bottom-0 p-4 text-center">
        <p className="text-[12px] text-white/70">Demo viewfinder · your camera is never accessed</p>
      </div>
    </div>
  );
}
