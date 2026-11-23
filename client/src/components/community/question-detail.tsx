"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, CheckCircle2, Eye, Info, MessageSquare, MessagesSquare, Send, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { CommunityQuestion, CommunityReply } from "@/types";
import { questions } from "@/data/community";
import { getProduct } from "@/data/products";
import { routes } from "@/config/routes";
import { cn, compactNumber, DEMO_NOW } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label, UserAvatar } from "@/components/ui/primitives";
import { DateDisplay } from "@/components/common/display";
import { ClaimTypeBadge } from "@/components/analysis/badges";
import { ProductCard } from "@/components/product/product-card";
import { CATEGORY_LABEL, Paragraphs, ReportButton, ReportedNotice, RoleBadge, useReported, VoteControl } from "./community-bits";

const replySchema = z.object({
  body: z.string().trim().min(20, "Replies need at least 20 characters so they're useful to others.").max(3000, "Keep replies under 3,000 characters."),
});
type ReplyValues = z.infer<typeof replySchema>;

function ReplyCard({ reply, local }: { reply: CommunityReply; local?: boolean }) {
  const reported = useReported(reply.id);
  if (reported) return <ReportedNotice what="reply" />;
  const official = reply.role === "manufacturer";
  return (
    <article
      id={reply.id}
      className={cn(
        "relative rounded-[16px] border bg-card p-4 shadow-xs sm:p-5",
        official && "border-claim-manufacturer/30 bg-claim-manufacturer-soft/40",
        reply.accepted && "border-success/40 ring-1 ring-success/25",
        !official && !reply.accepted && "border-border",
        local && "border-brand/40 bg-brand-soft/15",
      )}
    >
      {reply.accepted && (
        <span className="absolute -top-3 left-4 inline-flex h-6 items-center gap-1 rounded-full bg-success px-2.5 text-[11px] font-semibold text-white shadow-sm">
          <CheckCircle2 className="size-3.5" /> Accepted answer
        </span>
      )}
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <UserAvatar src={reply.authorAvatar || undefined} name={reply.authorName} className={cn("size-10", official && "ring-claim-manufacturer/40")} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[14px] font-semibold">{reply.authorName}</span>
            <RoleBadge role={reply.role} company={reply.company} />
            {local && <Badge variant="brand">Posted (demo)</Badge>}
          </p>
          <p className="mt-0.5 text-[12px] text-subtle-foreground">
            <DateDisplay iso={reply.date} relative />
          </p>
        </div>
      </header>
      <Paragraphs text={reply.body} className="mt-3.5 text-[14.5px] leading-relaxed text-foreground/90" />
      {official && (
        <p className="mt-3.5 flex flex-wrap items-center gap-1.5 rounded-[10px] border border-claim-manufacturer/20 bg-surface/70 px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
          <ClaimTypeBadge type="manufacturer" size="xs" />
          Official replies come from the brand&apos;s verified team and are manufacturer claims — not independently verified by Qeivo.
        </p>
      )}
      <footer className="mt-4 flex items-center justify-between gap-2">
        <VoteControl id={reply.id} base={reply.votes} orientation="horizontal" label={`reply by ${reply.authorName}`} />
        {!local && <ReportButton id={reply.id} what="reply" />}
      </footer>
    </article>
  );
}

export function QuestionDetail({ question: q }: { question: CommunityQuestion }) {
  const hydrated = useHydrated();
  const votes = useAppStore((s) => s.votes);
  const profileName = useAppStore((s) => s.profile.name);
  const reported = useReported(q.id);
  const [local, setLocal] = useState<CommunityReply[]>([]);
  const products = q.productIds.map((id) => getProduct(id)).filter((p) => p !== undefined);
  const official = q.replies.find((r) => r.role === "manufacturer");

  const sorted = useMemo(() => {
    const score = (r: CommunityReply) => r.votes + (hydrated ? (votes[r.id] ?? 0) : 0);
    return [...q.replies].sort((a, b) => Number(!!b.accepted) - Number(!!a.accepted) || score(b) - score(a));
  }, [q.replies, votes, hydrated]);

  const related = useMemo(
    () =>
      questions
        .filter((o) => o.id !== q.id && (o.productIds.some((id) => q.productIds.includes(id)) || o.category === q.category))
        .sort((a, b) => Number(b.productIds.some((id) => q.productIds.includes(id))) - Number(a.productIds.some((id) => q.productIds.includes(id))) || b.votes - a.votes)
        .slice(0, 4),
    [q],
  );

  const { register, handleSubmit, reset, watch, formState } = useForm<ReplyValues>({ resolver: zodResolver(replySchema), defaultValues: { body: "" } });
  const len = watch("body")?.length ?? 0;
  const submit = handleSubmit((v) => {
    setLocal((l) => [
      ...l,
      { id: `${q.id}-local-${l.length + 1}`, questionId: q.id, authorName: profileName || "You", authorAvatar: "", role: "customer", body: v.body.trim(), date: DEMO_NOW.toISOString(), votes: 0 },
    ]);
    reset();
    toast.success("Reply posted (demo)", { description: "Shown on this page only — it isn't published or sent to anyone." });
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
      <div className="min-w-0 space-y-6">
        {/* question */}
        {reported ? (
          <ReportedNotice what="question" />
        ) : (
          <section aria-label="Question" className="rounded-[20px] border border-border bg-card p-4 shadow-sm sm:p-6">
            <div className="flex gap-4">
              <VoteControl id={q.id} base={q.votes} label="question" className="hidden sm:flex" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge className="h-6 px-2">{CATEGORY_LABEL[q.category]}</Badge>
                  {q.solved ? (
                    <Badge variant="success" className="h-6 px-2">
                      <CheckCircle2 /> Solved
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="h-6 px-2">
                      Awaiting accepted answer
                    </Badge>
                  )}
                  {official && <RoleBadge role="manufacturer" company={official.company} />}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <UserAvatar src={q.authorAvatar} name={q.authorName} className="size-10" />
                  <div className="min-w-0 text-[13px]">
                    <p className="font-semibold">{q.authorName}</p>
                    <p className="text-[12px] text-subtle-foreground">
                      Asked <DateDisplay iso={q.date} pattern="d MMM yyyy" /> · <span className="tabular">{compactNumber(q.views)}</span> views
                    </p>
                  </div>
                </div>
                <Paragraphs text={q.body} className="mt-4 text-[15px] leading-relaxed text-foreground/90" />
                {q.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {q.tags.map((t) => (
                      <span key={t} className="inline-flex h-7 items-center rounded-full bg-surface-2 px-2.5 text-[12px] font-medium text-muted-foreground">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                  <VoteControl id={q.id} base={q.votes} label="question" orientation="horizontal" className="sm:hidden" />
                  <div className="ml-auto flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-11 sm:h-8"
                      onClick={() => {
                        void navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
                        toast.success("Link copied", { description: "Share this thread with anyone who has the demo." });
                      }}
                    >
                      <Share2 /> Share
                    </Button>
                    <ReportButton id={q.id} what="question" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* replies */}
        <section aria-labelledby="answers-heading" className="space-y-4">
          <div className="flex items-end justify-between gap-3 px-1">
            <h2 id="answers-heading" className="text-[18px] font-semibold tracking-tight sm:text-[20px]">
              {sorted.length + local.length} {sorted.length + local.length === 1 ? "answer" : "answers"}
            </h2>
            <p className="text-[12px] text-subtle-foreground">Accepted first, then most helpful</p>
          </div>
          <div className="space-y-5">
            {sorted.map((r) => (
              <ReplyCard key={r.id} reply={r} />
            ))}
            {local.map((r) => (
              <ReplyCard key={r.id} reply={r} local />
            ))}
          </div>
        </section>

        {/* reply form */}
        <section aria-labelledby="reply-heading" className="rounded-[20px] border border-border bg-card p-4 shadow-xs sm:p-6">
          <h2 id="reply-heading" className="text-[16px] font-semibold">
            Your answer
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">Share first-hand experience, measurements or a cited source. Owner replies are shown as customer opinion.</p>
          <form onSubmit={submit} noValidate className="mt-4 space-y-3">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="reply-body">Reply</Label>
                <span className="text-[11px] text-subtle-foreground tabular">{len} / 3000</span>
              </div>
              <Textarea id="reply-body" rows={5} placeholder="e.g. We fitted the same model in a 915 mm opening — here's what we had to change…" aria-invalid={!!formState.errors.body} aria-describedby="reply-err" {...register("body")} />
              {formState.errors.body && (
                <p id="reply-err" role="alert" className="text-[12px] text-danger-foreground">
                  {formState.errors.body.message}
                </p>
              )}
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-1.5 text-[12px] text-subtle-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" /> Demo: replies stay on this page and aren&apos;t published.
              </p>
              <Button type="submit" variant="brand" className="h-11 sm:h-10">
                <Send /> Post reply
              </Button>
            </div>
          </form>
        </section>
      </div>

      {/* sidebar */}
      <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="grid grid-cols-3 divide-x divide-border rounded-[16px] border border-border bg-card shadow-xs">
          {[
            { label: "Answers", value: q.replies.length + local.length, icon: MessageSquare },
            { label: "Views", value: compactNumber(q.views), icon: Eye },
            { label: "Status", value: q.solved ? "Solved" : "Open", icon: CheckCircle2 },
          ].map((s) => (
            <div key={s.label} className="px-3 py-3 text-center">
              <s.icon className="mx-auto size-4 text-subtle-foreground" />
              <p className="mt-1 text-[15px] font-semibold tabular">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {products.length > 0 && (
          <div className="rounded-[16px] border border-border bg-card p-4 shadow-xs">
            <p className="text-[13px] font-semibold">Products in this thread</p>
            <div className="mt-3 space-y-2">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} variant="compact" />
              ))}
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="rounded-[16px] border border-border bg-card p-4 shadow-xs">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold">
              <MessagesSquare className="size-4 text-brand" /> Related threads
            </p>
            <ul className="mt-2 divide-y divide-border">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={routes.question(r.slug)} className="group flex items-start gap-2 py-2.5 text-[13px]">
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 font-medium leading-snug group-hover:text-brand-soft-foreground">{r.title}</span>
                      <span className="mt-0.5 block text-[11px] text-subtle-foreground tabular">
                        {r.replies.length} answers{r.solved ? " · Solved" : ""}
                      </span>
                    </span>
                    <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-subtle-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
            <Button asChild variant="ghost" size="sm" className="mt-1 h-10 w-full">
              <Link href={routes.community}>Browse all threads</Link>
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
