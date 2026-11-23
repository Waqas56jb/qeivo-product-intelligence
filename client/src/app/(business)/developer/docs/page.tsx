import type { Metadata } from "next";
import { ApiDocs } from "@/components/developer/api-docs";

export const metadata: Metadata = { title: "API documentation · Qeivo Developer", description: "Reference for the Qeivo API preview: products, comparisons, analysis, errors and rate limits." };

export default function ApiDocsPage() {
  return <ApiDocs />;
}
