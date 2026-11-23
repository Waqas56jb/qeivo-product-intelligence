"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ScanLine, SlidersHorizontal } from "lucide-react";
import { currentUser } from "@/data/users/customers";
import { ownedProducts } from "@/data/research/owned-products";
import { priceStats } from "@/data/offers/price-history";
import { routes } from "@/config/routes";
import { formatDate } from "@/lib/format";
import { DEMO_NOW } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { PageContainer } from "@/components/layout/page";
import { HeroSearch } from "@/components/marketing/hero-search";
import { ActiveComparison, ActivityTimeline, MaintenanceReminders, PriceAlerts, QuickAsk, RecentlyViewed, RecommendedForYou, SavedResearch, StatsRow } from "./dashboard-sections";

function Welcome() {
  const hydrated = useHydrated();
  const name = useAppStore((s) => s.profile.name);
  const watch = useAppStore((s) => s.watchlist);
  const compare = useAppStore((s) => s.compare);
  const first = (hydrated ? name : currentUser.name).split(" ")[0];
  const hits = watch.filter((w) => priceStats(w.productId).current <= w.targetPrice).length;
  const overdue = ownedProducts.flatMap((o) => o.maintenance).filter((m) => m.status === "overdue").length;
  const parts = [
    compare.length ? `${compare.length} products waiting in your comparison` : null,
    `${watch.length} price ${watch.length === 1 ? "alert" : "alerts"}${hits ? ` (${hits} at target)` : ""}`,
    overdue ? `${overdue} overdue maintenance ${overdue === 1 ? "task" : "tasks"}` : null,
  ].filter(Boolean);
  return (
    <section aria-labelledby="welcome-title" className="relative z-20 min-w-0 rounded-[24px] border border-border bg-card p-5 shadow-sm sm:p-7 lg:p-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
        <div className="bg-hero-glow absolute inset-0" />
        <div className="surface-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(70%_80%_at_80%_0%,black,transparent)]" />
      </div>
      <div className="relative">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-soft-foreground">{formatDate(DEMO_NOW.toISOString(), "EEEE, d MMMM")}</p>
        <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mt-2 text-[28px] font-semibold leading-tight tracking-tight sm:text-[36px]">
          Welcome back, {first}
        </motion.h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">You have {parts.join(", ").replace(/, ([^,]*)$/, " and $1")}.</p>
        <HeroSearch size="md" className="mt-6 max-w-2xl" />
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={routes.recommendations} className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface/80 px-4 text-[13px] font-medium shadow-xs backdrop-blur transition-colors hover:border-border-strong sm:h-9">
            <SlidersHorizontal className="size-4 text-brand" /> Get recommendations
          </Link>
          <Link href={routes.scan} className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface/80 px-4 text-[13px] font-medium shadow-xs backdrop-blur transition-colors hover:border-border-strong sm:h-9">
            <ScanLine className="size-4 text-brand" /> Scan a barcode
          </Link>
        </div>
      </div>
    </section>
  );
}

export function CustomerDashboard() {
  return (
    <PageContainer size="wide" className="space-y-5 sm:space-y-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <Welcome />
        <QuickAsk />
      </div>
      <StatsRow />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-5">
          <RecentlyViewed />
          <RecommendedForYou />
          <ActiveComparison />
        </div>
        <div className="min-w-0 space-y-5">
          <PriceAlerts />
          <MaintenanceReminders />
          <SavedResearch />
          <ActivityTimeline />
        </div>
      </div>
    </PageContainer>
  );
}
