import type { Metadata } from "next";
import { ManufacturerDocumentsView } from "@/components/business/manufacturer/documents-view";

export const metadata: Metadata = { title: "Documents · Manufacturer" };

export default function Page() {
  return <ManufacturerDocumentsView />;
}
