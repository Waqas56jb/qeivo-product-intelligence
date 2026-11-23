import type { Metadata } from "next";
import { ProductsView } from "@/components/business/supplier/products-view";

export const metadata: Metadata = { title: "Products · Supplier" };

export default function SupplierProductsPage() {
  return <ProductsView />;
}
