import type { Brand } from "@/types";

/** All brands are invented for the demo. */
export const brands: Brand[] = [
  { id: "b-nordvik", name: "Nordvik", slug: "nordvik", origin: "Sweden", founded: 1961, tagline: "Quiet engineering for everyday living", categories: ["refrigerators", "washing-machines"], mark: "N", color: "#2E5A7A", reliabilityIndex: 8.7 },
  { id: "b-aurelle", name: "Aurelle", slug: "aurelle", origin: "France", founded: 1978, tagline: "Design-led kitchens", categories: ["refrigerators"], mark: "A", color: "#8C6A4F", reliabilityIndex: 7.6 },
  { id: "b-kestrel", name: "Kestrel", slug: "kestrel", origin: "United States", founded: 1989, tagline: "Honest appliances, fair prices", categories: ["refrigerators", "televisions", "washing-machines"], mark: "K", color: "#B5482F", reliabilityIndex: 7.2 },
  { id: "b-halden", name: "Halden", slug: "halden", origin: "Germany", founded: 1952, tagline: "Built to be measured", categories: ["refrigerators", "washing-machines"], mark: "H", color: "#3B4652", reliabilityIndex: 9.0 },
  { id: "b-solenne", name: "Solenne", slug: "solenne", origin: "Italy", founded: 1970, tagline: "Luxury cooling, crafted in Turin", categories: ["refrigerators"], mark: "S", color: "#7A5C8E", reliabilityIndex: 7.9 },
  { id: "b-maru", name: "Maru", slug: "maru", origin: "South Korea", founded: 1994, tagline: "Smart home, simply", categories: ["refrigerators", "washing-machines", "televisions"], mark: "M", color: "#1F7A8C", reliabilityIndex: 8.1 },
  { id: "b-brightwater", name: "Brightwater", slug: "brightwater", origin: "United Kingdom", founded: 1983, tagline: "Made for busy households", categories: ["refrigerators", "washing-machines"], mark: "B", color: "#2F7D5B", reliabilityIndex: 7.8 },
  { id: "b-corvane", name: "Corvane", slug: "corvane", origin: "United States", founded: 2004, tagline: "Professional-grade at home", categories: ["refrigerators"], mark: "C", color: "#4A4F57", reliabilityIndex: 8.3 },
  { id: "b-ovea", name: "Ovea", slug: "ovea", origin: "Netherlands", founded: 2011, tagline: "Efficiency first", categories: ["refrigerators", "washing-machines"], mark: "O", color: "#5E8C3A", reliabilityIndex: 8.0 },
  { id: "b-lumora", name: "Lumora", slug: "lumora", origin: "Japan", founded: 1972, tagline: "Picture perfected", categories: ["televisions"], mark: "L", color: "#5A3E9E", reliabilityIndex: 8.6 },
  { id: "b-vireo", name: "Vireo", slug: "vireo", origin: "Taiwan", founded: 1999, tagline: "Engineered for focus", categories: ["televisions", "laptops"], mark: "V", color: "#1D6FB8", reliabilityIndex: 8.2 },
  { id: "b-arclight", name: "Arclight", slug: "arclight", origin: "United States", founded: 2008, tagline: "Performance without compromise", categories: ["laptops"], mark: "Ar", color: "#C0392B", reliabilityIndex: 7.7 },
  { id: "b-tervo", name: "Tervo", slug: "tervo", origin: "Finland", founded: 2015, tagline: "Light, long-lasting, repairable", categories: ["laptops"], mark: "T", color: "#2C8C7C", reliabilityIndex: 8.4 },
];

export const brandById = new Map(brands.map((b) => [b.id, b]));

export function getBrand(id: string): Brand {
  const b = brandById.get(id);
  if (!b) throw new Error(`Unknown brand ${id}`);
  return b;
}
