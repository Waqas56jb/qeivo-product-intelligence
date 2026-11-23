"use client";

import Link from "next/link";
import { BarChart3, Eye, MessageSquareQuote, PencilLine, Undo2 } from "lucide-react";
import type { ContentSubmission } from "@/types";
import { getProduct } from "@/data/products";
import { routes } from "@/config/routes";
import { formatDate } from "@/lib/format";
import { cn, compactNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { SponsoredTag } from "@/components/analysis/warnings";
import { SubmissionStatusBadge, SubmissionStatusTimeline } from "@/components/business/submission-status";
import { CONTENT_TYPE_META } from "./meta";

const NOTE_TONE: Partial<Record<ContentSubmission["status"], string>> = {
  "changes-requested": "border-warning/35 bg-warning-soft/50",
  rejected: "border-danger/25 bg-danger-soft/40",
  approved: "border-brand/25 bg-brand-soft/40",
};

export function SubmissionCard({ submission: s, onWithdraw, className }: { submission: ContentSubmission; onWithdraw?: (s: ContentSubmission) => void; className?: string }) {
  const type = CONTENT_TYPE_META[s.type];
  const products = s.productIds.map((id) => getProduct(id)).filter((p) => p !== undefined);
  const editable = s.status === "draft" || s.status === "changes-requested" || s.status === "rejected";

  return (
    <article className={cn("flex flex-col overflow-hidden rounded-[14px] border border-border bg-card shadow-xs md:flex-row", className)}>
      <div className="relative md:w-[240px] md:shrink-0">
        <ImageWithFallback src={s.thumbnail} alt="" aspect="aspect-[16/9] md:aspect-auto" wrapperClassName="h-full md:min-h-full" sizes="(max-width: 768px) 100vw, 240px" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          <type.icon className="size-3.5" /> {type.label}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <SubmissionStatusBadge status={s.status} />
              {s.sponsored && <SponsoredTag />}
              <span className="text-[12px] text-subtle-foreground tabular">
                {s.status === "draft" ? "Last edited" : "Submitted"} {formatDate(s.submittedAt)}
              </span>
            </div>
            <h3 className="text-[15.5px] font-semibold leading-snug tracking-tight">{s.title}</h3>
            <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{s.description}</p>
          </div>
          {s.status === "published" && (
            <dl className="flex gap-4 rounded-[10px] bg-surface-2/70 px-3 py-2 text-[12px]">
              <div>
                <dt className="text-subtle-foreground">Views</dt>
                <dd className="font-semibold tabular">{compactNumber(s.views)}</dd>
              </div>
              <div>
                <dt className="text-subtle-foreground">Engagement</dt>
                <dd className="font-semibold tabular">{s.engagement}%</dd>
              </div>
            </dl>
          )}
        </div>

        {products.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Associated products">
            {products.map((p) => (
              <li key={p.id}>
                <Link href={routes.product(p.slug)} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[12px] font-medium text-muted-foreground hover:border-border-strong hover:text-foreground">
                  <span className="truncate">{p.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <SubmissionStatusTimeline status={s.status} compact className="max-w-[520px]" />

        {s.reviewerNote && (
          <div className={cn("flex gap-2.5 rounded-[12px] border p-3 text-[13px] leading-relaxed", NOTE_TONE[s.status] ?? "border-border bg-surface-2/60")}>
            <MessageSquareQuote className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Qeivo editor note</p>
              <p className="text-foreground">{s.reviewerNote}</p>
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2">
          {editable && (
            <Button asChild size="sm" variant={s.status === "draft" ? "default" : "brand"}>
              <Link href={`${routes.cSubmissionNew}?from=${s.id}`}>
                <PencilLine /> {s.status === "draft" ? "Continue editing" : "Revise & resubmit"}
              </Link>
            </Button>
          )}
          {s.status === "in-review" && onWithdraw && (
            <Button size="sm" variant="outline" onClick={() => onWithdraw(s)}>
              <Undo2 /> Withdraw to draft
            </Button>
          )}
          {s.status === "published" && (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href={routes.cAnalytics}>
                  <BarChart3 /> Performance
                </Link>
              </Button>
              {products[0] && (
                <Button asChild size="sm" variant="ghost">
                  <Link href={routes.product(products[0].slug)}>
                    <Eye /> View on product page
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
