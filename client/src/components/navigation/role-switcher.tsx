"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import type { DemoRole } from "@/types";
import { roleMeta } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/menus";

const ORDER: DemoRole[] = ["customer", "manufacturer", "supplier", "creator", "developer"];

/** Presenter tool: switch between customer and business experiences without a backend. */
export function RoleSwitcher({ className, compact, current }: { className?: string; compact?: boolean; current?: DemoRole }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const storeRole = useAppStore((s) => s.role);
  const setRole = useAppStore((s) => s.setRole);
  const role = current ?? (hydrated ? storeRole : "customer");
  const meta = roleMeta[role];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn("flex h-10 items-center gap-2 rounded-[10px] border border-dashed border-brand/50 bg-brand-soft/40 px-2.5 text-left text-[13px] outline-none transition-colors hover:bg-brand-soft/70 focus-visible:ring-[3px] focus-visible:ring-ring/30", className)}
          aria-label={`Demo role: ${meta.label}. Switch role`}
        >
          <FlaskConical className="size-4 shrink-0 text-brand-soft-foreground" />
          {!compact && (
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-brand-soft-foreground">Demo role</span>
              <span className="block truncate font-medium leading-tight">{meta.label}</span>
            </span>
          )}
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Explore as</DropdownMenuLabel>
        {ORDER.map((r) => {
          const m = roleMeta[r];
          return (
            <DropdownMenuItem
              key={r}
              onSelect={() => {
                setRole(r);
                toast.success(`Switched to ${m.label} view`, { description: `${m.org} · demo data` });
                router.push(m.home);
              }}
              className="items-start py-2"
            >
              <m.icon className="mt-0.5" />
              <span className="flex-1">
                <span className="block font-medium">{m.label}</span>
                <span className="block text-[12px] text-muted-foreground">{m.description}</span>
              </span>
              {r === role && <Check className="mt-0.5 !text-brand" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <p className="px-2.5 py-1.5 text-[11px] leading-snug text-subtle-foreground">Role switching is a presentation aid. No accounts or permissions are created.</p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
