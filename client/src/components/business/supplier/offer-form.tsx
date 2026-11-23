"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info, TrendingDown, TrendingUp } from "lucide-react";
import type { RegionCode } from "@/types";
import { products } from "@/data/products";
import { REGIONS } from "@/lib/format";
import { DEMO_NOW, cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox, Switch } from "@/components/ui/primitives";
import { ResponsiveSheet } from "@/components/layout/page";
import { SponsoredDisclosure } from "@/components/analysis/warnings";
import { FieldError, FormField, InputAffix, SelectField, fieldAria } from "@/components/forms";
import { ScoreIntegrityNotice } from "../primitives";
import { RETAILER_DOMAIN, STOCK_META, marketLow, money, type StockState, type SupplierOffer } from "./supplier-data";

/** Larder & Co is a kitchen & laundry specialist — it lists these categories. */
export const SUPPLIER_PRODUCTS = products.filter((p) => p.category === "refrigerators" || p.category === "washing-machines");
const productById = new Map(products.map((p) => [p.id, p]));

const REGION_CODES = ["US", "UK", "EU", "AU", "CA"] as const;
const STOCK_CODES = ["in-stock", "low-stock", "out-of-stock", "preorder"] as const;
const TODAY = DEMO_NOW.toISOString().slice(0, 10);

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");

export const offerSchema = z
  .object({
    productId: z.string().min(1, "Choose the product this offer is for"),
    region: z.enum(REGION_CODES, { error: "Choose a region" }),
    price: z.number({ error: "Enter the retail price" }).positive("Price must be greater than zero").max(50_000, "Price looks too high — check the decimal point"),
    stock: z.enum(STOCK_CODES, { error: "Choose a stock status" }),
    delivery: z.string().trim().min(4, "Describe delivery terms (at least 4 characters)").max(80, "Keep delivery terms under 80 characters"),
    validFrom: dateString,
    validUntil: dateString,
    urlPath: z
      .string()
      .trim()
      .min(3, "Enter the product page path")
      .max(90, "Keep the path under 90 characters")
      .regex(/^[a-z0-9][a-z0-9\-/]*$/, "Use lowercase letters, numbers, hyphens and slashes only"),
    affiliate: z.boolean(),
    sponsored: z.boolean(),
    disclosureAck: z.boolean(),
  })
  .superRefine((v, ctx) => {
    const p = productById.get(v.productId);
    if (p && !p.regions.includes(v.region as RegionCode))
      ctx.addIssue({ code: "custom", path: ["region"], message: `${p.model} isn't sold in ${REGIONS[v.region as RegionCode].name}. Available: ${p.regions.join(", ")}` });
    if (v.validUntil < TODAY) ctx.addIssue({ code: "custom", path: ["validUntil"], message: "End date can't be in the past" });
    if (v.validUntil <= v.validFrom) ctx.addIssue({ code: "custom", path: ["validUntil"], message: "End date must be after the start date" });
    else {
      const days = (new Date(v.validUntil).getTime() - new Date(v.validFrom).getTime()) / 86_400_000;
      if (days > 180) ctx.addIssue({ code: "custom", path: ["validUntil"], message: "Offers can run for at most 180 days — re-confirm the price after that" });
    }
    if (v.sponsored && !v.disclosureAck) ctx.addIssue({ code: "custom", path: ["disclosureAck"], message: "Confirm the sponsored-placement terms to continue" });
  });

export type OfferFormValues = z.infer<typeof offerSchema>;

function defaults(initial?: SupplierOffer | null, productId?: string): OfferFormValues {
  if (initial)
    return {
      productId: initial.productId,
      region: initial.region,
      price: initial.price,
      stock: initial.stock,
      delivery: initial.delivery,
      validFrom: initial.validFrom,
      validUntil: initial.validUntil,
      urlPath: initial.urlPath,
      affiliate: initial.affiliate,
      sponsored: initial.sponsored,
      disclosureAck: initial.sponsored,
    };
  const p = productId ? productById.get(productId) : undefined;
  return {
    productId: productId ?? "",
    region: (p?.regions.includes("US") ? "US" : (p?.regions[0] ?? "US")) as OfferFormValues["region"],
    price: Number.NaN,
    stock: "in-stock",
    delivery: "Free delivery & installation",
    validFrom: TODAY,
    validUntil: "2026-12-31",
    urlPath: p ? `p/${p.slug}` : "",
    affiliate: true,
    sponsored: false,
    disclosureAck: false,
  };
}

const FORM_ID = "supplier-offer-form";

/** Create / edit offer sheet (bottom sheet on mobile, side sheet on desktop). */
export function OfferSheet({
  open,
  onOpenChange,
  initial,
  defaultProductId,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: SupplierOffer | null;
  defaultProductId?: string;
  onSave: (values: OfferFormValues) => void;
}) {
  const editing = Boolean(initial);
  const form = useForm<OfferFormValues>({ resolver: zodResolver(offerSchema), defaultValues: defaults(initial, defaultProductId), mode: "onTouched" });
  const { register, control, handleSubmit, reset, setValue, formState } = form;
  const { errors, isSubmitting } = formState;

  useEffect(() => {
    if (open) reset(defaults(initial, defaultProductId));
  }, [open, initial, defaultProductId, reset]);

  const [productId, region, price, sponsored] = useWatch({ control, name: ["productId", "region", "price", "sponsored"] });
  const product = productById.get(productId);
  const low = product ? marketLow(product.id, region as RegionCode) : 0;
  const diff = low && Number.isFinite(price) && price > 0 ? Math.round(((price - low) / low) * 1000) / 10 : null;

  const productOptions = useMemo(() => SUPPLIER_PRODUCTS.map((p) => ({ value: p.id, label: p.name })), []);

  const submit = handleSubmit((v) => {
    onSave(v);
  });

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit offer" : "Create offer"}
      description={editing ? "Changes are saved locally in this demo and shown to shoppers after Qeivo's price check." : "Offers appear on product pages alongside other retailers, sorted by price — never by commission."}
      footer={
        <>
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} variant="brand" className="flex-1" disabled={isSubmitting}>
            {editing ? "Save changes" : "Create offer"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={submit} noValidate className="grid gap-5 pb-2">
        <FormField label="Product" htmlFor="offer-product" required error={errors.productId?.message} description={editing ? "The product can't be changed on an existing offer." : undefined}>
          <Controller
            control={control}
            name="productId"
            render={({ field }) => (
              <SelectField
                id="offer-product"
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  const p = productById.get(v);
                  if (p) {
                    setValue("urlPath", `p/${p.slug}`, { shouldValidate: formState.isSubmitted });
                    if (!p.regions.includes(region as RegionCode)) setValue("region", p.regions[0] as OfferFormValues["region"], { shouldValidate: formState.isSubmitted });
                  }
                }}
                options={productOptions}
                placeholder="Choose a product"
                error={errors.productId?.message}
                disabled={editing}
              />
            )}
          />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Region" htmlFor="offer-region" required error={errors.region?.message}>
            <Controller
              control={control}
              name="region"
              render={({ field }) => (
                <SelectField
                  id="offer-region"
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.region?.message}
                  options={REGION_CODES.map((c) => ({ value: c, label: `${REGIONS[c].flag} ${REGIONS[c].name}`, disabled: product ? !product.regions.includes(c) : false }))}
                />
              )}
            />
          </FormField>
          <FormField label="Stock" htmlFor="offer-stock" required error={errors.stock?.message}>
            <Controller
              control={control}
              name="stock"
              render={({ field }) => (
                <SelectField id="offer-stock" value={field.value} onValueChange={field.onChange} error={errors.stock?.message} options={STOCK_CODES.map((s) => ({ value: s, label: STOCK_META[s as StockState].label }))} />
              )}
            />
          </FormField>
        </div>

        <FormField label="Retail price" htmlFor="offer-price" required error={errors.price?.message}>
          <InputAffix suffix={REGIONS[region as RegionCode]?.currency ?? "USD"}>
            <Input type="number" inputMode="decimal" min={0} step="1" placeholder="e.g. 2499" className="tabular" {...fieldAria("offer-price", errors.price?.message)} {...register("price", { valueAsNumber: true })} />
          </InputAffix>
          {product && low > 0 && !errors.price && (
            <p className={cn("flex items-center gap-1.5 text-[12px]", diff === null ? "text-subtle-foreground" : diff <= 0 ? "text-success" : diff > 8 ? "text-warning-foreground" : "text-muted-foreground")}>
              {diff !== null && diff <= 0 ? <TrendingDown className="size-3.5" /> : diff !== null ? <TrendingUp className="size-3.5" /> : <Info className="size-3.5" />}
              {diff === null
                ? `Lowest competing price: ${money(low, region as RegionCode)}`
                : diff <= 0
                  ? `Lowest price for this product in ${region} (market low ${money(low, region as RegionCode)})`
                  : `${diff}% above the lowest competing price of ${money(low, region as RegionCode)}`}
            </p>
          )}
        </FormField>

        <FormField label="Delivery terms" htmlFor="offer-delivery" required error={errors.delivery?.message}>
          <Input placeholder="Free delivery & installation" {...fieldAria("offer-delivery", errors.delivery?.message)} {...register("delivery")} />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Valid from" htmlFor="offer-from" required error={errors.validFrom?.message}>
            <Input type="date" {...fieldAria("offer-from", errors.validFrom?.message)} {...register("validFrom")} />
          </FormField>
          <FormField label="Valid until" htmlFor="offer-until" required error={errors.validUntil?.message}>
            <Input type="date" {...fieldAria("offer-until", errors.validUntil?.message)} {...register("validUntil")} />
          </FormField>
        </div>

        <FormField label="Retailer page" htmlFor="offer-url" required error={errors.urlPath?.message} description="Shown to shoppers as text in this demo — no live link is created.">
          <div className={cn("flex h-11 min-w-0 items-center overflow-hidden rounded-[10px] border border-input bg-surface shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20 sm:h-10", errors.urlPath && "border-danger")}>
            <span className="flex h-full shrink-0 items-center border-r border-border bg-surface-2 px-3 font-mono text-[12px] text-muted-foreground">{RETAILER_DOMAIN}/</span>
            <input className="h-full min-w-0 flex-1 bg-transparent px-3 font-mono text-[13px] outline-none placeholder:text-subtle-foreground" placeholder="p/product-slug" {...fieldAria("offer-url", errors.urlPath?.message)} {...register("urlPath")} />
          </div>
        </FormField>

        <fieldset className="grid gap-3 rounded-[12px] border border-border p-4">
          <legend className="px-1 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Labels & disclosure</legend>
          <Controller
            control={control}
            name="affiliate"
            render={({ field }) => (
              <label className="flex cursor-pointer items-start justify-between gap-4">
                <span>
                  <span className="block text-[13.5px] font-medium">Affiliate link</span>
                  <span className="block text-[12px] text-muted-foreground">Qeivo may earn a commission. Shoppers see an “Affiliate” label.</span>
                </span>
                <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Affiliate link" />
              </label>
            )}
          />
          <Controller
            control={control}
            name="sponsored"
            render={({ field }) => (
              <label className="flex cursor-pointer items-start justify-between gap-4">
                <span>
                  <span className="block text-[13.5px] font-medium">Sponsored placement</span>
                  <span className="block text-[12px] text-muted-foreground">Paid highlight in the offers list, always labelled “Sponsored”.</span>
                </span>
                <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Sponsored placement" />
              </label>
            )}
          />
          {sponsored && (
            <div className="grid gap-2.5">
              <SponsoredDisclosure />
              <Controller
                control={control}
                name="disclosureAck"
                render={({ field }) => (
                  <label htmlFor="offer-ack" className="flex cursor-pointer items-start gap-2.5 text-[13px]">
                    <Checkbox id="offer-ack" checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} aria-invalid={errors.disclosureAck ? true : undefined} className="mt-0.5" />
                    <span>I understand sponsored offers are labelled to shoppers and never change scores, rankings or recommendations.</span>
                  </label>
                )}
              />
              <FieldError id="offer-ack-error" message={errors.disclosureAck?.message} />
            </div>
          )}
        </fieldset>

        <ScoreIntegrityNotice variant="inline" role="Suppliers" />
      </form>
    </ResponsiveSheet>
  );
}
