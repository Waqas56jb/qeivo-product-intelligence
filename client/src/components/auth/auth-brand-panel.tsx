"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileText, MinusCircle, Quote, ShieldCheck } from "lucide-react";
import { products, requireProduct } from "@/data/products";
import { avatarAt, images } from "@/data/images";
import { Logo } from "@/components/brand/logo";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { ClaimTypeBadge } from "@/components/analysis/badges";
import { EvidenceCoverage, SuitabilityScore } from "@/components/analysis/score";
import { BrandLabel, ProductPrice } from "@/components/product/product-bits";
import { UserAvatar } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const TESTIMONIALS = [
  {
    quote: "The compatibility check caught that our hallway was 12 mm too narrow for the fridge we'd picked. It showed exactly which measurement mattered.",
    name: "Hannah Okoro",
    role: "Family of six · Atlanta",
    avatar: avatarAt(12),
  },
  {
    quote: "It tells you when it doesn't know. Missing ventilation data is flagged as missing — not quietly treated as fine.",
    name: "Marcus Feld",
    role: "Kitchen designer · Hamburg",
    avatar: avatarAt(7),
  },
  {
    quote: "Measured energy use versus the label figure changed which washer we bought. Over ten years it's real money.",
    name: "Mei Chen",
    role: "Renovating · Melbourne",
    avatar: avatarAt(10),
  },
];

/** Left brand panel of the auth split layout. Uses real seed data for the preview card. */
export function AuthBrandPanel() {
  const p = requireProduct("p-ovea-eco-fd520");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % TESTIMONIALS.length), 7000);
    return () => window.clearInterval(t);
  }, [paused]);

  const t = TESTIMONIALS[index];

  return (
    <div className="bg-navy-sheen relative flex h-full min-h-dvh flex-col overflow-hidden text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.22]">
        <ImageWithFallback src={images.kitchens[3]} alt="" aspect="size-full" sizes="45vw" shimmer={false} priority />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-950/85 to-navy-950" />
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-teal-500/20 blur-[120px]" />

      <div className="relative z-10 flex flex-1 flex-col px-10 py-10 xl:px-14 xl:py-12">
        <Logo inverted />

        <div className="mt-14 max-w-md xl:mt-16">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-teal-400">Product intelligence</p>
          <h2 className="mt-3 text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] xl:text-[46px]">
            Know Before
            <br />
            You <span className="text-teal-400">Buy.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/70">
            Source-cited analysis, personal suitability scores and honest evidence coverage across {products.length} analysed products.
          </p>
        </div>

        {/* Product-intelligence preview */}
        <motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          aria-label={`Example analysis of ${p.name}`}
          className="mt-10 max-w-[440px] rounded-[20px] border border-white/10 bg-card p-4 text-card-foreground shadow-lg"
        >
          <div className="flex gap-4">
            <div className="w-[84px] shrink-0 overflow-hidden rounded-[14px] bg-gradient-to-b from-surface-2 to-surface-3/60">
              <ImageWithFallback src={p.images[0]} alt={p.name} aspect="aspect-[3/4]" sizes="84px" className="p-2" />
            </div>
            <div className="min-w-0 flex-1">
              <BrandLabel brandId={p.brandId} withMark />
              <h3 className="mt-1 truncate text-[15px] font-semibold leading-tight">{p.model}</h3>
              <p className="text-[12px] text-muted-foreground">
                {p.capacity.value} {p.capacity.unit} · {p.type}
              </p>
              <ProductPrice product={p} size="sm" className="mt-1" showSaving={false} />
            </div>
            <SuitabilityScore score={p.suitabilityScore} size="sm" label={false} className="self-start" />
          </div>
          <EvidenceCoverage coverage={p.evidenceCoverage} className="mt-3.5" />
          <div className="mt-3.5 space-y-2">
            {p.strengths.slice(0, 1).map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                <p className="flex-1 text-[12.5px] leading-snug">{c.text}</p>
                <ClaimTypeBadge type={c.type} size="xs" showLabel={false} />
              </div>
            ))}
            {p.limitations.slice(0, 1).map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <MinusCircle className="mt-0.5 size-4 shrink-0 text-warning" />
                <p className="flex-1 text-[12.5px] leading-snug">{c.text}</p>
                <ClaimTypeBadge type={c.type} size="xs" showLabel={false} />
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 border-t border-border pt-2.5 text-[11.5px] text-muted-foreground">
            <FileText className="size-3.5" /> <strong className="tabular text-foreground">{p.sourceIds.length}</strong> sources analysed · suitability and evidence shown separately
          </p>
        </motion.article>

        <div className="mt-auto pt-10">
          <figure
            className="max-w-md"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <Quote className="size-5 text-teal-400" aria-hidden />
            <div className="relative mt-3 min-h-[96px]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease }}>
                  <blockquote className="text-[15px] leading-relaxed text-white/90">“{t.quote}”</blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    <UserAvatar src={t.avatar} name={t.name} className="size-9 ring-white/20" />
                    <span>
                      <span className="block text-[13px] font-semibold">{t.name}</span>
                      <span className="block text-[12px] text-white/60">{t.role}</span>
                    </span>
                  </figcaption>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-5 flex items-center gap-1" role="group" aria-label="Choose testimonial">
              {TESTIMONIALS.map((item, i) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show testimonial ${i + 1} of ${TESTIMONIALS.length}`}
                  aria-current={i === index ? "true" : undefined}
                  className="grid h-6 place-items-center px-1 outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded"
                >
                  <span className={cn("block h-1.5 rounded-full transition-all duration-300", i === index ? "w-6 bg-teal-400" : "w-1.5 bg-white/30")} />
                </button>
              ))}
            </div>
          </figure>
          <p className="mt-8 flex items-center gap-2 text-[12px] text-white/50">
            <ShieldCheck className="size-3.5" /> Scores are never for sale. Testimonials are illustrative demo content.
          </p>
        </div>
      </div>
    </div>
  );
}
