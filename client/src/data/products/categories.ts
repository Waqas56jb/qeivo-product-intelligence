import type { CategoryInfo, CategorySlug } from "@/types";
import { images } from "../images";

export const categories: CategoryInfo[] = [
  {
    slug: "refrigerators",
    name: "Refrigerators",
    singular: "Refrigerator",
    description:
      "From compact under-counter units to four-door flagships, compare real capacity, measured energy use and long-term reliability — not just the brochure.",
    heroImage: images.fridgeInSitu[0],
    icon: "refrigerator",
    capacityLabel: "Total capacity",
    types: ["French door", "Side-by-side", "Bottom freezer", "Top freezer", "Four-door", "Counter-depth", "Column", "Compact"],
    featureFilters: ["Water & ice dispenser", "Plumbed ice maker", "Inverter compressor", "Wi-Fi app control", "Convertible zone", "Dual cooling", "Door-in-door", "Reversible doors"],
    factorLabels: {
      performance: "Cooling performance",
      energy: "Energy efficiency",
      value: "Value for money",
      reliability: "Reliability",
      capacity: "Capacity & layout",
      space: "Space compatibility",
      maintenance: "Maintenance",
      warranty: "Warranty",
    },
    considerations: [
      { title: "Measure the opening, then add clearance", body: "Most models need 25–50 mm at the back and 5–25 mm at the sides to breathe. Doors also need room to swing past 90° so crisper drawers can slide out." },
      { title: "Usable capacity is smaller than quoted", body: "Manufacturers quote gross volume. Shelving, ice makers and door bins typically reduce usable space by 8–15%." },
      { title: "Energy over ten years can rival the price", body: "A 450 kWh/yr model costs roughly twice as much to run as a 230 kWh/yr model. Over a decade that difference can exceed the price gap." },
      { title: "Ice makers are the most common failure point", body: "Owners report plumbed ice makers and dispensers as the leading source of service calls. Consider whether you need one." },
    ],
  },
  {
    slug: "washing-machines",
    name: "Washing machines",
    singular: "Washing machine",
    description:
      "Front-loaders and top-loaders compared on wash quality, water use, noise and the things owners actually complain about.",
    heroImage: images.laundry[0],
    icon: "washing-machine",
    capacityLabel: "Drum capacity",
    types: ["Front load", "Top load", "Washer-dryer"],
    featureFilters: ["Steam refresh", "Auto-dosing", "Inverter motor", "Wi-Fi app control", "Allergy cycle", "Quick wash"],
    factorLabels: {
      performance: "Wash performance",
      energy: "Energy & water",
      value: "Value for money",
      reliability: "Reliability",
      capacity: "Drum capacity",
      space: "Space compatibility",
      maintenance: "Maintenance",
      warranty: "Warranty",
    },
    considerations: [
      { title: "Match drum size to your household", body: "7–8 kg suits one or two people; families of four or more usually benefit from 9–10 kg." },
      { title: "Spin speed is about drying, not cleaning", body: "Higher spin speeds leave clothes drier, which saves tumble-dryer energy, but can increase creasing." },
      { title: "Check the noise in dB during spin", body: "Spin noise above 76 dB is noticeable in open-plan homes and apartments." },
    ],
  },
  {
    slug: "televisions",
    name: "Televisions",
    singular: "Television",
    description:
      "Panel technology, brightness, motion handling and real-world power draw — measured, not marketed.",
    heroImage: images.tvs[0],
    icon: "tv",
    capacityLabel: "Screen size",
    types: ["OLED", "Mini-LED", "QLED", "LED"],
    featureFilters: ["120 Hz panel", "Dolby Vision", "HDMI 2.1", "Hands-free voice", "Anti-glare"],
    factorLabels: {
      performance: "Picture quality",
      energy: "Power efficiency",
      value: "Value for money",
      reliability: "Reliability",
      capacity: "Screen size",
      space: "Room fit",
      maintenance: "Software support",
      warranty: "Warranty",
    },
    considerations: [
      { title: "Choose size by viewing distance", body: "For 4K content, a viewing distance of roughly 1.2–1.5× the screen diagonal gives an immersive picture without visible pixels." },
      { title: "Bright rooms favour Mini-LED", body: "OLED delivers perfect blacks but lower peak brightness; Mini-LED copes better with sunlit rooms." },
      { title: "Software updates matter", body: "Check how many years of platform updates a brand commits to — apps can stop working on unsupported sets." },
    ],
  },
  {
    slug: "laptops",
    name: "Laptops",
    singular: "Laptop",
    description:
      "Battery life you will actually get, thermals under load and repairability, side by side.",
    heroImage: images.laptops[1],
    icon: "laptop",
    capacityLabel: "Storage",
    types: ["Ultrabook", "Creator", "Gaming", "Business", "2-in-1"],
    featureFilters: ["OLED display", "Thunderbolt 4", "Backlit keyboard", "Fingerprint reader", "Upgradeable RAM"],
    factorLabels: {
      performance: "Performance",
      energy: "Battery life",
      value: "Value for money",
      reliability: "Build & reliability",
      capacity: "Memory & storage",
      space: "Portability",
      maintenance: "Repairability",
      warranty: "Warranty",
    },
    considerations: [
      { title: "Quoted battery life is a best case", body: "Independent tests at 150 nits web browsing typically return 60–80% of the manufacturer figure." },
      { title: "16 GB RAM is the sensible floor", body: "Modern browsers and creative apps make 8 GB machines feel slow within two years." },
      { title: "Repairability extends ownership", body: "Socketed SSDs and replaceable batteries can add years of useful life." },
    ],
  },
];

export const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

export function getCategory(slug: CategorySlug): CategoryInfo {
  return categoryBySlug.get(slug)!;
}
