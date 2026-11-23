import { Check, CircleDot, FilePen, MessageSquareWarning, Search, Send, XCircle } from "lucide-react";
import type { SubmissionStatus as Status } from "@/types";
import { cn } from "@/lib/utils";
import { StatusDot, type Tone } from "./primitives";

export const SUBMISSION_META: Record<Status, { label: string; tone: Tone; description: string }> = {
  draft: { label: "Draft", tone: "neutral", description: "Only visible to you. Submit when ready for review." },
  "in-review": { label: "In review", tone: "info", description: "A Qeivo editor is checking sources, disclosures and claims." },
  "changes-requested": { label: "Changes requested", tone: "warning", description: "The editor left notes. Update and resubmit." },
  approved: { label: "Approved", tone: "brand", description: "Approved and scheduled for publishing." },
  published: { label: "Published", tone: "success", description: "Live on Qeivo and linked to the associated products." },
  rejected: { label: "Rejected", tone: "danger", description: "Not accepted in its current form. See the reviewer note." },
};

export function SubmissionStatusBadge({ status, className }: { status: Status; className?: string }) {
  const m = SUBMISSION_META[status];
  return (
    <StatusDot tone={m.tone} className={className}>
      {m.label}
    </StatusDot>
  );
}

type StepState = "done" | "current" | "upcoming" | "warning" | "error";

function stepsFor(status: Status): { key: string; label: string; icon: typeof Check; state: StepState }[] {
  const order: Status[] = ["draft", "in-review", "approved", "published"];
  const reviewOutcome = status === "changes-requested" ? "warning" : status === "rejected" ? "error" : null;
  const idx = reviewOutcome ? 1 : order.indexOf(status);
  const state = (i: number): StepState => (i < idx ? "done" : i === idx ? (reviewOutcome ?? (status === "published" ? "done" : "current")) : "upcoming");
  return [
    { key: "draft", label: "Drafted", icon: FilePen, state: state(0) },
    {
      key: "review",
      label: status === "changes-requested" ? "Changes requested" : status === "rejected" ? "Rejected" : "Editorial review",
      icon: status === "changes-requested" ? MessageSquareWarning : status === "rejected" ? XCircle : Search,
      state: state(1),
    },
    { key: "approved", label: "Approved", icon: Check, state: state(2) },
    { key: "published", label: "Published", icon: Send, state: state(3) },
  ];
}

const DOT: Record<StepState, string> = {
  done: "border-brand bg-brand text-brand-foreground",
  current: "border-info bg-info-soft text-info-foreground ring-4 ring-info/15",
  upcoming: "border-border-strong bg-surface text-subtle-foreground",
  warning: "border-warning bg-warning-soft text-warning-foreground ring-4 ring-warning/15",
  error: "border-danger bg-danger-soft text-danger-foreground ring-4 ring-danger/15",
};

/**
 * Review pipeline: Drafted → Editorial review → Approved → Published.
 * Changes-requested / rejected replace the review step.
 */
export function SubmissionStatusTimeline({ status, className, compact }: { status: Status; className?: string; compact?: boolean }) {
  const steps = stepsFor(status);
  return (
    <ol className={cn("flex w-full items-start", className)} aria-label={`Status: ${SUBMISSION_META[status].label}`}>
      {steps.map((s, i) => {
        const Icon = s.state === "current" ? CircleDot : s.icon;
        return (
          <li key={s.key} className="relative flex flex-1 flex-col items-center gap-1.5 text-center" aria-current={s.state === "current" || s.state === "warning" || s.state === "error" ? "step" : undefined}>
            {i > 0 && <span aria-hidden className={cn("absolute right-1/2 top-[13px] h-0.5 w-full -translate-y-1/2", s.state === "upcoming" ? "bg-border" : "bg-brand/70")} style={{ marginRight: compact ? 12 : 14 }} />}
            <span className={cn("relative z-10 grid place-items-center rounded-full border-[1.5px] transition-colors", compact ? "size-6" : "size-7", DOT[s.state])}>
              <Icon className={compact ? "size-3" : "size-3.5"} strokeWidth={2.5} />
            </span>
            <span className={cn("max-w-[11ch] text-[11px] font-medium leading-tight sm:max-w-none", s.state === "upcoming" ? "text-subtle-foreground" : "text-foreground")}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
