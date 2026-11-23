import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquareText } from "lucide-react";
import { getProduct } from "@/data/products";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { PageContainer, SectionNavigation } from "@/components/layout/page";
import { ProductSubpageHeader } from "@/components/product-detail/product-subpage-header";
import { productStaticParams } from "@/components/product-detail/spec-utils";
import { buildAnalysis } from "@/components/product-detail/analysis-claims";
import { AIAnalysisPanel, AIInsightCard, ClaimLegend, LimitationsList, StrengthsList } from "@/components/analysis/claims";
import { SourceList } from "@/components/analysis/badges";
import { WarningList } from "@/components/analysis/warnings";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/tabs";

export function generateStaticParams() {
  return productStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return { title: p ? `${p.model} AI analysis` : "AI analysis" };
}

const SECTIONS = [
  { id: "summary", label: "Executive summary" },
  { id: "strengths", label: "Key strengths" },
  { id: "limitations", label: "Limitations" },
  { id: "who", label: "Who should buy" },
  { id: "avoid", label: "Who should avoid" },
  { id: "performance", label: "Performance" },
  { id: "value", label: "Value" },
  { id: "energy", label: "Energy" },
  { id: "reliability", label: "Reliability" },
  { id: "concerns", label: "Common concerns" },
  { id: "faqs", label: "FAQs" },
];

export default async function AnalysisPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product || product.slug !== slug) notFound();
  const a = buildAnalysis(product);

  return (
    <PageContainer>
      <ProductSubpageHeader
        product={product}
        eyebrow="AI analysis"
        title={`In-depth analysis: ${product.model}`}
        description="A synthesis of manuals, specification sheets, lab measurements, expert reviews and owner feedback. Every statement is classified and linked to its sources."
        actions={
          <Button asChild variant="brand" size="sm">
            <Link href={routes.askAbout(product.slug)}>
              <MessageSquareText /> Ask a follow-up
            </Link>
          </Button>
        }
      />
      <div className="mb-5 rounded-[14px] border border-border bg-surface-2/50 p-3.5">
        <ClaimLegend />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
        <SectionNavigation sections={SECTIONS} className="sticky top-14 z-20 -mx-4 bg-background/90 px-4 py-2 backdrop-blur lg:top-24 lg:mx-0 lg:self-start lg:bg-transparent lg:p-0" />
        <div className="min-w-0 space-y-5">
          <div id="summary" className="scroll-mt-28">
            <AIInsightCard title="Executive summary" claims={product.aiSummary} />
          </div>
          {product.warnings.length > 0 && <WarningList warnings={product.warnings} />}
          <AIAnalysisPanel id="strengths" title="Key strengths" tone="positive">
            <StrengthsList claims={product.strengths} />
          </AIAnalysisPanel>
          <AIAnalysisPanel id="limitations" title="Limitations" tone="caution">
            <LimitationsList claims={product.limitations} />
          </AIAnalysisPanel>
          <div className="grid gap-5 md:grid-cols-2">
            <AIAnalysisPanel id="who" title="Who should buy it" tone="positive" claims={a.who} />
            <AIAnalysisPanel id="avoid" title="Who should avoid it" tone="caution" claims={a.avoid.length ? a.avoid : []}>
              {!a.avoid.length && <p className="text-sm text-muted-foreground">No specific household types are poorly served by this model.</p>}
            </AIAnalysisPanel>
          </div>
          <AIAnalysisPanel id="performance" title="Performance observations" description="Lab results and expert assessment" claims={a.performance} />
          <AIAnalysisPanel id="value" title="Value assessment" description="Price position and price history" claims={a.valueClaims} />
          <AIAnalysisPanel id="energy" title="Energy analysis" description="Declared versus measured consumption" claims={a.energyClaims} />
          <AIAnalysisPanel id="reliability" title="Reliability discussion" description="Brand fault data, warranty and confidence" claims={a.reliability} />
          <AIAnalysisPanel id="concerns" title="Common concerns" tone="caution" claims={a.concerns} />
          <AIAnalysisPanel id="faqs" title="Frequently asked questions">
            <Accordion type="single" collapsible>
              {product.faqs.map((q, i) => (
                <AccordionItem key={i} value={`f${i}`}>
                  <AccordionTrigger>{q.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-[14px] leading-relaxed text-foreground">{q.answer}</p>
                    <SourceList ids={q.sourceIds} className="mt-3" />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AIAnalysisPanel>
          <section className="rounded-[20px] border border-border bg-card p-5 shadow-xs sm:p-6">
            <h2 className="text-[18px] font-semibold">All sources ({product.sourceIds.length})</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">Tap a source to read the exact passage. Sponsored content is never used as evidence.</p>
            <SourceList ids={product.sourceIds} className="mt-4" />
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
