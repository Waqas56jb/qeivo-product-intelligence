"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Building2, ShoppingBag, User, Video } from "lucide-react";
import { toast } from "sonner";
import type { DemoRole } from "@/types";
import { roleMeta } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";

/** Centred column inside the auth form panel. */
export function AuthCard({ children, className, wide }: { children: React.ReactNode; className?: string; wide?: boolean }) {
  return <div className={cn("mx-auto flex w-full flex-1 flex-col justify-center px-4 py-6 sm:px-8 sm:py-10", wide ? "max-w-[560px]" : "max-w-[440px]", className)}>{children}</div>;
}

export function AuthHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: React.ReactNode }) {
  return (
    <div className="mb-7">
      {eyebrow && <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-soft-foreground">{eyebrow}</p>}
      <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[32px]">{title}</h1>
      {description && <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
    </div>
  );
}

function GoogleGlyph() {
  // Neutral multi-tone "G" mark drawn with theme tokens (no brand hex).
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-[18px]">
      <path d="M21.6 12.23c0-.68-.06-1.36-.18-2.02H12v3.83h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.24c1.9-1.75 2.96-4.33 2.96-7.34Z" className="fill-info" />
      <path d="M12 22c2.7 0 4.98-.9 6.64-2.43l-3.24-2.5c-.9.6-2.05.95-3.4.95-2.6 0-4.82-1.76-5.6-4.12H3.06v2.58A10 10 0 0 0 12 22Z" className="fill-success" />
      <path d="M6.4 13.9a6 6 0 0 1 0-3.8V7.52H3.06a10 10 0 0 0 0 8.96L6.4 13.9Z" className="fill-warning" />
      <path d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.52L6.4 10.1C7.18 7.74 9.4 5.98 12 5.98Z" className="fill-danger" />
    </svg>
  );
}

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full"
      onClick={() => toast.info("Google sign-in is a visual preview", { description: "This demo has no OAuth connection — use the form or a demo shortcut instead." })}
    >
      <GoogleGlyph /> {label}
    </Button>
  );
}

export function OrDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3 text-[12px] uppercase tracking-wider text-subtle-foreground" role="separator">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export const SIGNUP_ROLES: { role: Exclude<DemoRole, "developer">; icon: typeof User; title: string; body: string }[] = [
  { role: "customer", icon: User, title: "Customer", body: "Research and compare products for my home" },
  { role: "manufacturer", icon: Building2, title: "Manufacturer", body: "Manage product data, documents and insights" },
  { role: "supplier", icon: ShoppingBag, title: "Supplier", body: "List offers, stock and retail pricing" },
  { role: "creator", icon: Video, title: "Creator", body: "Submit reviews and videos for evidence" },
];

/** "Continue as demo …" shortcuts — same semantics as the RoleSwitcher. */
export function DemoRoleButtons() {
  const router = useRouter();
  const setRole = useAppStore((s) => s.setRole);
  return (
    <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
      {SIGNUP_ROLES.map(({ role, icon: Icon, title }) => {
        const m = roleMeta[role];
        return (
          <button
            key={role}
            type="button"
            onClick={() => {
              setRole(role);
              toast.success(`Signed in as demo ${title.toLowerCase()}`, { description: `${m.org} · no credentials were checked` });
              router.push(m.home);
            }}
            className="group flex min-h-12 items-center gap-2.5 rounded-[12px] border border-border bg-surface px-3 py-2 text-left shadow-xs outline-none transition-all hover:border-brand/50 hover:bg-brand-soft/30 focus-visible:ring-[3px] focus-visible:ring-ring/30"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-surface-2 text-muted-foreground transition-colors group-hover:bg-brand-soft group-hover:text-brand-soft-foreground">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] leading-tight text-subtle-foreground">Continue as demo</span>
              <span className="block truncate text-[13.5px] font-semibold leading-tight">{title.toLowerCase()}</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-subtle-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </button>
        );
      })}
    </div>
  );
}
