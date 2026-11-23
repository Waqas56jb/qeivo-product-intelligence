import type { Plan } from "@/types";

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Evidence-backed product research for occasional purchases.",
    allowances: [
      { label: "Product comparisons", value: "3 per month" },
      { label: "Ask Qeivo messages", value: "20 per month" },
      { label: "Saved products", value: "15" },
      { label: "Research history", value: "30 days" },
      { label: "Price alerts", value: "2 active" },
      { label: "Owned products", value: "2" },
    ],
    features: ["Qeivo scores with evidence labels", "Retailer price comparison", "Community Q&A", "Buying and DIY guides"],
  },
  {
    id: "premium",
    name: "Premium",
    priceMonthly: 12,
    priceYearly: 115,
    description: "For households planning a major purchase or managing several appliances.",
    highlight: true,
    allowances: [
      { label: "Product comparisons", value: "Unlimited" },
      { label: "Ask Qeivo messages", value: "500 per month" },
      { label: "Saved products", value: "Unlimited" },
      { label: "Research history", value: "Unlimited" },
      { label: "Price alerts", value: "25 active" },
      { label: "Owned products", value: "Unlimited" },
    ],
    features: ["Everything in Free", "Personalised scoring weights", "Space-fit compatibility checker", "52-week price history", "Maintenance reminders & warranty tracking", "Export comparisons as PDF"],
  },
  {
    id: "team",
    name: "Team",
    priceMonthly: 39,
    priceYearly: 374,
    description: "Shared research workspaces for property managers, designers and procurement teams. Priced per seat.",
    allowances: [
      { label: "Seats", value: "From 3, billed per seat" },
      { label: "Research projects", value: "Unlimited" },
      { label: "Ask Qeivo messages", value: "2,000 per seat per month" },
      { label: "Approval workflows", value: "Included" },
      { label: "API requests", value: "50,000 per month" },
      { label: "Research history", value: "Unlimited" },
    ],
    features: ["Everything in Premium", "Shared projects, notes and approvals", "Bulk quantity pricing views", "Role-based access", "API access (read)", "Priority support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Manufacturers, retailers and large procurement teams with custom data and integration needs.",
    allowances: [
      { label: "Seats", value: "Unlimited" },
      { label: "API requests", value: "Custom volume" },
      { label: "Data feeds", value: "Product, price and review feeds" },
      { label: "SLA", value: "99.9% uptime" },
      { label: "Data retention", value: "Custom" },
      { label: "Support", value: "Dedicated success manager" },
    ],
    features: ["Everything in Team", "SSO / SAML and SCIM", "Manufacturer & supplier dashboards", "Verified product-data programme", "Custom contracts and invoicing", "Audit log export"],
  },
];

export function getPlan(id: Plan["id"]): Plan | undefined {
  return plans.find((p) => p.id === id);
}
