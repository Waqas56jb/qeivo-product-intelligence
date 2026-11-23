"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookmarkPlus, GitCompareArrows, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { getProduct } from "@/data/products";
import { savedComparisons } from "@/data/research/comparisons";
import { routes } from "@/config/routes";
import { hasCustomPriorities, personalScore } from "@/lib/scoring";
import { DEMO_NOW } from "@/lib/utils";
import { MAX_COMPARE, useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import { Label, Switch } from "@/components/ui/primitives";
import { EmptyState, LoadingSkeleton } from "@/components/common/states";
import { DataWarningCard } from "@/components/analysis/warnings";
import { ProductCard } from "@/components/product/product-card";
import { ProductCompareSelector } from "@/components/product-detail/product-compare-selector";
import { ComparisonTable } from "./comparison-table";
import { ComparisonAdvantages, ComparisonVerdict } from "./comparison-verdict";
import { ComparisonSnapshot, type ComparisonSnapshotItem } from "./comparison-snapshot";
import { bestValue, buildSpecGroups, buildVerdict, isMixedCategories } from "./compare-utils";

const SEED_SNAPSHOTS: ComparisonSnapshotItem[] = savedComparisons.map((c) => ({ id: c.id, name: c.name, productIds: c.productIds, createdAt: c.createdAt, verdict: c.verdict }));

function SectionTitle({ id, title, description }: { id: string; title: string; description?: string }) {
  return (
    <div id={id} className="mb-4 scroll-mt-28">
      <h2 className="text-[19px] font-semibold tracking-tight">{title}</h2>
      {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
    </div>
  );
}

/** Client comparison workspace: reads the persisted compare list and updates live. */
export function ComparisonWorkspace() {
  const hydrated = useHydrated();
  const ids = useAppStore((s) => s.compare);
  const priorities = useAppStore((s) => s.priorities);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const setCompare = useAppStore((s) => s.setCompare);
  const clearCompare = useAppStore((s) => s.clearCompare);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [snapshots, setSnapshots] = useState<ComparisonSnapshotItem[]>(SEED_SNAPSHOTS);

  const items = useMemo(() => ids.map((id) => getProduct(id)).filter((p): p is Product => p !== undefined), [ids]);
  const personalised = hasCustomPriorities(priorities);
  const scores = useMemo(() => Object.fromEntries(items.map((p) => [p.id, personalScore(p, priorities)])), [items, priorities]);
  const groups = useMemo(() => buildSpecGroups(items), [items]);
  const { verdict, tradeOffs } = useMemo(() => buildVerdict(items, scores), [items, scores]);
  const value = items.length >= 2 ? bestValue(items, scores) : undefined;
  const mixed = isMixedCategories(items);

  if (!hydrated) return <LoadingSkeleton variant="table" count={5} />;

  const add = (p: Product) => {
    const r = toggleCompare(p.id);
    if (r === "full") toast.error(`You can compare up to ${MAX_COMPARE} products`, { description: "Remove one before adding another." });
    else toast.success("Added to comparison", { description: p.name });
    setPickerOpen(false);
  };
  const remove = (id: string) => {
    const p = getProduct(id);
    const before = ids;
    toggleCompare(id);
    toast("Removed from comparison", { description: p?.name, action: { label: "Undo", onClick: () => setCompare(before) } });
  };
  const save = () => {
    const snap: ComparisonSnapshotItem = {
      id: `local-${snapshots.length + 1}`,
      name: items.map((p) => p.model).join(" vs "),
      productIds: items.map((p) => p.id),
      createdAt: DEMO_NOW.toISOString(),
      local: true,
    };
    setSnapshots((s) => [snap, ...s]);
    toast.success("Comparison saved (demo)", { description: "Saved for this session only — nothing is sent to a server." });
  };
  const restore = (s: ComparisonSnapshotItem) => {
    setCompare(s.productIds);
    toast.success("Comparison restored", { description: s.name });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const picker = (
    <ProductCompareSelector
      open={pickerOpen}
      onOpenChange={setPickerOpen}
      onSelect={add}
      excludeIds={ids}
      category={items[0]?.category}
      title="Add a product to compare"
      description={`${items.length} of ${MAX_COMPARE} selected. Products from the same category compare best.`}
    />
  );

  if (items.length < 2)
    return (
      <div className="space-y-8">
        <EmptyState
          icon={GitCompareArrows}
          title={items.length === 0 ? "Start a comparison" : "Add one more product"}
          description={items.length === 0 ? "Choose two to four products to see normalised specifications, highlighted differences and a sourced verdict side by side." : `You have ${items[0].model} selected. Add at least one more product to compare.`}
          action={
            <>
              <Button variant="brand" size="lg" onClick={() => setPickerOpen(true)}>
                <Plus /> Add product
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={routes.products}>Browse catalog</Link>
              </Button>
            </>
          }
        />
        {items.length === 1 && <ProductCard product={items[0]} variant="list" />}
        <ComparisonSnapshot snapshots={snapshots} currentIds={ids} onRestore={restore} />
        {picker}
      </div>
    );

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-2 sm:pl-4">
          <div className="flex min-h-11 items-center gap-3">
            <Switch id="diff-only" checked={differencesOnly} onCheckedChange={setDifferencesOnly} />
            <Label htmlFor="diff-only" className="cursor-pointer text-[14px]">
              Show differences only
            </Label>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            <Button variant="outline" className="h-11 sm:h-10" onClick={() => setPickerOpen(true)} disabled={items.length >= MAX_COMPARE}>
              <Plus /> <span className="truncate">Add</span>
            </Button>
            <Button variant="outline" className="h-11 sm:h-10" onClick={save}>
              <BookmarkPlus /> <span className="truncate">Save</span>
            </Button>
            <Button
              variant="ghost"
              className="h-11 text-muted-foreground sm:h-10"
              onClick={() => {
                const before = ids;
                clearCompare();
                toast("Comparison cleared", { action: { label: "Undo", onClick: () => setCompare(before) } });
              }}
            >
              <Trash2 /> <span className="truncate">Clear</span>
            </Button>
          </div>
        </div>
        {mixed && (
          <DataWarningCard
            warning={{
              kind: "unknown-compatibility",
              title: "You are comparing products from different categories",
              detail: "Only specifications that every product publishes are shown, and category-specific measurements are left out. Suitability scores use category-specific factors, so treat cross-category rankings as indicative.",
            }}
          />
        )}
      </div>

      <section aria-labelledby="cmp-table">
        <h2 id="cmp-table" className="sr-only">
          Side-by-side specifications
        </h2>
        <ComparisonTable items={items} scores={scores} personalised={personalised} groups={groups} differencesOnly={differencesOnly} bestValueId={value?.id} onRemove={remove} onAdd={() => setPickerOpen(true)} />
      </section>

      <section>
        <SectionTitle id="verdict" title="Verdict" description="Generated deterministically from the data above. Every statement is classified and linked to its sources." />
        <ComparisonVerdict verdict={verdict} tradeOffs={tradeOffs} />
      </section>

      <section>
        <SectionTitle id="pros-cons" title="Advantages and disadvantages" description="Where each product wins or loses within this comparison, plus its key cited strengths and limitations." />
        <ComparisonAdvantages items={items} groups={groups} />
      </section>

      <ComparisonSnapshot snapshots={snapshots} currentIds={ids} onRestore={restore} />
      {picker}
    </div>
  );
}
