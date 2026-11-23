"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Building2, ChevronDown, ChevronUp, Flag, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import type { CategorySlug, CommunityReply } from "@/types";
import { categories } from "@/data/products";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { ConfirmationDialog } from "@/components/common/controls";
import { Hint } from "@/components/ui/tooltip";

export const CATEGORY_LABEL: Record<CategorySlug, string> = Object.fromEntries(categories.map((c) => [c.slug, c.name])) as Record<CategorySlug, string>;

export const ROLE_META: Record<CommunityReply["role"], { label: string; icon: LucideIcon; className: string }> = {
  manufacturer: { label: "Official", icon: Building2, className: "border-claim-manufacturer/30 bg-claim-manufacturer-soft text-claim-manufacturer" },
  expert: { label: "Qeivo expert", icon: BadgeCheck, className: "border-brand/30 bg-brand-soft text-brand-soft-foreground" },
  moderator: { label: "Moderator", icon: ShieldCheck, className: "border-info/30 bg-info-soft text-info-foreground" },
  customer: { label: "Owner", icon: User, className: "border-border bg-surface-2 text-muted-foreground" },
};

export function RoleBadge({ role, company, className }: { role: CommunityReply["role"]; company?: string; className?: string }) {
  const m = ROLE_META[role];
  return (
    <span className={cn("inline-flex h-6 shrink-0 items-center gap-1 rounded-full border px-2 text-[11px] font-semibold", m.className, className)}>
      <m.icon className="size-3.5" aria-hidden />
      {role === "manufacturer" && company ? `Official · ${company}` : m.label}
    </span>
  );
}

/** Live vote count: seed votes plus the demo user's own vote from the store. */
export function useVote(id: string, base: number) {
  const hydrated = useHydrated();
  const mine = useAppStore((s) => s.votes[id]);
  const vote = useAppStore((s) => s.vote);
  const dir = hydrated ? mine : undefined;
  return { count: base + (dir ?? 0), dir, vote: (d: 1 | -1) => vote(id, d) };
}

export function VoteControl({ id, base, orientation = "vertical", label = "post", className }: { id: string; base: number; orientation?: "vertical" | "horizontal"; label?: string; className?: string }) {
  const { count, dir, vote } = useVote(id, base);
  const btn = "grid place-items-center rounded-[10px] transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 size-11 sm:size-9";
  return (
    <div
      className={cn(
        "relative z-10 flex shrink-0 items-center rounded-[12px] border border-border bg-surface",
        orientation === "vertical" ? "flex-col py-0.5" : "flex-row px-0.5",
        className,
      )}
    >
      <Hint label="Helpful — upvote">
        <button
          type="button"
          onClick={() => vote(1)}
          aria-pressed={dir === 1}
          aria-label={`Upvote ${label}`}
          data-testid={`upvote-${id}`}
          className={cn(btn, dir === 1 ? "bg-brand-soft text-brand-soft-foreground" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground")}
        >
          <ChevronUp className="size-5" />
        </button>
      </Hint>
      <span data-testid={`votes-${id}`} aria-live="polite" aria-label={`${count} votes`} className={cn("min-w-8 text-center text-[14px] font-semibold tabular", dir === 1 && "text-brand-soft-foreground", dir === -1 && "text-danger-foreground")}>
        {count}
      </span>
      <Hint label="Not helpful — downvote">
        <button
          type="button"
          onClick={() => vote(-1)}
          aria-pressed={dir === -1}
          aria-label={`Downvote ${label}`}
          className={cn(btn, dir === -1 ? "bg-danger-soft text-danger-foreground" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground")}
        >
          <ChevronDown className="size-5" />
        </button>
      </Hint>
    </div>
  );
}

export function useReported(id: string) {
  const hydrated = useHydrated();
  const reported = useAppStore((s) => s.reported.includes(id));
  return hydrated && reported;
}

/** Report action with confirmation; writes to the demo store. */
export function ReportButton({ id, what = "post", className, compact }: { id: string; what?: string; className?: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const report = useAppStore((s) => s.report);
  const reported = useReported(id);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={reported}
        className={cn(
          "relative z-10 inline-flex h-11 items-center gap-1.5 rounded-[10px] px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-60 sm:h-8",
          className,
        )}
        aria-label={reported ? `${what} reported` : `Report ${what}`}
      >
        <Flag className="size-3.5" />
        {!compact && (reported ? "Reported" : "Report")}
      </button>
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title={`Report this ${what}?`}
        description="Our moderators review reports against the community guidelines (spam, abuse, undisclosed promotion, unsafe advice). The post is hidden for you while it's reviewed."
        confirmLabel="Report"
        destructive
        onConfirm={() => {
          report(id);
          toast.success("Report submitted (demo)", { description: "In this demo the report is stored on your device only — no moderator is notified." });
        }}
      />
    </>
  );
}

export function ReportedNotice({ what = "post", className }: { what?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-[14px] border border-dashed border-border-strong bg-surface-2/50 px-4 py-3 text-[13px] text-muted-foreground", className)}>
      <Flag className="size-4 shrink-0 text-subtle-foreground" />
      <span>
        <strong className="font-semibold text-foreground">Reported</strong> — this {what} is hidden pending review.
      </span>
    </div>
  );
}

export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}
