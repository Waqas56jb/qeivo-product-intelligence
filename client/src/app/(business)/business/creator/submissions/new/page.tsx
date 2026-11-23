import { Suspense } from "react";
import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { LoadingSkeleton } from "@/components/common/states";
import { SubmissionForm } from "@/components/business/creator/submission-form";

export const metadata: Metadata = { title: "New submission · Creator" };

export default function NewSubmissionPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Creator workspace"
        title="New submission"
        description="Send a video, review, DIY guide or article for editorial review. Approved content is linked to the products it covers."
      />
      <Suspense fallback={<LoadingSkeleton variant="list" count={4} />}>
        <SubmissionForm />
      </Suspense>
    </PageContainer>
  );
}
