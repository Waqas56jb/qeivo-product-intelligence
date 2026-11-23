"use client";

import { Info, Printer } from "lucide-react";
import { toast } from "sonner";
import type { OwnedProduct, Product } from "@/types";
import { getBrand } from "@/data/products/brands";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TAX_RATE = 0.075;

export function ReceiptDialog({ owned, product, open, onOpenChange }: { owned: OwnedProduct; product: Product; open: boolean; onOpenChange: (o: boolean) => void }) {
  const tax = Math.round(owned.purchasePrice * TAX_RATE * 100) / 100;
  const total = owned.purchasePrice + tax;
  const money = (v: number) => formatCurrency(v, "US", { decimals: 2 });
  const hasReceipt = !owned.receiptId.startsWith("Not");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-surface-2">
        <DialogHeader>
          <DialogTitle>Purchase receipt</DialogTitle>
          <DialogDescription>{product.name}</DialogDescription>
        </DialogHeader>

        <div className="relative mx-auto w-full max-w-[360px] rounded-[6px] bg-card px-6 pb-8 pt-6 font-mono text-[12px] leading-relaxed text-card-foreground shadow-md ring-1 ring-border">
          {/* torn bottom edge */}
          <div aria-hidden className="absolute inset-x-0 -bottom-[6px] h-3 bg-[radial-gradient(circle_at_6px_0,transparent_6px,var(--card)_6.5px)] bg-[length:12px_12px] bg-repeat-x" />
          <div className="text-center">
            <p className="text-[15px] font-bold uppercase tracking-[0.18em]">{owned.retailer}</p>
            <p className="text-muted-foreground">Sales receipt</p>
          </div>
          <div className="my-4 border-t border-dashed border-border-strong" />
          <dl className="space-y-0.5">
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Receipt</dt><dd className="truncate">{owned.receiptId}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Date</dt><dd>{formatDate(owned.purchaseDate, "dd/MM/yyyy")}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Serial</dt><dd className="truncate">{owned.serialNumber.slice(0, 6)}…</dd></div>
          </dl>
          <div className="my-4 border-t border-dashed border-border-strong" />
          <div className="space-y-1">
            <p className="font-semibold">{getBrand(product.brandId).name.toUpperCase()} {product.model.toUpperCase()}</p>
            <div className="flex justify-between gap-3 text-muted-foreground">
              <span className="truncate">1 × {product.modelNumber}</span>
              <span className="text-card-foreground">{money(owned.purchasePrice)}</span>
            </div>
          </div>
          <div className="my-4 border-t border-dashed border-border-strong" />
          <dl className="space-y-0.5">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{money(owned.purchasePrice)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Sales tax 7.5% (demo)</dt><dd>{money(tax)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd>{money(0)}</dd></div>
            <div className="mt-2 flex justify-between border-t border-border-strong pt-2 text-[14px] font-bold"><dt>TOTAL</dt><dd>{money(total)}</dd></div>
          </dl>
          <div className="my-4 border-t border-dashed border-border-strong" />
          <p className="text-center text-muted-foreground">
            {owned.extendedWarranty ? `Protection plan: ${owned.extendedWarranty}` : "Keep this receipt for warranty claims"}
          </p>
          <div aria-hidden className="mx-auto mt-4 h-8 w-48 bg-[repeating-linear-gradient(90deg,var(--card-foreground)_0_2px,transparent_2px_4px,var(--card-foreground)_4px_5px,transparent_5px_8px)] opacity-80" />
        </div>

        <p className="flex items-start gap-2 rounded-[10px] bg-info-soft/70 px-3 py-2 text-[12px] leading-relaxed text-info-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {hasReceipt
            ? "Receipt image stored locally in demo. The tax line is illustrative; the original receipt is not uploaded anywhere."
            : "No receipt was attached to this product. This preview is generated from the details you entered (demo)."}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={() => toast("Print preview not available in the demo", { description: "In the full product this opens your browser's print dialog for the original receipt." })}>
            <Printer /> Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
