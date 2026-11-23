import type { Metadata } from "next";
import { ManufacturerProductsView } from "@/components/business/manufacturer/products-view";

export const metadata: Metadata = { title: "Products · Manufacturer" };

export default function Page() {
  return <ManufacturerProductsView />;
}
