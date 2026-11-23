import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { DataHistory } from "@/components/documents";

export const metadata: Metadata = { title: "Data history" };

export default function DataHistoryPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Data provenance"
        title="Data history"
        description="What changed in the catalogue, when, who changed it and which source it came from — including stale records and sources that disagree."
      />
      <DataHistory />
    </PageContainer>
  );
}
