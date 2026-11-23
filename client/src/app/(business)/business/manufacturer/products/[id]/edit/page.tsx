import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/data/products";
import { nordvikProducts } from "@/components/business/manufacturer/shared";
import { ProductForm } from "@/components/business/manufacturer/product-form";

export function generateStaticParams() {
  return nordvikProducts.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Edit ${getProduct(id)?.model ?? "product"} · Manufacturer` };
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product || product.brandId !== "b-nordvik") notFound();
  return <ProductForm product={product} />;
}
