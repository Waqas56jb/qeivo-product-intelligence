"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpenText } from "lucide-react";
import type { BuyingGuide, CategorySlug } from "@/types";
import { categories } from "@/data/products/categories";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/tabs";
import { FilterChip, SearchField } from "@/components/common/controls";
import { EmptyState } from "@/components/common/states";
import { GuideCard } from "./guide-card";

type Sort = "updated" | "quick";
const PAGE = 9;

/** Client-side filterable guide grid: search, category chips, topic filters and sort. */
export function GuideLibrary({ guides, className }: { guides: BuyingGuide[]; className?: string }) {
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const [topic, setTopic] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("updated");
  const [limit, setLimit] = useState(PAGE);

  const inCategory = useMemo(() => guides.filter((g) => category === "all" || g.category === category), [guides, category]);
  const topics = useMemo(() => {
    const m = new Map<string, number>();
    inCategory.forEach((g) => m.set(g.topic, (m.get(g.topic) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [inCategory]);

  const results = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const list = inCategory.filter((g) => {
      if (topic && g.topic !== topic) return false;
      if (!terms.length) return true;
      const hay = `${g.title} ${g.excerpt} ${g.topic} ${g.author.name} ${g.sections.map((s) => s.heading).join(" ")}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
    return list.sort((a, b) => (sort === "quick" ? a.readingMinutes - b.readingMinutes : b.updatedAt.localeCompare(a.updatedAt)));
  }, [inCategory, topic, query, sort]);

  const reset = () => {
    setCategory("all");
    setTopic(null);
    setQuery("");
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchField value={query} onChange={setQuery} placeholder="Search guides, topics or authors" className="md:max-w-md md:flex-1" />
          <ToggleGroup type="single" value={sort} onValueChange={(v) => v && setSort(v as Sort)} aria-label="Sort guides" className="self-start md:self-auto">
            <ToggleGroupItem value="updated" className="px-3">Recently updated</ToggleGroupItem>
            <ToggleGroupItem value="quick" className="px-3">Quickest read</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div role="group" aria-label="Category" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <FilterChip active={category === "all"} onClick={() => { setCategory("all"); setTopic(null); }} count={guides.length}>
            All guides
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.slug} active={category === c.slug} onClick={() => { setCategory(c.slug); setTopic(null); }} count={guides.filter((g) => g.category === c.slug).length}>
              {c.name}
            </FilterChip>
          ))}
        </div>
        <div role="group" aria-label="Topic" className="scrollbar-none -mx-4 flex items-center gap-x-1 gap-y-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <span className="mr-1 shrink-0 text-[12px] font-semibold uppercase tracking-wider text-subtle-foreground">Topics</span>
          {topics.map(([t, n]) => (
            <button
              key={t}
              type="button"
              aria-pressed={topic === t}
              onClick={() => setTopic(topic === t ? null : t)}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-[8px] px-2.5 text-[13px] font-medium transition-colors",
                topic === t ? "bg-brand-soft text-brand-soft-foreground" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
              )}
            >
              {t} <span className="text-[11px] text-subtle-foreground tabular">{n}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-[14px] text-muted-foreground" aria-live="polite">
          Showing <span className="font-semibold text-foreground tabular">{results.length}</span> of <span className="tabular">{guides.length}</span> guides
          {topic && <> in <span className="font-medium text-foreground">{topic}</span></>}
        </p>
        {(category !== "all" || topic || query) && (
          <Button variant="link" size="sm" onClick={reset}>
            Clear filters
          </Button>
        )}
      </div>

      {results.length === 0 ? (
        <EmptyState icon={BookOpenText} title="No guides match your search" description="Try a broader term such as “energy”, “noise” or “capacity”, or clear the filters." action={<Button variant="outline" onClick={reset}>Reset filters</Button>} />
      ) : (
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {results.slice(0, limit).map((g, i) => (
              <motion.div key={g.slug} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <GuideCard guide={g} priority={i < 3} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      {results.length > limit && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" size="lg" onClick={() => setLimit((l) => l + PAGE)}>
            Show more guides <span className="text-muted-foreground tabular">({results.length - limit} more)</span>
          </Button>
        </div>
      )}
    </div>
  );
}
