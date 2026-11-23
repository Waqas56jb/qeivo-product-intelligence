"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { BadgeCheck, Camera, Check, CircleDot, Eye, Info, LayoutGrid, Loader2, Megaphone, Plus, RotateCcw, Save, Tags, Trash2, UserRound, X } from "lucide-react";
import type { Creator } from "@/types";
import { submissionsForCreator } from "@/data/creators/submissions";
import { cn, compactNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox, Switch } from "@/components/ui/primitives";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { ErrorSummary, FieldError, FormActions, FormField, FormSection, SelectField, collectErrors, fieldAria } from "@/components/forms/form-field";
import { DemoTag } from "@/components/business/primitives";
import { CONTENT_TYPE_META } from "./meta";

const PLATFORMS = ["YouTube", "Instagram", "TikTok", "Newsletter", "Blog", "Podcast", "Mastodon", "Pinterest", "Facebook"].map((p) => ({ value: p, label: p }));

const schema = z.object({
  name: z.string().trim().min(2, "Enter your display name").max(60),
  handle: z
    .string()
    .trim()
    .regex(/^@[a-z0-9._]{3,30}$/i, "Handles start with @ and use 3–30 letters, numbers, dots or underscores"),
  location: z.string().trim().max(60),
  bio: z.string().trim().min(80, "Write at least 80 characters so shoppers understand your testing background").max(600, "Keep your bio under 600 characters"),
  expertise: z.array(z.string()).min(1, "Add at least one area of expertise").max(8, "Up to 8 expertise tags"),
  portfolio: z.array(z.string()).min(1, "Feature at least one published piece").max(4, "Feature up to 4 pieces"),
  socials: z
    .array(z.object({ label: z.string().min(1, "Choose a platform"), handle: z.string().trim().min(2, "Enter the handle or channel name") }))
    .max(6, "Up to 6 links"),
  disclosure: z.string().trim().min(40, "Your standing disclosure must be at least 40 characters").max(500),
  acceptsLoans: z.boolean(),
  openToSponsors: z.boolean(),
});

type Values = z.infer<typeof schema>;

const toId = (p: string) => (p === "expertise" ? "expertise-input" : p === "portfolio" ? "portfolio" : p.replace(/\./g, "-"));

export function ProfileForm({ creator }: { creator: Creator }) {
  const published = useMemo(() => submissionsForCreator(creator.id).filter((s) => s.status === "published"), [creator.id]);
  const defaults = useMemo<Values>(
    () => ({
      name: creator.name,
      handle: creator.handle,
      location: "Chicago, IL",
      bio: creator.bio,
      expertise: creator.expertise,
      portfolio: published.slice(0, 3).map((s) => s.id),
      socials: creator.socials,
      disclosure: creator.disclosure,
      acceptsLoans: true,
      openToSponsors: true,
    }),
    [creator, published],
  );

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: defaults, mode: "onTouched" });
  const { register, control, handleSubmit, reset, formState, setValue, getValues } = form;
  const { errors, isDirty, isSubmitting } = formState;
  const socials = useFieldArray({ control, name: "socials" });
  const v = useWatch({ control });

  const [photo, setPhoto] = useState<string | null>(null);
  const [photoDirty, setPhotoDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const photoUrl = useRef<string | null>(null);
  useEffect(() => () => void (photoUrl.current && URL.revokeObjectURL(photoUrl.current)), []);

  const dirty = isDirty || photoDirty;
  const errorList = collectErrors(errors, toId);

  const addTag = () => {
    const t = tagDraft.trim().replace(/\s+/g, " ");
    if (!t) return;
    const cur = getValues("expertise");
    if (cur.some((x) => x.toLowerCase() === t.toLowerCase())) return toast.info(`“${t}” is already listed`);
    if (cur.length >= 8) return toast.error("Up to 8 expertise tags");
    setValue("expertise", [...cur, t], { shouldDirty: true, shouldValidate: true });
    setTagDraft("");
  };

  const onValid = async (values: Values) => {
    await new Promise((r) => setTimeout(r, 900));
    reset(values);
    setPhotoDirty(false);
    setShowSummary(false);
    setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    toast.success("Profile saved locally (demo)", { description: "Changes last for this session only — nothing was sent to Qeivo." });
  };

  const status = isSubmitting ? (
    <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Saving…</span>
  ) : dirty ? (
    <span className="inline-flex items-center gap-2 text-warning-foreground"><CircleDot className="size-4" /> Unsaved changes</span>
  ) : savedAt ? (
    <span className="inline-flex items-center gap-2 text-success"><Check className="size-4" /> Saved locally at {savedAt} <DemoTag /></span>
  ) : (
    <span className="inline-flex items-center gap-2">All changes saved <DemoTag /></span>
  );

  const avatar = photo ?? creator.avatar;

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onValid, () => {
        setShowSummary(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      })}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]"
    >
      <div className="min-w-0 space-y-6">
        {showSummary && errorList.length > 0 && <ErrorSummary errors={errorList} />}

        <FormSection title="Public identity" description="How you appear on product pages, video cards and your creator profile." icon={<UserRound />}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative size-20 shrink-0">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element -- local object-URL preview
                <img src={photo} alt="New profile photo preview" className="size-20 rounded-full object-cover ring-2 ring-border" />
              ) : (
                <ImageWithFallback src={creator.avatar} alt={`${creator.name} profile photo`} wrapperClassName="size-20 rounded-full ring-2 ring-border" sizes="80px" />
              )}
              <label htmlFor="photo" className="absolute -bottom-1 -right-1 grid size-8 cursor-pointer place-items-center rounded-full border border-border bg-surface text-muted-foreground shadow-sm hover:text-foreground">
                <Camera className="size-4" />
                <span className="sr-only">Change photo</span>
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-[13px] text-muted-foreground">Square JPG or PNG, at least 400 × 400 px. Previewed locally — not uploaded (demo).</p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <label htmlFor="photo" className="cursor-pointer">
                    <Camera /> Upload new photo
                  </label>
                </Button>
                {photo && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setPhoto(null);
                      setPhotoDirty(false);
                    }}
                  >
                    <RotateCcw /> Revert
                  </Button>
                )}
              </div>
              <input
                id="photo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  if (!f.type.startsWith("image/")) return void toast.error("Choose a JPG, PNG or WebP image");
                  if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
                  photoUrl.current = URL.createObjectURL(f);
                  setPhoto(photoUrl.current);
                  setPhotoDirty(true);
                }}
              />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Display name" htmlFor="name" required error={errors.name?.message}>
              <Input {...register("name")} {...fieldAria("name", errors.name?.message)} />
            </FormField>
            <FormField label="Handle" htmlFor="handle" required error={errors.handle?.message}>
              <Input {...register("handle")} {...fieldAria("handle", errors.handle?.message)} />
            </FormField>
            <FormField label="Location" htmlFor="location" optional error={errors.location?.message} className="sm:col-span-2">
              <Input {...register("location")} {...fieldAria("location", errors.location?.message)} />
            </FormField>
          </div>
          <FormField
            label="Bio"
            htmlFor="bio"
            required
            error={errors.bio?.message}
            description="Lead with how you test. Shoppers use this to judge how much weight to give your reviews."
            labelAction={<span className="text-[11px] text-subtle-foreground tabular">{v.bio?.length ?? 0}/600</span>}
          >
            <Textarea {...register("bio")} {...fieldAria("bio", errors.bio?.message, true)} rows={5} />
          </FormField>
        </FormSection>

        <FormSection title="Expertise" description="Up to 8 tags. Used to match you with products and questions." icon={<Tags />}>
          <FormField label="Expertise tags" htmlFor="expertise-input" error={errors.expertise?.message}>
            <div className="flex gap-2">
              <Input
                id="expertise-input"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Type a topic and press Enter"
                aria-invalid={errors.expertise ? true : undefined}
              />
              <Button type="button" variant="outline" onClick={addTag} disabled={!tagDraft.trim()}>
                <Plus /> Add
              </Button>
            </div>
          </FormField>
          <Controller
            control={control}
            name="expertise"
            render={({ field }) => (
              <ul className="flex flex-wrap gap-2" aria-label="Expertise tags">
                {field.value.map((t) => (
                  <li key={t} className="inline-flex items-center gap-1 rounded-full bg-brand-soft py-1 pl-3 pr-1 text-[12.5px] font-medium text-brand-soft-foreground">
                    {t}
                    <button type="button" onClick={() => field.onChange(field.value.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="grid size-6 place-items-center rounded-full hover:bg-brand/15">
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
                {!field.value.length && <li className="text-[13px] text-subtle-foreground">No tags yet.</li>}
              </ul>
            )}
          />
        </FormSection>

        <FormSection title="Portfolio" description="Choose up to 4 published pieces to feature at the top of your profile." icon={<LayoutGrid />}>
          <Controller
            control={control}
            name="portfolio"
            render={({ field }) => (
              <div id="portfolio" tabIndex={-1} className="grid gap-3 outline-none sm:grid-cols-2">
                {published.map((s) => {
                  const on = field.value.includes(s.id);
                  const T = CONTENT_TYPE_META[s.type];
                  return (
                    <label key={s.id} className={cn("flex cursor-pointer gap-3 rounded-[12px] border p-2.5 transition-colors", on ? "border-brand bg-brand-soft/30 ring-1 ring-brand" : "border-border bg-surface hover:border-border-strong")}>
                      <ImageWithFallback src={s.thumbnail} alt="" wrapperClassName="aspect-video w-24 shrink-0 rounded-[8px]" sizes="96px" />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-[13px] font-medium leading-snug">{s.title}</span>
                        <span className="mt-1 flex items-center gap-1 text-[11.5px] text-muted-foreground">
                          <T.icon className="size-3" /> {T.label} · {compactNumber(s.views)} views
                        </span>
                      </span>
                      <Checkbox
                        checked={on}
                        onCheckedChange={(c) => field.onChange(c ? [...field.value, s.id] : field.value.filter((x) => x !== s.id))}
                        disabled={!on && field.value.length >= 4}
                        aria-label={`Feature ${s.title}`}
                      />
                    </label>
                  );
                })}
              </div>
            )}
          />
          <FieldError id="portfolio-error" message={errors.portfolio?.message} />
        </FormSection>

        <FormSection
          title="Social links"
          description="Handles only — Qeivo shows them as text so shoppers can find you."
          icon={<BadgeCheck />}
          action={
            <Button type="button" size="sm" variant="outline" disabled={socials.fields.length >= 6} onClick={() => socials.append({ label: "", handle: "" })}>
              <Plus /> Add link
            </Button>
          }
        >
          {socials.fields.length === 0 && <p className="text-[13px] text-subtle-foreground">No social links added.</p>}
          <div className="grid gap-3">
            {socials.fields.map((f, i) => {
              const err = errors.socials?.[i];
              return (
                <div key={f.id} className="grid grid-cols-[minmax(0,1fr)_40px] gap-2 sm:grid-cols-[170px_minmax(0,1fr)_40px] sm:items-start">
                  <FormField label={<span className="sr-only">Platform {i + 1}</span>} htmlFor={`socials-${i}-label`} error={err?.label?.message} className="col-span-2 sm:col-span-1 [&>div:first-child]:hidden">
                    <Controller
                      control={control}
                      name={`socials.${i}.label`}
                      render={({ field }) => <SelectField id={`socials-${i}-label`} ariaLabel={`Platform ${i + 1}`} value={field.value} onValueChange={field.onChange} options={PLATFORMS} placeholder="Platform" error={err?.label?.message} />}
                    />
                  </FormField>
                  <FormField label={<span className="sr-only">Handle {i + 1}</span>} htmlFor={`socials-${i}-handle`} error={err?.handle?.message} className="[&>div:first-child]:hidden">
                    <Input {...register(`socials.${i}.handle`)} {...fieldAria(`socials-${i}-handle`, err?.handle?.message)} aria-label={`Handle ${i + 1}`} placeholder="@handle or channel name" />
                  </FormField>
                  <Button type="button" variant="ghost" size="icon" onClick={() => socials.remove(i)} aria-label={`Remove link ${i + 1}`}>
                    <Trash2 />
                  </Button>
                </div>
              );
            })}
          </div>
        </FormSection>

        <FormSection title="Disclosure" description="Your standing disclosure appears on every piece of content you publish on Qeivo." icon={<Megaphone />}>
          <FormField label="Standing disclosure" htmlFor="disclosure" required error={errors.disclosure?.message}>
            <Textarea {...register("disclosure")} {...fieldAria("disclosure", errors.disclosure?.message)} rows={3} />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["acceptsLoans", "I accept loaned review units", "Loans are disclosed automatically on each review."],
                ["openToSponsors", "Open to sponsored partnerships", "Sponsored content is always labelled and never affects scores."],
              ] as const
            ).map(([name, label, hint]) => (
              <Controller
                key={name}
                control={control}
                name={name}
                render={({ field }) => (
                  <label htmlFor={name} className="flex cursor-pointer items-start justify-between gap-3 rounded-[12px] border border-border bg-surface p-3.5">
                    <span>
                      <span className="block text-[13.5px] font-medium">{label}</span>
                      <span className="mt-0.5 block text-[12px] text-muted-foreground">{hint}</span>
                    </span>
                    <Switch id={name} checked={field.value} onCheckedChange={field.onChange} />
                  </label>
                )}
              />
            ))}
          </div>
        </FormSection>

        <FormActions status={status}>
          <Button
            type="button"
            variant="outline"
            disabled={!dirty || isSubmitting}
            onClick={() => {
              reset();
              setPhoto(null);
              setPhotoDirty(false);
              setShowSummary(false);
            }}
          >
            Discard changes
          </Button>
          <Button type="submit" variant="brand" disabled={!dirty || isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} Save profile
          </Button>
        </FormActions>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Live profile preview">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
          <Eye className="size-3.5" /> Live preview
        </p>
        <div className="overflow-hidden rounded-[20px] border border-border bg-card shadow-sm">
          <ImageWithFallback src={creator.cover} alt="" aspect="aspect-[3/1]" sizes="360px" />
          <div className="relative space-y-3 px-5 pb-5">
            <div className="-mt-8 flex items-end justify-between">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element -- local object-URL preview
                <img src={avatar} alt="" className="size-16 rounded-full object-cover ring-4 ring-card" />
              ) : (
                <ImageWithFallback src={avatar} alt="" wrapperClassName="size-16 rounded-full ring-4 ring-card" sizes="64px" />
              )}
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground tabular">{compactNumber(creator.followers)} followers</span>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[16px] font-semibold">
                {v.name || "Your name"} {creator.verified && <BadgeCheck className="size-4 text-brand" aria-label="Verified creator" />}
              </p>
              <p className="text-[12.5px] text-muted-foreground">
                {v.handle} {v.location ? `· ${v.location}` : ""}
              </p>
            </div>
            <p className="line-clamp-4 text-[13px] leading-relaxed text-muted-foreground">{v.bio}</p>
            <div className="flex flex-wrap gap-1.5">
              {(v.expertise ?? []).map((t) => (
                <span key={t} className="rounded-full bg-surface-2 px-2 py-0.5 text-[11.5px] font-medium text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
            {(v.socials ?? []).some((s) => s?.label && s?.handle) && (
              <ul className="space-y-1 border-t border-border pt-3 text-[12.5px]">
                {(v.socials ?? [])
                  .filter((s) => s?.label && s?.handle)
                  .map((s, i) => (
                    <li key={i} className="flex justify-between gap-3">
                      <span className="text-muted-foreground">{s?.label}</span>
                      <span className="truncate font-medium">{s?.handle}</span>
                    </li>
                  ))}
              </ul>
            )}
            <p className="flex gap-2 rounded-[10px] bg-surface-2/70 p-2.5 text-[12px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" /> {v.disclosure}
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
