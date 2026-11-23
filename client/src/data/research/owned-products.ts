import type { OwnedProduct } from "@/types";
import { requireProduct } from "../products";

function addYears(iso: string, years: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y + years}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

type Base = Omit<OwnedProduct, "warrantyExpires">;

/** Warranty expiry is always purchase date + the product's standard warranty years. */
function own(o: Base): OwnedProduct {
  const p = requireProduct(o.productId);
  return { ...o, warrantyExpires: addYears(o.purchaseDate, p.warranty.years) };
}

export const ownedProducts: OwnedProduct[] = [
  own({
    id: "own-1",
    productId: "p-brightwater-studio-tf310",
    purchaseDate: "2023-06-18",
    purchasePrice: 579,
    retailer: "HomeHub Outlet",
    serialNumber: "BW310-23F-0418872",
    receiptId: "HHO-7741920",
    extendedWarranty: "HomeHub Care+ until 2027-06-18",
    maintenance: [
      { id: "m-1a", task: "Vacuum the condenser coils at the back", dueDate: "2026-11-15", intervalMonths: 6, status: "overdue" },
      { id: "m-1b", task: "Clean door gaskets with warm soapy water", dueDate: "2026-12-01", intervalMonths: 3, status: "due" },
      { id: "m-1c", task: "Check fridge is holding 3–4 °C with a thermometer", dueDate: "2027-01-10", intervalMonths: 3, status: "upcoming" },
      { id: "m-1d", task: "Clear the defrost drain hole", dueDate: "2026-08-20", intervalMonths: 12, status: "done" },
    ],
    serviceHistory: [
      { date: "2025-02-11", type: "Repair", provider: "Brightwater Service", notes: "Replaced the cracked lower door shelf under warranty.", cost: 0 },
      { date: "2026-03-04", type: "Repair", provider: "Cascade Appliance Repair", notes: "Thermostat sensor replaced after the fridge started freezing lettuce. Covered by HomeHub Care+.", cost: 0 },
    ],
  }),
  own({
    id: "own-2",
    productId: "p-kestrel-view-qled65",
    purchaseDate: "2025-11-28",
    purchasePrice: 599,
    retailer: "Voltmart",
    serialNumber: "KSVQ65-25K-9930015",
    receiptId: "VM-2025-118842",
    maintenance: [
      { id: "m-2a", task: "Install the latest firmware update", dueDate: "2026-11-30", intervalMonths: 3, status: "due" },
      { id: "m-2b", task: "Dust the rear vents and clean the screen with a dry microfibre cloth", dueDate: "2027-02-01", intervalMonths: 3, status: "upcoming" },
    ],
    serviceHistory: [],
  }),
  own({
    id: "own-3",
    productId: "p-tervo-core-15",
    purchaseDate: "2024-08-22",
    purchasePrice: 899,
    retailer: "BrightCart",
    serialNumber: "TVCR15-24-55102",
    receiptId: "BC-20240822-4471",
    maintenance: [
      { id: "m-3a", task: "Run battery health report", dueDate: "2026-12-15", intervalMonths: 6, status: "upcoming" },
      { id: "m-3b", task: "Clean the fan intake with compressed air", dueDate: "2026-10-01", intervalMonths: 6, status: "overdue" },
    ],
    serviceHistory: [
      { date: "2025-09-30", type: "Upgrade", provider: "Self", notes: "Added a second 16 GB memory module (32 GB total).", cost: 54 },
      { date: "2026-05-14", type: "Repair", provider: "Tervo Repair Centre", notes: "Replaced worn keyboard deck under warranty; 4-day turnaround.", cost: 0 },
    ],
  }),
  own({
    id: "own-4",
    productId: "p-kestrel-loadmaster-t11",
    purchaseDate: "2021-04-03",
    purchasePrice: 649,
    retailer: "Northline Appliances",
    serialNumber: "KSLM11-21-0098341",
    receiptId: "NA-0403-21-1188",
    maintenance: [
      { id: "m-4a", task: "Run a hot drum-clean cycle with washer cleaner", dueDate: "2026-11-25", intervalMonths: 1, status: "due" },
      { id: "m-4b", task: "Inspect inlet hoses for bulging or cracks", dueDate: "2027-04-03", intervalMonths: 12, status: "upcoming" },
      { id: "m-4c", task: "Clean the lint filter", dueDate: "2026-11-01", intervalMonths: 1, status: "done" },
    ],
    serviceHistory: [
      { date: "2023-01-19", type: "Repair", provider: "Northline Service", notes: "Replaced the lid lock assembly. Out of warranty.", cost: 168 },
      { date: "2026-07-08", type: "Inspection", provider: "Cascade Appliance Repair", notes: "Bearing noise during spin. Technician advised replacement is uneconomic; budgeting for a new washer.", cost: 95 },
    ],
  }),
  own({
    id: "own-5",
    productId: "p-ovea-eco-c160",
    purchaseDate: "2026-02-09",
    purchasePrice: 529,
    retailer: "Larder & Co",
    serialNumber: "OVC160-26-1200457",
    receiptId: "LC-US-260209-0091",
    maintenance: [
      { id: "m-5a", task: "Defrost freezer box if ice exceeds 5 mm", dueDate: "2027-01-15", intervalMonths: 4, status: "upcoming" },
    ],
    serviceHistory: [],
  }),
];

export function getOwnedProduct(id: string): OwnedProduct | undefined {
  return ownedProducts.find((o) => o.id === id);
}
