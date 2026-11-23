import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page";
import { ScanExperience } from "@/components/mobile/scan-experience";

export const metadata: Metadata = {
  title: "Scan",
  description: "Look up any analysed product by its EAN-13 barcode and jump straight to its evidence.",
};

export default function ScanPage() {
  return (
    <PageContainer size="wide">
      <ScanExperience />
    </PageContainer>
  );
}
