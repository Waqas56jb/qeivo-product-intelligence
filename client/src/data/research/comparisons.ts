import type { SavedComparison } from "@/types";

export const savedComparisons: SavedComparison[] = [
  {
    id: "cmp-1",
    name: "Counter-depth French doors for the remodel",
    productIds: ["p-nordvik-frostline-fd540-cd", "p-maru-smartview-cd540", "p-kestrel-everyday-cd510"],
    createdAt: "2026-10-12T20:15:00Z",
    verdict: "The Nordvik FD540 is the best fit: the quietest of the three at 35 dB(A), a 10-year compressor warranty, and at 908 mm wide it ties for the narrowest body. Side gaps in a 920 mm opening are still tighter than the manual recommends, so confirm with Nordvik.",
  },
  {
    id: "cmp-2",
    name: "Efficiency vs capacity",
    productIds: ["p-ovea-eco-fd520", "p-brightwater-family-fd560", "p-nordvik-frostline-fd600"],
    createdAt: "2026-10-18T09:02:00Z",
    verdict: "The Ovea Eco FD520 uses 114 kWh a year less (about $19 at $0.17/kWh) than the Brightwater, but the Brightwater gives you 41 L more for $200 less. Only the Ovea and Brightwater fit the 720 mm depth.",
  },
  {
    id: "cmp-3",
    name: "Front loaders for a family of four",
    productIds: ["p-halden-pureclean-w9", "p-ovea-greencycle-w8", "p-brightwater-familywash-w9", "p-maru-aiwash-w10"],
    createdAt: "2026-10-20T19:48:00Z",
    verdict: "The Halden PureClean W9 leads on cleaning and reliability. The Brightwater FamilyWash W9 is the value pick at almost half the price, if you can live with a louder spin.",
  },
  {
    id: "cmp-4",
    name: "Garage overflow fridge",
    productIds: ["p-kestrel-homebase-tf450", "p-brightwater-studio-tf310", "p-maru-cube-c120"],
    createdAt: "2026-11-02T15:10:00Z",
    verdict: "The Kestrel HomeBase TF450 gives the most space per dollar. Check the climate-class rating before putting any of them in an unheated garage.",
  },
  {
    id: "cmp-5",
    name: "College laptop shortlist",
    productIds: ["p-tervo-air-14", "p-vireo-aero-13", "p-arclight-swift-14"],
    createdAt: "2026-11-13T07:40:00Z",
    verdict: "The Tervo Air 14 is worth the extra $300–400: twice the RAM of the Aero 13, upgradeable memory, and the longest measured battery life of the three.",
  },
];

export function getComparison(id: string): SavedComparison | undefined {
  return savedComparisons.find((c) => c.id === id);
}
