"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bookmark,
  CalendarClock,
  Check,
  GitCompareArrows,
  MessageSquareText,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { Product } from "@/types";
import { getProduct, products } from "@/data/products";
import { researchFolders, savedProducts } from "@/data/research/saved-products";
import { savedComparisons } from "@/data/research/comparisons";
import { ownedProducts } from "@/data/research/owned-products";
import { conversations } from "@/data/conversations/conversations";
import { priceHistory, priceStats } from "@/data/offers/price-history";
import { currentUser } from "@/data/users/customers";
import { routes } from "@/config/routes";
import { formatDate, formatRelative } from "@/lib/format";
import { recommend } from "@/lib/recommend";
import { cn, DEMO_NOW } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CurrencyDisplay } from "@/components/common/display";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { EmptyState } from "@/components/common/states";
import { EvidenceCoverage, ScorePill, SuitabilityScore } from "@/components/analysis/score";
import { SponsoredTag } from "@/components/analysis/warnings";
import { Sparkline } from "@/components/charts/charts";
import { BrandLabel, ProductPrice } from "@/components/product/product-bits";
import { SaveButton } from "@/components/product/product-actions";

/* ---------------------------------------------------------------- shared */

export function Panel({ title, description, icon: Icon, action, children, className, id }: { title: string; description?: string; icon?: LucideIcon; action?: React.ReactNode; children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={cn("rounded-[20px] border border-border bg-card p-4 shadow-xs sm:p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          {Icon && (
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[9px] bg-surface-2 text-muted-foreground">
              <Icon className="size-4" />
            </span>
          )}
          <div className="min-w-0">
            <h2 id={id ? `${id}-title` : undefined} className="text-[16px] font-semibold leading-tight sm:text-[17px]">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function SeeAll({ href, label = "See all" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-[8px] px-1 text-[13px] font-medium text-brand-soft-foreground hover:underline sm:min-h-0">
      {label} <ArrowRight className="size-3.5" />
    </Link>
  );
}

const asProducts = (ids: string[]) => ids.map((id) => getProduct(id)).filter((p): p is Product => Boolean(p));

/* ----------------------------------------------------------- stats row */

export function StatsRow() {
  const saved = useAppStore((s) => s.saved);
  const compare = useAppStore((s) => s.compare);
  const watch = useAppStore((s) => s.watchlist);
  const used = useAppStore((s) => s.chatUsed);
  const plan = useAppStore((s) => s.plan);
  const limit = plan === "free" ? 25 : 500;
  const hits = watch.filter((w) => priceStats(w.productId).current <= w.targetPrice).length;
  const due = ownedProducts.flatMap((o) => o.maintenance).filter((m) => m.status === "overdue" || m.status === "due").length;
  const stats: { label: string; value: string; hint: string; icon: LucideIcon; href: string; tone: string }[] = [
    { label: "Saved products", value: String(saved.length), hint: `${researchFolders.length} research folders`, icon: Bookmark, href: routes.saved, tone: "text-brand" },
    { label: "In comparison", value: `${compare.length}/4`, hint: compare.length >= 2 ? "Ready to compare" : "Add one more", icon: GitCompareArrows, href: routes.compare, tone: "text-info" },
    { label: "Price alerts", value: String(watch.length), hint: hits ? `${hits} at or below target` : "None at target yet", icon: Bell, href: routes.priceIntelligence, tone: "text-warning" },
    { label: "Tasks due", value: String(due), hint: "Across your products", icon: Wrench, href: routes.myProducts, tone: "text-danger" },
    { label: "Questions left", value: String(Math.max(0, limit - used)), hint: `${used} of ${limit} used`, icon: Sparkles, href: routes.ask, tone: "text-brand" },
  ];
  return (
    <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i, duration: 0.35 }} className={cn("w-[44%] shrink-0 snap-start sm:w-auto", i === 4 && "sm:col-span-3 lg:col-span-1", i === 3 && "sm:hidden lg:block")}>
          <Link href={s.href} className="group flex h-full flex-col gap-2 rounded-[16px] border border-border bg-card p-4 shadow-xs transition-all hover:-translate-y-px hover:border-border-strong hover:shadow-sm">
            <span className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-muted-foreground">{s.label}</span>
              <s.icon className={cn("size-4", s.tone)} />
            </span>
            <span className="tabular text-[26px] font-semibold leading-none tracking-tight">{s.value}</span>
            <span className="truncate text-[12px] text-subtle-foreground">{s.hint}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------- recently viewed */

export function RecentlyViewed() {
  const ids = useAppStore((s) => s.recentlyViewed);
  const list = asProducts(ids).slice(0, 8);
  return (
    <Panel id="recent" title="Continue researching" description="Products you looked at recently" icon={Search} action={<SeeAll href={routes.products} label="Explore" />}>
      {list.length ? (
        <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5">
          {list.map((p, i) => (
            <Link key={p.id} href={routes.product(p.slug)} className="group w-[168px] shrink-0 snap-start rounded-[16px] border border-border bg-surface p-2.5 transition-all hover:border-border-strong hover:shadow-sm sm:w-[184px]">
              <div className="relative">
                <ImageWithFallback src={p.images[0]} alt={p.name} aspect="aspect-square rounded-[12px] bg-gradient-to-b from-surface-2 to-surface-3/60" sizes="184px" className="p-3 transition-transform duration-500 group-hover:scale-[1.05]" priority={i < 3} />
                <ScorePill score={p.suitabilityScore} className="absolute bottom-2 left-2" />
              </div>
              <div className="px-0.5 pb-0.5 pt-2.5">
                <BrandLabel brandId={p.brandId} className="text-[10px]" />
                <p className="truncate text-[13.5px] font-semibold leading-tight">{p.model}</p>
                <ProductPrice product={p} size="sm" showSaving={false} className="mt-1" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState compact title="Nothing viewed yet" description="Products you open appear here so you can pick up where you left off." action={<Button asChild size="sm"><Link href={routes.products}>Explore products</Link></Button>} />
      )}
    </Panel>
  );
}

/* --------------------------------------------------------- recommended */

export function RecommendedForYou() {
  const region = useAppStore((s) => s.region);
  const prefs = useAppStore((s) => s.preferences);
  const priorities = useAppStore((s) => s.priorities);
  const base = currentUser.preferences;
  const { results } = useMemo(
    () =>
      recommend(products, {
        category: (prefs.interests ?? base.interests)[0] ?? "refrigerators",
        budgetMin: prefs.budgetMin ?? base.budgetMin,
        budgetMax: prefs.budgetMax ?? base.budgetMax,
        householdSize: prefs.householdSize ?? base.householdSize,
        space: null,
        noWaterSupply: false,
        features: [],
        energyPriority: prefs.energyPriority ?? base.energyPriority,
        region,
        brandIds: prefs.preferredBrandIds ?? base.preferredBrandIds,
        priorities,
      }),
    [prefs, base, region, priorities],
  );
  const household = prefs.householdSize ?? base.householdSize;
  return (
    <Panel
      id="recommended"
      title="Recommended for you"
      description={`For a household of ${household}, high energy priority and your preferred brands`}
      icon={Sparkles}
      action={<SeeAll href={routes.recommendations} label="Tune" />}
    >
      <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {results.map((r, i) => (
          <Link key={r.product.id} href={routes.product(r.product.slug)} className="group relative flex w-[78%] shrink-0 snap-start flex-col rounded-[16px] border border-border bg-surface p-3.5 transition-all hover:border-border-strong hover:shadow-sm md:w-auto">
            <div className="flex items-start justify-between gap-2">
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", i === 0 ? "bg-brand text-brand-foreground" : "bg-surface-2 text-muted-foreground")}>{i === 0 ? "Best match" : `#${i + 1} match`}</span>
              <SuitabilityScore score={r.personalScore} size="xs" label={false} />
            </div>
            <ImageWithFallback src={r.product.images[0]} alt={r.product.name} aspect="aspect-[4/3] my-2" sizes="(max-width: 768px) 70vw, 22vw" className="p-2 transition-transform duration-500 group-hover:scale-[1.04]" />
            <div className="flex items-center gap-2">
              <BrandLabel brandId={r.product.brandId} className="text-[10px]" />
              {r.product.sponsored && <SponsoredTag />}
            </div>
            <p className="truncate text-[14px] font-semibold">{r.product.model}</p>
            <ProductPrice product={r.product} size="sm" className="mt-0.5" />
            <EvidenceCoverage coverage={r.product.evidenceCoverage} className="mt-3" />
            <p className="mt-3 flex gap-1.5 border-t border-border pt-3 text-[12px] leading-snug text-muted-foreground">
              <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
              <span className="line-clamp-2">{r.reasons[0]}</span>
            </p>
          </Link>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-subtle-foreground">Ranked on evidence and your priorities only — sponsored placements never affect recommendations.</p>
    </Panel>
  );
}

/* ---------------------------------------------------- active comparison */

export function ActiveComparison() {
  const ids = useAppStore((s) => s.compare);
  const items = asProducts(ids);
  const rows: { label: string; get: (p: Product) => number; fmt: (v: number, p: Product) => React.ReactNode; better: "higher" | "lower" }[] = [
    { label: "Suitability", get: (p) => p.suitabilityScore, fmt: (v) => `${v.toFixed(1)}/10`, better: "higher" },
    { label: "Evidence", get: (p) => p.evidenceCoverage, fmt: (v) => `${v}%`, better: "higher" },
    { label: "Capacity", get: (p) => p.capacity.value, fmt: (v, p) => `${v} ${p.capacity.unit}`, better: "higher" },
    { label: "Energy", get: (p) => p.energy.annualKwh, fmt: (v) => `${v} kWh`, better: "lower" },
    { label: "Price", get: (p) => p.price, fmt: (_v, p) => <CurrencyDisplay usd={p.price} />, better: "lower" },
  ];
  return (
    <Panel id="comparison" title="Active comparison" description={items.length ? `${items.length} products side by side` : "Nothing queued yet"} icon={GitCompareArrows} action={items.length >= 2 ? <SeeAll href={routes.compare} label="Open" /> : undefined}>
      {items.length === 0 ? (
        <EmptyState compact icon={GitCompareArrows} title="Start a comparison" description="Tick “Compare” on up to four products to see real differences side by side." action={<Button asChild size="sm"><Link href={routes.products}>Find products</Link></Button>} />
      ) : (
        <>
          <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 sm:-mx-5 sm:px-5">
            <table className="w-full min-w-[440px] text-[13px]">
              <thead>
                <tr>
                  <th scope="col" className="w-[22%] pb-3 text-left text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">
                    <span className="sr-only">Attribute</span>
                  </th>
                  {items.map((p) => (
                    <th key={p.id} scope="col" className="pb-3 pr-2 text-left align-bottom font-normal">
                      <ImageWithFallback src={p.images[0]} alt="" aspect="mb-2 h-16 w-14 rounded-[10px] bg-surface-2" sizes="56px" className="p-1" />
                      <BrandLabel brandId={p.brandId} className="text-[10px]" />
                      <p className="line-clamp-1 font-semibold">{p.model}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const vals = items.map(r.get);
                  const best = r.better === "higher" ? Math.max(...vals) : Math.min(...vals);
                  return (
                    <tr key={r.label} className="border-t border-border">
                      <th scope="row" className="py-2.5 text-left font-normal text-muted-foreground">
                        {r.label}
                      </th>
                      {items.map((p, i) => (
                        <td key={p.id} className="py-2.5 pr-2">
                          <span className={cn("tabular inline-flex items-center gap-1 rounded-[7px] px-1.5 py-0.5 font-medium", items.length > 1 && vals[i] === best && "bg-success-soft text-success")}>
                            {items.length > 1 && vals[i] === best && <Check className="size-3" />}
                            {r.fmt(vals[i], p)}
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="brand" className={cn("h-11 sm:h-10", items.length < 2 && "pointer-events-none opacity-50")} aria-disabled={items.length < 2}>
              <Link href={routes.compare}>
                <GitCompareArrows /> Open full comparison
              </Link>
            </Button>
            {items.length >= 2 && (
              <Button asChild variant="outline" className="h-11 sm:h-10">
                <Link href={`${routes.ask}?product=${items[0].slug}&q=${encodeURIComponent(`Compare it with ${items[1].name}`)}`}>
                  <MessageSquareText /> Ask Qeivo to compare
                </Link>
              </Button>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}

/* --------------------------------------------------------- price alerts */

export function PriceAlerts() {
  const watch = useAppStore((s) => s.watchlist);
  return (
    <Panel id="alerts" title="Price alerts" description="Current price vs your target" icon={Bell} action={<SeeAll href={routes.priceIntelligence} />}>
      {watch.length === 0 ? (
        <EmptyState compact icon={Bell} title="No price alerts" description="Set a target price on any product and we'll show when it's reached." />
      ) : (
        <ul className="space-y-2">
          {watch.map((w) => {
            const p = getProduct(w.productId);
            if (!p) return null;
            const s = priceStats(p.id);
            const gap = s.current - w.targetPrice;
            const hit = gap <= 0;
            const history = priceHistory(p.id).slice(-16).map((x) => x.price);
            return (
              <li key={w.productId}>
                <Link href={routes.product(p.slug)} className="group flex items-center gap-3 rounded-[14px] border border-border bg-surface p-2.5 transition-colors hover:border-border-strong">
                  <ImageWithFallback src={p.images[0]} alt="" aspect="size-12 shrink-0 rounded-[10px] bg-surface-2" sizes="48px" className="p-1" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold leading-tight">{p.model}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[12px] text-muted-foreground">
                      <CurrencyDisplay usd={s.current} className="font-semibold text-foreground" />
                      <span>· target</span>
                      <CurrencyDisplay usd={w.targetPrice} />
                    </p>
                  </div>
                  <div className="hidden w-16 sm:block">
                    <Sparkline values={history} height={28} color={hit ? 2 : 0} />
                  </div>
                  <span className={cn("inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-semibold tabular", hit ? "bg-success-soft text-success" : "bg-surface-2 text-muted-foreground")}>
                    {hit ? <ArrowDownRight className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                    {hit ? "Target hit" : <CurrencyDisplay usd={gap} />}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-[12px] text-subtle-foreground">52-week low shown on each product page. Prices are demo observations.</p>
    </Panel>
  );
}

/* ------------------------------------------------------- maintenance */

export function MaintenanceReminders() {
  const tasks = ownedProducts
    .flatMap((o) => o.maintenance.filter((m) => m.status !== "done").map((m) => ({ ...m, product: getProduct(o.productId) })))
    .filter((t) => t.product)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);
  return (
    <Panel id="maintenance" title="Maintenance" description={`${ownedProducts.length} products you own`} icon={Wrench} action={<SeeAll href={routes.myProducts} />}>
      <ul className="space-y-1">
        {tasks.map((t) => {
          const overdue = t.status === "overdue";
          const due = t.status === "due";
          return (
            <li key={t.id} className="flex items-start gap-3 rounded-[12px] p-2 transition-colors hover:bg-surface-2/60">
              <span className={cn("mt-0.5 grid size-9 shrink-0 place-items-center rounded-[10px]", overdue ? "bg-danger-soft text-danger" : due ? "bg-warning-soft text-warning-foreground" : "bg-surface-2 text-muted-foreground")}>
                <CalendarClock className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium leading-snug">{t.task}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {t.product!.model} · <span className={cn("tabular", overdue && "font-medium text-danger-foreground")}>{overdue ? `Overdue since ${formatDate(t.dueDate, "d MMM")}` : `Due ${formatDate(t.dueDate, "d MMM")}`}</span>
                </p>
              </div>
              <Badge variant={overdue ? "danger" : due ? "warning" : "default"} className="mt-1 shrink-0 capitalize">
                {t.status}
              </Badge>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/* --------------------------------------------------- saved research */

export function SavedResearch() {
  const saved = useAppStore((s) => s.saved);
  const counts = researchFolders.map((f) => ({ f, ids: savedProducts.filter((s) => s.folderId === f.id).map((s) => s.productId) }));
  return (
    <Panel id="saved" title="Saved research" description={`${saved.length} saved products in ${researchFolders.length} folders`} icon={Bookmark} action={<SeeAll href={routes.saved} />}>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {counts.slice(0, 4).map(({ f, ids }) => (
          <li key={f.id}>
            <Link href={routes.saved} className="group flex items-center gap-3 rounded-[14px] border border-border bg-surface p-3 transition-colors hover:border-border-strong">
              <span className="flex -space-x-2">
                {asProducts(ids)
                  .slice(0, 3)
                  .map((p) => (
                    <ImageWithFallback key={p.id} src={p.images[0]} alt="" aspect="size-9 rounded-[9px] border-2 border-surface bg-surface-2" sizes="36px" className="p-0.5" shimmer={false} />
                  ))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold">{f.name}</span>
                <span className="block text-[12px] text-muted-foreground tabular">
                  {ids.length} {ids.length === 1 ? "product" : "products"}
                </span>
              </span>
              <ArrowRight className="size-4 text-subtle-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ---------------------------------------------------- activity timeline */

export function ActivityTimeline() {
  const events = useMemo(() => {
    const list: { at: string; icon: LucideIcon; tone: string; title: string; detail: string; href: string }[] = [
      ...conversations.map((c) => ({ at: c.updatedAt, icon: MessageSquareText, tone: "bg-brand-soft text-brand-soft-foreground", title: "Asked Qeivo", detail: c.title, href: `${routes.ask}?c=${c.id}` })),
      ...savedComparisons.map((c) => ({ at: c.createdAt, icon: GitCompareArrows, tone: "bg-info-soft text-info-foreground", title: "Saved a comparison", detail: c.name, href: routes.compare })),
      ...savedProducts.map((s) => ({ at: s.savedAt, icon: Bookmark, tone: "bg-lime-soft text-lime-soft-foreground", title: "Saved a product", detail: getProduct(s.productId)?.name ?? "", href: routes.saved })),
    ];
    return list.filter((e) => new Date(e.at).getTime() <= DEMO_NOW.getTime()).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);
  }, []);
  return (
    <Panel id="activity" title="Research activity" description="Your latest steps" icon={CalendarClock}>
      <ol className="relative space-y-4 pl-1">
        <span aria-hidden className="absolute bottom-2 left-[19px] top-2 w-px bg-border" />
        {events.map((e, i) => (
          <li key={`${e.title}-${i}`} className="relative">
            <Link href={e.href} className="group flex gap-3">
              <span className={cn("relative z-10 grid size-9 shrink-0 place-items-center rounded-full ring-4 ring-card", e.tone)}>
                <e.icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1 pt-0.5">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-[13px] font-semibold">{e.title}</span>
                  <span className="shrink-0 text-[11px] text-subtle-foreground tabular">{formatRelative(e.at)}</span>
                </span>
                <span className="line-clamp-1 text-[12.5px] text-muted-foreground group-hover:text-foreground">{e.detail}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* ------------------------------------------------------ quick ask card */

export function QuickAsk() {
  const recent = useAppStore((s) => s.recentlyViewed);
  const p = getProduct(recent[0] ?? "p-nordvik-frostline-fd600") ?? getProduct("p-nordvik-frostline-fd600")!;
  const prompts = ["Is it suitable for a family of five?", "How much electricity could it use?", "What do owners complain about?"];
  return (
    <section aria-labelledby="quick-ask-title" className="bg-navy-sheen relative flex h-full flex-col overflow-hidden rounded-[24px] p-5 text-white shadow-md sm:p-6">
      <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="relative flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-[10px] bg-teal-sheen shadow-sm">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 id="quick-ask-title" className="text-[15px] font-semibold text-white">
            Ask Qeivo
          </h2>
          <p className="truncate text-[12px] text-white/60">About the {p.model} you viewed last</p>
        </div>
      </div>
      <div className="relative mt-4 flex items-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.06] p-2.5">
        <ImageWithFallback src={p.images[0]} alt="" aspect="size-12 shrink-0 rounded-[10px] bg-white/90" sizes="48px" className="p-1" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold">{p.name}</p>
          <p className="text-[12px] text-white/60 tabular">
            {p.suitabilityScore.toFixed(1)}/10 suitability · {p.evidenceCoverage}% evidence
          </p>
        </div>
        <SaveButton productId={p.id} className="text-white/70 hover:bg-white/10 hover:text-white" />
      </div>
      <ul className="relative mt-3 space-y-1.5">
        {prompts.map((q) => (
          <li key={q}>
            <Link href={`${routes.ask}?product=${p.slug}&q=${encodeURIComponent(q)}`} className="group flex min-h-11 items-center justify-between gap-2 rounded-[12px] px-3 py-2 text-[13.5px] text-white/85 transition-colors hover:bg-white/[0.08] hover:text-white">
              {q}
              <ArrowUpRight className="size-4 shrink-0 text-teal-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
      <div className="relative mt-auto pt-4">
        <Button asChild variant="brand" className="h-11 w-full">
          <Link href={routes.askAbout(p.slug)}>
            <MessageSquareText /> Open Ask Qeivo
          </Link>
        </Button>
      </div>
    </section>
  );
}
