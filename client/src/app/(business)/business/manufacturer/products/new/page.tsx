import type { Metadata } from "next";
import { ProductForm } from "@/components/business/manufacturer/product-form";

export const metadata: Metadata = { title: "Add product · Manufacturer" };

export default function NewProductPage() {
  return <ProductForm />;
}
