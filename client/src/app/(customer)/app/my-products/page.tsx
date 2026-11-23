import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page";
import { MyProductsView } from "@/components/owned";

export const metadata: Metadata = { title: "My products", description: "Warranty, receipts, maintenance and service history for the products you own." };

export default function MyProductsPage() {
  return (
    <PageContainer size="wide">
      <MyProductsView />
    </PageContainer>
  );
}
