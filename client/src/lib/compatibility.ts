import type { Product } from "@/types";

export type FitStatus = "fits" | "no-fit" | "unknown";

export interface SpaceInput {
  widthMm: number | null;
  heightMm: number | null;
  depthMm: number | null;
  /** Clear space in front of the opening for doors to swing */
  doorClearanceMm: number | null;
  /** Narrowest doorway or hallway on the delivery route */
  accessWidthMm: number | null;
  hasWaterSupply: boolean | null;
}

export interface CompatibilityCheck {
  id: string;
  label: string;
  status: FitStatus;
  required: string;
  available: string;
  detail: string;
}

const mm = (v: number) => `${v.toLocaleString("en-US")} mm`;

/**
 * Deterministic compatibility checks. Unknown inputs or unpublished requirements
 * always return "unknown" — never "fits".
 */
export function checkCompatibility(product: Product, space: SpaceInput): CompatibilityCheck[] {
  const vent = product.installation.ventilationMm;
  const { widthMm: w, heightMm: h, depthMm: d } = product.dimensions;
  const checks: CompatibilityCheck[] = [];

  const dimCheck = (id: string, label: string, productValue: number, ventValue: number | null, avail: number | null) => {
    if (avail === null) {
      checks.push({ id, label, status: "unknown", required: vent ? mm(productValue + (ventValue ?? 0)) : mm(productValue), available: "Not provided", detail: "Enter this measurement to check the fit." });
      return;
    }
    if (productValue > avail) {
      checks.push({ id, label, status: "no-fit", required: mm(productValue), available: mm(avail), detail: `The appliance is ${mm(productValue - avail)} too large before ventilation is considered.` });
      return;
    }
    if (ventValue === null) {
      checks.push({ id, label, status: "unknown", required: `${mm(productValue)} + unpublished clearance`, available: mm(avail), detail: `The appliance itself fits with ${mm(avail - productValue)} to spare, but the manufacturer has not published ventilation clearance, so the fit cannot be confirmed.` });
      return;
    }
    const need = productValue + ventValue;
    checks.push(
      need <= avail
        ? { id, label, status: "fits", required: mm(need), available: mm(avail), detail: `Fits including ${mm(ventValue)} ventilation, with ${mm(avail - need)} to spare.` }
        : { id, label, status: "no-fit", required: mm(need), available: mm(avail), detail: `The appliance fits physically but leaves only ${mm(avail - productValue)} for ventilation; ${mm(ventValue)} is required.` },
    );
  };

  dimCheck("width", "Width", w, vent ? vent.sides * 2 : null, space.widthMm);
  dimCheck("height", "Height", h, vent ? vent.top : null, space.heightMm);
  dimCheck("depth", "Depth", d, vent ? vent.back : null, space.depthMm);

  const swing = product.installation.doorSwingMm;
  if (swing !== null) {
    if (space.doorClearanceMm === null) checks.push({ id: "door", label: "Door clearance", status: "unknown", required: mm(swing), available: "Not provided", detail: "Measure the free space in front of the appliance." });
    else
      checks.push(
        space.doorClearanceMm >= swing
          ? { id: "door", label: "Door clearance", status: "fits", required: mm(swing), available: mm(space.doorClearanceMm), detail: "Doors can open past 90° so drawers slide out fully." }
          : { id: "door", label: "Door clearance", status: "no-fit", required: mm(swing), available: mm(space.doorClearanceMm), detail: "Doors will not open far enough to remove crisper drawers." },
      );
  }

  const access = Math.min(w, d) + 20;
  if (space.accessWidthMm === null) checks.push({ id: "access", label: "Delivery access", status: "unknown", required: mm(access), available: "Not provided", detail: "Measure the narrowest doorway or hallway on the delivery route." });
  else checks.push(space.accessWidthMm >= access ? { id: "access", label: "Delivery access", status: "fits", required: mm(access), available: mm(space.accessWidthMm), detail: "Can be carried through the narrowest point (doors may need removing)." } : { id: "access", label: "Delivery access", status: "no-fit", required: mm(access), available: mm(space.accessWidthMm), detail: "Too wide for the delivery route even with doors removed." });

  const needsWater = product.features.some((f) => /ice maker|dispenser/i.test(f));
  if (needsWater) {
    if (space.hasWaterSupply === null) checks.push({ id: "water", label: "Water supply", status: "unknown", required: "Plumbed 1/4\" supply", available: "Not provided", detail: "The ice maker / dispenser needs a water connection." });
    else checks.push({ id: "water", label: "Water supply", status: space.hasWaterSupply ? "fits" : "no-fit", required: "Plumbed 1/4\" supply", available: space.hasWaterSupply ? "Available" : "Not available", detail: space.hasWaterSupply ? "Connect within 2 m of the installation position." : "The ice maker and dispenser will not work without a water connection." });
  }

  return checks;
}

export function overallFit(checks: CompatibilityCheck[]): FitStatus {
  if (checks.some((c) => c.status === "no-fit")) return "no-fit";
  if (checks.some((c) => c.status === "unknown")) return "unknown";
  return "fits";
}

/** Quick dimensional fit used by recommendations and catalog filters. */
export function physicallyFits(product: Product, space: { widthMm: number; heightMm: number; depthMm: number } | null): FitStatus {
  if (!space) return "unknown";
  const { widthMm, heightMm, depthMm } = product.dimensions;
  if (widthMm > space.widthMm || heightMm > space.heightMm || depthMm > space.depthMm) return "no-fit";
  return product.installation.ventilationMm ? "fits" : "unknown";
}
