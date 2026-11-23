"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Check, CheckCircle2, Hourglass, MessageSquareWarning, ShieldCheck, Undo2 } from "lucide-react";
import type { ResearchProject } from "@/types";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label, UserAvatar } from "@/components/ui/primitives";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CURRENT_MEMBER_ID, useMemberLookup, useWorkspaceStore } from "./workspace-store";

type Approval = ResearchProject["approvals"][number];
type Decision = Exclude<Approval["decision"], "pending">;

const DECISION_META: Record<Approval["decision"], { label: string; variant: "success" | "warning" | "danger"; icon: typeof Check }> = {
  approved: { label: "Approved", variant: "success", icon: CheckCircle2 },
  pending: { label: "Awaiting decision", variant: "warning", icon: Hourglass },
  changes: { label: "Changes requested", variant: "danger", icon: MessageSquareWarning },
};

export function DecisionBadge({ decision }: { decision: Approval["decision"] }) {
  const m = DECISION_META[decision];
  return (
    <Badge variant={m.variant}>
      <m.icon /> {m.label}
    </Badge>
  );
}

/** Dialog collecting the decision note. A note is required when requesting changes. */
export function DecisionDialog({
  open,
  onOpenChange,
  decision,
  projectName,
  onBehalfOf,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  decision: Decision;
  projectName: string;
  onBehalfOf?: string;
  onSubmit: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const needsNote = decision === "changes";
  const invalid = needsNote && note.trim().length < 10;
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setNote("");
          setTouched(false);
        }
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{decision === "approved" ? "Approve shortlist" : "Request changes"}</DialogTitle>
          <DialogDescription>
            {projectName}
            {onBehalfOf ? ` · recorded on behalf of ${onBehalfOf} in this demo` : ""}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (invalid) return;
            onSubmit(note.trim() || "Approved as specified.");
            setNote("");
            setTouched(false);
            onOpenChange(false);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="decision-note">{needsNote ? "What needs to change?" : "Approval note (optional)"}</Label>
            <Textarea
              id="decision-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={needsNote ? "e.g. Please add the per-unit landed cost including installation." : "e.g. Within budget — go ahead with the order."}
              aria-invalid={touched && invalid}
              aria-describedby="decision-note-help"
              maxLength={400}
              autoFocus
            />
            <p id="decision-note-help" className={cn("text-[12px]", touched && invalid ? "text-danger-foreground" : "text-subtle-foreground")}>
              {touched && invalid ? "Add at least 10 characters so the team knows what to change." : "Visible to everyone on the project."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant={decision === "approved" ? "brand" : "default"}>
              {decision === "approved" ? <Check /> : <Undo2 />}
              {decision === "approved" ? "Approve" : "Send request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** One approval row with approve / request-changes actions while pending. */
export function ApprovalItem({ project, approval, showProject, className }: { project: ResearchProject; approval: Approval; showProject?: boolean; className?: string }) {
  const lookup = useMemberLookup();
  const decide = useWorkspaceStore((s) => s.decide);
  const [dialog, setDialog] = useState<Decision | null>(null);
  const m = lookup(approval.memberId);
  const name = m?.name ?? "Former member";
  return (
    <div className={cn("flex flex-col gap-3 py-4 first:pt-0 last:pb-0", className)}>
      <div className="flex items-start gap-3">
        <UserAvatar src={m?.avatar || undefined} name={name} className="size-9" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[14px] font-semibold">{name}</span>
            <span className="text-[12px] text-muted-foreground">{m?.title}</span>
          </div>
          {showProject && (
            <Link href={routes.project(project.id)} className="mt-0.5 block truncate text-[13px] font-medium text-brand-soft-foreground hover:underline">
              {project.name}
            </Link>
          )}
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">“{approval.note}”</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <DecisionBadge decision={approval.decision} />
            <span className="text-[12px] text-subtle-foreground">{formatRelative(approval.date)}</span>
          </div>
        </div>
      </div>
      {approval.decision === "pending" && (
        <div className="flex flex-wrap gap-2 pl-12">
          <Button size="sm" variant="brand" className="h-11 sm:h-9" onClick={() => setDialog("approved")}>
            <Check /> Approve
          </Button>
          <Button size="sm" variant="outline" className="h-11 sm:h-9" onClick={() => setDialog("changes")}>
            <Undo2 /> Request changes
          </Button>
        </div>
      )}
      <DecisionDialog
        open={dialog !== null}
        onOpenChange={(o) => !o && setDialog(null)}
        decision={dialog ?? "approved"}
        projectName={project.name}
        onBehalfOf={approval.memberId !== CURRENT_MEMBER_ID ? name : undefined}
        onSubmit={(note) => {
          if (!dialog) return;
          decide(project.id, approval.id, dialog, note);
          toast.success(dialog === "approved" ? "Approval recorded" : "Changes requested", {
            description: `${project.name} · saved in this demo session only, no one was notified.`,
          });
        }}
      />
    </div>
  );
}

/** Full approval panel on a project: everyone's decision + Alex's own decision form. */
export function ApprovalPanel({ project, className }: { project: ResearchProject; className?: string }) {
  const record = useWorkspaceStore((s) => s.recordDecision);
  const [dialog, setDialog] = useState<Decision | null>(null);
  const approved = project.approvals.filter((a) => a.decision === "approved").length;
  const mine = project.approvals.find((a) => a.memberId === CURRENT_MEMBER_ID);
  const closed = project.status === "archived";
  return (
    <section id="approvals" aria-labelledby="approvals-title" className={cn("scroll-mt-24 rounded-[14px] border border-border bg-card shadow-xs", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 grid size-7 place-items-center rounded-[8px] bg-surface-2 text-muted-foreground">
            <ShieldCheck className="size-3.5" />
          </span>
          <div>
            <h2 id="approvals-title" className="text-[15px] font-semibold tracking-tight">Approvals</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground tabular">
              {project.approvals.length ? `${approved} of ${project.approvals.length} approved` : "No approvals requested yet"}
            </p>
          </div>
        </div>
        {project.approvals.length > 0 && (
          <div className="flex h-2 w-28 overflow-hidden rounded-full bg-surface-3" aria-hidden>
            {project.approvals.map((a) => (
              <span key={a.id} className={cn("h-full flex-1 border-r-2 border-card last:border-r-0", a.decision === "approved" ? "bg-success" : a.decision === "changes" ? "bg-danger" : "bg-warning/60")} />
            ))}
          </div>
        )}
      </div>
      <div className="divide-y divide-border px-4 py-4 sm:px-5">
        {project.approvals.length ? (
          project.approvals.map((a) => <ApprovalItem key={a.id} project={project} approval={a} />)
        ) : (
          <p className="text-[13px] text-muted-foreground">Approvers are added when the shortlist is ready. You can record your own decision below.</p>
        )}
      </div>
      {!closed && (
        <div className="space-y-3 border-t border-border bg-surface-2/40 px-4 py-4 sm:px-5">
          <p className="text-[13px] font-medium">
            Your decision <span className="font-normal text-muted-foreground">· Alex Morgan, Admin</span>
          </p>
          {mine && mine.decision !== "pending" ? (
            <p className="text-[13px] text-muted-foreground">
              You {mine.decision === "approved" ? "approved" : "requested changes"} {formatRelative(mine.date)}. You can change your decision at any time.
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="brand" className="h-11 sm:h-10" onClick={() => setDialog("approved")}>
              <Check /> Approve shortlist
            </Button>
            <Button variant="outline" className="h-11 sm:h-10" onClick={() => setDialog("changes")}>
              <Undo2 /> Request changes
            </Button>
          </div>
        </div>
      )}
      <DecisionDialog
        open={dialog !== null}
        onOpenChange={(o) => !o && setDialog(null)}
        decision={dialog ?? "approved"}
        projectName={project.name}
        onSubmit={(note) => {
          if (!dialog) return;
          record(project.id, dialog, note);
          toast.success(dialog === "approved" ? "You approved the shortlist" : "Change request sent to the project", {
            description: "Saved in this demo session only — no notifications were sent.",
          });
        }}
      />
    </section>
  );
}
