import type { SourceReference, SourceType } from "@/types";
import { productSources } from "@/data/products";

const x = (
  slug: string,
  type: SourceType,
  title: string,
  publisher: string,
  locator: string,
  excerpt: string,
  publishedAt: string,
  reliability: number,
): SourceReference => ({
  id: `src-${slug}`,
  type,
  title,
  publisher,
  locator,
  excerpt,
  publishedAt,
  retrievedAt: "2026-10-14",
  productIds: [],
  reliability,
});

/** Non-product sources cited by buying guides and Ask Qeivo answers. All publishers are invented. */
export const extraSources: SourceReference[] = [
  x("energy-label-methodology", "certification", "Household refrigerating appliances — energy label calculation method", "International Appliance Standards Council", "Annex B, Table 3", "Annual consumption is declared from a 24-hour test at 32 °C ambient (16 °C for the low-ambient cycle) with doors closed, then annualised. Door openings and food loads are not simulated.", "2024-03-18", 0.97),
  x("energy-label-rescale", "certification", "Guidance note: interpreting rescaled A–G energy classes", "International Appliance Standards Council", "Section 2.1", "Following the rescale, very few products reach class A at launch. A class C refrigerator today typically uses less energy than one labelled A+ under the previous scheme.", "2024-09-02", 0.95),
  x("cold-chain-food-safety", "independent-review", "Domestic refrigeration and food safety temperatures", "Food Safety Research Institute", "Chapter 4", "Fresh food compartments should be held between 3 °C and 5 °C. Each 1 °C excursion above 5 °C measurably shortens the safe life of dairy and cooked meats.", "2023-11-06", 0.93),
  x("fridge-noise-study", "lab-test", "Perceived loudness of domestic refrigerators in open-plan homes", "Acoustic Living Lab", "Results, Fig. 6", "Listeners rated compressor start-up transients as more annoying than steady-state noise. Models below 36 dB(A) were rarely noticed during conversation; above 40 dB(A) most participants noticed the start-up click.", "2025-02-11", 0.9),
  x("ice-maker-reliability", "independent-review", "Ten-year appliance service call analysis: ice makers and dispensers", "Home Repair Data Consortium", "Table 7", "Ice makers and water dispensers accounted for 31% of refrigerator service calls in the first five years of ownership, more than compressors and sealed systems combined.", "2025-06-20", 0.91),
  x("kitchen-planning-clearances", "manual", "Kitchen planning handbook — appliance clearances", "Institute of Kitchen Designers", "Section 5.4", "Allow a minimum 25 mm above tall appliances and plan door swing against adjacent walls. French door models generally need a 90° opening to remove crisper drawers.", "2024-05-14", 0.89),
  x("doorway-delivery-survey", "independent-review", "Why appliance deliveries fail: a survey of 4,200 installations", "Home Delivery Research Group", "Key findings", "Eleven percent of large-appliance deliveries required a second visit. The most common reasons were doorway width, stair turns and missing water shut-off valves.", "2025-08-28", 0.84),
  x("water-filter-study", "lab-test", "Refrigerator water filter performance over rated life", "Clean Water Testing Collective", "Summary", "Most filters met their chlorine-reduction claims until roughly 80% of rated capacity. Beyond six months flow rate dropped by up to 40%, slowing ice production.", "2025-04-09", 0.88),
  x("appliance-reliability-survey-2026", "independent-review", "Appliance reliability survey 2026", "Owners' Reliability Panel", "Refrigerators, p. 12", "Bottom-freezer and top-freezer designs reported the fewest faults over five years. Models with through-door dispensers were 1.6× more likely to need a repair.", "2026-04-22", 0.9),
  x("smart-appliance-security", "independent-review", "Connected appliances: update policies and privacy", "Digital Home Watch", "Findings, para 3", "Only four of eleven appliance makers published a minimum security-update period. Remote diagnostics were the most-used smart feature; recipe and shopping-list features saw little sustained use.", "2025-10-15", 0.85),
  x("washer-test-method", "certification", "Household washing machines — performance and energy test method", "International Appliance Standards Council", "Clause 8", "The eco 40–60 programme is used for the energy label. Water and energy use are measured at full, half and quarter load and weighted.", "2024-01-30", 0.96),
  x("laundry-water-study", "lab-test", "Real-world water use of front- and top-loading washers", "Laundry Science Forum", "Table 2", "Front loaders used between 40 and 55 litres per full cycle in our tests; agitator top loaders used 85 to 110 litres for similar loads.", "2025-03-12", 0.89),
  x("washer-dryer-drying", "lab-test", "Washer-dryers: drying capacity and time", "Laundry Science Forum", "Results", "Drying capacity is typically 55–65% of washing capacity. Wash-and-dry cycles at full drying load averaged 5 h 40 min.", "2025-07-03", 0.88),
  x("display-measurement-method", "lab-test", "Display measurement methodology v4", "Panel Measurement Group", "Section 3 — HDR brightness", "Peak brightness is measured on a 10% window after 30 seconds. Full-screen sustained brightness is reported separately because automatic brightness limiting differs widely.", "2025-01-21", 0.94),
  x("viewing-distance-guidance", "independent-review", "Viewing distance and screen size recommendations", "Home Cinema Society", "Table 1", "For 4K content, a viewing angle of 30–40° is comfortable. For a 2.5 m seating distance that corresponds to a 65 to 77-inch screen.", "2024-06-17", 0.86),
  x("oled-burn-in-study", "lab-test", "Long-term image retention testing of self-emissive panels", "Panel Measurement Group", "24-month update", "After 20 hours a day of mixed news and sports content, recent OLED panels showed no visible retention in normal viewing at 18 months; static-logo stress tests produced faint retention at 14 months.", "2026-02-09", 0.9),
  x("gaming-latency-method", "lab-test", "Input latency and VRR test procedure", "Panel Measurement Group", "Section 5", "Input lag is measured at 60 Hz and 120 Hz in game mode with a photodiode. Results under 10 ms are imperceptible to most players.", "2025-05-27", 0.92),
  x("battery-test-method", "lab-test", "Laptop battery rundown methodology", "Bench & Battery", "Method notes", "Web-browsing loop at 150 nits with Wi-Fi active; tabs rotate every 30 seconds. Manufacturer claims are typically based on local video playback at lower brightness.", "2025-02-03", 0.93),
  x("ram-workload-study", "lab-test", "How much memory do everyday workloads use?", "Bench & Battery", "Fig. 3", "A browser with 30 tabs, a video call and an office suite peaked at 11.2 GB. Photo editing with large RAW files peaked at 19 GB; 4K video timelines exceeded 26 GB.", "2025-09-18", 0.9),
  x("laptop-repairability-index", "independent-review", "Laptop repairability index 2026", "Right to Repair Observatory", "Scoring table", "Scores consider fastener types, part availability, documentation and soldered components. Soldered memory is the most common reason for low scores.", "2026-03-05", 0.88),
  x("electrical-installation-code", "manual", "Domestic electrical installation guidance — fixed appliances", "National Electrical Safety Board", "Clause 4.2", "Large appliances should be connected to a dedicated, grounded outlet. Extension leads and multi-way adaptors are not recommended for refrigerators or washing machines.", "2023-08-01", 0.96),
  x("plumbing-connection-code", "manual", "Water supply connections for domestic appliances", "National Plumbing Standards Board", "Section 7", "Appliance supply lines must be fitted with an accessible isolation valve and a non-return valve. Braided stainless hoses are recommended over plastic tubing.", "2024-02-26", 0.95),
  x("refrigerant-safety", "certification", "Hydrocarbon refrigerants in household appliances", "International Appliance Standards Council", "Informative annex", "Modern domestic refrigerators use small charges of isobutane (R600a). The charge is sealed and does not require servicing; ventilate the room if the refrigerant circuit is damaged.", "2024-07-11", 0.94),
];

export const sources: SourceReference[] = [...productSources, ...extraSources];

export const sourceById = new Map(sources.map((s) => [s.id, s]));

export function getSource(id: string): SourceReference | undefined {
  return sourceById.get(id);
}

export function sourcesForProduct(productId: string): SourceReference[] {
  return sources.filter((s) => s.productIds.includes(productId));
}
