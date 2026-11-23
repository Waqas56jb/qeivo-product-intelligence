"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FilePlus2, Inbox } from "lucide-react";
import { toast } from "sonner";
import type { ContentSubmission, SubmissionStatus } from "@/types";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/states";
import { ConfirmationDialog, FilterChip, SearchField } from "@/components/common/controls";
import { SelectField } from "@/components/forms/form-field";
import { SUBMISSION_META } from "@/components/business/submission-status";
import { CONTENT_TYPE_META, CONTENT_TYPES, type ContentType } from "./meta";
import { SubmissionCard } from "./submission-card";

const STATUS_ORDER: SubmissionStatus[] = ["draft", "in-review", "changes-requested", "approved", "published", "rejected"];

export function SubmissionsBrowser({ initial }: { initial: ContentSubmission[] }) {
  const [items, setItems] = useState(initial);
  const [status, setStatus] = useState<SubmissionStatus | "all">("all");
  const [type, setType] = useState<ContentType | "all">("all");
  const [query, setQuery] = useState("");
  const [withdrawing, setWithdrawing] = useState<ContentSubmission | null>(null);

  const byType = useMemo(() => items.filter((s) => type === "all" || s.type === type), [items, type]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: byType.length };
    for (const s of byType) c[s.status] = (c[s.status] ?? 0) + 1;
    return c;
  }, [byType]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return byType
      .filter((s) => status === "all" || s.status === status)
      .filter((s) => !q || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [byType, status, query]);

  const needsAction = items.filter((s) => s.status === "changes-requested" || s.status === "draft").length;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField value={query} onChange={setQuery} placeholder="Search your submissions…" className="sm:max-w-sm sm:flex-1" />
          <SelectField
            id="type-filter"
            ariaLabel="Content type"
            value={type}
            onValueChange={(v) => setType(v as ContentType | "all")}
            options={[{ value: "all", label: "All content types" }, ...CONTENT_TYPES.map((t) => ({ value: t, label: CONTENT_TYPE_META[t].plural }))]}
            className="sm:w-[200px]"
          />
          {needsAction > 0 && <p className="text-[13px] text-muted-foreground sm:ml-auto">{needsAction} need your attention</p>}
        </div>
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by status">
          <FilterChip active={status === "all"} onClick={() => setStatus("all")} count={counts.all}>
            All
          </FilterChip>
          {STATUS_ORDER.map((s) => (
            <FilterChip key={s} active={status === s} onClick={() => setStatus(s)} count={counts[s] ?? 0}>
              {SUBMISSION_META[s].label}
            </FilterChip>
          ))}
        </div>
      </div>

      {visible.length ? (
        <div className="grid gap-4">
          {visible.map((s) => (
            <SubmissionCard key={s.id} submission={s} onWithdraw={setWithdrawing} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title="No submissions match these filters"
          description="Try another status or content type, or start a new submission."
          action={
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setStatus("all");
                  setType("all");
                  setQuery("");
                }}
              >
                Clear filters
              </Button>
              <Button asChild>
                <Link href={routes.cSubmissionNew}>
                  <FilePlus2 /> New submission
                </Link>
              </Button>
            </>
          }
        />
      )}

      <ConfirmationDialog
        open={withdrawing !== null}
        onOpenChange={(o) => !o && setWithdrawing(null)}
        title="Withdraw from review?"
        description={withdrawing ? `“${withdrawing.title}” will move back to drafts and leave the editor's queue. You can resubmit at any time.` : undefined}
        confirmLabel="Withdraw to draft"
        onConfirm={() => {
          if (!withdrawing) return;
          setItems((prev) => prev.map((s) => (s.id === withdrawing.id ? { ...s, status: "draft" } : s)));
          toast.success("Moved back to drafts (demo)", { description: "This change is kept for this session only." });
          setWithdrawing(null);
        }}
      />
    </div>
  );
}
