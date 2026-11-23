import type { Company } from "@/types";
import { manufacturers } from "./manufacturers";

/** Retail suppliers that manage their own offers on Qeivo. Demo supplier is `co-larder`. */
export const suppliers: Company[] = [
  {
    id: "co-larder",
    name: "Larder & Co",
    kind: "supplier",
    logo: "L&",
    regions: ["US", "CA", "UK"],
    website: "https://larderandco.example",
    plan: "Supplier Pro",
    verified: true,
    description: "Independent kitchen-appliance specialist with 38 showrooms and a white-glove delivery and installation service.",
  },
  {
    id: "co-brightcart",
    name: "BrightCart",
    kind: "supplier",
    logo: "BC",
    regions: ["US", "UK", "EU", "AU", "CA"],
    website: "https://brightcart.example",
    plan: "Supplier Growth",
    verified: true,
    description: "Online-first electronics and appliance retailer known for fast delivery and price-match guarantees.",
  },
  {
    id: "co-voltmart",
    name: "Voltmart",
    kind: "supplier",
    logo: "VM",
    regions: ["US", "AU"],
    website: "https://voltmart.example",
    plan: "Supplier Basic",
    verified: false,
    description: "Big-box consumer electronics chain with a growing major-appliance range and in-store collection.",
  },
];

export const DEMO_SUPPLIER_ID = "co-larder";
export const currentSupplier: Company = suppliers[0];

export const companies: Company[] = [...manufacturers, ...suppliers];
export const companyById = new Map(companies.map((c) => [c.id, c]));

export function getCompany(id: string): Company | undefined {
  return companyById.get(id);
}
