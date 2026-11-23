"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import type { OwnedProduct } from "@/types";
import { getProduct, products } from "@/data/products";
import { getBrand } from "@/data/products/brands";
import { retailers } from "@/data/offers/retailers";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchField } from "@/components/common/controls";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { addYearsIso, TODAY_ISO } from "./owned-utils";

const schema = z.object({
  productId: z.string().min(1, "Choose the product you own"),
  purchaseDate: z
    .string()
    .min(1, "Enter the purchase date")
    .refine((v) => v <= TODAY_ISO, "Purchase date can't be in the future")
    .refine((v) => v >= "2010-01-01", "Enter a date after 2010"),
  retailer: z.string().min(1, "Choose where you bought it"),
  price: z.number({ error: "Enter the price you paid" }).positive("Price must be more than 0").max(50000, "That looks too high"),
});
type FormValues = z.infer<typeof schema>;

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="text-[12px] text-danger-foreground">{msg}</p> : null;
}

export function AddOwnedDialog({ open, onOpenChange, ownedIds, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; ownedIds: string[]; onAdd: (o: OwnedProduct) => void }) {
  const [query, setQuery] = useState("");
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { productId: "", purchaseDate: "", retailer: "" } });
  const { register, handleSubmit, setValue, watch, formState, reset } = form;
  const productId = watch("productId");
  const retailer = watch("retailer");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? products.filter((p) => `${getBrand(p.brandId).name} ${p.name} ${p.modelNumber}`.toLowerCase().includes(q)) : products;
    return list.slice(0, 6);
  }, [query]);
  const selected = productId ? getProduct(productId) : undefined;

  const close = (o: boolean) => {
    if (!o) {
      reset();
      setQuery("");
    }
    onOpenChange(o);
  };

  const submit = (v: FormValues) => {
    const p = getProduct(v.productId);
    if (!p) return;
    const n = ownedIds.length + 1;
    onAdd({
      id: `own-local-${n}-${p.slug}`,
      productId: p.id,
      purchaseDate: v.purchaseDate,
      purchasePrice: v.price,
      retailer: v.retailer,
      serialNumber: "Not recorded",
      receiptId: "Not uploaded",
      warrantyExpires: addYearsIso(v.purchaseDate, p.warranty.years),
      maintenance: [],
      serviceHistory: [],
    });
    toast.success("Added (demo — stored in this session only)", { description: `${p.name} is now in My products.` });
    close(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add a product you own</DialogTitle>
          <DialogDescription>Track warranty, maintenance and service history. Nothing leaves your browser in this demo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="grid gap-5" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="own-search">Product</Label>
            <SearchField value={query} onChange={setQuery} placeholder="Search by brand, model or model number" ariaLabel="Search products" />
            <ul role="listbox" aria-label="Matching products" className="grid max-h-60 gap-1 overflow-y-auto rounded-[12px] border border-border p-1 scrollbar-thin">
              {matches.length === 0 && <li className="px-3 py-6 text-center text-[13px] text-muted-foreground">No products match “{query}”.</li>}
              {matches.map((p) => {
                const active = p.id === productId;
                const already = ownedIds.includes(p.id);
                return (
                  <li key={p.id} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => setValue("productId", p.id, { shouldValidate: true })}
                      className={cn("flex min-h-12 w-full items-center gap-3 rounded-[9px] px-2 py-1.5 text-left transition-colors hover:bg-surface-2", active && "bg-brand-soft/60 hover:bg-brand-soft/60")}
                    >
                      <ImageWithFallback src={p.images[0]} alt="" aspect="size-10 shrink-0 rounded-[8px] bg-surface-2" sizes="40px" className="p-1" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold">{getBrand(p.brandId).name} {p.model}</span>
                        <span className="block truncate text-[12px] text-muted-foreground">{p.modelNumber}{already ? " · already in your list" : ""}</span>
                      </span>
                      {active && <Check className="size-4 shrink-0 text-brand" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            {selected ? <p className="text-[12px] text-muted-foreground">Selected: <strong className="text-foreground">{selected.name}</strong> · {selected.warranty.years}-year standard warranty</p> : <FieldError msg={formState.errors.productId?.message} />}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="own-date">Purchase date</Label>
              <Input id="own-date" type="date" max={TODAY_ISO} aria-invalid={!!formState.errors.purchaseDate} {...register("purchaseDate")} />
              <FieldError msg={formState.errors.purchaseDate?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="own-retailer">Retailer</Label>
              <Select value={retailer} onValueChange={(v) => setValue("retailer", v, { shouldValidate: true })}>
                <SelectTrigger id="own-retailer" aria-invalid={!!formState.errors.retailer}>
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  {retailers.map((r) => (
                    <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                  ))}
                  <SelectItem value="Other / private sale">Other / private sale</SelectItem>
                </SelectContent>
              </Select>
              <FieldError msg={formState.errors.retailer?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="own-price">Price paid (USD)</Label>
              <Input id="own-price" type="number" inputMode="decimal" min={0} step="1" placeholder={selected ? String(selected.price) : "0"} aria-invalid={!!formState.errors.price} {...register("price", { valueAsNumber: true })} />
              <FieldError msg={formState.errors.price?.message} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>Cancel</Button>
            <Button type="submit" variant="brand"><Plus /> Add product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
