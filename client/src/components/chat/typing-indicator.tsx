"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Qeivo's assistant avatar. */
export function QeivoMark({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center bg-teal-sheen text-white shadow-sm",
        size === "sm" ? "size-7 rounded-[8px]" : size === "lg" ? "size-14 rounded-[16px]" : "size-8 rounded-[10px]",
        className,
      )}
    >
      <Sparkles className={size === "lg" ? "size-6" : size === "sm" ? "size-3.5" : "size-4"} />
    </span>
  );
}

/** Animated "researching" state. Steps cycle on a fixed interval so the sequence is deterministic. */
export function TypingIndicator({ steps, className }: { steps: string[]; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(x + 1, steps.length - 1)), 420);
    return () => clearInterval(t);
  }, [steps.length]);
  return (
    <div role="status" aria-label="Qeivo is researching your question" className={cn("flex items-start gap-3", className)}>
      <QeivoMark />
      <div className="rounded-[16px] rounded-tl-[6px] border border-border bg-card px-4 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" aria-hidden>
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                className="size-1.5 rounded-full bg-brand"
                animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15, ease: "easeInOut" }}
              />
            ))}
          </span>
          <motion.span key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-[13px] text-muted-foreground">
            {steps[i]}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
