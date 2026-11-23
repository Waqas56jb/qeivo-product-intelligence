import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { BuyingGuide } from "@/types";
import { routes } from "@/config/routes";
import { getCategory } from "@/data/products/categories";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/common/image-with-fallback";

export function GuideAuthor({ guide, className, size = "sm", onDark }: { guide: BuyingGuide; className?: string; size?: "sm" | "md"; onDark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <ImageWithFallback src={guide.author.avatar} alt="" aspect={cn("shrink-0 rounded-full", size === "md" ? "size-10" : "size-7")} sizes="40px" />
      <div className={cn("min-w-0 leading-tight", size === "md" ? "text-[14px]" : "text-[12px]")}>
        <p className={cn("truncate font-semibold", onDark && "text-white")}>{guide.author.name}</p>
        <p className={cn("truncate", onDark ? "text-white/65" : "text-subtle-foreground")}>
          {size === "md" ? guide.author.role : <>Updated {formatDate(guide.updatedAt)}</>}
        </p>
      </div>
    </div>
  );
}

/**
 * Editorial guide card. `default` for grids, `feature` for hero placements,
 * `compact` for rails and related lists.
 */
export function GuideCard({ guide, variant = "default", href, className, priority }: { guide: BuyingGuide; variant?: "default" | "feature" | "compact"; href?: string; className?: string; priority?: boolean }) {
  const link = href ?? routes.guide(guide.slug);
  const category = getCategory(guide.category);

  if (variant === "compact")
    return (
      <Link href={link} className={cn("group flex items-center gap-3.5 rounded-[14px] p-2 transition-colors hover:bg-surface-2", className)}>
        <ImageWithFallback src={guide.heroImage} alt="" aspect="size-20 shrink-0 rounded-[12px] sm:size-[88px]" sizes="88px" className="transition-transform duration-500 group-hover:scale-105" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-soft-foreground">{guide.topic}</p>
          <p className="mt-0.5 line-clamp-2 text-[14px] font-semibold leading-snug">{guide.title}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-subtle-foreground tabular">
            <Clock className="size-3" /> {guide.readingMinutes} min read
          </p>
        </div>
      </Link>
    );

  if (variant === "feature")
    return (
      <Link href={link} className={cn("group relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[24px] shadow-md sm:min-h-[480px]", className)}>
        <ImageWithFallback src={guide.heroImage} alt="" aspect="absolute inset-0 -z-10" priority={priority} sizes="(max-width: 1024px) 100vw, 66vw" className="transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/95 via-navy-950/45 to-navy-950/5" />
        <div className="space-y-4 p-6 sm:p-9">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-teal-400 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-navy-950">Featured</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              {category.name} · {guide.topic}
            </span>
          </div>
          <h3 className="max-w-2xl text-balance text-[26px] font-semibold leading-tight text-white sm:text-[36px]">{guide.title}</h3>
          <p className="line-clamp-3 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-[16px]">{guide.excerpt}</p>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <GuideAuthor guide={guide} onDark size="md" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-navy-950 transition-transform group-hover:translate-x-0.5">
              Read guide · {guide.readingMinutes} min <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>
      </Link>
    );

  return (
    <Link href={link} className={cn("group flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-xs transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md", className)}>
      <div className="relative">
        <ImageWithFallback src={guide.heroImage} alt="" aspect="aspect-[16/10]" priority={priority} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="transition-transform duration-700 group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur">{category.name}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-[12px] font-medium text-brand-soft-foreground">
          {guide.topic} · <span className="tabular">{guide.readingMinutes} min read</span>
        </p>
        <h3 className="text-[17px] font-semibold leading-snug">{guide.title}</h3>
        <p className="line-clamp-2 text-[14px] leading-relaxed text-muted-foreground">{guide.excerpt}</p>
        <GuideAuthor guide={guide} className="mt-auto pt-3" />
      </div>
    </Link>
  );
}
