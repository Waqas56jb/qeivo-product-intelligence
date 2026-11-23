import type { Company } from "@/types";
import { brands } from "../products";

const DESCRIPTIONS: Record<string, string> = {
  "b-nordvik": "Swedish maker of quiet, efficient refrigeration and laundry appliances. Publishes full lab data packs for every model and runs a verified product-data programme on Qeivo.",
  "b-aurelle": "French design house producing statement refrigerators in heritage colourways, sold mainly through specialist kitchen studios.",
  "b-kestrel": "US value brand covering refrigerators, laundry and televisions, known for wide retail availability and straightforward feature sets.",
  "b-halden": "German engineering group whose refrigerators and washers lead independent efficiency and noise testing.",
  "b-solenne": "Turin-based luxury cooling brand focused on four-door and retro-styled refrigerators.",
  "b-maru": "Korean smart-home manufacturer spanning connected refrigerators, AI laundry and QLED televisions.",
  "b-brightwater": "British family-appliance brand built around large-capacity, easy-to-service products.",
  "b-corvane": "Professional-style kitchen refrigeration for serious home cooks, with long compressor warranties.",
  "b-ovea": "Dutch efficiency-first appliance start-up with class-leading energy ratings and three-year standard warranties.",
  "b-lumora": "Japanese display specialist producing OLED televisions for home cinema enthusiasts.",
  "b-vireo": "Taiwanese electronics group making Mini-LED televisions and business and creator laptops.",
  "b-arclight": "US performance laptop brand targeting gamers and 3D creators.",
  "b-tervo": "Finnish laptop maker designing light, repairable machines with upgradeable components.",
};

const PLAN: Record<string, string> = { "b-nordvik": "Manufacturer Pro", "b-halden": "Manufacturer Pro", "b-maru": "Manufacturer Pro", "b-ovea": "Manufacturer Growth", "b-brightwater": "Manufacturer Growth", "b-vireo": "Manufacturer Growth" };

/** One company record per brand. The demo manufacturer is `co-nordvik`. */
export const manufacturers: Company[] = brands.map((b) => ({
  id: `co-${b.slug}`,
  name: b.id === "b-nordvik" ? "Nordvik Appliances AB" : b.id === "b-halden" ? "Halden Hausgeräte GmbH" : `${b.name} ${b.categories.includes("laptops") && b.categories.length === 1 ? "Computing" : "Appliances"}`,
  kind: "manufacturer",
  logo: b.mark,
  brandIds: [b.id],
  regions: b.id === "b-aurelle" || b.id === "b-solenne" ? ["UK", "EU", "US"] : ["US", "UK", "EU", "AU", "CA"],
  website: `https://${b.slug}.example`,
  plan: PLAN[b.id] ?? "Manufacturer Basic",
  verified: b.id in PLAN,
  description: DESCRIPTIONS[b.id] ?? b.tagline,
}));

export const DEMO_MANUFACTURER_ID = "co-nordvik";

export const currentManufacturer: Company = manufacturers.find((c) => c.id === DEMO_MANUFACTURER_ID) as Company;
