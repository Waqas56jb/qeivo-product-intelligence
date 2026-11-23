"use client";

import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Info, PenLine, ShieldCheck, Star } from "lucide-react";
import type { Product, Review } from "@/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label, Switch } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { ResponsiveSheet } from "@/components/layout/page";

const OWNED_FOR = ["Less than a month", "1 month", "3 months", "6 months", "1 year", "2 years", "3+ years"] as const;
const STAR_LABELS = ["", "Poor", "Below average", "Average", "Good", "Excellent"];

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Choose a star rating").max(5),
  title: z.string().trim().min(4, "Add a short headline (at least 4 characters)").max(90, "Keep the headline under 90 characters"),
  body: z.string().trim().min(40, "Tell other buyers a little more — at least 40 characters").max(2000, "Reviews are limited to 2,000 characters"),
  ownedFor: z.string().min(1, "Tell us how long you've owned it"),
});
export type ReviewFormValues = z.infer<typeof reviewSchema>;

/** Accessible 1–5 star radio group with 44px targets and arrow-key support. */
export function StarRatingInput({ value, onChange, invalid, describedBy }: { value: number; onChange: (v: number) => void; invalid?: boolean; describedBy?: string }) {
  const [hover, setHover] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const shown = hover || value;
  const move = (v: number) => {
    const next = Math.min(5, Math.max(1, v));
    onChange(next);
    refs.current[next - 1]?.focus();
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="radiogroup" aria-label="Star rating" aria-invalid={invalid || undefined} aria-describedby={describedBy} className="flex" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            ref={(el) => {
              refs.current[s - 1] = el;
            }}
            type="button"
            role="radio"
            aria-checked={value === s}
            aria-label={`${s} star${s > 1 ? "s" : ""} — ${STAR_LABELS[s]}`}
            tabIndex={value === s || (value === 0 && s === 1) ? 0 : -1}
            onClick={() => onChange(s)}
            onMouseEnter={() => setHover(s)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                move((value || 0) + 1);
              }
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                move((value || 2) - 1);
              }
            }}
            className="grid size-11 place-items-center rounded-[10px] outline-none transition-transform focus-visible:ring-[3px] focus-visible:ring-ring/40 active:scale-95"
          >
            <Star className={cn("size-7 transition-colors", s <= shown ? "text-warning" : "text-border-strong")} fill="currentColor" strokeWidth={0} aria-hidden />
          </button>
        ))}
      </div>
      <span className="text-[13px] font-medium text-muted-foreground" aria-live="polite">
        {shown ? STAR_LABELS[shown] : "Select a rating"}
      </span>
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-[12px] font-medium text-danger-foreground">
      {message}
    </p>
  );
}

/** Review form (RHF + Zod). Submission is local only — the parent decides what to do with the draft review. */
export function ReviewForm({ product, formId = "review-form", onSubmitted }: { product: Product; formId?: string; onSubmitted: (review: Review) => void }) {
  const hydrated = useHydrated();
  const profile = useAppStore((s) => s.profile);
  const counter = useRef(0);
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReviewFormValues>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 0, title: "", body: "", ownedFor: "" } });
  const bodyLength = watch("body")?.length ?? 0;

  const submit = handleSubmit((v) => {
    counter.current += 1;
    onSubmitted({
      id: `local-${product.id}-${counter.current}`,
      productId: product.id,
      authorName: hydrated ? profile.name : "You",
      authorAvatar: "",
      authorLocation: hydrated ? profile.location : "Your location",
      rating: v.rating,
      title: v.title.trim(),
      body: v.body.trim(),
      date: "2026-11-23",
      verifiedPurchase: false,
      helpful: 0,
      ownedFor: v.ownedFor.toLowerCase(),
      sentiment: v.rating >= 4 ? "positive" : v.rating === 3 ? "mixed" : "negative",
      aspects: [],
      photos: [],
    });
  });

  return (
    <form id={formId} onSubmit={submit} noValidate className="space-y-6">
      <div className="space-y-2.5">
        <Label>Your rating</Label>
        <Controller control={control} name="rating" render={({ field }) => <StarRatingInput value={field.value} onChange={field.onChange} invalid={Boolean(errors.rating)} describedBy={errors.rating ? "rating-error" : undefined} />} />
        <FieldError id="rating-error" message={errors.rating?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-title">Headline</Label>
        <Input id="review-title" placeholder="e.g. Quiet, roomy and easy to keep clean" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "title-error" : undefined} {...register("title")} />
        <FieldError id="title-error" message={errors.title?.message} />
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor="review-body">Your experience</Label>
          <span className={cn("tabular text-[11px]", bodyLength > 2000 ? "text-danger-foreground" : "text-subtle-foreground")}>{bodyLength.toLocaleString("en-US")} / 2,000</span>
        </div>
        <Textarea
          id="review-body"
          rows={6}
          placeholder={`What has it been like to live with the ${product.model}? Mention noise, fit, reliability and anything you wish you'd known before buying.`}
          aria-invalid={Boolean(errors.body)}
          aria-describedby={errors.body ? "body-error" : undefined}
          {...register("body")}
        />
        <FieldError id="body-error" message={errors.body?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-owned">How long have you owned it?</Label>
        <Controller
          control={control}
          name="ownedFor"
          render={({ field }) => (
            <Select value={field.value || undefined} onValueChange={field.onChange}>
              <SelectTrigger id="review-owned" aria-invalid={Boolean(errors.ownedFor)} aria-describedby={errors.ownedFor ? "owned-error" : undefined}>
                <SelectValue placeholder="Select ownership period" />
              </SelectTrigger>
              <SelectContent>
                {OWNED_FOR.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError id="owned-error" message={errors.ownedFor?.message} />
      </div>

      <div className="flex items-start justify-between gap-4 rounded-[14px] border border-border bg-surface-2/60 p-4">
        <div className="space-y-1">
          <Label htmlFor="review-verified" className="gap-1.5">
            <ShieldCheck className="size-4 text-success" aria-hidden /> Verified purchase
          </Label>
          <p className="text-[12px] leading-relaxed text-muted-foreground">Set automatically when an order receipt or registration matches this model. You can&apos;t switch it on yourself — that keeps the badge meaningful.</p>
        </div>
        <Switch id="review-verified" checked={false} disabled aria-describedby="verified-hint" />
      </div>
      <p id="verified-hint" className="sr-only">
        Verified purchase status cannot be changed manually.
      </p>
    </form>
  );
}

/** "Write a review" button + responsive sheet with the form and an honest moderation state. */
export function WriteReviewSheet({ product, onSubmitted, trigger }: { product: Product; onSubmitted: (review: Review) => void; trigger?: (open: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const openSheet = () => {
    setDone(false);
    setFormKey((k) => k + 1);
    setOpen(true);
  };
  return (
    <>
      {trigger ? (
        trigger(openSheet)
      ) : (
        <Button variant="brand" onClick={openSheet} className="h-11">
          <PenLine /> Write a review
        </Button>
      )}
      <ResponsiveSheet
        open={open}
        onOpenChange={setOpen}
        title={done ? "Thanks for your review" : `Review the ${product.model}`}
        description={done ? undefined : "Honest, specific reviews help other buyers most. Reviews are moderated before publishing."}
        footer={
          done ? (
            <Button className="h-11 flex-1" onClick={() => setOpen(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="outline" className="h-11 flex-1 sm:flex-none" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="review-form" variant="brand" className="h-11 flex-1">
                Submit review
              </Button>
            </>
          )
        }
      >
        {done ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="size-7" />
            </span>
            <div className="space-y-1.5">
              <h3 className="text-[17px] font-semibold">Submitted for moderation (demo)</h3>
              <p className="mx-auto max-w-sm text-[14px] leading-relaxed text-muted-foreground">Your review now appears at the top of this page marked &ldquo;Pending moderation&rdquo;. Nothing has been sent anywhere — in this demo it lives only in this browser tab.</p>
            </div>
            <p className="flex items-start gap-2 rounded-[12px] bg-surface-2 p-3 text-left text-[12px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" /> In the live product, moderators check reviews for relevance and authenticity before they count towards ratings and sentiment.
            </p>
          </div>
        ) : (
          <ReviewForm
            key={formKey}
            product={product}
            onSubmitted={(r) => {
              onSubmitted(r);
              setDone(true);
            }}
          />
        )}
      </ResponsiveSheet>
    </>
  );
}
