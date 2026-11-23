/**
 * Hand-authored catalog specifications.
 * This file intentionally has no imports so the studio-render generator
 * (scripts/generate-renders.mjs) can read it directly with Node.
 *
 * Every other product field (scores, claims, specs, FAQs, warnings…) is derived
 * deterministically from these rows in ./build.ts so the data stays internally consistent.
 */

export type Finish = "stainless" | "black" | "white" | "graphite" | "sage" | "navy" | "cream" | "silver" | "panel";
export type Freshness = "current" | "aging" | "stale";

/* ---------------------------------------------------------------- Fridges */
/*
 Feature codes: W water & ice dispenser · I plumbed ice maker · V inverter compressor · S Wi-Fi app
 C convertible zone · D dual cooling · R door-in-door · H humidity crispers · N non-plumbed water filter
 Q quiet mode · X reversible doors · L LED lighting · Z fast freeze
*/
export type FridgeRow = [
  key: string, brandId: string, name: string, modelNumber: string, type: string, finish: Finish,
  totalL: number, freezerL: number, widthMm: number, heightMm: number, depthMm: number,
  price: number, originalPrice: number, kwhYear: number, energyRating: string, noiseDb: number,
  warrantyYears: number, compressorYears: number, stars: number, reviews: number, features: string,
  evidence: number, year: number, freshness: Freshness,
];

export const fridgeRows: FridgeRow[] = [
  ["nordvik-frostline-fd600", "b-nordvik", "Frostline FD600", "NV-FD600SS", "French door", "stainless", 603, 198, 908, 1780, 730, 2499, 2799, 318, "D", 36, 2, 10, 4.6, 1284, "WIVSDHQLZ", 94, 2025, "current"],
  ["nordvik-frostline-fd540-cd", "b-nordvik", "Frostline FD540 Counter-Depth", "NV-FD540CD", "Counter-depth", "stainless", 541, 176, 908, 1778, 625, 2699, 0, 302, "D", 35, 2, 10, 4.5, 642, "IVSDHQL", 91, 2025, "current"],
  ["nordvik-ellipse-bf380", "b-nordvik", "Ellipse BF380", "NV-BF380W", "Bottom freezer", "white", 382, 112, 700, 2010, 680, 1199, 1349, 198, "B", 34, 2, 10, 4.7, 2210, "VDHQXLZ", 96, 2024, "current"],
  ["nordvik-column-c400", "b-nordvik", "Column C400", "NV-C400IX", "Column", "stainless", 398, 0, 600, 1940, 650, 2899, 0, 112, "A", 33, 2, 10, 4.4, 186, "VHQL", 84, 2025, "current"],
  ["nordvik-frostline-sbs630", "b-nordvik", "Frostline SBS630", "NV-SB630SS", "Side-by-side", "stainless", 628, 226, 910, 1790, 715, 1999, 0, 352, "D", 37, 2, 10, 4.4, 960, "WIVSDL", 89, 2024, "current"],
  ["aurelle-maison-fd610", "b-aurelle", "Maison FD610", "AU-M610BK", "French door", "black", 612, 205, 910, 1790, 740, 2899, 3199, 365, "E", 38, 2, 5, 4.2, 873, "WIVSRHL", 82, 2024, "aging"],
  ["aurelle-atelier-bf350", "b-aurelle", "Atelier BF350", "AU-AT350CR", "Bottom freezer", "cream", 348, 105, 600, 1880, 660, 1399, 0, 236, "C", 37, 2, 5, 4.3, 512, "VHXL", 79, 2023, "aging"],
  ["aurelle-petite-u130", "b-aurelle", "Petite U130", "AU-PT130SG", "Compact", "sage", 131, 15, 495, 850, 560, 649, 0, 118, "E", 39, 2, 5, 4.1, 334, "XL", 71, 2023, "stale"],
  ["aurelle-maison-sbs620", "b-aurelle", "Maison SBS620", "AU-MS620SS", "Side-by-side", "stainless", 622, 228, 912, 1790, 720, 2299, 0, 388, "F", 40, 2, 5, 4.0, 441, "WIVSL", 76, 2024, "current"],
  ["kestrel-homebase-tf450", "b-kestrel", "HomeBase TF450", "KS-TF450W", "Top freezer", "white", 453, 118, 760, 1720, 740, 749, 829, 362, "F", 41, 1, 5, 4.2, 3420, "XL", 88, 2024, "current"],
  ["kestrel-homebase-sbs650", "b-kestrel", "HomeBase SBS650", "KS-SB650SS", "Side-by-side", "stainless", 651, 236, 912, 1780, 760, 1299, 1499, 452, "F", 42, 1, 5, 4.0, 2870, "WILN", 85, 2024, "current"],
  ["kestrel-everyday-fd580", "b-kestrel", "Everyday FD580", "KS-FD580SS", "French door", "stainless", 578, 192, 908, 1770, 770, 1599, 1799, 404, "E", 40, 1, 5, 4.1, 1945, "WIDHL", 87, 2025, "current"],
  ["kestrel-dorm-c90", "b-kestrel", "Dorm C90", "KS-C90BK", "Compact", "black", 92, 10, 480, 840, 500, 229, 0, 142, "F", 41, 1, 1, 3.9, 4120, "X", 74, 2023, "current"],
  ["kestrel-homebase-bf420", "b-kestrel", "HomeBase BF420", "KS-BF420SL", "Bottom freezer", "silver", 418, 128, 700, 1900, 700, 999, 0, 289, "E", 39, 1, 5, 4.2, 1532, "VHXL", 83, 2024, "current"],
  ["kestrel-everyday-cd510", "b-kestrel", "Everyday CD510 Counter-Depth", "KS-CD510SS", "Counter-depth", "stainless", 512, 168, 908, 1770, 630, 1799, 0, 380, "E", 39, 1, 5, 4.0, 760, "IDL", 80, 2024, "current"],
  ["halden-precision-bf400", "b-halden", "Precision BF400", "HD-P400IX", "Bottom freezer", "stainless", 401, 118, 600, 2030, 665, 1549, 0, 172, "A", 33, 2, 10, 4.8, 1611, "VDHQXLZ", 97, 2025, "current"],
  ["halden-precision-fd590", "b-halden", "Precision FD590", "HD-P590IX", "French door", "stainless", 592, 188, 905, 1830, 700, 3199, 0, 268, "B", 34, 3, 10, 4.7, 702, "IVSDCHQL", 95, 2025, "current"],
  ["halden-integra-bi270", "b-halden", "Integra BI270 Built-in", "HD-IN270", "Bottom freezer", "panel", 268, 74, 556, 1772, 545, 1899, 0, 181, "C", 35, 2, 10, 4.6, 388, "VDHQZ", 90, 2024, "current"],
  ["halden-precision-qd650", "b-halden", "Precision QD650", "HD-Q650BK", "Four-door", "black", 648, 220, 912, 1830, 720, 3599, 3899, 296, "C", 35, 3, 10, 4.6, 455, "IVSCDHQL", 92, 2025, "current"],
  ["solenne-rivoli-fd640", "b-solenne", "Rivoli FD640", "SL-RV640NV", "French door", "navy", 638, 214, 915, 1800, 745, 3799, 0, 352, "D", 37, 2, 5, 4.3, 296, "WIVSRHL", 73, 2024, "aging"],
  ["solenne-portofino-r330", "b-solenne", "Portofino Retro R330", "SL-PF330CR", "Bottom freezer", "cream", 331, 92, 600, 1960, 720, 1899, 0, 248, "D", 38, 2, 5, 4.4, 820, "XL", 77, 2023, "stale"],
  ["solenne-rivoli-qd700", "b-solenne", "Rivoli QD700", "SL-RV700SS", "Four-door", "stainless", 702, 241, 915, 1800, 760, 4299, 4699, 398, "E", 38, 2, 5, 4.2, 214, "WIVSCRDHL", 68, 2025, "current"],
  ["solenne-capri-u140", "b-solenne", "Capri U140", "SL-CP140IX", "Compact", "stainless", 138, 0, 595, 820, 575, 1199, 0, 128, "E", 36, 2, 5, 4.3, 167, "VLQ", 66, 2024, "current"],
  ["maru-smartview-fd620", "b-maru", "SmartView FD620", "MR-SV620GR", "French door", "graphite", 618, 204, 912, 1790, 735, 2799, 2999, 336, "D", 36, 2, 10, 4.4, 1720, "WIVSCRDHL", 89, 2025, "current"],
  ["maru-smartview-cd540", "b-maru", "SmartView CD540 Counter-Depth", "MR-SV540CD", "Counter-depth", "graphite", 538, 178, 912, 1780, 620, 2599, 0, 318, "D", 36, 2, 10, 4.3, 612, "WIVSDHL", 86, 2025, "current"],
  ["maru-flex-qd640", "b-maru", "Flex QD640", "MR-FX640SS", "Four-door", "stainless", 641, 230, 912, 1790, 730, 2499, 0, 352, "D", 37, 2, 10, 4.3, 1288, "WIVSCDHL", 86, 2025, "current"],
  ["maru-panel-bf360", "b-maru", "Panel BF360", "MR-PN360WH", "Bottom freezer", "white", 361, 112, 595, 1853, 658, 1149, 0, 214, "C", 35, 2, 10, 4.5, 2045, "VSDHXL", 90, 2024, "current"],
  ["maru-flex-sbs660", "b-maru", "Flex SBS660", "MR-FX660BK", "Side-by-side", "black", 661, 240, 912, 1790, 720, 1899, 2099, 408, "E", 38, 2, 10, 4.2, 1390, "WIVSRL", 84, 2024, "current"],
  ["maru-cube-c120", "b-maru", "Cube C120", "MR-CB120SL", "Compact", "silver", 122, 12, 480, 860, 520, 399, 0, 131, "E", 38, 2, 10, 4.4, 980, "VX", 80, 2025, "current"],
  ["brightwater-family-fd560", "b-brightwater", "Family FD560", "BW-FM560SS", "French door", "stainless", 562, 184, 905, 1780, 720, 1899, 2099, 342, "D", 37, 2, 5, 4.4, 2650, "WIVDHL", 90, 2024, "current"],
  ["brightwater-family-bf440", "b-brightwater", "Family BF440", "BW-FM440W", "Bottom freezer", "white", 438, 141, 700, 1950, 700, 999, 1099, 258, "D", 37, 2, 5, 4.5, 3810, "VDHXL", 93, 2024, "current"],
  ["brightwater-studio-tf310", "b-brightwater", "Studio TF310", "BW-ST310W", "Top freezer", "white", 312, 86, 600, 1720, 640, 599, 0, 228, "E", 39, 2, 5, 4.2, 2270, "XL", 86, 2023, "current"],
  ["brightwater-family-sbs600", "b-brightwater", "Family SBS600", "BW-FM600BK", "Side-by-side", "black", 598, 221, 908, 1780, 710, 1499, 0, 418, "F", 40, 2, 5, 4.0, 1104, "WINL", 81, 2024, "aging"],
  ["brightwater-larder-c385", "b-brightwater", "Larder C385", "BW-LD385S", "Column", "silver", 385, 0, 600, 1850, 650, 849, 0, 118, "B", 35, 2, 5, 4.5, 870, "VHXL", 85, 2024, "current"],
  ["corvane-pro-fd650", "b-corvane", "Pro FD650", "CV-PR650SS", "French door", "stainless", 652, 210, 915, 1785, 770, 3999, 0, 372, "D", 37, 3, 12, 4.6, 520, "IVSDCHQL", 88, 2025, "current"],
  ["corvane-pro-column-r480", "b-corvane", "Pro Column R480", "CV-PC480", "Column", "stainless", 476, 0, 760, 2130, 610, 5499, 0, 158, "B", 34, 3, 12, 4.7, 142, "VSHQL", 72, 2025, "current"],
  ["corvane-chef-sbs700", "b-corvane", "Chef SBS700", "CV-CH700SS", "Side-by-side", "stainless", 702, 252, 915, 1790, 740, 2899, 3199, 438, "E", 38, 3, 12, 4.4, 610, "WIVSDL", 83, 2024, "current"],
  ["corvane-pro-qd690", "b-corvane", "Pro QD690", "CV-PQ690BK", "Four-door", "black", 688, 238, 915, 1790, 745, 4499, 0, 384, "D", 37, 3, 12, 4.5, 248, "WIVSCDRHQL", 78, 2025, "aging"],
  ["ovea-eco-bf370", "b-ovea", "Eco BF370", "OV-EC370W", "Bottom freezer", "white", 371, 106, 595, 1860, 660, 1099, 0, 146, "A", 32, 3, 10, 4.6, 1390, "VDHQXLZ", 95, 2025, "current"],
  ["ovea-eco-fd520", "b-ovea", "Eco FD520", "OV-EC520SS", "French door", "stainless", 521, 168, 836, 1800, 700, 2099, 0, 228, "B", 34, 3, 10, 4.6, 610, "VSDHQL", 92, 2025, "current"],
  ["ovea-terra-tf300", "b-ovea", "Terra TF300", "OV-TR300SG", "Top freezer", "sage", 298, 78, 595, 1650, 630, 849, 0, 168, "B", 34, 3, 10, 4.5, 540, "VXL", 89, 2024, "current"],
  ["ovea-eco-c160", "b-ovea", "Eco Compact C160", "OV-EC160W", "Compact", "white", 158, 18, 550, 850, 580, 549, 0, 98, "B", 33, 3, 10, 4.6, 720, "VXQ", 87, 2025, "current"],
];

/* ------------------------------------------------------- Washing machines */
/* Feature codes: S steam refresh · D auto-dosing · I inverter motor · W Wi-Fi · A allergy cycle · Q quick wash */
export type WasherRow = [
  key: string, brandId: string, name: string, modelNumber: string, type: string, finish: Finish,
  kg: number, widthMm: number, heightMm: number, depthMm: number, price: number, originalPrice: number,
  kwhYear: number, energyRating: string, spinDb: number, warrantyYears: number, motorYears: number,
  stars: number, reviews: number, features: string, evidence: number, year: number, freshness: Freshness,
  rpm: number, waterL: number,
];

export const washerRows: WasherRow[] = [
  ["halden-pureclean-w9", "b-halden", "PureClean W9", "HD-PC9W", "Front load", "white", 9, 597, 850, 590, 999, 1099, 108, "A", 72, 2, 10, 4.7, 1420, "SDIAQ", 95, 2025, "current", 1400, 48],
  ["nordvik-silkwash-w8", "b-nordvik", "SilkWash W8", "NV-SW8W", "Front load", "white", 8, 599, 850, 585, 749, 0, 112, "A", 73, 2, 10, 4.5, 980, "SIAQ", 91, 2024, "current", 1400, 46],
  ["maru-aiwash-w10", "b-maru", "AIWash W10", "MR-AW10GR", "Front load", "graphite", 10, 600, 850, 615, 1099, 1199, 128, "A", 74, 2, 10, 4.4, 1630, "SDIWAQ", 88, 2025, "current", 1400, 52],
  ["kestrel-loadmaster-t11", "b-kestrel", "LoadMaster T11", "KS-LM11W", "Top load", "white", 11, 686, 1080, 700, 699, 799, 178, "C", 77, 1, 5, 4.1, 2760, "Q", 84, 2024, "current", 800, 92],
  ["brightwater-familywash-w9", "b-brightwater", "FamilyWash W9", "BW-FW9W", "Front load", "white", 9, 600, 850, 590, 549, 0, 136, "B", 76, 2, 5, 4.3, 3120, "AQ", 89, 2024, "current", 1400, 50],
  ["ovea-greencycle-w8", "b-ovea", "GreenCycle W8", "OV-GC8W", "Front load", "white", 8, 597, 845, 575, 799, 0, 98, "A", 71, 3, 10, 4.6, 640, "IAQD", 93, 2025, "current", 1600, 42],
  ["halden-combi-wd10", "b-halden", "Combi WD10 Washer-Dryer", "HD-WD10IX", "Washer-dryer", "silver", 10, 597, 850, 620, 1499, 0, 210, "D", 75, 2, 10, 4.4, 520, "SDIWQ", 87, 2025, "current", 1400, 56],
  ["brightwater-compact-w6", "b-brightwater", "Compact W6", "BW-CP6W", "Front load", "white", 6, 595, 850, 470, 429, 0, 104, "C", 75, 2, 5, 4.2, 1150, "Q", 82, 2023, "aging", 1200, 40],
  ["maru-twinload-t13", "b-maru", "TwinLoad T13", "MR-TL13BK", "Top load", "black", 13, 686, 1100, 720, 999, 1099, 188, "C", 76, 2, 10, 4.3, 870, "IWSQ", 80, 2025, "current", 900, 98],
];

/* ------------------------------------------------------------ Televisions */
/* Feature codes: R 120 Hz panel · V Dolby Vision · H HDMI 2.1 · M hands-free voice · G anti-glare */
export type TvRow = [
  key: string, brandId: string, name: string, modelNumber: string, type: string,
  inches: number, widthMm: number, heightMm: number, depthMm: number, price: number, originalPrice: number,
  kwhYear: number, energyRating: string, peakNits: number, refreshHz: number, stars: number, reviews: number,
  features: string, evidence: number, year: number, freshness: Freshness, updateYears: number, warrantyYears: number,
];

export const tvRows: TvRow[] = [
  ["lumora-vivid-oled65", "b-lumora", "Vivid OLED 65", "LM-OV65C", "OLED", 65, 1449, 834, 47, 2199, 2499, 168, "G", 1300, 120, 4.7, 1840, "RVHM", 94, 2025, "current", 5, 2],
  ["lumora-vivid-oled55", "b-lumora", "Vivid OLED 55", "LM-OV55C", "OLED", 55, 1228, 708, 46, 1499, 1699, 132, "G", 1200, 120, 4.7, 1320, "RVH", 93, 2025, "current", 5, 2],
  ["lumora-studio-oled77", "b-lumora", "Studio OLED 77", "LM-SO77X", "OLED", 77, 1718, 988, 41, 3299, 3599, 214, "G", 1500, 120, 4.8, 410, "RVHMG", 90, 2025, "current", 5, 2],
  ["vireo-lumen-miniled75", "b-vireo", "Lumen Mini-LED 75", "VR-LM75Q", "Mini-LED", 75, 1672, 960, 62, 1999, 2299, 212, "F", 2400, 144, 4.5, 690, "RVHG", 88, 2025, "current", 4, 2],
  ["vireo-lumen-miniled65", "b-vireo", "Lumen Mini-LED 65", "VR-LM65Q", "Mini-LED", 65, 1449, 834, 55, 1499, 0, 176, "F", 2100, 144, 4.6, 840, "RVHG", 87, 2025, "current", 4, 2],
  ["maru-crystal-qled65", "b-maru", "Crystal QLED 65", "MR-CQ65", "QLED", 65, 1452, 833, 58, 1099, 1299, 186, "F", 900, 120, 4.3, 2210, "RHM", 86, 2024, "current", 4, 1],
  ["maru-crystal-qled50", "b-maru", "Crystal QLED 50", "MR-CQ50", "QLED", 50, 1117, 645, 59, 549, 649, 102, "F", 700, 60, 4.2, 1980, "M", 83, 2024, "current", 4, 1],
  ["kestrel-view-led55", "b-kestrel", "View LED 55", "KS-V55U", "LED", 55, 1240, 722, 79, 399, 449, 118, "F", 350, 60, 4.0, 5380, "M", 81, 2024, "aging", 2, 1],
  ["kestrel-view-qled65", "b-kestrel", "View QLED 65", "KS-VQ65U", "QLED", 65, 1450, 840, 80, 649, 749, 172, "F", 600, 60, 4.1, 2890, "M", 80, 2025, "current", 2, 1],
];

/* ---------------------------------------------------------------- Laptops */
/* Feature codes: O OLED display · T Thunderbolt 4 · B backlit keyboard · F fingerprint reader · U upgradeable RAM */
export type LaptopRow = [
  key: string, brandId: string, name: string, modelNumber: string, type: string, finish: Finish,
  storageGb: number, screenIn: number, widthMm: number, thicknessMm: number, depthMm: number, weightKg: number,
  price: number, originalPrice: number, claimedHours: number, measuredHours: number, cpu: string, ramGb: number,
  stars: number, reviews: number, features: string, evidence: number, year: number, freshness: Freshness, warrantyYears: number,
];

export const laptopRows: LaptopRow[] = [
  ["tervo-air-14", "b-tervo", "Air 14", "TV-AR14-16", "Ultrabook", "silver", 512, 14, 312, 15, 221, 1.21, 1299, 0, 18, 13.2, "8-core U-class", 16, 4.6, 840, "OTBFU", 92, 2025, "current", 3],
  ["arclight-blaze-16", "b-arclight", "Blaze 16", "AL-BZ16-32", "Gaming", "black", 1000, 16, 356, 24, 264, 2.45, 2199, 2399, 8, 4.6, "16-core H-class + 8 GB discrete GPU", 32, 4.4, 1210, "TBU", 86, 2025, "current", 2],
  ["vireo-studio-15", "b-vireo", "Studio 15", "VR-ST15-32", "Creator", "graphite", 1000, 15.6, 344, 17, 230, 1.82, 1899, 0, 14, 9.8, "12-core H-class", 32, 4.5, 690, "OTBF", 89, 2025, "current", 2],
  ["tervo-flex-13", "b-tervo", "Flex 13 2-in-1", "TV-FX13-16", "2-in-1", "silver", 512, 13.3, 298, 14, 208, 1.14, 1099, 1199, 15, 11.4, "8-core U-class", 16, 4.4, 520, "TBF", 87, 2024, "current", 3],
  ["vireo-meridian-14", "b-vireo", "Meridian 14", "VR-MD14-16", "Business", "graphite", 512, 14, 315, 17, 222, 1.36, 1449, 0, 16, 12.1, "10-core U-class", 16, 4.5, 1120, "TBFU", 91, 2025, "current", 3],
  ["arclight-swift-14", "b-arclight", "Swift 14", "AL-SW14-16", "Ultrabook", "navy", 512, 14, 311, 16, 220, 1.29, 999, 1149, 14, 9.6, "8-core U-class", 16, 4.2, 1570, "OB", 84, 2024, "current", 1],
  ["arclight-forge-17", "b-arclight", "Forge 17", "AL-FG17-32", "Gaming", "black", 2000, 17.3, 396, 27, 290, 2.9, 2799, 0, 6, 3.9, "24-core HX-class + 12 GB discrete GPU", 32, 4.3, 430, "TBU", 79, 2025, "current", 2],
  ["tervo-core-15", "b-tervo", "Core 15", "TV-CR15-16", "Business", "graphite", 512, 15.6, 357, 18, 236, 1.65, 849, 949, 12, 8.9, "8-core U-class", 16, 4.3, 980, "BFU", 85, 2024, "aging", 3],
  ["vireo-aero-13", "b-vireo", "Aero 13", "VR-AE13-8", "Ultrabook", "silver", 256, 13.3, 297, 13, 205, 0.99, 899, 0, 15, 10.2, "8-core U-class", 8, 4.1, 760, "OBF", 82, 2024, "current", 1],
];

/** Lightweight list used by the render generator. */
export const renderManifest = [
  ...fridgeRows.map((r) => ({ key: r[0], category: "refrigerators", type: r[4], finish: r[5] })),
  ...washerRows.map((r) => ({ key: r[0], category: "washing-machines", type: r[4], finish: r[5] })),
  ...tvRows.map((r) => ({ key: r[0], category: "televisions", type: r[4], finish: "black" as Finish })),
  ...laptopRows.map((r) => ({ key: r[0], category: "laptops", type: r[4], finish: r[5] })),
];
