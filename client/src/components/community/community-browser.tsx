"use client";

import { useMemo, useState } from "react";
import { ArrowDownWideNarrow, BadgeCheck, Building2, CheckCircle2, Clock, Flame, HelpCircle, MessagesSquare, PenSquare, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { CategorySlug, CommunityQuestion } from "@/types";
import { questions } from "@/data/community";
import { categories } from "@/data/products";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/ui/primitives";
import { EmptyState } from "@/components/common/states";
import { FilterChip, SearchField } from "@/components/common/controls";
import { ClaimTypeBadge } from "@/components/analysis/badges";
import { AskQuestionSheet } from "./ask-question-sheet";
import { QuestionCard } from "./question-card";
import { RoleBadge } from "./community-bits";

type Sort = "top" | "new" | "unanswered";

const SORTS: { value: Sort; label: string; icon: typeof Flame; hint: string }[] = [
  { value: "top", label: "Top", icon: Flame, hint: "Most upvoted" },
  { value: "new", label: "New", icon: Clock, hint: "Most recent" },
  { value: "unanswered", label: "Unanswered", icon: HelpCircle, hint: "No accepted answer yet" },
];

export function CommunityBrowser() {
  const hydrated = useHydrated();
  const votes = useAppStore((s) => s.votes);
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("top");
  const [askOpen, setAskOpen] = useState(false);
  const [local, setLocal] = useState<CommunityQuestion[]>([]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: questions.length };
    for (const q of questions) c[q.category] = (c[q.category] ?? 0) + 1;
    return c;
  }, []);

  const list = useMemo(() => {
    const term = query.trim().toLowerCase();
    const score = (q: CommunityQuestion) => q.votes + (hydrated ? (votes[q.id] ?? 0) : 0);
    let rows = questions.filter((q) => (category === "all" || q.category === category) && (!term || `${q.title} ${q.body} ${q.tags.join(" ")}`.toLowerCase().includes(term)));
    if (sort === "unanswered") rows = rows.filter((q) => !q.solved);
    return [...rows].sort((a, b) => (sort === "new" ? b.date.localeCompare(a.date) : sort === "unanswered" ? b.date.localeCompare(a.date) : score(b) - score(a)));
  }, [category, query, sort, votes, hydrated]);

  const solved = questions.filter((q) => q.solved).length;
  const official = questions.filter((q) => q.hasOfficialReply).length;
  const answers = questions.reduce((n, q) => n + q.replies.length, 0);

  const experts = useMemo(() => {
    const m = new Map<string, { name: string; avatar: string; count: number; accepted: number }>();
    for (const q of questions)
      for (const r of q.replies)
        if (r.role === "expert") {
          const e = m.get(r.authorName) ?? { name: r.authorName, avatar: r.authorAvatar, count: 0, accepted: 0 };
          e.count++;
          if (r.accepted) e.accepted++;
          m.set(r.authorName, e);
        }
    return [...m.values()].sort((a, b) => b.count - a.count).slice(0, 4);
  }, []);

  const shownLocal = local.filter((q) => category === "all" || q.category === category);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-8">
      <div className="min-w-0 space-y-5">
        <Button variant="brand" className="h-12 w-full rounded-[14px] lg:hidden" onClick={() => setAskOpen(true)}>
          <PenSquare /> Ask a question
        </Button>
        {/* stat strip */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            { label: "Threads", value: questions.length, icon: MessagesSquare },
            { label: "Answers", value: answers, icon: PenSquare },
            { label: "Solved", value: `${Math.round((solved / questions.length) * 100)}%`, icon: CheckCircle2 },
            { label: "Official replies", value: official, icon: Building2 },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-[14px] border border-border bg-card px-3.5 py-3 shadow-xs">
              <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-muted-foreground">
                <s.icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[18px] font-semibold leading-none tabular">{s.value}</p>
                <p className="mt-1 truncate text-[12px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* filters */}
        <div className="space-y-3 rounded-[16px] border border-border bg-card p-3 shadow-xs sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchField value={query} onChange={setQuery} placeholder="Search questions, models, tags…" className="flex-1" ariaLabel="Search community questions" />
            <ToggleGroup type="single" value={sort} onValueChange={(v) => v && setSort(v as Sort)} aria-label="Sort questions" className="self-start sm:self-auto">
              {SORTS.map((s) => (
                <ToggleGroupItem key={s.value} value={s.value} title={s.hint} className="h-10 px-3 sm:h-9">
                  <s.icon /> {s.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="scrollbar-none -mx-3 flex gap-2 overflow-x-auto px-3 sm:-mx-4 sm:px-4" role="group" aria-label="Filter by category">
            <FilterChip active={category === "all"} onClick={() => setCategory("all")} count={counts.all}>
              All topics
            </FilterChip>
            {categories.map((c) => (
              <FilterChip key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)} count={counts[c.slug] ?? 0}>
                {c.name}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground tabular">{list.length}</span> {list.length === 1 ? "thread" : "threads"}
            {sort === "unanswered" && " without an accepted answer"}
          </p>
          <span className="hidden items-center gap-1.5 text-[12px] text-subtle-foreground sm:inline-flex">
            <ArrowDownWideNarrow className="size-3.5" /> {SORTS.find((s) => s.value === sort)?.hint}
          </span>
        </div>

        <div className="space-y-3" data-testid="question-list">
          {shownLocal.map((q) => (
            <QuestionCard key={q.id} question={q} local />
          ))}
          {list.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
          {list.length === 0 && shownLocal.length === 0 && (
            <EmptyState
              icon={MessagesSquare}
              title="No threads match"
              description={query ? `Nothing matches “${query}” in this topic. Try a model number or a broader word.` : "No threads in this view yet."}
              action={
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery("");
                      setCategory("all");
                      setSort("top");
                    }}
                  >
                    Clear filters
                  </Button>
                  <Button variant="brand" onClick={() => setAskOpen(true)}>
                    <PenSquare /> Ask a question
                  </Button>
                </>
              }
            />
          )}
        </div>
      </div>

      {/* sidebar */}
      <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="relative overflow-hidden rounded-[20px] bg-navy-sheen p-5 text-white shadow-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-400">Can&apos;t find an answer?</p>
          <p className="mt-2 text-[17px] font-semibold leading-snug">Ask owners, Qeivo experts and verified manufacturer teams.</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-white/70">Most questions with measurements get an expert reply within a day.</p>
          <Button variant="brand" className="mt-4 h-11 w-full" onClick={() => setAskOpen(true)}>
            <PenSquare /> Ask a question
          </Button>
        </div>

        <div className="rounded-[16px] border border-border bg-card p-4 shadow-xs">
          <p className="text-[13px] font-semibold">Who answers here</p>
          <ul className="mt-3 space-y-3 text-[12.5px] leading-relaxed text-muted-foreground">
            <li className="space-y-1.5">
              <RoleBadge role="expert" />
              <p>Qeivo&apos;s in-house analysts. They cite manuals, lab data and measurements.</p>
            </li>
            <li className="space-y-1.5">
              <RoleBadge role="manufacturer" company="Brand" />
              <p className="flex flex-wrap items-center gap-1.5">
                Verified brand teams. Their statements are treated as <ClaimTypeBadge type="manufacturer" size="xs" /> claims, not verified fact.
              </p>
            </li>
            <li className="space-y-1.5">
              <RoleBadge role="customer" />
              <p>Owners sharing first-hand experience. Subjective and not independently verified.</p>
            </li>
          </ul>
        </div>

        <div className="rounded-[16px] border border-border bg-card p-4 shadow-xs">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold">
            <BadgeCheck className="size-4 text-brand" /> Most helpful experts
          </p>
          <ul className="mt-3 space-y-2.5">
            {experts.map((e) => (
              <li key={e.name} className="flex items-center gap-3">
                <UserAvatar src={e.avatar} name={e.name} className="size-8" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{e.name}</p>
                  <p className="text-[11px] text-subtle-foreground tabular">
                    {e.count} answers · {e.accepted} accepted
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-start gap-2.5 rounded-[14px] border border-border bg-surface-2/50 p-3.5 text-[12px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
          <span>Community votes never change suitability scores or rankings. Undisclosed promotion is removed.</span>
        </div>
      </aside>

      <AskQuestionSheet
        open={askOpen}
        onOpenChange={setAskOpen}
        counter={local.length}
        onPosted={(q) => {
          setLocal((l) => [q, ...l]);
          if (category !== "all" && category !== q.category) setCategory("all");
          toast.success("Question posted (demo)", { description: "Added to this page only — it isn't published or sent to anyone." });
        }}
      />

    </div>
  );
}
