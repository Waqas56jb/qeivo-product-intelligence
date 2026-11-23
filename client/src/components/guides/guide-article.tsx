import { AlertTriangle, Check, Info, Lightbulb } from "lucide-react";
import type { BuyingGuide, GuideSection } from "@/types";
import { getSource } from "@/data/sources/sources";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SourceCitation, SourceTypeBadge } from "@/components/analysis/badges";

const CALLOUT = {
  tip: { icon: Lightbulb, label: "Qeivo tip", className: "border-success/30 bg-success-soft/60", iconClass: "bg-success-soft text-success" },
  warning: { icon: AlertTriangle, label: "Watch out", className: "border-warning/35 bg-warning-soft/60", iconClass: "bg-warning-soft text-warning-foreground" },
  info: { icon: Info, label: "Good to know", className: "border-info/30 bg-info-soft/60", iconClass: "bg-info-soft text-info-foreground" },
} as const;

export function GuideCallout({ tone, text, className }: { tone: NonNullable<GuideSection["callout"]>["tone"]; text: string; className?: string }) {
  const c = CALLOUT[tone];
  return (
    <aside role="note" className={cn("flex gap-3.5 rounded-[16px] border p-4 sm:p-5", c.className, className)}>
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-[10px]", c.iconClass)}>
        <c.icon className="size-4.5" />
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</p>
        <p className="mt-1 text-[15px] leading-relaxed text-foreground">{text}</p>
      </div>
    </aside>
  );
}

function Section({ section, index }: { section: GuideSection; index: number }) {
  return (
    <section id={section.id} aria-labelledby={`${section.id}-h`} className="scroll-mt-28">
      <h2 id={`${section.id}-h`} className="flex items-baseline gap-3 text-[22px] font-semibold leading-tight tracking-tight sm:text-[26px]">
        <span className="text-[14px] font-semibold text-brand-soft-foreground tabular sm:text-[15px]">{String(index + 1).padStart(2, "0")}</span>
        <span className="text-balance">{section.heading}</span>
      </h2>
      <div className="mt-4 space-y-4">
        {section.paragraphs.map((p, i) => (
          <p key={i} className="text-[16px] leading-[1.75] text-foreground/85 sm:text-[17px]">
            {p}
          </p>
        ))}
      </div>
      {section.bullets && (
        <ul className="mt-5 space-y-2.5 rounded-[16px] border border-border bg-surface p-4 sm:p-5">
          {section.bullets.map((b) => (
            <li key={b} className="flex gap-3 text-[15px] leading-relaxed">
              <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-soft-foreground">
                <Check className="size-3" />
              </span>
              {b}
            </li>
          ))}
        </ul>
      )}
      {section.callout && <GuideCallout tone={section.callout.tone} text={section.callout.text} className="mt-6" />}
    </section>
  );
}

/** Long-form guide body: numbered sections with bullets and callouts. */
export function GuideArticle({ guide, className }: { guide: BuyingGuide; className?: string }) {
  return (
    <div className={cn("space-y-12 sm:space-y-14", className)}>
      {guide.sections.map((s, i) => (
        <Section key={s.id} section={s} index={i} />
      ))}
    </div>
  );
}

/** Numbered reference list for a guide, each with a clickable citation chip that opens the source panel. */
export function GuideReferences({ sourceIds, className }: { sourceIds: string[]; className?: string }) {
  const sources = sourceIds.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => Boolean(s));
  if (!sources.length) return null;
  return (
    <ol className={cn("divide-y divide-border rounded-[20px] border border-border bg-card shadow-xs", className)}>
      {sources.map((s, i) => (
        <li key={s.id} className="flex gap-4 p-4 sm:p-5">
          <span className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-surface-2 text-[12px] font-semibold text-muted-foreground tabular">{i + 1}</span>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <SourceTypeBadge type={s.type} />
              <span className="text-[12px] text-subtle-foreground tabular">Published {formatDate(s.publishedAt)}</span>
            </div>
            <p className="text-[14px] font-semibold leading-snug">{s.title}</p>
            <p className="text-[13px] text-muted-foreground">{s.publisher}</p>
            <p className="line-clamp-2 text-[13px] italic leading-relaxed text-muted-foreground">“{s.excerpt}”</p>
            <SourceCitation sourceId={s.id} allIds={sources.map((x) => x.id)} />
          </div>
        </li>
      ))}
    </ol>
  );
}
