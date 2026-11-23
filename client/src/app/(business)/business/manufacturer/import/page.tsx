import type { Metadata } from "next";
import { ImportWizard } from "@/components/business/manufacturer/import-wizard";

export const metadata: Metadata = { title: "Bulk import · Manufacturer" };

export default function Page() {
  return <ImportWizard />;
}
