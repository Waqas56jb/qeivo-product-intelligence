"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { BookMarked, CheckCircle2, ClipboardCheck, FileVideo, Link2, Loader2, Megaphone, Package, Plus, Send, Trash2, Type, X } from "lucide-react";
import type { ContentSubmission } from "@/types";
import { submissionsForCreator } from "@/data/creators/submissions";
import { CREATOR_ID } from "@/data/analytics/creator";
import { routes } from "@/config/routes";
import { getProduct } from "@/data/products";
import { cn, hash } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox, RadioCard, RadioGroup, Switch } from "@/components/ui/primitives";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { SponsoredDisclosure } from "@/components/analysis/warnings";
import { ErrorSummary, FieldError, FormActions, FormField, FormSection, SelectField, collectErrors, fieldAria } from "@/components/forms/form-field";
import { ProductMultiSelect } from "@/components/business/product-picker";
import { UploadDropzone, UploadRow, useUploadQueue } from "@/components/business/upload";
import { SubmissionStatusTimeline } from "@/components/business/submission-status";
import { DemoTag, ScoreIntegrityNotice } from "@/components/business/primitives";
import { CONTENT_TYPE_META, CONTENT_TYPES } from "./meta";

const RELATIONSHIPS = [
  { value: "paid", label: "Paid partnership" },
  { value: "loaned", label: "Loaned review unit" },
  { value: "gifted", label: "Gifted product" },
  { value: "affiliate", label: "Affiliate commission" },
];

const schema = z
  .object({
    type: z.enum(["video", "review", "diy-guide", "article"], { message: "Choose a content type" }),
    title: z.string().trim().min(10, "Title must be at least 10 characters").max(120, "Keep the title under 120 characters"),
    description: z.string().trim().min(40, "Describe the content in at least 40 characters").max(1200, "Keep the description under 1,200 characters"),
    productIds: z.array(z.string()).min(1, "Associate at least one product").max(5, "Associate up to 5 products"),
    mediaCount: z.number(),
    sources: z
      .array(
        z.object({
          label: z.string().trim().min(4, "Name the source (at least 4 characters)"),
          locator: z.string().trim().max(60, "Keep the locator short"),
        }),
      )
      .min(1, "Add at least one source")
      .max(8, "Up to 8 sources"),
    sponsored: z.boolean(),
    sponsor: z.string().trim(),
    relationship: z.string(),
    disclosure: z.string().trim(),
    confirm: z.boolean().refine((v) => v, "Confirm the accuracy and disclosure statement to submit"),
  })
  .superRefine((v, ctx) => {
    if ((v.type === "video" || v.type === "diy-guide") && v.mediaCount < 1)
      ctx.addIssue({ code: "custom", path: ["mediaCount"], message: v.type === "video" ? "Upload the video file or a preview cut" : "Upload at least one step photo" });
    if (v.sponsored) {
      if (v.sponsor.length < 2) ctx.addIssue({ code: "custom", path: ["sponsor"], message: "Name the sponsor — required for sponsored content" });
      if (!v.relationship) ctx.addIssue({ code: "custom", path: ["relationship"], message: "Choose the type of relationship" });
      if (v.disclosure.length < 30) ctx.addIssue({ code: "custom", path: ["disclosure"], message: "Write a disclosure of at least 30 characters — it is shown to shoppers" });
    }
  });

type Values = z.infer<typeof schema>;

const ERROR_ID: Record<string, string> = { mediaCount: "media", "sources.root": "add-source", sources: "add-source", confirm: "confirm" };
const toId = (p: string) => ERROR_ID[p] ?? p.replace(/\./g, "-");

function defaultsFrom(s?: ContentSubmission): Values {
  return {
    type: s?.type ?? "video",
    title: s?.title ?? "",
    description: s?.description ?? "",
    productIds: s?.productIds ?? [],
    mediaCount: s && (s.type === "video" || s.type === "diy-guide") ? 1 : 0,
    sources: s ? [{ label: "Own measurements — calibrated probe and logging-meter data", locator: "Test log, method notes" }] : [{ label: "", locator: "" }],
    sponsored: s?.sponsored ?? false,
    sponsor: s?.sponsor ?? "",
    relationship: s?.sponsored ? "paid" : "",
    disclosure: s?.sponsored ? `Paid partnership with ${s.sponsor}. ${s.sponsor} did not see or approve the content before submission.` : "",
    confirm: false,
  };
}

export function SubmissionForm() {
  const params = useSearchParams();
  const from = params.get("from");
  const source = from ? submissionsForCreator(CREATOR_ID).find((s) => s.id === from) : undefined;
  return <SubmissionFormInner key={source?.id ?? "new"} source={source} />;
}

function SubmissionFormInner({ source }: { source?: ContentSubmission }) {
  const [submitted, setSubmitted] = useState<(Values & { ref: string }) | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [existingMedia, setExistingMedia] = useState<string | null>(source && (source.type === "video" || source.type === "diy-guide") ? source.thumbnail : null);
  const uploads = useUploadQueue<{ kind: string }>({ tickMs: 140 });

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: defaultsFrom(source), mode: "onTouched" });
  const { register, control, handleSubmit, setValue, formState, reset } = form;
  const { errors, isSubmitting, submitCount } = formState;
  const sources = useFieldArray({ control, name: "sources" });
  const [type, sponsored, title, description, sponsor, disclosure] = useWatch({ control, name: ["type", "sponsored", "title", "description", "sponsor", "disclosure"] });

  const mediaCount = uploads.items.length + (existingMedia ? 1 : 0);
  useEffect(() => {
    setValue("mediaCount", mediaCount, { shouldValidate: submitCount > 0 });
  }, [mediaCount, setValue, submitCount]);

  const errorList = useMemo(() => collectErrors(errors, toId), [errors]);
  const previewVideo = uploads.items.find((i) => i.type.startsWith("video/") && i.previewUrl);

  const onValid = async (v: Values) => {
    await new Promise((r) => setTimeout(r, 1100));
    setSubmitted({ ...v, ref: `SUB-${1000 + (hash(v.title) % 9000)}` });
    setShowSummary(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("Submitted for editorial review (demo)", { description: "Nothing was sent — this is a local simulation." });
  };

  if (submitted) {
    const t = CONTENT_TYPE_META[submitted.type];
    return (
      <div className="mx-auto max-w-2xl space-y-5" data-testid="submission-success">
        <div className="overflow-hidden rounded-[20px] border border-border bg-card shadow-sm">
          <div className="bg-teal-sheen px-6 py-7 text-center sm:px-8">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-surface text-brand shadow-sm">
              <CheckCircle2 className="size-7" />
            </span>
            <h2 className="mt-4 text-[22px] font-semibold tracking-tight">Submitted for editorial review</h2>
            <p className="mx-auto mt-1.5 max-w-md text-[14px] text-muted-foreground">
              Reference <span className="font-mono font-semibold text-foreground">{submitted.ref}</span>. Editors usually respond within 3 working days. <DemoTag className="ml-1 align-middle" />
            </p>
          </div>
          <div className="space-y-6 p-6 sm:p-8">
            <SubmissionStatusTimeline status="in-review" />
            <dl className="grid gap-3 rounded-[14px] bg-surface-2/60 p-4 text-[13px] sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-subtle-foreground">Title</dt>
                <dd className="font-medium">{submitted.title}</dd>
              </div>
              <div>
                <dt className="text-subtle-foreground">Content type</dt>
                <dd className="font-medium">{t.label}</dd>
              </div>
              <div>
                <dt className="text-subtle-foreground">Sources cited</dt>
                <dd className="font-medium tabular">{submitted.sources.length}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-subtle-foreground">Products</dt>
                <dd className="font-medium">{submitted.productIds.map((id) => getProduct(id)?.name).filter(Boolean).join(", ")}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-subtle-foreground">Disclosure</dt>
                <dd className="font-medium">{submitted.sponsored ? `Sponsored by ${submitted.sponsor} — labelled on Qeivo` : "Independent — no sponsor declared"}</dd>
              </div>
            </dl>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              This is a demo: no files or data left your browser. In the live product the editor checks every source and disclosure, then you would be notified here when the status changes.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="sm:flex-1">
                <Link href={routes.cSubmissions}>View all submissions</Link>
              </Button>
              <Button
                variant="outline"
                className="sm:flex-1"
                onClick={() => {
                  reset(defaultsFrom());
                  uploads.clear();
                  setExistingMedia(null);
                  setSubmitted(null);
                }}
              >
                <Plus /> Start another submission
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onValid, () => {
        setShowSummary(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      })}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]"
    >
      <div className="min-w-0 space-y-6">
        {showSummary && errorList.length > 0 && <ErrorSummary errors={errorList} />}
        {source && (
          <div className="flex items-start gap-3 rounded-[14px] border border-info/30 bg-info-soft/50 p-4 text-[13px]">
            <BookMarked className="mt-0.5 size-4 shrink-0 text-info-foreground" />
            <p className="text-muted-foreground">
              Revising <span className="font-medium text-foreground">“{source.title}”</span>.{source.reviewerNote ? <> Editor note: {source.reviewerNote}</> : null}
            </p>
          </div>
        )}

        <FormSection title="Content type" description="What are you submitting? This decides which checks the editor runs." icon={<Type />}>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3 sm:grid-cols-2" aria-label="Content type">
                {CONTENT_TYPES.map((t) => {
                  const m = CONTENT_TYPE_META[t];
                  return (
                    <RadioCard key={t} value={t} id={`type-${t}`}>
                      <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-muted-foreground">
                        <m.icon className="size-[18px]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-semibold">{m.label}</span>
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-muted-foreground">{m.description}</span>
                      </span>
                    </RadioCard>
                  );
                })}
              </RadioGroup>
            )}
          />
        </FormSection>

        <FormSection title="Details" description="Shown to shoppers on product pages and in search." icon={<FileVideo />}>
          <FormField label="Title" htmlFor="title" required error={errors.title?.message} labelAction={<span className="text-[11px] text-subtle-foreground tabular">{title.length}/120</span>}>
            <Input {...register("title")} {...fieldAria("title", errors.title?.message)} placeholder="e.g. Nordvik Ellipse BF380 — three months of night-time noise logs" />
          </FormField>
          <FormField
            label="Description"
            htmlFor="description"
            required
            error={errors.description?.message}
            description="Explain your test method and what the viewer will learn."
            labelAction={<span className="text-[11px] text-subtle-foreground tabular">{description.length}/1200</span>}
          >
            <Textarea {...register("description")} {...fieldAria("description", errors.description?.message, true)} rows={5} placeholder="What did you test, for how long, and with which equipment?" />
          </FormField>
          <FormField label="Associated products" htmlFor="productIds" required error={errors.productIds?.message} description="Up to 5. Your content appears in the Videos & reviews section of each product.">
            <Controller control={control} name="productIds" render={({ field }) => <ProductMultiSelect id="productIds" value={field.value} onChange={field.onChange} error={errors.productIds?.message} />} />
          </FormField>
        </FormSection>

        <FormSection
          id="media-section"
          title="Media"
          description={type === "video" ? "Video file (MP4/MOV) plus an optional thumbnail. Required." : type === "diy-guide" ? "Step photos. At least one is required." : "Optional header image or figures."}
          icon={<Package />}
        >
          <UploadDropzone
            id="media"
            accept="video/*,image/*"
            maxSizeMb={2048}
            title="Drag your media here"
            hint="MP4, MOV, JPG or PNG · files stay in your browser (demo)"
            onFiles={(files) => uploads.add(files, (f) => ({ kind: f.type.startsWith("video/") ? "video" : "image" }))}
            className={cn(errors.mediaCount && "border-danger")}
          />
          <FieldError id="media-error" message={errors.mediaCount?.message} />
          {(existingMedia || uploads.items.length > 0) && (
            <div className="grid gap-2">
              {existingMedia && (
                <div className="flex items-center gap-3 rounded-[12px] border border-border bg-surface p-3">
                  <ImageWithFallback src={existingMedia} alt="" wrapperClassName="size-11 shrink-0 rounded-[9px]" sizes="44px" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium">Current media from your previous submission</p>
                    <p className="text-[12px] text-muted-foreground">Kept unless you remove it</p>
                  </div>
                  <button type="button" onClick={() => setExistingMedia(null)} aria-label="Remove current media" className="grid size-8 place-items-center rounded-[8px] text-muted-foreground hover:bg-surface-2 hover:text-foreground">
                    <X className="size-4" />
                  </button>
                </div>
              )}
              {uploads.items.map((it) => (
                <UploadRow key={it.id} item={it} onRemove={() => uploads.remove(it.id)} processingLabel={it.meta.kind === "video" ? "Generating preview…" : "Optimising…"} doneLabel="Ready for review" />
              ))}
            </div>
          )}
          {previewVideo?.previewUrl && previewVideo.status === "done" && (
            <video src={previewVideo.previewUrl} controls className="aspect-video w-full rounded-[12px] border border-border bg-black" aria-label={`Preview of ${previewVideo.name}`} />
          )}
        </FormSection>

        <FormSection
          title="Sources"
          description="Every factual claim needs a source the editor can check: your own measurements, manuals, lab reports or registry entries."
          icon={<Link2 />}
          action={
            <Button id="add-source" type="button" size="sm" variant="outline" disabled={sources.fields.length >= 8} onClick={() => sources.append({ label: "", locator: "" })}>
              <Plus /> Add source
            </Button>
          }
        >
          <FieldError message={errors.sources?.root?.message ?? errors.sources?.message} />
          <ol className="grid gap-3">
            {sources.fields.map((f, i) => {
              const err = errors.sources?.[i];
              return (
                <li key={f.id} className="grid gap-3 rounded-[12px] border border-border bg-surface-2/40 p-3 sm:grid-cols-[28px_minmax(0,1fr)_180px_36px] sm:items-start">
                  <span className="hidden size-7 place-items-center rounded-full bg-surface text-[12px] font-semibold text-muted-foreground tabular sm:mt-1.5 sm:grid">{i + 1}</span>
                  <FormField label={<span className="sm:sr-only">Source {i + 1}</span>} htmlFor={`sources-${i}-label`} error={err?.label?.message}>
                    <Input {...register(`sources.${i}.label`)} {...fieldAria(`sources-${i}-label`, err?.label?.message)} placeholder="e.g. Nordvik NV-BF380W owner's manual" />
                  </FormField>
                  <FormField label={<span className="sm:sr-only">Locator</span>} htmlFor={`sources-${i}-locator`} error={err?.locator?.message}>
                    <Input {...register(`sources.${i}.locator`)} {...fieldAria(`sources-${i}-locator`, err?.locator?.message)} placeholder="Page 14 · 03:10" />
                  </FormField>
                  <Button type="button" variant="ghost" size="icon" className="justify-self-end sm:mt-0" disabled={sources.fields.length === 1} onClick={() => sources.remove(i)} aria-label={`Remove source ${i + 1}`}>
                    <Trash2 />
                  </Button>
                </li>
              );
            })}
          </ol>
        </FormSection>

        <FormSection title="Sponsorship & disclosure" description="Declare any relationship with a brand or retailer. Sponsored content is labelled and never affects scores." icon={<Megaphone />}>
          <Controller
            control={control}
            name="sponsored"
            render={({ field }) => (
              <label htmlFor="sponsored" className="flex cursor-pointer items-start justify-between gap-4 rounded-[12px] border border-border bg-surface p-4">
                <span>
                  <span className="block text-[14px] font-medium">This content is sponsored or involves a brand relationship</span>
                  <span className="mt-0.5 block text-[12.5px] text-muted-foreground">Paid partnerships, loaned or gifted units and affiliate commissions all count.</span>
                </span>
                <Switch id="sponsored" checked={field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />
          {sponsored && (
            <div className="grid gap-5 animate-in fade-in-0 slide-in-from-top-1">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Sponsor" htmlFor="sponsor" required error={errors.sponsor?.message}>
                  <Input {...register("sponsor")} {...fieldAria("sponsor", errors.sponsor?.message)} placeholder="Brand or retailer name" />
                </FormField>
                <FormField label="Relationship" htmlFor="relationship" required error={errors.relationship?.message}>
                  <Controller control={control} name="relationship" render={({ field }) => <SelectField id="relationship" value={field.value} onValueChange={field.onChange} options={RELATIONSHIPS} placeholder="Choose…" error={errors.relationship?.message} />} />
                </FormField>
              </div>
              <FormField label="Disclosure shown to shoppers" htmlFor="disclosure" required error={errors.disclosure?.message} description="Plain language. Say what was received and whether the sponsor saw the content before publishing.">
                <Textarea {...register("disclosure")} {...fieldAria("disclosure", errors.disclosure?.message, true)} rows={3} placeholder="e.g. Paid partnership with Maru. Maru did not see or approve this video before publishing." />
              </FormField>
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">Preview</p>
                <SponsoredDisclosure detail={disclosure || `Sponsored by ${sponsor || "…"}. This placement never changes suitability scores, AI verdicts, rankings or recommendations.`} />
              </div>
            </div>
          )}
          <Controller
            control={control}
            name="confirm"
            render={({ field }) => (
              <div className="space-y-2">
                <label htmlFor="confirm" className="flex cursor-pointer items-start gap-3 text-[13.5px] leading-relaxed">
                  <Checkbox id="confirm" checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} aria-invalid={errors.confirm ? true : undefined} aria-describedby={errors.confirm ? "confirm-error" : undefined} className="mt-0.5" />
                  <span>I confirm the sources are accurate and I have disclosed every relationship with the brands and retailers featured.</span>
                </label>
                <FieldError id="confirm-error" message={errors.confirm?.message} />
              </div>
            )}
          />
        </FormSection>

        <FormActions status={<span className="inline-flex items-center gap-2">Submissions are reviewed by a Qeivo editor <DemoTag /></span>}>
          <Button type="button" variant="outline" onClick={() => toast.success("Draft saved locally (demo)", { description: "Drafts are kept for this session only." })}>
            Save draft
          </Button>
          <Button type="submit" variant="brand" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />} {isSubmitting ? "Submitting…" : "Submit for review"}
          </Button>
        </FormActions>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[14px] border border-border bg-card p-5 shadow-xs">
          <h2 className="flex items-center gap-2 text-[14px] font-semibold">
            <ClipboardCheck className="size-4 text-brand" /> What editors check
          </h2>
          <ul className="mt-3 space-y-2.5 text-[13px] leading-snug text-muted-foreground">
            {[
              "Every number on screen or in text has a checkable source",
              "Manufacturer claims are attributed, not stated as fact",
              "Sponsorship and loaned units are disclosed up front",
              "No prices, promo codes or buy calls inside the verdict",
              "DIY guides include isolation and safety steps",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <CheckCircle2 className="mt-px size-3.5 shrink-0 text-success" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <ScoreIntegrityNotice role="Creators">Your content is shown as evidence next to products. It cannot change suitability scores, evidence coverage, rankings or verdicts — and sponsored content never affects them.</ScoreIntegrityNotice>
      </aside>
    </form>
  );
}
