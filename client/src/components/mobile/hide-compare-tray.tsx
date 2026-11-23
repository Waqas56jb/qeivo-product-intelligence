/**
 * Hides the global floating CompareTray while a full-screen surface (chat composer,
 * scanner, sticky wizard footer) owns the bottom of the viewport.
 * Scoped by a marker element so it only applies while this component is mounted.
 * TODO(shared): replace with a `hideCompareTray` flag on AppShell/CompareTray.
 */
export function HideCompareTray({ scope = "all" }: { scope?: "all" | "mobile" }) {
  const rule = "body:has([data-hide-compare-tray]) div.fixed.max-w-2xl.z-40{display:none!important}";
  return (
    <>
      <span data-hide-compare-tray hidden />
      <style>{scope === "mobile" ? `@media (max-width: 1023px){${rule}}` : rule}</style>
    </>
  );
}
