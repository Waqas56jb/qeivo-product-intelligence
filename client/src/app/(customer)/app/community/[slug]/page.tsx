import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuestion, questions } from "@/data/community";
import { routes } from "@/config/routes";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { QuestionDetail } from "@/components/community";
import { getCategory } from "@/data/products";

export function generateStaticParams() {
  return questions.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const q = getQuestion(slug);
  return { title: q ? q.title : "Question not found" };
}

export default async function QuestionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const q = getQuestion(slug);
  if (!q) notFound();
  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow={`Community · ${getCategory(q.category).name}`}
        title={<span className="text-balance">{q.title}</span>}
        crumbs={[
          { label: "Home", href: routes.app },
          { label: "Community", href: routes.community },
          { label: q.title.length > 48 ? `${q.title.slice(0, 46)}…` : q.title },
        ]}
      />
      <QuestionDetail question={q} />
    </PageContainer>
  );
}
