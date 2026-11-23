"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Zap, CornerDownRight, GitCompareArrows, MessageSquareWarning, Ruler, ShieldAlert, Sparkles, Users } from "lucide-react";
import { classifyIntent, type AskIntent } from "@/lib/ask-engine";
import { cn } from "@/lib/utils";

const ICONS: Partial<Record<AskIntent, LucideIcon>> = {
  household: Users,
  weaknesses: ShieldAlert,
  energy: Zap,
  fit: Ruler,
  compare: GitCompareArrows,
  complaints: MessageSquareWarning,
};

/** Suggested questions: a card grid for empty conversations, or compact follow-up chips. */
export function SuggestedQuestions({ questions, onPick, variant = "grid", disabled, className }: { questions: string[]; onPick: (q: string) => void; variant?: "grid" | "chips"; disabled?: boolean; className?: string }) {
  if (!questions.length) return null;
  if (variant === "chips")
    return (
      <div className={cn("flex flex-wrap gap-2", className)} role="group" aria-label="Suggested follow-up questions">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            disabled={disabled}
            onClick={() => onPick(q)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-left text-[13px] text-muted-foreground shadow-xs transition-colors hover:border-brand/50 hover:text-foreground disabled:opacity-50 sm:min-h-9 sm:py-1.5"
          >
            <CornerDownRight className="size-3.5 shrink-0 text-brand" />
            {q}
          </button>
        ))}
      </div>
    );
  return (
    <div className={cn("grid gap-2.5 sm:grid-cols-2", className)} role="group" aria-label="Suggested questions">
      {questions.map((q, i) => {
        const Icon = ICONS[classifyIntent(q)] ?? Sparkles;
        return (
          <motion.button
            key={q}
            type="button"
            disabled={disabled}
            onClick={() => onPick(q)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.3 }}
            className="group flex min-h-14 items-center gap-3 rounded-[14px] border border-border bg-card p-3 text-left shadow-xs transition-all hover:-translate-y-px hover:border-brand/40 hover:shadow-sm disabled:opacity-50"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-soft text-brand-soft-foreground transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1 text-[13.5px] font-medium leading-snug">{q}</span>
            <ArrowUpRight className="size-4 shrink-0 text-subtle-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
          </motion.button>
        );
      })}
    </div>
  );
}
