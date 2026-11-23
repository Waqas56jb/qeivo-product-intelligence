import type { ProductNote, ResearchFolder, SavedProduct } from "@/types";

/** Research folders for the demo customer (Alex Morgan). */
export const researchFolders: ResearchFolder[] = [
  { id: "fd-kitchen", name: "Kitchen remodel — fridge", description: "Candidates for the 920 × 1800 × 720 mm opening beside the pantry. Must be quiet; the kitchen is open-plan.", color: "#2E5A7A" },
  { id: "fd-laundry", name: "Laundry upgrade", description: "Replacing the 12-year-old top loader. Looking for 9 kg+ front loaders with low water use.", color: "#2F7D5B" },
  { id: "fd-garage", name: "Garage second fridge", description: "Something cheap and tough for drinks and overflow from the weekly shop.", color: "#B5482F" },
  { id: "fd-gifts", name: "Gift ideas & someday", description: "Laptop for Maddie starting college next fall, and a bigger TV for the den eventually.", color: "#7A5C8E" },
  { id: "fd-shortlist", name: "Final shortlist", description: "The two or three models I'd actually buy if the price drops this month.", color: "#C49A2C" },
];

const s = (productId: string, savedAt: string, folderId: string, note?: string): SavedProduct => ({ productId, savedAt, folderId, note });

export const savedProducts: SavedProduct[] = [
  s("p-nordvik-frostline-fd540-cd", "2026-10-02T19:14:00Z", "fd-shortlist", "Counter-depth, 625 mm deep — leaves room for the door to clear the island."),
  s("p-ovea-eco-fd520", "2026-10-04T21:40:00Z", "fd-shortlist", "Narrowest French door I've found (836 mm) and the lowest running cost. Height is exactly 1800 though."),
  s("p-maru-smartview-cd540", "2026-10-06T08:05:00Z", "fd-kitchen", "Nice app, but 912 mm wide leaves only 4 mm each side."),
  s("p-brightwater-family-fd560", "2026-10-09T20:22:00Z", "fd-kitchen", "Best value of the bunch. 720 mm deep = flush with the opening, no room behind?"),
  s("p-kestrel-everyday-cd510", "2026-10-11T12:48:00Z", "fd-kitchen"),
  s("p-nordvik-frostline-fd600", "2026-09-28T18:30:00Z", "fd-kitchen", "Love it but 730 mm deep is 10 mm too much for our opening."),
  s("p-halden-precision-fd590", "2026-09-30T22:11:00Z", "fd-kitchen", "Too tall at 1830 mm — would need to remove the cabinet above."),
  s("p-halden-pureclean-w9", "2026-10-15T07:55:00Z", "fd-laundry", "Auto-dosing + 48 L per cycle. Top pick."),
  s("p-ovea-greencycle-w8", "2026-10-15T08:10:00Z", "fd-laundry", "1600 rpm spin, 3-year warranty. 8 kg might be tight for bedding."),
  s("p-brightwater-familywash-w9", "2026-10-16T20:31:00Z", "fd-laundry"),
  s("p-maru-cube-c120", "2026-11-01T10:02:00Z", "fd-garage", "Check whether it's rated for an unheated garage in January."),
  s("p-kestrel-homebase-tf450", "2026-11-02T14:45:00Z", "fd-garage"),
  s("p-tervo-air-14", "2026-11-12T23:04:00Z", "fd-gifts", "Repairable, 13 h measured battery. Wait for holiday pricing."),
  s("p-lumora-vivid-oled65", "2026-11-18T21:17:00Z", "fd-gifts"),
];

export const productNotes: ProductNote[] = [
  { id: "pn-1", productId: "p-nordvik-frostline-fd540-cd", body: "Asked Larder & Co about delivery — they can take the doors off on site. Installation is $129, includes water line hookup.", createdAt: "2026-10-03T17:20:00Z" },
  { id: "pn-2", productId: "p-ovea-eco-fd520", body: "Measured again: opening is 1802 mm at the back, 1800 at the front. The Eco FD520 needs 25 mm above for ventilation per the manual — probably a no unless we trim the cabinet.", createdAt: "2026-10-05T09:41:00Z" },
  { id: "pn-3", productId: "p-brightwater-family-fd560", body: "Reviewers say the water dispenser takes up door space. We barely use the dispenser on our current fridge anyway.", createdAt: "2026-10-10T20:02:00Z" },
  { id: "pn-4", productId: "p-halden-pureclean-w9", body: "Needs a drain within 1 m. Ours is on the opposite wall — check extension hose length.", createdAt: "2026-10-15T08:30:00Z" },
  { id: "pn-5", productId: "p-maru-smartview-cd540", body: "Community thread says the app drops after router changes. We're switching ISPs in January, so that's a consideration.", createdAt: "2026-10-07T18:55:00Z" },
  { id: "pn-6", productId: "p-maru-cube-c120", body: "Manual lists an ambient range of 10–43 °C. Garage hit 4 °C last winter, so this is probably out.", createdAt: "2026-11-01T10:30:00Z" },
  { id: "pn-7", productId: "p-tervo-air-14", body: "RAM is upgradeable — could buy 16 GB now and add more later.", createdAt: "2026-11-13T07:12:00Z" },
];

export function savedInFolder(folderId: string): SavedProduct[] {
  return savedProducts.filter((p) => p.folderId === folderId);
}

export function notesForProduct(productId: string): ProductNote[] {
  return productNotes.filter((n) => n.productId === productId);
}
