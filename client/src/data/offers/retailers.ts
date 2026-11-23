/** Invented retailers for the demo. */
export interface Retailer {
  id: string;
  name: string;
  short: string;
  color: string;
  supplierId?: string;
}

export const retailers: Retailer[] = [
  { id: "r-larder", name: "Larder & Co", short: "L&", color: "#2F7D5B", supplierId: "co-larder" },
  { id: "r-brightcart", name: "BrightCart", short: "BC", color: "#1D6FB8", supplierId: "co-brightcart" },
  { id: "r-homehub", name: "HomeHub Outlet", short: "HH", color: "#B5482F" },
  { id: "r-voltmart", name: "Voltmart", short: "VM", color: "#5A3E9E", supplierId: "co-voltmart" },
  { id: "r-northline", name: "Northline Appliances", short: "NA", color: "#304B65" },
  { id: "r-currant", name: "Currant Electrical", short: "CE", color: "#C0392B" },
];

export const retailerByName = new Map(retailers.map((r) => [r.name, r]));
