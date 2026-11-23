import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { LoadingSkeleton } from "@/components/common/states";
import { OwnershipGuides } from "@/components/ownership/ownership-guides";

export const metadata: Metadata = { title: "DIY & ownership guides" };

export default function OwnershipGuidesPage() {
  return (
    <PageContainer size="wide">
      <PageHeader title="DIY & ownership guides" description="Installation, setup, cleaning, maintenance and troubleshooting — with tools, parts, safety notes and checklists you can tick off." />
      <Suspense fallback={<LoadingSkeleton count={6} />}>
        <OwnershipGuides />
      </Suspense>
    </PageContainer>
  );
}
