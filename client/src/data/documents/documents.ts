import type { DocumentExtraction, Product, ProductDocument } from "@/types";
import { requireProduct } from "../products";
import { specValue } from "../conversations/conversations";

type Ex = DocumentExtraction;
const ok = (field: string, value: string, page: number, confidence: number): Ex => ({ field, value, page, confidence, status: "confirmed" });
const unsure = (field: string, value: string, page: number, confidence: number, note: string): Ex => ({ field, value, page, confidence, status: "uncertain", note });
const clash = (field: string, value: string, page: number, confidence: number, note: string): Ex => ({ field, value, page, confidence, status: "contradiction", note });

const dims = (p: Product) => `${p.dimensions.widthMm} × ${p.dimensions.heightMm} × ${p.dimensions.depthMm} mm`;
const vent = (p: Product) => {
  const v = p.installation.ventilationMm;
  return v ? `${v.sides} mm sides / ${v.top} mm top / ${v.back} mm rear` : "Not stated";
};

const fd600 = requireProduct("p-nordvik-frostline-fd600");
const fd540 = requireProduct("p-nordvik-frostline-fd540-cd");
const bf380 = requireProduct("p-nordvik-ellipse-bf380");
const c400 = requireProduct("p-nordvik-column-c400");
const sw8 = requireProduct("p-nordvik-silkwash-w8");
const bf400 = requireProduct("p-halden-precision-bf400");
const sbs650 = requireProduct("p-kestrel-homebase-sbs650");
const fd620 = requireProduct("p-maru-smartview-fd620");
const pc9 = requireProduct("p-halden-pureclean-w9");
const oled65 = requireProduct("p-lumora-vivid-oled65");
const air14 = requireProduct("p-tervo-air-14");
const r330 = requireProduct("p-solenne-portofino-r330");

export const documents: ProductDocument[] = [
  {
    id: "doc-001",
    productId: fd600.id,
    title: `${fd600.name} — Owner's manual (EN, rev. C)`,
    kind: "manual",
    pages: 64,
    sizeKb: 8420,
    uploadedAt: "2026-09-14T10:22:00Z",
    uploadedBy: "Elin Sandberg (Nordvik)",
    language: "English",
    status: "processed",
    extractions: [
      ok("Model number", fd600.modelNumber, 2, 0.99),
      ok("Gross capacity", `${fd600.capacity.value} L`, 6, 0.97),
      ok("Dimensions (W × H × D)", dims(fd600), 8, 0.96),
      ok("Ventilation clearance", vent(fd600), 14, 0.91),
      ok("Water supply", "1/4\" (6.35 mm) line, 1.4–8.3 bar", 18, 0.93),
      unsure("Ice production", "Up to 1.8 kg per 24 h", 31, 0.64, "Figure appears in a footnote referencing an ambient temperature of 21 °C; the spec sheet does not list ice output."),
      ok("Water filter interval", "6 months or 1,800 L", 42, 0.95),
      clash("Noise level", "38 dB(A)", 9, 0.88, `Manual states 38 dB(A); the current spec sheet and product record list ${specValue(fd600, "noise")} dB(A). Rev. C may predate the compressor change.`),
    ],
    previewPages: [
      { page: 6, heading: "Product overview", lines: [`Your ${fd600.model} offers a total gross volume of ${fd600.capacity.value} litres.`, "1. Fresh-food compartment with LED lighting", "2. Humidity-controlled crisper drawers (2)", "3. Through-door water and ice dispenser", "4. Freezer drawer with sliding ice bin", "Keep this manual with the appliance for future reference."] },
      { page: 14, heading: "Installation — positioning", lines: ["Install the appliance on a firm, level floor able to bear the loaded weight.", `Leave the following gaps for air circulation: ${vent(fd600)}.`, "Do not install next to an oven, dishwasher or in direct sunlight.", "Allow 2 hours before switching on if the appliance has been transported on its side."] },
      { page: 42, heading: "Care — replacing the water filter", lines: ["The filter indicator turns amber after 5 months and red after 6 months.", "1. Turn the filter cartridge a quarter turn anticlockwise and pull it out.", "2. Remove the protective cap from the new cartridge and insert it fully.", "3. Turn clockwise until it locks. Dispense 10 L of water to flush the system.", "4. Hold FILTER RESET for 3 seconds."] },
    ],
  },
  {
    id: "doc-002",
    productId: fd540.id,
    title: `${fd540.modelNumber} technical specification sheet`,
    kind: "spec-sheet",
    pages: 4,
    sizeKb: 612,
    uploadedAt: "2026-10-02T08:45:00Z",
    uploadedBy: "Aisha Karimi (Nordvik)",
    language: "English",
    status: "processed",
    extractions: [
      ok("Model number", fd540.modelNumber, 1, 0.99),
      ok("Gross capacity", `${fd540.capacity.value} L`, 1, 0.98),
      ok("Dimensions (W × H × D)", dims(fd540), 1, 0.98),
      ok("Energy class", fd540.energy.rating, 2, 0.97),
      ok("Rated consumption", `${fd540.energy.annualKwh} kWh/yr`, 2, 0.97),
      ok("Noise level", `${specValue(fd540, "noise")} dB(A)`, 2, 0.95),
      ok("Compressor warranty", fd540.warranty.extended ?? "Not stated", 3, 0.92),
      unsure("Depth with handles", `${fd540.dimensions.depthMm + 58} mm`, 1, 0.71, "Value read from a dimension drawing; label partially obscured in the scan."),
    ],
    previewPages: [
      { page: 1, heading: "Key specifications", lines: [`Model: ${fd540.modelNumber}`, `Type: Counter-depth French door`, `Total volume: ${fd540.capacity.value} L`, `Dimensions: ${dims(fd540)} (excluding handles)`, `Net weight: ${fd540.dimensions.weightKg} kg`] },
      { page: 2, heading: "Energy & acoustics", lines: [`Energy class: ${fd540.energy.rating}`, `Annual consumption: ${fd540.energy.annualKwh} kWh`, `Airborne acoustical noise: ${specValue(fd540, "noise")} dB(A) re 1 pW`, "Climate class: SN-T (10–43 °C ambient)"] },
      { page: 3, heading: "Warranty", lines: [`${fd540.warranty.years}-year parts and labour.`, `${fd540.warranty.extended ?? ""} — registration required within 90 days.`, "Cosmetic damage must be reported within 7 days of delivery."] },
    ],
  },
  {
    id: "doc-003",
    productId: bf380.id,
    title: `${bf380.name} — Installation guide`,
    kind: "installation",
    pages: 16,
    sizeKb: 2310,
    uploadedAt: "2026-08-19T13:05:00Z",
    uploadedBy: "Lars Holmberg (Nordvik)",
    language: "English",
    status: "processed",
    extractions: [
      ok("Dimensions (W × H × D)", dims(bf380), 3, 0.97),
      ok("Ventilation clearance", vent(bf380), 4, 0.9),
      ok("Door reversal", "Supported — kit included", 9, 0.94),
      ok("Door swing clearance", `${bf380.installation.doorSwingMm ?? "—"} mm`, 5, 0.86),
      unsure("Floor load", "Minimum 120 kg/m²", 3, 0.58, "Unit is unclear in the source (kg vs kg/m²)."),
      ok("Electrical supply", "220–240 V, 50 Hz, 10 A fused", 6, 0.95),
      clash("Height", "2000 mm", 3, 0.83, `Installation guide drawing shows 2000 mm; spec sheet and product record list ${bf380.dimensions.heightMm} mm. Likely excludes adjustable feet.`),
    ],
    previewPages: [
      { page: 3, heading: "Space requirements", lines: [`Appliance dimensions: ${dims(bf380)}.`, "Allow an additional 10 mm in height for levelling feet adjustment.", "Ensure the floor is level within 2 mm across the width."] },
      { page: 9, heading: "Reversing the doors", lines: ["Tools required: Torx T25, 8 mm socket, flat screwdriver.", "1. Remove the top hinge cover and unscrew the upper hinge.", "2. Lift the fridge door off the middle hinge and set it aside on a soft surface.", "3. Transfer the hinge pins to the opposite side using the included kit.", "4. Refit in reverse order and check the seal closes evenly."] },
      { page: 12, heading: "First start", lines: ["Wait 2 hours after positioning before connecting to power.", "Set fridge to 4 °C and freezer to −18 °C.", "Allow 6 hours before loading food."] },
    ],
  },
  {
    id: "doc-004",
    productId: c400.id,
    title: `${c400.modelNumber} — Integrated column installation (draft)`,
    kind: "installation",
    pages: 12,
    sizeKb: 1890,
    uploadedAt: "2026-11-21T15:40:00Z",
    uploadedBy: "Lars Holmberg (Nordvik)",
    language: "English",
    status: "needs-review",
    extractions: [
      ok("Model number", c400.modelNumber, 1, 0.98),
      ok("Gross capacity", `${c400.capacity.value} L`, 2, 0.95),
      ok("Dimensions (W × H × D)", dims(c400), 2, 0.93),
      unsure("Niche dimensions", "560–570 × 1945–1955 × 560 mm", 4, 0.62, "Draft document; niche dimensions differ between text and diagram."),
      unsure("Ventilation clearance", "Plinth grille ≥ 200 cm²", 5, 0.55, "Expressed as an area rather than gaps; cannot be mapped to the compatibility checker automatically."),
      ok("Door hinge", "Fixed, right-hand", 7, 0.88),
      clash("Energy class", "B", 2, 0.9, `Draft lists class B; the registered energy label record says class ${c400.energy.rating}. Confirm with Nordvik before publishing.`),
    ],
    previewPages: [
      { page: 2, heading: "Product data", lines: [`Model ${c400.modelNumber} · ${c400.capacity.value} L all-fridge column`, `Appliance dimensions ${dims(c400)}`, "Energy class B (draft — subject to registration)"] },
      { page: 4, heading: "Preparing the niche", lines: ["The cabinet must be fixed to the wall before installing the appliance.", "Check niche dimensions at the top, middle and bottom.", "Side walls must be at least 16 mm thick."] },
      { page: 7, heading: "Fitting the furniture door", lines: ["Maximum furniture door weight: 22 kg.", "Fit the door brackets using the template supplied.", "Adjust the gap to 3 mm on each side."] },
    ],
  },
  {
    id: "doc-005",
    productId: sw8.id,
    title: `${sw8.name} — Warranty terms`,
    kind: "warranty",
    pages: 6,
    sizeKb: 420,
    uploadedAt: "2026-07-30T09:12:00Z",
    uploadedBy: "Johan Ekström (Nordvik)",
    language: "English",
    status: "processed",
    extractions: [
      ok("Standard warranty", `${sw8.warranty.years} years parts and labour`, 1, 0.97),
      ok("Motor warranty", sw8.warranty.extended ?? "Not stated", 1, 0.93),
      ok("Registration window", "90 days from delivery", 2, 0.95),
      ok("Exclusions", "Commercial use, improper installation, limescale damage", 3, 0.9),
      unsure("Transferability", "Transferable with proof of purchase", 4, 0.6, "Clause references regional terms that vary; applies to EU only?"),
      ok("Claims contact", "Nordvik Customer Care, in-app or by phone", 5, 0.94),
    ],
    previewPages: [
      { page: 1, heading: "What is covered", lines: [`Your ${sw8.model} is covered for ${sw8.warranty.years} years against defects in materials and workmanship.`, `The inverter motor carries an additional ${sw8.warranty.extended ?? "extended"} warranty.`, "Repairs are carried out by authorised Nordvik engineers."] },
      { page: 3, heading: "What is not covered", lines: ["Damage caused by use of non-recommended detergents or excessive dosing.", "Consumables such as door seals, filters and hoses after the first 12 months.", "Use in commercial premises, laundrettes or shared housing laundries."] },
      { page: 5, heading: "Making a claim", lines: ["Have your model number and serial number ready.", "Describe the fault and any error code shown on the display.", "Most visits are scheduled within 3 working days."] },
    ],
  },
  {
    id: "doc-006",
    productId: bf400.id,
    title: `${bf400.name} — Bedienungsanleitung / Owner's manual`,
    kind: "manual",
    pages: 48,
    sizeKb: 5120,
    uploadedAt: "2026-09-02T07:30:00Z",
    uploadedBy: "Katrin Vogel (Halden)",
    language: "German / English",
    status: "processed",
    extractions: [
      ok("Model number", bf400.modelNumber, 1, 0.99),
      ok("Gross capacity", `${bf400.capacity.value} L`, 5, 0.97),
      ok("Dimensions (W × H × D)", dims(bf400), 7, 0.97),
      ok("Ventilation clearance", vent(bf400), 11, 0.92),
      ok("Fast freeze", "Auto-off after 52 h", 22, 0.9),
      ok("Holiday mode", "Fridge held at 15 °C, freezer unaffected", 24, 0.88),
      unsure("Storage time in power failure", "Up to 26 h", 28, 0.66, "German text says 26 h, English translation says 24 h."),
      ok("Noise level", `${specValue(bf400, "noise")} dB(A)`, 6, 0.95),
    ],
    previewPages: [
      { page: 7, heading: "Technical data", lines: [`Dimensions: ${dims(bf400)}`, `Total volume: ${bf400.capacity.value} L`, `Energy class: ${bf400.energy.rating}`, `Noise: ${specValue(bf400, "noise")} dB(A)`] },
      { page: 22, heading: "Fast freeze", lines: ["Press SUPER FROST 24 hours before loading large amounts of fresh food.", "The function switches off automatically after 52 hours.", "Do not load more than 12 kg of fresh food in 24 hours."] },
      { page: 28, heading: "Power failure", lines: ["Keep the doors closed. Frozen food remains safe for up to 26 hours.", "Do not refreeze food that has completely thawed."] },
    ],
  },
  {
    id: "doc-007",
    productId: sbs650.id,
    title: `${sbs650.modelNumber} energy label registration`,
    kind: "certification",
    pages: 2,
    sizeKb: 188,
    uploadedAt: "2026-06-11T16:20:00Z",
    uploadedBy: "Qeivo data team",
    language: "English",
    status: "processed",
    extractions: [
      ok("Model number", sbs650.modelNumber, 1, 0.99),
      ok("Energy class", sbs650.energy.rating, 1, 0.98),
      ok("Declared consumption", `${sbs650.energy.annualKwh} kWh/yr`, 1, 0.98),
      ok("Fresh-food volume", `${sbs650.capacity.value - Number(specValue(sbs650, "freezer"))} L`, 1, 0.94),
      ok("Freezer volume", `${specValue(sbs650, "freezer")} L`, 1, 0.94),
      clash("Noise class", "C (41 dB)", 1, 0.89, `Label shows 41 dB(A); spec sheet and product record list ${specValue(sbs650, "noise")} dB(A).`),
      ok("Registration date", "2024-03-18", 2, 0.97),
    ],
    previewPages: [
      { page: 1, heading: "Label record", lines: [`Supplier: Kestrel · Model ${sbs650.modelNumber}`, `Energy class ${sbs650.energy.rating} · ${sbs650.energy.annualKwh} kWh/annum`, `Airborne noise 41 dB(A), class C`, "Climate class: SN-T"] },
      { page: 2, heading: "Registration", lines: ["Product registered 18 March 2024.", "Test laboratory accreditation verified.", "Record status: active."] },
      { page: 2, heading: "Verification notes", lines: ["No market-surveillance actions recorded for this model.", "Next scheduled review: Q2 2027."] },
    ],
  },
  {
    id: "doc-008",
    productId: fd620.id,
    title: `${fd620.name} — Smart features & app guide`,
    kind: "manual",
    pages: 28,
    sizeKb: 3640,
    uploadedAt: "2026-10-28T11:00:00Z",
    uploadedBy: "Min-jun Park (Maru)",
    language: "English",
    status: "processing",
    extractions: [
      ok("Model number", fd620.modelNumber, 1, 0.98),
      ok("Wi-Fi", "2.4 GHz 802.11 b/g/n only", 4, 0.94),
      ok("Convertible zone modes", "Chill −1 °C / Soft freeze −5 °C / Freeze −18 °C", 12, 0.9),
      unsure("Energy saving claim", "Up to 15% with Smart Saving", 16, 0.52, "Marketing claim; no test conditions given. Not independently verified."),
      ok("Door alarm", "Sounds after 60 s, app alert after 2 min", 18, 0.91),
      unsure("App data retention", "Usage history kept 12 months", 24, 0.61, "Stated in a privacy box that cites a separate policy document."),
    ],
    previewPages: [
      { page: 4, heading: "Connecting to Wi-Fi", lines: ["Your refrigerator supports 2.4 GHz networks only.", "1. Open the Maru Home app and tap Add device.", "2. Hold the WI-FI button on the control panel for 3 seconds.", "3. Follow the on-screen pairing steps.", "If you change router or password, repeat this procedure."] },
      { page: 12, heading: "Convertible zone", lines: ["Select CHILL for meat and fish (−1 °C).", "Select SOFT FREEZE for ice cream that scoops easily (−5 °C).", "Select FREEZE for extra freezer space (−18 °C)."] },
      { page: 16, heading: "Smart Saving", lines: ["Smart Saving learns your usage pattern and reduces cooling at quiet times.", "Savings of up to 15% are possible depending on use."] },
    ],
  },
  {
    id: "doc-009",
    productId: pc9.id,
    title: `${pc9.name} — Installation & first use`,
    kind: "installation",
    pages: 20,
    sizeKb: 2780,
    uploadedAt: "2026-08-05T09:40:00Z",
    uploadedBy: "Katrin Vogel (Halden)",
    language: "English",
    status: "processed",
    extractions: [
      ok("Dimensions (W × H × D)", dims(pc9), 2, 0.97),
      ok("Transit bolts", "4 bolts, 13 mm spanner", 4, 0.96),
      ok("Water pressure", "0.1–1.0 MPa", 6, 0.93),
      ok("Drain height", "60–100 cm", 7, 0.94),
      ok("Max spin", `${specValue(pc9, "rpm")} rpm`, 2, 0.97),
      unsure("Stacking kit", "Compatible with HD-SK60", 9, 0.67, "Kit compatibility table lists dryer models only; washer row unreadable."),
      clash("Capacity", "8 kg", 2, 0.86, `Page 2 table states 8 kg; product record and spec sheet list ${pc9.capacity.value} kg. Possibly copied from the W8 sibling model.`),
    ],
    previewPages: [
      { page: 4, heading: "Removing transit bolts", lines: ["Remove all four transit bolts before first use.", "Insert the cover caps supplied into the holes.", "Keep the bolts for future transport."] },
      { page: 7, heading: "Drain connection", lines: ["The end of the drain hose must be between 60 and 100 cm above the floor.", "Do not extend the drain hose beyond 4 m."] },
      { page: 12, heading: "Auto-dosing", lines: ["Fill tank A with liquid detergent (up to 1.3 L, approx. 20 washes).", "Fill tank B with fabric softener or a second detergent.", "Do not use powder or pods in the auto-dosing tanks."] },
    ],
  },
  {
    id: "doc-010",
    productId: oled65.id,
    title: `${oled65.name} — Quick start & safety`,
    kind: "manual",
    pages: 24,
    sizeKb: 3020,
    uploadedAt: "2026-07-14T12:30:00Z",
    uploadedBy: "Qeivo data team",
    language: "English",
    status: "processed",
    extractions: [
      ok("Screen size", `${oled65.capacity.value} in`, 1, 0.99),
      ok("Dimensions without stand", `${oled65.dimensions.widthMm} × ${oled65.dimensions.heightMm} × ${oled65.dimensions.depthMm} mm`, 3, 0.96),
      ok("VESA pattern", "300 × 300", 5, 0.95),
      ok("HDMI 2.1 ports", "HDMI 3 and 4", 8, 0.92),
      unsure("Typical power", "118 W", 20, 0.69, "Value differs between the safety page and the energy-label annex."),
      ok("Panel warranty", `${oled65.warranty.years} years`, 22, 0.9),
    ],
    previewPages: [
      { page: 5, heading: "Wall mounting", lines: ["Use a VESA 300 × 300 wall bracket rated for at least 40 kg.", "Use M6 screws, 10–15 mm in length.", "Two people are required to lift the TV."] },
      { page: 8, heading: "Connections", lines: ["HDMI 3 and HDMI 4 support 4K 120 Hz and VRR.", "HDMI 2 supports eARC for soundbars."] },
      { page: 20, heading: "Power", lines: ["Typical power consumption: 118 W (SDR).", "Standby: below 0.5 W."] },
    ],
  },
  {
    id: "doc-011",
    productId: air14.id,
    title: `${air14.name} — Service & repair manual`,
    kind: "manual",
    pages: 36,
    sizeKb: 6900,
    uploadedAt: "2026-05-22T08:00:00Z",
    uploadedBy: "Qeivo data team",
    language: "English",
    status: "processed",
    extractions: [
      ok("Memory", `${specValue(air14, "ram")} GB, 1 × SO-DIMM slot free`, 4, 0.93),
      ok("Storage", "M.2 2280 NVMe, 1 slot", 4, 0.95),
      ok("Battery capacity", `${specValue(air14, "wh")} Wh`, 6, 0.94),
      ok("Bottom panel screws", "8 × Torx T5, captive", 9, 0.96),
      unsure("Battery replacement time", "≈ 10 minutes", 14, 0.7, "Estimated time is presented as a guideline only."),
      ok("Warranty", `${air14.warranty.years} years`, 34, 0.95),
      clash("Weight", "1.29 kg", 2, 0.84, `Service manual lists 1.29 kg; product record lists ${air14.dimensions.weightKg} kg. Manual may refer to the touchscreen variant.`),
    ],
    previewPages: [
      { page: 9, heading: "Removing the bottom cover", lines: ["Power off and disconnect the charger.", "Loosen the eight captive T5 screws.", "Lift the cover from the hinge edge using a plastic pick."] },
      { page: 12, heading: "Memory upgrade", lines: ["One SO-DIMM slot is free for expansion.", "Supported: DDR5-5600 up to 32 GB per module.", "Insert at 30° and press down until the clips engage."] },
      { page: 14, heading: "Battery replacement", lines: ["Disconnect the battery connector first.", "Remove four Phillips #0 screws.", "Replacement part: TV-BAT-A14."] },
    ],
  },
  {
    id: "doc-012",
    productId: r330.id,
    title: `${r330.name} — Owner's manual (2023 edition)`,
    kind: "manual",
    pages: 40,
    sizeKb: 4480,
    uploadedAt: "2025-10-08T14:10:00Z",
    uploadedBy: "Qeivo data team",
    language: "English / Italian",
    status: "needs-review",
    extractions: [
      ok("Model number", r330.modelNumber, 1, 0.98),
      ok("Gross capacity", `${r330.capacity.value} L`, 4, 0.95),
      ok("Dimensions (W × H × D)", dims(r330), 5, 0.94),
      unsure("Defrost", "Automatic (fridge) / manual (freezer)", 18, 0.63, "Contradicts the product record, which lists frost-free operation; check whether newer production changed this."),
      ok("Door reversal", "Supported", 11, 0.9),
      clash("Energy consumption", `${r330.energy.annualKwh + 22} kWh/yr`, 5, 0.85, `2023 manual lists ${r330.energy.annualKwh + 22} kWh/yr; the energy label record lists ${r330.energy.annualKwh} kWh/yr.`),
    ],
    previewPages: [
      { page: 5, heading: "Technical data", lines: [`Model ${r330.modelNumber}`, `Dimensions ${dims(r330)}`, `Energy consumption ${r330.energy.annualKwh + 22} kWh/annum`] },
      { page: 11, heading: "Reversing the door", lines: ["The chrome handles must be moved to the opposite side.", "Request the reversal kit from Solenne service if not supplied."] },
      { page: 18, heading: "Defrosting", lines: ["The fridge compartment defrosts automatically.", "Defrost the freezer when the ice layer exceeds 4 mm."] },
    ],
  },
];

export const documentById = new Map(documents.map((d) => [d.id, d]));

export function getDocument(id: string): ProductDocument | undefined {
  return documentById.get(id);
}

export function documentsForProduct(productId: string): ProductDocument[] {
  return documents.filter((d) => d.productId === productId);
}
