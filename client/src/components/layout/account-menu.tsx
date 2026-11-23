"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, LogOut, RotateCcw, Settings, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { avatarAt } from "@/data/images";
import { routes } from "@/config/routes";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/menus";
import { UserAvatar } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";

export function AccountMenu({ name, subtitle, avatar }: { name?: string; subtitle?: string; avatar?: string }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const profile = useAppStore((s) => s.profile);
  const plan = useAppStore((s) => s.plan);
  const reset = useAppStore((s) => s.resetDemo);
  const displayName = name ?? (hydrated ? profile.name : "Alex Morgan");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40" aria-label="Account menu">
          <UserAvatar src={avatar ?? avatarAt(2)} name={displayName} className="size-9" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <div className="flex items-center gap-3 px-2.5 py-2">
          <UserAvatar src={avatar ?? avatarAt(2)} name={displayName} className="size-10" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-[12px] text-muted-foreground">{subtitle ?? (hydrated ? profile.email : "alex.morgan@example.com")}</p>
          </div>
        </div>
        {!name && (
          <div className="px-2.5 pb-2">
            <Badge variant={plan === "premium" ? "brand" : "default"}>
              <Sparkles /> {hydrated && plan === "free" ? "Free plan" : "Premium plan"}
            </Badge>
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={routes.profile}>
            <User /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={routes.settings}>
            <Settings /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={routes.billing}>
            <CreditCard /> Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            reset();
            toast.success("Demo data reset", { description: "Saved items, comparisons and preferences restored to defaults." });
          }}
        >
          <RotateCcw /> Reset demo data
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            toast("Signed out of the demo", { description: "No real session existed — this is a front-end preview." });
            router.push(routes.login);
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
