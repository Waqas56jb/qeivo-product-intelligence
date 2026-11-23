"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock, Gauge, Package, PlayCircle, RotateCcw, Wrench } from "lucide-react";
import { toast } from "sonner";
import type { DiyCategory, DiyGuide } from "@/types";
import { diyGuides } from "@/data/guides";
import { getProduct } from "@/data/products";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Progress } from "@/components/ui/primitives";
import { FilterChip, SearchField } from "@/components/common/controls";
import { EmptyState } from "@/components/common/states";
import { ImageWithFallback } from "@/components/common/image-with-fallback";

const CATS: { id: DiyCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "installation", label: "Installation" },
  { id: "setup", label: "Setup" },
  { id: "cleaning", label: "Cleaning" },
  { id: "maintenance", label: "Maintenance" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "parts", label: "Parts & tools" },
  { id: "safety", label: "Safety" },
];

const DIFF: Record<DiyGuide["difficulty"], "success" | "warning" | "danger"> = { Easy: "success", Moderate: "warning", Advanced: "danger" };

export function SafetyWarning({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div role="note" className="rounded-[14px] border border-warning/35 bg-warning-soft/60 p-4">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-warning-foreground">
        <AlertTriangle className="size-4" /> Safety first
      </p>
      <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed">
        {items.map((s) => (
          <li key={s} className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-warning" /> {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GuideChecklist({ guide }: { guide: DiyGuide }) {
  const hydrated = useHydrated();
  const done = useAppStore((s) => s.checklists[guide.id]);
  const toggle = useAppStore((s) => s.toggleChecklist);
  const reset = useAppStore((s) => s.resetChecklist);
  const checked = hydrated ? (done ?? []) : [];
  const pct = Math.round((checked.length / guide.checklist.length) * 100);
  const complete = checked.length === guide.checklist.length;
  return (
    <section className={cn("rounded-[20px] border p-5 shadow-xs", complete ? "border-success/40 bg-success-soft/40" : "border-border bg-card")}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">Completion checklist</h3>
        <Button variant="ghost" size="sm" onClick={() => reset(guide.id)} disabled={!checked.length}>
          <RotateCcw /> Reset
        </Button>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <Progress value={pct} className="flex-1" indicatorClassName={complete ? "bg-success" : undefined} />
        <span className="tabular text-[13px] font-semibold">{pct}%</span>
      </div>
      <ul className="mt-4 space-y-1">
        {guide.checklist.map((item) => {
          const on = checked.includes(item);
          return (
            <li key={item}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] px-2 hover:bg-surface-2">
                <Checkbox
                  checked={on}
                  onCheckedChange={() => {
                    toggle(guide.id, item);
                    if (!on && checked.length + 1 === guide.checklist.length) toast.success("Guide complete", { description: guide.title });
                  }}
                />
                <span className={cn("text-[14px]", on && "text-muted-foreground line-through")}>{item}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {complete && (
        <p className="mt-3 flex items-center gap-2 text-[13px] font-medium text-success">
          <CheckCircle2 className="size-4" /> All steps complete. Nicely done.
        </p>
      )}
    </section>
  );
}

function GuideDetail({ guide, onBack }: { guide: DiyGuide; onBack: () => void }) {
  return (
    <article className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft /> All guides
      </Button>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[24px] border border-border">
            <ImageWithFallback src={guide.image} alt="" aspect="aspect-[16/7]" priority sizes="(max-width: 1024px) 100vw, 60vw" />
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="brand">{CATS.find((c) => c.id === guide.category)?.label}</Badge>
              <Badge variant={DIFF[guide.difficulty]}>{guide.difficulty}</Badge>
            </div>
            <h2 className="mt-3 text-[26px] font-semibold leading-tight">{guide.title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{guide.summary}</p>
          </div>
          <dl className="grid grid-cols-3 gap-3">
            {[
              { icon: Clock, label: "Duration", value: `${guide.durationMinutes} min` },
              { icon: Gauge, label: "Difficulty", value: guide.difficulty },
              { icon: Wrench, label: "Tools", value: `${guide.tools.length}` },
            ].map((s) => (
              <div key={s.label} className="rounded-[14px] border border-border bg-card p-3">
                <s.icon className="size-4 text-brand" />
                <dt className="mt-2 text-[11px] uppercase tracking-wider text-subtle-foreground">{s.label}</dt>
                <dd className="tabular text-[15px] font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
          <SafetyWarning items={guide.safety} />
          <section>
            <h3 className="mb-4 text-[18px] font-semibold">Step-by-step</h3>
            <ol className="space-y-4">
              {guide.steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-[13px] font-semibold tabular text-primary-foreground">{i + 1}</span>
                  <div className="pt-1">
                    <p className="font-semibold">{s.title}</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <GuideChecklist guide={guide} />
          <section className="rounded-[20px] border border-border bg-card p-5 shadow-xs">
            <h3 className="flex items-center gap-2 font-semibold">
              <Wrench className="size-4 text-brand" /> Tools
            </h3>
            <ul className="mt-2 space-y-1 text-[14px] text-muted-foreground">
              {guide.tools.map((t) => (
                <li key={t}>• {t}</li>
              ))}
            </ul>
            {guide.parts.length > 0 && (
              <>
                <h3 className="mt-4 flex items-center gap-2 font-semibold">
                  <Package className="size-4 text-brand" /> Parts
                </h3>
                <ul className="mt-2 space-y-1 text-[14px] text-muted-foreground">
                  {guide.parts.map((t) => (
                    <li key={t}>• {t}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
          {guide.videoSlug && (
            <Button asChild variant="outline" className="w-full">
              <Link href={routes.video(guide.videoSlug)}>
                <PlayCircle /> Watch the video walkthrough
              </Link>
            </Button>
          )}
          {guide.productIds.length > 0 && (
            <section className="rounded-[20px] border border-border bg-card p-5 shadow-xs">
              <h3 className="font-semibold">Applies to</h3>
              <ul className="mt-2 space-y-1.5">
                {guide.productIds.map((id) => {
                  const p = getProduct(id);
                  return p ? (
                    <li key={id}>
                      <Link href={routes.product(p.slug)} className="text-[14px] text-brand-soft-foreground hover:underline">
                        {p.name}
                      </Link>
                    </li>
                  ) : null;
                })}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </article>
  );
}

export function OwnershipGuides() {
  const params = useSearchParams();
  const router = useRouter();
  const [cat, setCat] = useState<DiyCategory | "all">("all");
  const [q, setQ] = useState("");
  const hydrated = useHydrated();
  const checklists = useAppStore((s) => s.checklists);
  const selected = params.get("guide");
  const guide = selected ? diyGuides.find((g) => g.slug === selected) : undefined;
  const list = useMemo(() => diyGuides.filter((g) => (cat === "all" || g.category === cat) && (!q || `${g.title} ${g.summary}`.toLowerCase().includes(q.toLowerCase()))), [cat, q]);

  if (guide) return <GuideDetail guide={guide} onBack={() => router.push(routes.ownershipGuides, { scroll: false })} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="scrollbar-none -mx-4 flex flex-1 gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {CATS.map((c) => (
            <FilterChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} count={c.id === "all" ? diyGuides.length : diyGuides.filter((g) => g.category === c.id).length}>
              {c.label}
            </FilterChip>
          ))}
        </div>
        <SearchField value={q} onChange={setQ} placeholder="Search guides…" className="lg:w-72" />
      </div>
      {list.length === 0 ? (
        <EmptyState title="No guides match" description="Try another category or search term." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((g) => {
            const done = hydrated ? (checklists[g.id]?.length ?? 0) : 0;
            return (
              <Link key={g.id} href={`${routes.ownershipGuides}?guide=${g.slug}`} scroll={false} className="group overflow-hidden rounded-[20px] border border-border bg-card shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md">
                <ImageWithFallback src={g.image} alt="" aspect="aspect-[16/9]" sizes="(max-width: 768px) 100vw, 33vw" className="transition-transform duration-700 group-hover:scale-[1.04]" />
                <div className="space-y-2 p-4">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="brand">{CATS.find((c) => c.id === g.category)?.label}</Badge>
                    <Badge variant={DIFF[g.difficulty]}>{g.difficulty}</Badge>
                    <Badge variant="outline">
                      <Clock /> {g.durationMinutes} min
                    </Badge>
                  </div>
                  <h3 className="font-semibold leading-snug">{g.title}</h3>
                  <p className="line-clamp-2 text-[13px] text-muted-foreground">{g.summary}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Progress value={(done / g.checklist.length) * 100} className="h-1.5 flex-1" />
                    <span className="tabular text-[11px] text-muted-foreground">
                      {done}/{g.checklist.length}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
