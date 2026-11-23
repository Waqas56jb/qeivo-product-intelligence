"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info, Send } from "lucide-react";
import type { CategorySlug, CommunityQuestion } from "@/types";
import { categories, productsByCategory } from "@/data/products";
import { DEMO_NOW } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { ResponsiveSheet } from "@/components/layout/page";

const CATS = ["refrigerators", "washing-machines", "televisions", "laptops"] as const;

const schema = z.object({
  title: z.string().trim().min(15, "Make the title a little more specific (at least 15 characters).").max(140, "Keep the title under 140 characters."),
  body: z.string().trim().min(30, "Add some detail — measurements, model numbers, what you've tried (at least 30 characters).").max(3000),
  category: z.enum(CATS, { message: "Choose a category." }),
  productId: z.string(),
  tags: z.string().max(80).optional(),
});
type FormValues = z.infer<typeof schema>;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-[12px] text-danger-foreground">
      {message}
    </p>
  );
}

export function AskQuestionSheet({ open, onOpenChange, onPosted, counter }: { open: boolean; onOpenChange: (o: boolean) => void; onPosted: (q: CommunityQuestion) => void; counter: number }) {
  const profileName = useAppStore((s) => s.profile.name);
  const { register, handleSubmit, control, watch, reset, setValue, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", body: "", category: "refrigerators", productId: "none", tags: "" },
  });
  const { errors, isSubmitting } = formState;
  const category = watch("category") as CategorySlug;
  const bodyLen = watch("body")?.length ?? 0;

  const submit = handleSubmit((v) => {
    const id = `local-q-${counter + 1}`;
    const q: CommunityQuestion = {
      id,
      slug: id,
      title: v.title.trim(),
      body: v.body.trim(),
      category: v.category,
      tags: (v.tags ?? "")
        .split(",")
        .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
        .filter(Boolean)
        .slice(0, 4),
      authorName: profileName || "You",
      authorAvatar: "",
      date: DEMO_NOW.toISOString(),
      votes: 0,
      views: 0,
      productIds: v.productId !== "none" ? [v.productId] : [],
      replies: [],
      hasOfficialReply: false,
      solved: false,
    };
    onPosted(q);
    reset();
    onOpenChange(false);
  });

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Ask the community"
      description="Owners, Qeivo experts and verified manufacturer teams answer here."
      footer={
        <>
          <Button variant="outline" className="h-11 flex-1 sm:flex-none" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="ask-question-form" variant="brand" className="h-11 flex-1" disabled={isSubmitting}>
            <Send /> Post question
          </Button>
        </>
      }
    >
      <form id="ask-question-form" onSubmit={submit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="q-title">Question title</Label>
          <Input id="q-title" placeholder="e.g. Will a 908 mm fridge fit a 920 mm opening with side ventilation?" aria-invalid={!!errors.title} aria-describedby="q-title-err" {...register("title")} />
          <FieldError id="q-title-err" message={errors.title?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="q-category">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue("productId", "none");
                  }}
                >
                  <SelectTrigger id="q-category" aria-invalid={!!errors.category}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError id="q-category-err" message={errors.category?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-product">
              Related product <span className="font-normal text-subtle-foreground">(optional)</span>
            </Label>
            <Controller
              control={control}
              name="productId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="q-product">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific product</SelectItem>
                    {productsByCategory(category).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="q-body">Details</Label>
            <span className="text-[11px] text-subtle-foreground tabular">{bodyLen} / 3000</span>
          </div>
          <Textarea
            id="q-body"
            rows={6}
            placeholder="Include your measurements, model numbers and what you've already checked. Specific questions get better answers."
            aria-invalid={!!errors.body}
            aria-describedby="q-body-err"
            {...register("body")}
          />
          <FieldError id="q-body-err" message={errors.body?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="q-tags">
            Tags <span className="font-normal text-subtle-foreground">(comma separated, up to 4)</span>
          </Label>
          <Input id="q-tags" placeholder="installation, noise" {...register("tags")} />
        </div>
        <p className="flex items-start gap-2 rounded-[12px] border border-border bg-surface-2/60 px-3 py-2.5 text-[12px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Demo mode: your question is added to this page only and is not published or sent to anyone. It disappears when you reload.
        </p>
      </form>
    </ResponsiveSheet>
  );
}
