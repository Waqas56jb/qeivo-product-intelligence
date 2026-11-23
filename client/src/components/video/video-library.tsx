"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clapperboard } from "lucide-react";
import type { CategorySlug, Video, VideoKind } from "@/types";
import { categories } from "@/data/products/categories";
import { getProduct } from "@/data/products";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch, Label } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { FilterChip, SearchField } from "@/components/common/controls";
import { EmptyState } from "@/components/common/states";
import { VideoCard } from "./video-card";
import { VIDEO_KIND_META, VIDEO_KIND_ORDER, videoCreator } from "./video-meta";

type Sort = "newest" | "views" | "shortest";
const PAGE = 12;

function haystack(v: Video) {
  const products = v.productIds.map((id) => getProduct(id)?.name ?? "").join(" ");
  return `${v.title} ${v.description} ${videoCreator(v)?.name ?? ""} ${products}`.toLowerCase();
}

/** Filterable video gallery (kind, category, search, sponsored visibility, sort). Client-side only. */
export function VideoLibrary({ videos, className }: { videos: Video[]; className?: string }) {
  const [kind, setKind] = useState<VideoKind | "all">("all");
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const [query, setQuery] = useState("");
  const [hideSponsored, setHideSponsored] = useState(false);
  const [sort, setSort] = useState<Sort>("newest");
  const [limit, setLimit] = useState(PAGE);

  const index = useMemo(() => new Map(videos.map((v) => [v.id, haystack(v)])), [videos]);

  const base = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos.filter((v) => (category === "all" || v.category === category) && (!hideSponsored || !v.sponsored) && (!q || q.split(/\s+/).every((t) => index.get(v.id)!.includes(t))));
  }, [videos, category, hideSponsored, query, index]);

  const results = useMemo(() => {
    const list = base.filter((v) => kind === "all" || v.kind === kind);
    return list.sort((a, b) => (sort === "views" ? b.views - a.views : sort === "shortest" ? a.durationSeconds - b.durationSeconds : b.publishedAt.localeCompare(a.publishedAt)));
  }, [base, kind, sort]);

  const reset = () => {
    setKind("all");
    setCategory("all");
    setQuery("");
    setHideSponsored(false);
  };
  const filtered = kind !== "all" || category !== "all" || query || hideSponsored;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-4 rounded-[20px] border border-border bg-card p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <SearchField value={query} onChange={setQuery} placeholder="Search videos, creators or products" className="md:max-w-md md:flex-1" />
          <div className="flex flex-wrap items-center gap-3 md:ml-auto">
            <Select value={category} onValueChange={(v) => setCategory(v as CategorySlug | "all")}>
              <SelectTrigger className="w-[180px]" aria-label="Category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="w-[150px]" aria-label="Sort videos">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="views">Most viewed</SelectItem>
                <SelectItem value="shortest">Shortest first</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch id="hide-sponsored" checked={hideSponsored} onCheckedChange={setHideSponsored} />
              <Label htmlFor="hide-sponsored" className="text-[13px] font-medium text-muted-foreground">
                Hide sponsored
              </Label>
            </div>
          </div>
        </div>
        <div role="group" aria-label="Video type" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <FilterChip active={kind === "all"} onClick={() => setKind("all")} count={base.length}>
            All videos
          </FilterChip>
          {VIDEO_KIND_ORDER.map((k) => {
            const m = VIDEO_KIND_META[k];
            return (
              <FilterChip key={k} active={kind === k} onClick={() => setKind(k)} count={base.filter((v) => v.kind === k).length}>
                <m.icon className="size-3.5" /> {m.plural}
              </FilterChip>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] text-muted-foreground" aria-live="polite">
          <span className="font-semibold text-foreground tabular">{results.length}</span> {results.length === 1 ? "video" : "videos"}
          {kind !== "all" && <> · {VIDEO_KIND_META[kind].plural}</>}
        </p>
        {filtered && (
          <Button variant="link" size="sm" onClick={reset}>
            Clear filters
          </Button>
        )}
      </div>

      {results.length === 0 ? (
        <EmptyState icon={Clapperboard} title="No videos match these filters" description="Try another type or category, or clear the search to see the whole library." action={<Button variant="outline" onClick={reset}>Reset filters</Button>} />
      ) : (
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {results.slice(0, limit).map((v, i) => (
              <motion.div key={v.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <VideoCard video={v} priority={i < 3} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      {results.length > limit && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" size="lg" onClick={() => setLimit((l) => l + PAGE)}>
            Show more videos <span className="text-muted-foreground tabular">({results.length - limit} more)</span>
          </Button>
        </div>
      )}
    </div>
  );
}
