import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleHelp } from "lucide-react";
import { getProduct } from "@/data/products";
import { missingInformation } from "@/lib/scoring";
import { PageContainer } from "@/components/layout/page";
import { ProductSubpageHeader } from "@/components/product-detail/product-subpage-header";
import { productStaticParams } from "@/components/product-detail/spec-utils";
import { ScoreExplorer } from "@/components/product-detail/score-explorer";
import { WarningList } from "@/components/analysis/warnings";

export function generateStaticParams() {
  return productStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return { title: p ? `${p.model} suitability score` : "Suitability score" };
}

export default async function ScorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product || product.slug !== slug) notFound();
  const missing = missingInformation(product);
  const uncertain = product.scoreFactors.filter((f) => f.confidence !== "high");

  return (
    <PageContainer>
      <ProductSubpageHeader product={product} eyebrow="Suitability score" title="How this score is built" description="Eight evidence-based factors, weighted by what matters to you. Every factor has its own explanation and confidence level." />
      <ScoreExplorer product={product} />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[20px] border border-border bg-card p-5 shadow-xs sm:p-6">
          <h2 className="text-[18px] font-semibold">Missing information</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">These gaps lower evidence coverage. They are never filled with assumptions.</p>
          {missing.length ? (
            <ul className="mt-4 space-y-2.5">
              {missing.map((m) => (
                <li key={m} className="flex gap-2.5 rounded-[12px] bg-surface-2/70 p-3 text-[14px]">
                  <CircleHelp className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> {m}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-[12px] bg-success-soft/60 p-3 text-[14px] text-success">No significant gaps — all scored data points have supporting evidence.</p>
          )}
        </section>
        <section className="rounded-[20px] border border-border bg-card p-5 shadow-xs sm:p-6">
          <h2 className="text-[18px] font-semibold">Confidence & uncertainty</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">Factors where the evidence is thinner, and what that means for the score.</p>
          <ul className="mt-4 space-y-3">
            {uncertain.length ? (
              uncertain.map((f) => (
                <li key={f.key} className="text-[14px]">
                  <span className="font-medium">{f.label}</span> <span className="text-muted-foreground">— {f.confidence} confidence. The score could move by up to ±{f.confidence === "low" ? "1.0" : "0.5"} as more owner and lab data arrives.</span>
                </li>
              ))
            ) : (
              <li className="text-[14px] text-muted-foreground">All factors are supported with high confidence.</li>
            )}
          </ul>
          {product.warnings.length > 0 && <WarningList warnings={product.warnings} compact className="mt-5" />}
        </section>
      </div>
    </PageContainer>
  );
}
