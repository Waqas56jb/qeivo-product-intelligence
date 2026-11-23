/**
 * The AppShell's floating CompareTray sits directly after the mobile bottom navigation.
 * Pages that provide their own sticky action bar (product detail on mobile) or that ARE the
 * comparison (compare page) hide it to avoid stacked floating bars.
 * TODO(shared): replace with a `hideOn` prop / store flag on CompareTray.
 */
export function HideCompareTray({ scope = "mobile" }: { scope?: "mobile" | "all" }) {
  const rule = `nav[aria-label="Primary"] + div.fixed{display:none !important}`;
  return <style>{scope === "all" ? rule : `@media (max-width: 1023.98px){${rule}}`}</style>;
}
