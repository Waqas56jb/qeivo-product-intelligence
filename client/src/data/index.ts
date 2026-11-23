/**
 * Qeivo demo data — single entry point.
 * All data is static and deterministic (no Math.random / Date.now).
 */

// Catalogue
export * from "./products";
export * from "./offers/retailers";
export * from "./offers/retailer-offers";
export * from "./offers/price-history";
export * from "./images";
export * from "./sources/sources";

// Content
export * from "./reviews";
export * from "./creators";
export * from "./videos";
export * from "./guides";
export * from "./community";
export * from "./documents/documents";

// People & organisations
export * from "./users/customers";
export * from "./users/profiles";
export * from "./companies/manufacturers";
export * from "./companies/suppliers";
export * from "./companies/team";
export * from "./workspaces/workspaces";
export * from "./workspaces/projects";

// Customer research
export * from "./research/saved-products";
export * from "./research/comparisons";
export * from "./research/owned-products";
export * from "./research/price-watch";
export * from "./conversations/conversations";
export * from "./notifications/notifications";

// Billing
export * from "./subscriptions/plans";
export * from "./subscriptions/invoices";

// Developer platform
export * from "./api/keys";
export * from "./api/usage";

// Data operations & admin preview
export * from "./imports/import-history";
export * from "./imports/revisions";
export * from "./admin-preview/audit-log";
export * from "./admin-preview/reports";

// Dashboards
export * from "./analytics/manufacturer";
export * from "./analytics/supplier";
export * from "./analytics/creator";
