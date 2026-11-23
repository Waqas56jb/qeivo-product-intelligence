# Qeivo client — architecture & conventions

Front-end only. No API routes, server actions, databases or auth. All data is local,
deterministic TypeScript seed data. Next.js 15 App Router · React 19 · TypeScript (strict) ·
Tailwind CSS v4 · Radix (shadcn pattern) · Framer Motion · Recharts · RHF + Zod · Zustand · date-fns · Sonner.

## Folder map

```
src/app/
  (marketing)/        /, /about, /how-it-works, /pricing             → MarketingShell
  (public-content)/   /guides, /guides/[slug], /categories/[slug], /videos, /videos/[slug] → MarketingShell
  (auth)/             /signup, /login, /forgot-password, /onboarding (own split layout)
  (customer)/app/     every /app/** route                             → AppShell (sidebar, topbar, mobile tabs)
  (business)/         /business/** and /developer/**                  → BusinessShell (role from path)
src/components/
  ui/         Radix primitives restyled (button, badge, card, input, textarea, primitives.tsx
              [Label, Separator, Checkbox, Switch, Slider, Progress, Avatar, UserAvatar, RadioGroup, RadioCard],
              dialog, sheet, menus.tsx [DropdownMenu*, Popover*, Select*], tabs.tsx [Tabs*, Accordion*, ToggleGroup*],
              table, skeleton, command, tooltip [Hint])
  common/     image-with-fallback, states (EmptyState, ErrorState, LoadingSkeleton),
              display (CurrencyDisplay, MoneyDisplay, DateDisplay, StatCard, SectionHeading, KeyValue),
              controls (ConfirmationDialog, ThemeToggle, RegionSelect, DemoDataNotice, SearchField, FilterBar, FilterChip),
              reveal (scroll fade-in)
  analysis/   THE TRUST SYSTEM — SuitabilityScore, ScorePill, EvidenceCoverage, ScoreBreakdown,
              ClaimTypeBadge, SourceTypeBadge, SourceCitation, SourceList, ConfidenceIndicator,
              DataWarningCard, WarningList, Missing/Conflicting/StaleDataWarning, SponsoredDisclosure, SponsoredTag,
              ClaimItem, StrengthsList, LimitationsList, ClaimLegend, AIInsightCard, AIAnalysisPanel,
              useSourceDrawer() → openSources(ids, focusId) opens the global source panel
  product/    ProductCard (grid|list|compact), ProductGrid, ProductList, ProductCarousel, ProductPrice,
              ProductRating, ProductStatusBadge, BrandLabel, keySpecs(), SaveButton, CompareToggle,
              CompareTray, useSaved(), useCompare()
  charts/     ChartCard, LineChart, AreaChart, BarChart (vertical/horizontal), DonutChart, Sparkline,
              ChartLegend, SERIES_COLORS, PriceHistoryChart, RatingDistribution, SentimentBar
  layout/     PageContainer, PageHeader, Breadcrumbs (auto), SectionNavigation, ResponsiveSheet,
              AppShell, BusinessShell, MarketingShell, NotificationCenter, useNotifications()
  navigation/ CommandSearchProvider/SearchTrigger (⌘K), RoleSwitcher
  tables/     DataTable<T> (sortable, paginated, responsive column hiding)
  brand/      Logo, LogoMark (swap artwork here)
src/lib/      utils (cn, hash, seeded, clamp, round, DEMO_NOW=2026-11-23), format (REGIONS, formatPrice,
              formatCurrency, formatDate, formatRelative…), scoring (personalScore, personaliseFactors,
              PRIORITY_LABELS, scoreBand, evidenceBand, missingInformation), catalog (filter/sort/search),
              compatibility (checkCompatibility, overallFit), recommend (recommend, idealCapacity),
              ownership (ownershipCost, defaultMaintenance)
src/store/app-store.ts   Zustand + persisted demo state (saved, compare, watchlist, votes, checklists,
              notifications read, chat usage, priorities, region, role, profile, preferences…)
              Always read persisted values through `useHydrated()` guard to avoid hydration mismatch.
src/config/   routes.ts (route builders — never hand-write paths), navigation.ts (all nav)
src/data/     seed data; import from "@/data/<area>/..." (see src/data/index.ts)
src/types/    domain model
```

## Non-negotiable product rules
1. **Suitability (0–10 ring) and evidence coverage (% segmented bar) are separate metrics.** Never combine,
   average or show one as the other.
2. Every AI/factual statement shows its claim type (`ClaimTypeBadge`) and clickable sources (`SourceCitation`
   → opens local source panel). No external source URLs.
3. Manufacturer claims are never styled as verified fact.
4. Sponsored content & affiliate links always carry `SponsoredTag` / `SponsoredDisclosure`, and never affect
   scores, verdicts, rankings or recommendations.
5. Unknown ≠ compatible. Missing data is shown as unknown/missing.
6. Deterministic only: no `Math.random`, no `Date.now()` for content. "Today" is `DEMO_NOW` (23 Nov 2026).
7. Honest simulations: no claim that an email was sent, payment taken or file uploaded for real —
   say "demo" / "preview" in success toasts where relevant.

## Design conventions
- Tokens live in `src/app/globals.css` (`bg-surface`, `bg-surface-2`, `text-muted-foreground`,
  `text-subtle-foreground`, `bg-brand`, `bg-brand-soft`, `text-brand-soft-foreground`, `bg-success-soft`,
  `bg-warning-soft`, `bg-danger-soft`, `bg-info-soft`, `bg-navy-sheen`, `bg-teal-sheen`, claim colours…).
  Never hardcode hex colours in components (charts use `SERIES_COLORS`).
- Radius: controls 8px, inputs 10px, cards 14px (`rounded-[14px]`), large cards 20px, hero 24px.
- Type: page title via `PageHeader`; section titles 18–20px semibold; body 14–15px; micro labels 11–12px
  uppercase tracking-wider. Use `tabular` class for prices, scores, stats.
- Cards: `rounded-[14px] border border-border bg-card shadow-xs` (or `<Card>`). Avoid borders-around-everything.
- Pages: wrap in `<PageContainer>` + `<PageHeader>`; vertical rhythm `space-y-6`/`gap-6`.
- Mobile first: touch targets ≥ 44px, sticky primary actions, `ResponsiveSheet` for filters/forms,
  horizontal scrollers for carousels, no horizontal page overflow at 360px.
- Every button does something: navigate, mutate store, open dialog/sheet, or show an honest toast.
- Loading/empty/error: `LoadingSkeleton`, `EmptyState`, `ErrorState`.
- Server components for static structure; `"use client"` only for interactive parts. Pages under dynamic
  segments use `generateStaticParams` where practical and `notFound()` for unknown slugs.
- Next 15: dynamic route `params` is a Promise — `({ params }: { params: Promise<{ slug: string }> })` then
  `const { slug } = await params;` in server components (or `use(params)` in client components).
  `useSearchParams()` must be inside a `<Suspense>` boundary.
