"use client";

import { useState } from "react";
import { BellRing, Mail, Pencil, Smartphone, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { RegionCode } from "@/types";
import { requireProduct } from "@/data/products";
import { formatCurrency, formatPrice, regionalPrice, REGIONS } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppStore, type WatchItem } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Slider, Switch } from "@/components/ui/primitives";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { lowestPrice, toUsdBase } from "./price-utils";

/** Dialog to create or edit a price-drop target. Amounts are typed in the region's currency. */
export function TargetDialog({ productId, region, open, onOpenChange, initialUsd }: { productId: string; region: RegionCode; open: boolean; onOpenChange: (o: boolean) => void; initialUsd?: number }) {
  const product = requireProduct(productId);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{initialUsd !== undefined ? "Edit target price" : "Watch this price"}</DialogTitle>
          <DialogDescription>{product.name}</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the field resets each time */}
        <TargetForm productId={productId} region={region} initialUsd={initialUsd} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function TargetForm({ productId, region, initialUsd, onDone }: { productId: string; region: RegionCode; initialUsd?: number; onDone: () => void }) {
  const addWatch = useAppStore((s) => s.addWatch);
  const product = requireProduct(productId);
  const current = lowestPrice(productId, region);
  const editing = initialUsd !== undefined;
  const [value, setValue] = useState(String(regionalPrice(initialUsd ?? Math.round(current * 0.92), region)));
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return setError("Enter a target price above zero.");
    if (n >= regionalPrice(current, region) * 1.5) return setError("Target is well above the current price, so alerts would fire immediately.");
    addWatch(productId, toUsdBase(n, region));
    toast.success(editing ? "Target updated" : "Added to price watch", { description: `${product.model}: alert at ${formatCurrency(n, region)} or below (demo).` });
    onDone();
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor={`target-${productId}`}>Alert me at or below ({REGIONS[region].currency})</Label>
        <Input
          id={`target-${productId}`}
          type="number"
          inputMode="decimal"
          min={1}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          aria-invalid={!!error}
          autoFocus
          className="tabular text-[17px] sm:text-[17px]"
        />
        {error ? <p className="text-[12px] text-danger-foreground">{error}</p> : <p className="text-[12px] text-muted-foreground">Lowest price now: <strong className="tabular text-foreground">{formatPrice(current, region)}</strong></p>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[0.95, 0.9, 0.85].map((f) => (
          <button key={f} type="button" onClick={() => setValue(String(regionalPrice(Math.round(current * f), region)))} className="h-9 rounded-full border border-border px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground">
            −{Math.round((1 - f) * 100)}%
          </button>
        ))}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" variant="brand">{editing ? "Save target" : "Start watching"}</Button>
      </DialogFooter>
    </form>
  );
}

function WatchRow({ item, region, active, onSelect }: { item: WatchItem; region: RegionCode; active: boolean; onSelect: () => void }) {
  const removeWatch = useAppStore((s) => s.removeWatch);
  const addWatch = useAppStore((s) => s.addWatch);
  const [editOpen, setEditOpen] = useState(false);
  const p = requireProduct(item.productId);
  const current = lowestPrice(item.productId, region);
  const diff = (regionalPrice(current, region) - regionalPrice(item.targetPrice, region)) / regionalPrice(item.targetPrice, region);
  const reached = diff <= 0;
  return (
    <li data-testid={`watch-${item.productId}`} className={cn("rounded-[12px] border p-3 transition-colors", active ? "border-brand/60 bg-brand-soft/25" : "border-border")}>
      <div className="flex items-start gap-3">
        <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-label={`Show price details for ${p.name}`}>
          <ImageWithFallback src={p.images[0]} alt="" aspect="size-11 shrink-0 rounded-[9px] bg-surface-2" sizes="44px" className="p-1" />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold">{p.model}</span>
            <span className="block text-[12px] text-muted-foreground tabular">
              Now {formatPrice(current, region)}
            </span>
          </span>
        </button>
        {reached ? <Badge variant="success">Target hit</Badge> : <Badge variant="outline" className="tabular">{Math.round(diff * 100)}% away</Badge>}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="inline-flex min-w-0 flex-1 items-center gap-1.5 text-[12px] text-muted-foreground">
          <Target className="size-3.5 shrink-0 text-brand" /> Target <strong data-testid="watch-target" className="tabular text-foreground">{formatPrice(item.targetPrice, region)}</strong>
        </span>
        <Button size="icon-sm" variant="ghost" className="size-10 sm:size-8" onClick={() => setEditOpen(true)} aria-label={`Edit target for ${p.model}`}>
          <Pencil />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          className="size-10 text-muted-foreground hover:text-danger-foreground sm:size-8"
          aria-label={`Stop watching ${p.model}`}
          onClick={() => {
            const snapshot = item;
            removeWatch(item.productId);
            toast("Removed from price watch", { description: p.name, action: { label: "Undo", onClick: () => addWatch(snapshot.productId, snapshot.targetPrice) } });
          }}
        >
          <Trash2 />
        </Button>
      </div>
      <TargetDialog productId={item.productId} region={region} open={editOpen} onOpenChange={setEditOpen} initialUsd={item.targetPrice} />
    </li>
  );
}

export function WatchlistPanel({ items, region, selectedId, onSelect }: { items: WatchItem[]; region: RegionCode; selectedId?: string; onSelect: (id: string) => void }) {
  return (
    <section aria-labelledby="watch-h" className="rounded-[14px] border border-border bg-card p-4 shadow-xs sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="watch-h" className="flex items-center gap-2 text-[15px] font-semibold"><BellRing className="size-4 text-brand" /> Price-drop watchlist</h2>
        <span className="text-[12px] tabular text-muted-foreground">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-[12px] border border-dashed border-border-strong px-4 py-6 text-center text-[13px] text-muted-foreground">You&apos;re not watching any prices. Pick a product and choose “Watch price”.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((w) => (
            <WatchRow key={w.productId} item={w} region={region} active={w.productId === selectedId} onSelect={() => onSelect(w.productId)} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function AlertPreferencesCard() {
  const prefs = useAppStore((s) => s.alertPrefs);
  const setPrefs = useAppStore((s) => s.setAlertPrefs);
  const saved = () => toast.success("Preferences saved (demo — no messages are sent)");
  return (
    <section aria-labelledby="alerts-h" className="rounded-[14px] border border-border bg-card p-4 shadow-xs sm:p-5">
      <h2 id="alerts-h" className="text-[15px] font-semibold">Alert preferences</h2>
      <p className="mt-0.5 text-[12px] text-muted-foreground">How and when we tell you about price drops.</p>
      <div className="mt-4 divide-y divide-border">
        {([
          { key: "email", label: "Email alerts", hint: "Digest when a watched price drops", icon: Mail },
          { key: "push", label: "Push notifications", hint: "Instant alert in the app", icon: Smartphone },
        ] as const).map((o) => (
          <label key={o.key} htmlFor={`pref-${o.key}`} className="flex min-h-14 cursor-pointer items-center gap-3 py-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-muted-foreground"><o.icon className="size-4" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium">{o.label}</span>
              <span className="block text-[12px] text-muted-foreground">{o.hint}</span>
            </span>
            <Switch
              id={`pref-${o.key}`}
              checked={prefs[o.key]}
              onCheckedChange={(v) => {
                setPrefs({ [o.key]: v });
                saved();
              }}
            />
          </label>
        ))}
      </div>
      <div className="mt-3 rounded-[12px] bg-surface-2/70 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="pref-threshold">Minimum drop to notify</Label>
          <span className="tabular text-[15px] font-semibold">{prefs.threshold}%</span>
        </div>
        <Slider id="pref-threshold" aria-label="Minimum price drop percentage" min={1} max={20} step={1} value={[prefs.threshold]} onValueChange={([v]) => setPrefs({ threshold: v })} onValueCommit={saved} className="mt-2" />
        <div className="flex justify-between text-[11px] text-subtle-foreground tabular">
          <span>1% · every change</span>
          <span>20% · big drops only</span>
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground">You&apos;ll also be alerted whenever a watched price reaches your target, regardless of this threshold.</p>
      </div>
    </section>
  );
}
