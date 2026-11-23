"use client";

import { Bookmark, BookmarkCheck, PlaySquare } from "lucide-react";
import { toast } from "sonner";
import type { Video } from "@/types";
import { getProduct } from "@/data/products";
import { routes } from "@/config/routes";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { VideoCard } from "./video-card";
import { VideoLibrary } from "./video-library";

function SaveVideo({ slug, title }: { slug: string; title: string }) {
  const hydrated = useHydrated();
  const saved = useAppStore((s) => s.savedVideos.includes(slug));
  const toggle = useAppStore((s) => s.toggleSavedVideo);
  const on = hydrated && saved;
  return (
    <Button
      variant={on ? "subtle" : "outline"}
      size="sm"
      aria-pressed={on}
      onClick={() => {
        toggle(slug);
        toast.success(on ? "Removed from saved videos" : "Video saved", { description: title });
      }}
    >
      {on ? <BookmarkCheck /> : <Bookmark />} {on ? "Saved" : "Save"}
    </Button>
  );
}

/** In-app library: full filterable library plus the user's saved videos with product relationships. */
export function SavedVideos({ videos }: { videos: Video[] }) {
  const hydrated = useHydrated();
  const savedSlugs = useAppStore((s) => s.savedVideos);
  const saved = hydrated ? videos.filter((v) => savedSlugs.includes(v.slug)) : [];
  const forYou = videos.filter((v) => v.productIds.some((id) => ["p-nordvik-frostline-fd600", "p-halden-precision-fd590", "p-ovea-eco-fd520", "p-halden-pureclean-w9"].includes(id))).slice(0, 6);

  return (
    <Tabs defaultValue="library" className="space-y-6">
      <TabsList>
        <TabsTrigger value="library">All videos</TabsTrigger>
        <TabsTrigger value="foryou">For your research</TabsTrigger>
        <TabsTrigger value="saved">
          Saved <span className="tabular text-subtle-foreground">{saved.length}</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="library">
        <VideoLibrary videos={videos} />
      </TabsContent>
      {[
        { key: "foryou", list: forYou, empty: "No videos linked to your saved products" },
        { key: "saved", list: saved, empty: "No saved videos yet" },
      ].map((t) => (
        <TabsContent key={t.key} value={t.key}>
          {t.list.length === 0 ? (
            <EmptyState icon={PlaySquare} title={t.empty} description="Save videos from the library to watch later." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {t.list.map((v) => (
                <div key={v.id} className="space-y-2">
                  <VideoCard video={v} />
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="flex min-w-0 flex-wrap gap-1.5">
                      {v.productIds.slice(0, 2).map((id) => {
                        const p = getProduct(id);
                        return p ? (
                          <Link key={id} href={routes.product(p.slug)} className="truncate rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                            {p.model}
                          </Link>
                        ) : null;
                      })}
                    </div>
                    <SaveVideo slug={v.slug} title={v.title} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
