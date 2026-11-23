import Link from "next/link";
import type { Metadata } from "next";
import { FilePlus2 } from "lucide-react";
import { submissionsForCreator } from "@/data/creators/submissions";
import { CREATOR_ID } from "@/data/analytics/creator";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { ScoreIntegrityNotice } from "@/components/business/primitives";
import { SubmissionsBrowser } from "@/components/business/creator/submissions-browser";

export const metadata: Metadata = { title: "Submissions · Creator" };

export default function CreatorSubmissionsPage() {
  const mine = submissionsForCreator(CREATOR_ID);
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Creator workspace"
        title="Submissions"
        description="Videos, reviews, DIY guides and articles you have sent to Qeivo. Every piece passes editorial review for sources and disclosures before it is linked to product pages."
        actions={
          <Button asChild variant="brand">
            <Link href={routes.cSubmissionNew}>
              <FilePlus2 /> New submission
            </Link>
          </Button>
        }
      />
      <div className="space-y-6">
        <SubmissionsBrowser initial={mine} />
        <ScoreIntegrityNotice role="Creators" variant="inline">
          Approved content is shown alongside products as independent or sponsored evidence. It never changes Qeivo suitability scores, evidence coverage, rankings or verdicts — and sponsored content is always labelled.
        </ScoreIntegrityNotice>
      </div>
    </PageContainer>
  );
}
