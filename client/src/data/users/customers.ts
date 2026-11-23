import type { Customer } from "@/types";
import { avatarAt } from "../images";

/** The signed-in demo customer. */
export const currentUser: Customer = {
  id: "u-alex",
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  avatar: avatarAt(3),
  location: "Portland, Oregon, US",
  memberSince: "2025-03-14",
  plan: "premium",
  preferences: {
    budgetMin: 1500,
    budgetMax: 3000,
    householdSize: 4,
    region: "US",
    interests: ["refrigerators", "washing-machines"],
    preferredBrandIds: ["b-nordvik", "b-halden", "b-ovea"],
    energyPriority: "high",
    space: { widthMm: 920, heightMm: 1800, depthMm: 720 },
    priorities: { energy: 0.22, reliability: 0.2, capacity: 0.16, space: 0.14, value: 0.12, performance: 0.08, maintenance: 0.05, warranty: 0.03 },
    reviewPreference: "verified-only",
  },
};

interface Row {
  id: string;
  name: string;
  city: string;
  since: string;
  plan: Customer["plan"];
  region: Customer["preferences"]["region"];
  budget: [number, number];
  household: number;
  interests: Customer["preferences"]["interests"];
  brands: string[];
  energy: Customer["preferences"]["energyPriority"];
  space: [number, number, number] | null;
}

const rows: Row[] = [
  { id: "u-sofia", name: "Sofia Lindqvist", city: "Gothenburg, Sweden", since: "2025-06-02", plan: "premium", region: "EU", budget: [1200, 2200], household: 3, interests: ["refrigerators"], brands: ["b-nordvik"], energy: "high", space: [700, 2050, 700] },
  { id: "u-james", name: "James Whitaker", city: "Leeds, UK", since: "2025-09-19", plan: "free", region: "UK", budget: [400, 900], household: 2, interests: ["washing-machines"], brands: [], energy: "balanced", space: [600, 850, 600] },
  { id: "u-amara", name: "Amara Nwosu", city: "Toronto, Canada", since: "2025-11-07", plan: "premium", region: "CA", budget: [2000, 4000], household: 5, interests: ["refrigerators", "televisions"], brands: ["b-maru", "b-halden"], energy: "balanced", space: [915, 1830, 760] },
  { id: "u-diego", name: "Diego Fernández", city: "Austin, Texas, US", since: "2026-01-21", plan: "free", region: "US", budget: [800, 1600], household: 4, interests: ["televisions", "laptops"], brands: ["b-lumora"], energy: "low", space: null },
  { id: "u-mei", name: "Mei Chen", city: "Melbourne, Australia", since: "2025-04-30", plan: "premium", region: "AU", budget: [1000, 1800], household: 2, interests: ["refrigerators", "washing-machines"], brands: ["b-ovea"], energy: "high", space: [600, 1900, 680] },
  { id: "u-oliver", name: "Oliver Brandt", city: "Hamburg, Germany", since: "2026-02-11", plan: "free", region: "EU", budget: [900, 1500], household: 1, interests: ["laptops"], brands: ["b-tervo"], energy: "balanced", space: null },
  { id: "u-hannah", name: "Hannah Okoro", city: "Atlanta, Georgia, US", since: "2025-08-15", plan: "premium", region: "US", budget: [1800, 3200], household: 6, interests: ["refrigerators", "washing-machines"], brands: ["b-brightwater", "b-kestrel"], energy: "balanced", space: [915, 1800, 770] },
  { id: "u-lucas", name: "Lucas Moreau", city: "Lyon, France", since: "2026-05-03", plan: "free", region: "EU", budget: [500, 1100], household: 2, interests: ["refrigerators"], brands: ["b-aurelle"], energy: "high", space: [600, 1880, 660] },
  { id: "u-priyanka", name: "Priyanka Desai", city: "San Jose, California, US", since: "2025-12-01", plan: "premium", region: "US", budget: [1200, 2400], household: 3, interests: ["laptops", "televisions"], brands: ["b-vireo"], energy: "balanced", space: null },
  { id: "u-tom", name: "Tom Gallagher", city: "Dublin, Ireland", since: "2026-03-27", plan: "free", region: "EU", budget: [300, 700], household: 1, interests: ["refrigerators"], brands: [], energy: "low", space: [500, 860, 560] },
  { id: "u-ruth", name: "Ruth Abernathy", city: "Halifax, Canada", since: "2025-07-09", plan: "premium", region: "CA", budget: [1000, 2000], household: 2, interests: ["refrigerators", "washing-machines"], brands: ["b-halden"], energy: "high", space: [610, 2040, 680] },
  { id: "u-kenji", name: "Kenji Watanabe", city: "Brisbane, Australia", since: "2026-06-18", plan: "free", region: "AU", budget: [1500, 2600], household: 4, interests: ["televisions"], brands: ["b-lumora", "b-vireo"], energy: "balanced", space: null },
];

export const otherCustomers: Customer[] = rows.map((r, i) => ({
  id: r.id,
  name: r.name,
  email: `${r.name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
  avatar: avatarAt(i + 6),
  location: r.city,
  memberSince: r.since,
  plan: r.plan,
  preferences: {
    budgetMin: r.budget[0],
    budgetMax: r.budget[1],
    householdSize: r.household,
    region: r.region,
    interests: r.interests,
    preferredBrandIds: r.brands,
    energyPriority: r.energy,
    space: r.space ? { widthMm: r.space[0], heightMm: r.space[1], depthMm: r.space[2] } : null,
    priorities: r.energy === "high" ? { energy: 0.24, reliability: 0.18 } : r.energy === "low" ? { value: 0.26, performance: 0.2 } : {},
    reviewPreference: i % 3 === 0 ? "verified-only" : "all",
  },
}));

export const customers: Customer[] = [currentUser, ...otherCustomers];

export function getCustomer(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}
