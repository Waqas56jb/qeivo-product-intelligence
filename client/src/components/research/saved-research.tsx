"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Bookmark, FolderOpen, FolderPlus, GitCompareArrows, NotebookPen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ResearchFolder } from "@/types";
import { getProduct } from "@/data/products";
import { productNotes, researchFolders, savedProducts } from "@/data/research/saved-products";
import { savedComparisons } from "@/data/research/comparisons";
import { routes } from "@/config/routes";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { EmptyState, LoadingSkeleton } from "@/components/common/states";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { ProductCard } from "@/components/product/product-card";
import { BrandLabel } from "@/components/product/product-bits";
import { ScorePill } from "@/components/analysis/score";

const UNSORTED = "unsorted";
const COLORS = ["#2E5A7A", "#2F7D5B", "#B5482F", "#7A5C8E", "#C49A2C", "#1F7A8C"];

export function SavedResearch() {
  const router = useRouter();
  const hydrated = useHydrated();
  const saved = useAppStore((s) => s.saved);
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  const notes = useAppStore((s) => s.notes);
  const setNote = useAppStore((s) => s.setNote);
  const setCompare = useAppStore((s) => s.setCompare);

  const [folders, setFolders] = useState<ResearchFolder[]>(researchFolders);
  const [assign, setAssign] = useState<Record<string, string>>(() => Object.fromEntries(savedProducts.map((s) => [s.productId, s.folderId])));
  const [active, setActive] = useState<string>("all");
  const [newOpen, setNewOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const ids = useMemo(() => (hydrated ? saved : []), [hydrated, saved]);
  const items = ids.map((id) => getProduct(id)).filter((p) => p !== undefined);
  const inFolder = (folderId: string) => items.filter((p) => (assign[p.id] ?? UNSORTED) === folderId);
  const shown = active === "all" ? items : inFolder(active);
  const noteFor = (id: string) => notes[id] ?? productNotes.find((n) => n.productId === id)?.body ?? savedProducts.find((s) => s.productId === id)?.note ?? "";
  const noted = items.filter((p) => noteFor(p.id));

  if (!hydrated) return <LoadingSkeleton count={6} />;

  return (
    <Tabs defaultValue="products" className="space-y-6">
      <TabsList>
        <TabsTrigger value="products">
          <Bookmark /> Products <span className="tabular text-subtle-foreground">{items.length}</span>
        </TabsTrigger>
        <TabsTrigger value="notes">
          <NotebookPen /> Notes <span className="tabular text-subtle-foreground">{noted.length}</span>
        </TabsTrigger>
        <TabsTrigger value="comparisons">
          <GitCompareArrows /> Comparisons <span className="tabular text-subtle-foreground">{savedComparisons.length}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="products" className="space-y-5">
        <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-4">
          {[{ id: "all", name: "All saved", description: "Everything you've saved", color: "#304B65" } as ResearchFolder, ...folders, { id: UNSORTED, name: "Unsorted", description: "Saved but not yet filed", color: "#8A97A8" } as ResearchFolder].map((fd) => {
            const count = fd.id === "all" ? items.length : inFolder(fd.id).length;
            return (
              <button
                key={fd.id}
                type="button"
                onClick={() => setActive(fd.id)}
                aria-pressed={active === fd.id}
                className={cn("w-60 shrink-0 rounded-[16px] border bg-card p-4 text-left shadow-xs transition-all sm:w-auto", active === fd.id ? "border-brand ring-1 ring-brand" : "border-border hover:border-border-strong")}
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-9 place-items-center rounded-[10px] text-white" style={{ backgroundColor: fd.color }}>
                    <FolderOpen className="size-4" />
                  </span>
                  <span className="tabular text-[13px] font-semibold">{count}</span>
                </div>
                <p className="mt-3 truncate text-[14px] font-semibold">{fd.name}</p>
                <p className="line-clamp-2 text-[12px] text-muted-foreground">{fd.description}</p>
              </button>
            );
          })}
          <button type="button" onClick={() => setNewOpen(true)} className="grid w-60 shrink-0 place-items-center rounded-[16px] border border-dashed border-border-strong p-4 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground sm:w-auto">
            <span className="flex flex-col items-center gap-2">
              <FolderPlus className="size-5" /> New folder
            </span>
          </button>
        </div>

        {shown.length === 0 ? (
          <EmptyState icon={Bookmark} title={items.length ? "This folder is empty" : "Nothing saved yet"} description="Save products from the catalog or any product page to build your shortlist." action={<Button asChild><Link href={routes.products}>Explore products</Link></Button>} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {shown.map((p) => (
              <div key={p.id} className="space-y-2">
                <ProductCard product={p} />
                <div className="flex items-center gap-2">
                  <Select
                    value={assign[p.id] ?? UNSORTED}
                    onValueChange={(v) => {
                      setAssign({ ...assign, [p.id]: v });
                      toast.success(`Moved to ${folders.find((f) => f.id === v)?.name ?? "Unsorted"}`);
                    }}
                  >
                    <SelectTrigger size="sm" className="flex-1" aria-label={`Folder for ${p.model}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                        </SelectItem>
                      ))}
                      <SelectItem value={UNSORTED}>Unsorted</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon-sm" onClick={() => toggleSaved(p.id)} aria-label={`Remove ${p.model} from saved`}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="notes" className="space-y-3">
        {items.length === 0 && <EmptyState icon={NotebookPen} title="No saved products to annotate" />}
        {items.map((p) => {
          const value = drafts[p.id] ?? noteFor(p.id);
          return (
            <div key={p.id} className="flex flex-col gap-4 rounded-[16px] border border-border bg-card p-4 shadow-xs sm:flex-row">
              <Link href={routes.product(p.slug)} className="flex w-full items-center gap-3 sm:w-56 sm:shrink-0">
                <ImageWithFallback src={p.images[0]} alt="" aspect="size-14 shrink-0 rounded-[10px] bg-surface-2" sizes="56px" className="p-1" />
                <span className="min-w-0">
                  <BrandLabel brandId={p.brandId} className="text-[10px]" />
                  <span className="block truncate text-[14px] font-semibold">{p.model}</span>
                </span>
              </Link>
              <div className="flex-1 space-y-2">
                <Textarea value={value} onChange={(e) => setDrafts({ ...drafts, [p.id]: e.target.value })} placeholder="Add a note — measurements, questions for the retailer, deal-breakers…" className="min-h-20" aria-label={`Note for ${p.model}`} />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={drafts[p.id] === undefined}
                    onClick={() => {
                      setNote(p.id, value);
                      const { [p.id]: _, ...rest } = drafts;
                      void _;
                      setDrafts(rest);
                      toast.success("Note saved", { description: "Stored on this device (demo)." });
                    }}
                  >
                    Save note
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </TabsContent>

      <TabsContent value="comparisons" className="grid gap-4 md:grid-cols-2">
        {savedComparisons.map((c) => {
          const ps = c.productIds.map((id) => getProduct(id)).filter((p) => p !== undefined);
          return (
            <article key={c.id} className="flex flex-col rounded-[20px] border border-border bg-card p-5 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-[12px] text-muted-foreground">Saved {formatDate(c.createdAt)} · {ps.length} products</p>
                </div>
                <GitCompareArrows className="size-5 text-brand" />
              </div>
              <div className="mt-4 space-y-2">
                {ps.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-[12px] bg-surface-2/60 p-2">
                    <ImageWithFallback src={p.images[0]} alt="" aspect="size-10 shrink-0 rounded-[8px] bg-surface" sizes="40px" className="p-1" />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{p.name}</span>
                    <ScorePill score={p.suitabilityScore} />
                  </div>
                ))}
              </div>
              <p className="mt-4 flex-1 rounded-[12px] border border-brand/20 bg-brand-soft/30 p-3 text-[13px] leading-relaxed">{c.verdict}</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => {
                  setCompare(c.productIds);
                  router.push(routes.compare);
                }}
              >
                Open in compare
              </Button>
            </article>
          );
        })}
      </TabsContent>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New research folder</DialogTitle>
            <DialogDescription>Group products for a room, a project or a decision.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim().length < 2) return;
              const id = `fd-new-${folders.length}`;
              setFolders([...folders, { id, name: name.trim(), description: desc.trim() || "Custom folder", color: COLORS[folders.length % COLORS.length] }]);
              setActive(id);
              setName("");
              setDesc("");
              setNewOpen(false);
              toast.success("Folder created");
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="fname">Name</Label>
              <Input id="fname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Holiday cottage kitchen" aria-invalid={name.length > 0 && name.trim().length < 2} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fdesc">Description (optional)</Label>
              <Input id="fdesc" value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={name.trim().length < 2}>
                Create folder
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
