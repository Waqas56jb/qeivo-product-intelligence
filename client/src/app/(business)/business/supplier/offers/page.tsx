import type { Metadata } from "next";
import { OffersView } from "@/components/business/supplier/offers-view";

export const metadata: Metadata = { title: "Offers · Supplier" };

export default function SupplierOffersPage() {
  return <OffersView />;
}
