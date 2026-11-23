import type { Metadata } from "next";
import { Clapperboard, PlayCircle, ShieldCheck, Tag, Users } from "lucide-react";
import { creators } from "@/data/creators/creators";
import { videos } from "@/data/videos";
import { routes } from "@/config/routes";
import { compactNumber } from "@/lib/utils";
import { PageContainer, Breadcrumbs } from "@/components/layout/page";
import { SectionHeading } from "@/components/common/display";
import { Reveal } from "@/components/common/reveal";
import { Badge } from "@/components/ui/badge";
import { SponsoredDisclosure } from "@/components/analysis/warnings";
import { VIDEO_ORIGIN_META, VideoCard, VideoLibrary } from "@/components/video";

export const metadata: Metadata = {
  title: "Video library",
  description: "Independent reviews, manufacturer demos, installation, maintenance and DIY videos — classified by source and timestamp-cited.",
};

export default function VideosPage() {
  const byNewest = [...videos].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const featured = [...videos].filter((v) => v.kind === "independent" && !v.sponsored).sort((a, b) => b.views - a.views)[0] ?? byNewest[0];
  const trending = [...videos].filter((v) => v.id !== featured.id).sort((a, b) => b.views - a.views).slice(0, 5);
  const totalViews = videos.reduce((n, v) => n + v.views, 0);
  const independentShare = Math.round((videos.filter((v) => v.kind !== "manufacturer").length / videos.length) * 100);
  const activeCreators = creators.filter((c) => videos.some((v) => v.creatorId === c.id)).length;

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="bg-hero-glow pointer-events-none absolute inset-0" />
        <PageContainer className="relative pb-14 pt-8 sm:pt-12 lg:pb-20">
          <Breadcrumbs items={[{ label: "Home", href: routes.home }, { label: "Video library" }]} className="mb-6" />
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <Reveal className="max-w-2xl">
              <Badge variant="brand" className="mb-5 h-7 gap-1.5 px-3 text-[12px]">
                <Clapperboard /> {videos.length} videos · chapters &amp; transcripts
              </Badge>
              <h1 className="text-balance text-[38px] font-semibold leading-[1.05] tracking-tight sm:text-[52px]">See it tested, installed and fixed.</h1>
              <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">
                Every video is labelled by who made it and whether it was paid for. Jump straight to the chapter you need, or search the transcript for a single measurement.
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <dl className="flex gap-6 sm:gap-8">
                {[
                  { k: "Total views", v: compactNumber(totalViews) },
                  { k: "Not brand-made", v: `${independentShare}%` },
                  { k: "Creators", v: activeCreators },
                ].map((s) => (
                  <div key={s.k}>
                    <dd className="text-[26px] font-semibold leading-none tracking-tight tabular sm:text-[30px]">{s.v}</dd>
                    <dt className="mt-2 text-[12px] text-muted-foreground">{s.k}</dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:gap-8">
            <Reveal>
              <VideoCard video={featured} variant="feature" priority />
            </Reveal>
            <Reveal delay={0.06}>
              <div className="flex h-full flex-col rounded-[24px] border border-border bg-card p-3 shadow-xs sm:p-4">
                <h2 className="flex items-center gap-2 px-2 pb-2 pt-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">
                  <PlayCircle className="size-4" /> Most watched
                </h2>
                <div className="flex flex-1 flex-col justify-between gap-1">
                  {trending.map((v) => (
                    <VideoCard key={v.id} video={v} variant="list" />
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </PageContainer>
      </section>

      <section className="border-y border-border bg-surface py-14 lg:py-16">
        <PageContainer>
          <Reveal>
            <SectionHeading align="center" eyebrow="Source classification" title="You always know who made it" description="Videos inform our analysis, but their claims are classified by origin — and sponsorship is always disclosed." />
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(["independent", "manufacturer", "qeivo"] as const).map((k, i) => {
              const m = VIDEO_ORIGIN_META[k];
              return (
                <Reveal key={k} delay={i * 0.05}>
                  <div className="h-full rounded-[20px] border border-border bg-card p-5 shadow-xs">
                    <span className={`grid size-10 place-items-center rounded-[12px] border ${m.className}`}>
                      <m.icon className="size-5" />
                    </span>
                    <h3 className="mt-4 text-[15px] font-semibold">{m.label}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{m.description}</p>
                  </div>
                </Reveal>
              );
            })}
            <Reveal delay={0.15}>
              <div className="h-full rounded-[20px] border border-warning/30 bg-warning-soft/40 p-5">
                <span className="grid size-10 place-items-center rounded-[12px] border border-warning/30 bg-warning-soft text-warning-foreground">
                  <Tag className="size-5" />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold">Sponsored</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">Paid partnerships carry a label on every card and the creator&apos;s full disclosure on the video page. Sponsorship never moves a score.</p>
              </div>
            </Reveal>
          </div>
        </PageContainer>
      </section>

      <section className="py-16 lg:py-20">
        <PageContainer>
          <Reveal>
            <SectionHeading eyebrow="Browse" title="The full library" description="Filter by video type and category, search titles, creators and products, or hide sponsored videos entirely." className="mb-8" />
          </Reveal>
          <VideoLibrary videos={byNewest} />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <div className="flex gap-3 rounded-[16px] border border-border bg-surface p-5">
              <ShieldCheck className="size-6 shrink-0 text-brand" />
              <div>
                <h3 className="font-semibold">Timestamps become citations</h3>
                <p className="mt-1 text-[14px] text-muted-foreground">When a video informs a product analysis, the exact timestamp is cited — open it from any claim and land on that moment.</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-[16px] border border-border bg-surface p-5">
              <Users className="size-6 shrink-0 text-brand" />
              <div>
                <h3 className="font-semibold">Creators publish their own disclosures</h3>
                <p className="mt-1 text-[14px] text-muted-foreground">Each creator profile lists how review units are sourced and how the channel is funded.</p>
              </div>
            </div>
          </div>
          <SponsoredDisclosure className="mt-4" detail="Some videos in this library are paid partnerships between a brand and an independent creator. They are labelled on every card and never change suitability scores, AI verdicts, rankings or recommendations." />
        </PageContainer>
      </section>
    </>
  );
}
