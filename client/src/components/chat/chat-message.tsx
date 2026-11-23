"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, CircleHelp, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { getProduct } from "@/data/products";
import { routes } from "@/config/routes";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AskMessage } from "@/store/chat-store";
import { CLAIM_META } from "@/components/analysis/meta";
import { ClaimTypeBadge, SourceCitation } from "@/components/analysis/badges";
import { EvidenceCoverage, ScorePill } from "@/components/analysis/score";
import { ErrorState } from "@/components/common/states";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { BrandLabel, ProductPrice } from "@/components/product/product-bits";
import { ChatSourceList } from "./chat-source-list";
import { SuggestedQuestions } from "./suggested-questions";
import { QeivoMark } from "./typing-indicator";

/** Product referenced in an answer — compact, linkable card. */
export function ProductReferenceCard({ product, className }: { product: Product; className?: string }) {
  return (
    <Link
      href={routes.product(product.slug)}
      className={cn("group flex min-w-[240px] flex-1 items-center gap-3 rounded-[14px] border border-border bg-card p-2.5 pr-3 shadow-xs transition-all hover:border-border-strong hover:shadow-sm", className)}
    >
      <ImageWithFallback src={product.images[0]} alt="" aspect="size-14 shrink-0 rounded-[10px] bg-gradient-to-b from-surface-2 to-surface-3/60" sizes="56px" className="p-1.5" />
      <div className="min-w-0 flex-1">
        <BrandLabel brandId={product.brandId} className="text-[10px]" />
        <p className="truncate text-[13.5px] font-semibold leading-tight">{product.model}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <ProductPrice product={product} size="sm" showSaving={false} />
          <EvidenceCoverage coverage={product.evidenceCoverage} variant="pill" className="h-6 px-2 text-[11px]" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <ScorePill score={product.suitabilityScore} />
        <ArrowUpRight className="size-4 text-subtle-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
    </Link>
  );
}

function UserBubble({ message }: { message: AskMessage }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex justify-end">
      <div className="max-w-[86%] rounded-[18px] rounded-br-[6px] bg-primary px-4 py-2.5 text-[14.5px] leading-relaxed text-primary-foreground shadow-xs sm:max-w-[75%]">
        <span className="sr-only">You asked: </span>
        {message.content}
      </div>
    </motion.div>
  );
}

function Feedback({ text }: { text: string }) {
  const [vote, setVote] = useState<1 | -1 | null>(null);
  const btn = "grid size-11 place-items-center rounded-[10px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground sm:size-8";
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        className={btn}
        aria-label="Copy answer"
        onClick={() => {
          void navigator.clipboard?.writeText(text).then(
            () => toast.success("Answer copied", { description: "Citations are kept in the Qeivo source panel." }),
            () => toast.error("Couldn't access the clipboard"),
          );
        }}
      >
        <Copy className="size-4" />
      </button>
      <button type="button" className={cn(btn, vote === 1 && "text-brand")} aria-pressed={vote === 1} aria-label="Helpful answer" onClick={() => { setVote(vote === 1 ? null : 1); if (vote !== 1) toast.success("Thanks for the feedback", { description: "Demo only — feedback isn't sent anywhere." }); }}>
        <ThumbsUp className="size-4" />
      </button>
      <button type="button" className={cn(btn, vote === -1 && "text-danger")} aria-pressed={vote === -1} aria-label="Unhelpful answer" onClick={() => { setVote(vote === -1 ? null : -1); if (vote !== -1) toast("Feedback noted", { description: "Demo only — in the full product this flags the answer for review." }); }}>
        <ThumbsDown className="size-4" />
      </button>
    </div>
  );
}

export function ChatMessage({ message, isLatest, onFollowUp, onRetry, busy }: { message: AskMessage; isLatest?: boolean; onFollowUp?: (q: string) => void; onRetry?: (q: string, id: string) => void; busy?: boolean }) {
  if (message.role === "user") return <UserBubble message={message} />;

  if (message.error)
    return (
      <div className="flex items-start gap-3">
        <QeivoMark />
        <ErrorState
          className="flex-1 items-start px-5 py-6 text-left [&>div:nth-child(2)]:max-w-none"
          title="Qeivo couldn't reach its research sources"
          description="The connection dropped while assembling this answer (simulated network error). Nothing was charged against your allowance."
          onRetry={onRetry && message.retryOf ? () => onRetry(message.retryOf!, message.id) : undefined}
        />
      </div>
    );

  const ids = message.sourceIds ?? [];
  const blocks = message.blocks ?? [];
  const referenced = (message.productIds ?? []).map((id) => getProduct(id)).filter((p): p is Product => Boolean(p));
  const types = Array.from(new Set(blocks.map((b) => b.claimType)));

  return (
    <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="flex items-start gap-3" aria-label="Qeivo answer">
      <QeivoMark className="mt-0.5 hidden sm:grid" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
          <QeivoMark size="sm" className="sm:hidden" />
          <span className="font-semibold text-foreground">Qeivo</span>
          {message.intentLabel && <span className="rounded-full bg-surface-2 px-2 py-0.5 font-medium">{message.intentLabel}</span>}
          <span className="tabular">{formatRelative(message.createdAt)}</span>
        </div>

        <div className="rounded-[18px] rounded-tl-[6px] border border-border bg-card p-4 shadow-xs sm:p-5">
          <div className="space-y-3.5">
            {blocks.map((b, i) => (
              <div key={i} className="relative pl-3.5">
                <span aria-hidden className={cn("absolute bottom-1 left-0 top-1 w-[3px] rounded-full opacity-70", CLAIM_META[b.claimType].dot)} />
                <p className="text-[14.5px] leading-relaxed">
                  {b.text}
                  {b.sourceIds.map((id) => (
                    <SourceCitation key={id} sourceId={id} allIds={ids} index={ids.indexOf(id) + 1} variant="number" />
                  ))}{" "}
                  <ClaimTypeBadge type={b.claimType} size="xs" className="ml-0.5 align-[1px]" />
                  {!b.sourceIds.length && message.intent === "price" && <span className="ml-1.5 text-[11px] text-subtle-foreground">Qeivo price tracking</span>}
                </p>
              </div>
            ))}
          </div>

          {message.gaps && message.gaps.length > 0 && (
            <div role="note" className="mt-4 flex gap-2.5 rounded-[12px] border border-border-strong bg-surface-2/70 p-3 text-[12.5px] leading-relaxed">
              <CircleHelp className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p>
                <span className="font-semibold">Not enough data for part of this answer: </span>
                <span className="text-muted-foreground">{message.gaps.join("; ")}. Qeivo shows unknowns as unknown rather than guessing.</span>
              </p>
            </div>
          )}

          {referenced.length > 0 && (
            <div className="scrollbar-none -mx-1 mt-4 flex gap-2.5 overflow-x-auto px-1 pb-1">
              {referenced.map((p) => (
                <ProductReferenceCard key={p.id} product={p} className={referenced.length === 1 ? "max-w-md" : undefined} />
              ))}
            </div>
          )}

          <ChatSourceList ids={ids} className="mt-4" />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {types.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className={cn("size-1.5 rounded-full", CLAIM_META[t].dot)} />
                  {CLAIM_META[t].short}
                </span>
              ))}
            </div>
            <Feedback text={blocks.map((b) => b.text).join("\n\n")} />
          </div>
        </div>

        {isLatest && message.followUps && message.followUps.length > 0 && onFollowUp && <SuggestedQuestions variant="chips" questions={message.followUps} onPick={onFollowUp} disabled={busy} />}
      </div>
    </motion.article>
  );
}
