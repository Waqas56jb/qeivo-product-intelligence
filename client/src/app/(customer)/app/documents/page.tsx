import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { DocumentWorkspace } from "@/components/documents";

export const metadata: Metadata = { title: "Documents" };

export default function DocumentsPage() {
  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow="Document intelligence"
        title="Manuals & technical documents"
        description="Every value Qeivo reads from a manual or spec sheet keeps its page reference and an extraction confidence. Uncertain values and contradictions are flagged, never hidden."
      />
      <DocumentWorkspace />
    </PageContainer>
  );
}
