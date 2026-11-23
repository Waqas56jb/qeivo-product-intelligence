"use client";

import Link from "next/link";
import { CheckCircle2, Eye, MessageSquare, Sparkles } from "lucide-react";
import type { CommunityQuestion } from "@/types";
import { getProduct } from "@/data/products";
import { routes } from "@/config/routes";
import { cn, compactNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/primitives";
import { DateDisplay } from "@/components/common/display";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { CATEGORY_LABEL, ReportButton, ReportedNotice, RoleBadge, useReported, VoteControl } from "./community-bits";

export function QuestionCard({ question: q, local, className }: { question: CommunityQuestion; local?: boolean; className?: string }) {
  const reported = useReported(q.id);
  if (reported) return <ReportedNotice what="question" className={className} />;
  const official = q.replies.find((r) => r.role === "manufacturer");
  const expert = q.replies.some((r) => r.role === "expert");
  const products = q.productIds.map((id) => getProduct(id)).filter((p) => p !== undefined).slice(0, 3);
  const href = routes.question(q.slug);

  return (
    <article
      className={cn(
        "group relative flex gap-3 rounded-[16px] border border-border bg-card p-3.5 shadow-xs transition-[border-color,box-shadow] sm:gap-4 sm:p-5",
        !local && "hover:border-border-strong hover:shadow-sm",
        local && "border-brand/40 bg-brand-soft/15",
        className,
      )}
    >
      {!local && <Link href={href} className="absolute inset-0 z-0 rounded-[16px]" aria-label={q.title} />}
      <VoteControl id={q.id} base={q.votes} label="question" className="hidden sm:flex" />
      <div className="pointer-events-none relative z-[1] min-w-0 flex-1 sm:pr-8">
        <div className="flex flex-wrap items-center gap-1.5">
          {local && (
            <Badge variant="brand" className="h-6 px-2">
              <Sparkles /> Your question (demo, not published)
            </Badge>
          )}
          <Badge variant="default" className="h-6 px-2">{CATEGORY_LABEL[q.category]}</Badge>
          {q.solved && (
            <Badge variant="success" className="h-6 px-2">
              <CheckCircle2 /> Solved
            </Badge>
          )}
          {official && <RoleBadge role="manufacturer" company={official.company} />}
          {!official && expert && <RoleBadge role="expert" className="hidden sm:inline-flex" />}
        </div>
        <h3 className="mt-2 text-[16px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-brand-soft-foreground sm:text-[17px]">{q.title}</h3>
        <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-muted-foreground">{q.body}</p>

        {(products.length > 0 || q.tags.length > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {products.map((p) => (
              <Link
                key={p.id}
                href={routes.product(p.slug)}
                className="pointer-events-auto relative z-10 inline-flex h-7 max-w-[200px] items-center gap-1.5 rounded-full border border-border bg-surface pl-1 pr-2.5 text-[12px] font-medium transition-colors hover:border-brand/50"
              >
                <ImageWithFallback src={p.images[0]} alt="" aspect="size-5 shrink-0 rounded-full bg-surface-2" sizes="20px" fit="contain" shimmer={false} />
                <span className="truncate">{p.model}</span>
              </Link>
            ))}
            {q.tags.slice(0, 3).map((t) => (
              <span key={t} className="hidden h-7 items-center rounded-full px-2 text-[12px] text-subtle-foreground sm:inline-flex">
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-[12px] text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-2">
            <UserAvatar src={q.authorAvatar} name={q.authorName} className="size-6" />
            <span className="truncate font-medium text-foreground">{q.authorName}</span>
            <span className="text-subtle-foreground">·</span>
            <DateDisplay iso={q.date} relative />
          </span>
          <span className="ml-auto inline-flex items-center gap-3 tabular">
            <span className="inline-flex items-center gap-1" aria-label={`${q.replies.length} replies`}>
              <MessageSquare className="size-3.5" /> {q.replies.length}
            </span>
            <span className="inline-flex items-center gap-1" aria-label={`${q.views} views`}>
              <Eye className="size-3.5" /> {compactNumber(q.views)}
            </span>
          </span>
        </div>
        <div className="pointer-events-auto mt-2 flex items-center justify-between gap-2 sm:hidden">
          <VoteControl id={q.id} base={q.votes} label="question" orientation="horizontal" />
          {!local && <ReportButton id={q.id} what="question" />}
        </div>
      </div>
      {!local && <ReportButton id={q.id} what="question" compact className="absolute right-3 top-3 hidden sm:inline-flex" />}
    </article>
  );
}
