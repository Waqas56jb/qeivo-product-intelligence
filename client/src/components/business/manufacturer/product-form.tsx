"use client";

import Link from "next/link";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ImagePlus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { categories } from "@/data/products/categories";
import { REGION_LIST } from "@/lib/format";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox, Label } from "@/components/ui/primitives";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { ErrorSummary, FormField, FormSection, SelectField, collectErrors, fieldAria } from "@/components/forms";
import { ScoreIntegrityNotice } from "../primitives";
import { UploadDropzone, UploadRow, useUploadQueue } from "../upload";

const num = (label: string, min: number, max: number) => z.number({ error: `${label} is required` }).min(min, `${label} must be at least ${min}`).max(max, `${label} must be at most ${max}`);

const schema = z.object({
  brand: z.string().min(1),
  model: z.string().trim().min(2, "Enter a model name"),
  modelNumber: z.string().trim().regex(/^[A-Z]{2}-[A-Z0-9-]{3,}$/, "Use the format NV-FD600SS (letters, digits, hyphens)"),
  category: z.enum(["refrigerators", "washing-machines", "televisions", "laptops"]),
  type: z.string().min(1, "Choose a type"),
  variant: z.string().trim().min(2, "Describe the variant, e.g. Stainless steel"),
  regions: z.array(z.string()).min(1, "Select at least one region"),
  price: num("Price", 50, 20000),
  widthMm: num("Width", 200, 3000),
  heightMm: num("Height", 10, 3000),
  depthMm: num("Depth", 10, 1500),
  capacity: num("Capacity", 1, 5000),
  energyRating: z.string().regex(/^[A-G]$/, "Energy class A–G"),
  annualKwh: num("Annual consumption", 1, 2000),
  features: z.string().trim().min(3, "List at least one feature"),
  warrantyYears: num("Warranty", 1, 15),
  specs: z.array(z.object({ label: z.string().trim().min(2, "Label required"), value: z.string().trim().min(1, "Value required") })).max(20),
  description: z.string().trim().min(40, "Write at least 40 characters").max(1200),
  confirm: z.literal(true, { error: "Confirm the data matches your published documentation" }),
});
type Values = z.infer<typeof schema>;

export function ProductForm({ product }: { product?: Product }) {
  const [submitted, setSubmitted] = useState(false);
  const images = useUploadQueue({ processing: false });
  const docs = useUploadQueue();
  const defaults: Partial<Values> = product
    ? {
        brand: "Nordvik",
        model: product.model,
        modelNumber: product.modelNumber,
        category: product.category,
        type: product.type,
        variant: product.variants[0]?.label ?? "",
        regions: product.regions,
        price: product.price,
        widthMm: product.dimensions.widthMm,
        heightMm: product.dimensions.heightMm,
        depthMm: product.dimensions.depthMm,
        capacity: product.capacity.value,
        energyRating: product.energy.rating.length === 1 ? product.energy.rating : "A",
        annualKwh: product.energy.annualKwh,
        features: product.features.join(", "),
        warrantyYears: product.warranty.years,
        specs: product.specs.flatMap((g) => g.items).filter((i) => typeof i.value !== "boolean").slice(0, 4).map((i) => ({ label: i.label, value: `${i.value}${i.unit ? ` ${i.unit}` : ""}` })),
        description: product.description,
      }
    : { brand: "Nordvik", category: "refrigerators", type: "", regions: ["US"], specs: [{ label: "", value: "" }] };

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: defaults, mode: "onTouched" });
  const { register, handleSubmit, watch, setValue, formState } = form;
  const errors = formState.errors;
  const specs = useFieldArray({ control: form.control, name: "specs" });
  const category = watch("category");
  const regions = watch("regions") ?? [];
  const cat = categories.find((c) => c.slug === category)!;

  const onSubmit = () => {
    setSubmitted(true);
    toast.success(product ? "Changes submitted for verification" : "Product saved as draft", { description: "Demo — nothing was sent. Qeivo verifies every change against your documents." });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const numReg = (k: keyof Values) => register(k, { setValueAs: (v: string) => (v === "" || v === undefined ? undefined : Number(v)) });

  return (
    <PageContainer size="narrow" className="space-y-6">
      <PageHeader title={product ? `Edit ${product.model}` : "Add a product"} description="Product data is published only after Qeivo verifies it against the documents you upload." />
      <ScoreIntegrityNotice variant="inline" />
      {submitted && (
        <div role="status" className="flex gap-3 rounded-[14px] border border-success/30 bg-success-soft/60 p-4">
          <CheckCircle2 className="size-5 shrink-0 text-success" />
          <div className="text-[14px]">
            <p className="font-semibold">Saved as draft for Qeivo verification (demo)</p>
            <p className="text-muted-foreground">In production this would enter the verification queue. Suitability scores and evidence coverage are recalculated independently and cannot be edited.</p>
            <Link href={routes.mProducts} className="mt-1 inline-block font-medium text-brand-soft-foreground hover:underline">
              Back to products
            </Link>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <ErrorSummary errors={formState.isSubmitted ? collectErrors(errors) : []} />
        <FormSection title="Identity" description="How the product appears on Qeivo.">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Brand" htmlFor="brand">
              <Input id="brand" {...register("brand")} readOnly className="bg-surface-2" />
            </FormField>
            <FormField label="Category" htmlFor="category" required error={errors.category?.message}>
              <SelectField id="category" value={category} onValueChange={(v) => setValue("category", v as Values["category"], { shouldValidate: true })} options={categories.map((c) => ({ value: c.slug, label: c.name }))} error={errors.category?.message} />
            </FormField>
            <FormField label="Model name" htmlFor="model" required error={errors.model?.message}>
              <Input {...register("model")} {...fieldAria("model", errors.model?.message)} placeholder="Frostline FD700" />
            </FormField>
            <FormField label="Model number" htmlFor="modelNumber" required error={errors.modelNumber?.message}>
              <Input {...register("modelNumber")} {...fieldAria("modelNumber", errors.modelNumber?.message)} placeholder="NV-FD700SS" />
            </FormField>
            <FormField label="Type" htmlFor="type" required error={errors.type?.message}>
              <SelectField id="type" value={watch("type")} onValueChange={(v) => setValue("type", v, { shouldValidate: true })} options={cat.types.map((t) => ({ value: t, label: t }))} placeholder="Choose a type" error={errors.type?.message} />
            </FormField>
            <FormField label="Variant / finish" htmlFor="variant" required error={errors.variant?.message}>
              <Input {...register("variant")} {...fieldAria("variant", errors.variant?.message)} placeholder="Stainless steel" />
            </FormField>
          </div>
          <FormField label="Description" htmlFor="description" required error={errors.description?.message}>
            <Textarea {...register("description")} {...fieldAria("description", errors.description?.message)} rows={4} />
          </FormField>
        </FormSection>

        <FormSection title="Availability & price">
          <fieldset>
            <legend className="mb-2 text-[13px] font-medium">Regions *</legend>
            <div className="flex flex-wrap gap-3">
              {REGION_LIST.map((r) => (
                <Label key={r.code} className="h-9 cursor-pointer rounded-[10px] border border-border px-3 font-normal">
                  <Checkbox checked={regions.includes(r.code)} onCheckedChange={(c) => setValue("regions", c ? [...regions, r.code] : regions.filter((x) => x !== r.code), { shouldValidate: true })} /> {r.flag} {r.name}
                </Label>
              ))}
            </div>
            {errors.regions && <p className="mt-2 text-[12px] text-danger-foreground">{errors.regions.message}</p>}
          </fieldset>
          <FormField label="Recommended retail price (USD)" htmlFor="price" required error={errors.price?.message} className="sm:max-w-xs">
            <Input type="number" inputMode="decimal" {...numReg("price")} {...fieldAria("price", errors.price?.message)} />
          </FormField>
        </FormSection>

        <FormSection title="Dimensions, capacity & energy">
          <div className="grid gap-4 sm:grid-cols-3">
            {(["widthMm", "heightMm", "depthMm"] as const).map((k) => (
              <FormField key={k} label={`${k === "widthMm" ? "Width" : k === "heightMm" ? "Height" : "Depth"} (mm)`} htmlFor={k} required error={errors[k]?.message}>
                <Input type="number" inputMode="numeric" {...numReg(k)} {...fieldAria(k, errors[k]?.message)} />
              </FormField>
            ))}
            <FormField label={`${cat.capacityLabel} (${category === "refrigerators" ? "L" : category === "washing-machines" ? "kg" : category === "televisions" ? "in" : "GB"})`} htmlFor="capacity" required error={errors.capacity?.message}>
              <Input type="number" {...numReg("capacity")} {...fieldAria("capacity", errors.capacity?.message)} />
            </FormField>
            <FormField label="Energy class" htmlFor="energyRating" required error={errors.energyRating?.message}>
              <Input maxLength={1} {...register("energyRating", { setValueAs: (v: string) => v.toUpperCase() })} {...fieldAria("energyRating", errors.energyRating?.message)} placeholder="A–G" />
            </FormField>
            <FormField label="Annual consumption (kWh)" htmlFor="annualKwh" required error={errors.annualKwh?.message}>
              <Input type="number" {...numReg("annualKwh")} {...fieldAria("annualKwh", errors.annualKwh?.message)} />
            </FormField>
          </div>
          <p className="text-[12px] text-muted-foreground">Declared figures are shown as manufacturer claims. Qeivo displays independent measurements separately where available.</p>
        </FormSection>

        <FormSection title="Specifications & features">
          <FormField label="Features (comma separated)" htmlFor="features" required error={errors.features?.message}>
            <Input {...register("features")} {...fieldAria("features", errors.features?.message)} placeholder="Inverter compressor, Wi-Fi app control" />
          </FormField>
          <div className="space-y-2">
            <p className="text-[13px] font-medium">Additional specifications</p>
            {specs.fields.map((f, i) => (
              <div key={f.id} className="flex gap-2">
                <Input aria-label={`Specification ${i + 1} label`} placeholder="Label" {...register(`specs.${i}.label`)} aria-invalid={!!errors.specs?.[i]?.label} />
                <Input aria-label={`Specification ${i + 1} value`} placeholder="Value" {...register(`specs.${i}.value`)} aria-invalid={!!errors.specs?.[i]?.value} />
                <Button type="button" variant="ghost" size="icon" onClick={() => specs.remove(i)} aria-label={`Remove specification ${i + 1}`}>
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => specs.append({ label: "", value: "" })}>
              <Plus /> Add specification
            </Button>
          </div>
          <FormField label="Warranty (years)" htmlFor="warrantyYears" required error={errors.warrantyYears?.message} className="sm:max-w-xs">
            <Input type="number" {...numReg("warrantyYears")} {...fieldAria("warrantyYears", errors.warrantyYears?.message)} />
          </FormField>
        </FormSection>

        <FormSection title="Images & technical documentation" description="Files stay in your browser in this demo — nothing is uploaded.">
          <UploadDropzone id="images" accept="image/*" title="Drop product images" hint="PNG or JPG, up to 20 MB" icon={ImagePlus} onFiles={(f) => images.add(f, () => ({}))} compact />
          {images.items.map((it) => (
            <UploadRow key={it.id} item={it} onRemove={() => images.remove(it.id)} doneLabel="Ready" />
          ))}
          <UploadDropzone id="docs" accept=".pdf" title="Drop manuals, spec sheets or certificates" hint="PDF, up to 50 MB" onFiles={(f) => docs.add(f, () => ({}))} compact />
          {docs.items.map((it) => (
            <UploadRow key={it.id} item={it} onRemove={() => docs.remove(it.id)} />
          ))}
        </FormSection>

        <div className="rounded-[14px] border border-border bg-card p-4">
          <Label className="cursor-pointer items-start font-normal leading-relaxed">
            <Checkbox className="mt-0.5" checked={watch("confirm") === true} onCheckedChange={(c) => setValue("confirm", (c === true) as true, { shouldValidate: true })} aria-invalid={!!errors.confirm} />
            I confirm these values match our published documentation. I understand Qeivo independently verifies submitted data and that manufacturers cannot edit suitability scores, evidence coverage or verdicts.
          </Label>
          {errors.confirm && <p className="mt-2 text-[12px] text-danger-foreground">{errors.confirm.message}</p>}
        </div>
        <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-[14px] sm:border">
          <Button asChild variant="outline">
            <Link href={routes.mProducts}>Cancel</Link>
          </Button>
          <Button type="submit">{product ? "Submit changes" : "Save draft"}</Button>
        </div>
      </form>
    </PageContainer>
  );
}
