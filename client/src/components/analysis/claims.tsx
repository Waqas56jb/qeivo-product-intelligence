"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MinusCircle, Sparkles } from "lucide-react";
import type { Claim } from "@/types";
import { cn } from "@/lib/utils";
import { ClaimTypeBadge, SourceCitation } from "./badges";
import { CLAIM_META, CLAIM_ORDER } from "./meta";

/** A single classified claim with clickable citations. */
export function ClaimItem({ claim, icon, className }: { claim: Claim; icon?: React.ReactNode; className?: string }) {
  return (
    <li className={cn("flex gap-3", className)}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="text-[14px] leading-relaxed">
          {claim.text}
          {claim.sourceIds.map((id, i) => (
            <SourceCitation key={id} sourceId={id} allIds={claim.sourceIds} index={i + 1} variant="number" />
          ))}
        </p>
        <div className="mt-1.5">
          <ClaimTypeBadge type={claim.type} size="xs" />
        </div>
      </div>
    </li>
  );
}

export function StrengthsList({ claims, className }: { claims: Claim[]; className?: string }) {
  return (
    <ul className={cn("space-y-4", className)}>
      {claims.map((c) => (
        <ClaimItem key={c.id} claim={c} icon={<CheckCircle2 className="size-[18px] text-success" />} />
      ))}
    </ul>
  );
}

export function LimitationsList({ claims, className }: { claims: Claim[]; className?: string }) {
  return (
    <ul className={cn("space-y-4", className)}>
      {claims.map((c) => (
        <ClaimItem key={c.id} claim={c} icon={<MinusCircle className="size-[18px] text-warning" />} />
      ))}
    </ul>
  );
}

/** Legend explaining the five claim types. */
export function ClaimLegend({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex flex-wrap gap-x-4 gap-y-2", className)}>
      {CLAIM_ORDER.map((t) => (
        <span key={t} className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <span className={cn("size-2 rounded-full", CLAIM_META[t].dot)} />
          {compact ? CLAIM_META[t].short : CLAIM_META[t].label}
        </span>
      ))}
    </div>
  );
}

/** Highlighted AI summary card with typed, cited statements. */
export function AIInsightCard({ title = "Qeivo AI summary", claims, footer, className }: { title?: string; claims: Claim[]; footer?: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={cn("relative overflow-hidden rounded-[20px] border border-brand/25 bg-card p-5 shadow-sm sm:p-6", className)}
    >
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-brand/10 blur-3xl" />
      <div className="relative mb-4 flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-[9px] bg-teal-sheen text-white shadow-sm">
          <Sparkles className="size-4" />
        </span>
        <div>
          <h3 className="text-[15px] font-semibold">{title}</h3>
          <p className="text-[12px] text-muted-foreground">Every statement is classified and linked to its sources.</p>
        </div>
      </div>
      <ul className="relative space-y-4">
        {claims.map((c) => (
          <ClaimItem key={c.id} claim={c} />
        ))}
      </ul>
      {footer && <div className="relative mt-5 border-t border-border pt-4">{footer}</div>}
    </motion.section>
  );
}

/** Panel grouping a heading with classified claims — used across analysis screens. */
export function AIAnalysisPanel({ id, title, description, claims, children, tone = "default", className }: { id?: string; title: string; description?: string; claims?: Claim[]; children?: React.ReactNode; tone?: "default" | "positive" | "caution"; className?: string }) {
  return (
    <section id={id} className={cn("scroll-mt-28 rounded-[20px] border border-border bg-card p-5 shadow-xs sm:p-6", className)}>
      <div className="mb-4 flex items-start gap-3">
        <span className={cn("mt-1 h-5 w-1 shrink-0 rounded-full", tone === "positive" ? "bg-success" : tone === "caution" ? "bg-warning" : "bg-brand")} />
        <div>
          <h2 className="text-[18px] font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      {claims && (
        <ul className="space-y-4">
          {claims.map((c) => (
            <ClaimItem key={c.id} claim={c} />
          ))}
        </ul>
      )}
      {children}
    </section>
  );
}
