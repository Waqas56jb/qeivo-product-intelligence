"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Check, Info, Monitor, Moon, Search, Sun, X } from "lucide-react";
import type { RegionCode } from "@/types";
import { REGION_LIST } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/menus";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { Hint } from "@/components/ui/tooltip";

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  destructive,
  onConfirm,
  children,
  requireText,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  children?: React.ReactNode;
  /** User must type this text to enable the confirm button */
  requireText?: string;
}) {
  const [typed, setTyped] = useState("");
  const blocked = requireText !== undefined && typed.trim() !== requireText;
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setTyped("");
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {requireText !== undefined && (
          <div className="space-y-2">
            <p className="text-[13px] text-muted-foreground">
              Type <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-foreground">{requireText}</span> to confirm.
            </p>
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} aria-label="Confirmation text" autoComplete="off" />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={blocked}
            onClick={() => {
              onConfirm();
              setTyped("");
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ThemeToggle({ className, variant = "icon" }: { className?: string; variant?: "icon" | "segmented" }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const hydrated = useHydrated();
  if (variant === "segmented") {
    const opts = [
      { v: "light", label: "Light", icon: Sun },
      { v: "dark", label: "Dark", icon: Moon },
      { v: "system", label: "System", icon: Monitor },
    ];
    return (
      <div role="radiogroup" aria-label="Theme" className={cn("inline-flex gap-1 rounded-[12px] bg-surface-2 p-1", className)}>
        {opts.map((o) => (
          <button
            key={o.v}
            role="radio"
            aria-checked={hydrated && theme === o.v}
            onClick={() => setTheme(o.v)}
            className={cn("inline-flex h-9 items-center gap-2 rounded-[9px] px-3 text-[13px] font-medium text-muted-foreground transition-colors", hydrated && theme === o.v && "bg-surface text-foreground shadow-sm")}
          >
            <o.icon className="size-4" /> {o.label}
          </button>
        ))}
      </div>
    );
  }
  const isDark = hydrated && resolvedTheme === "dark";
  return (
    <DropdownMenu>
      <Hint label="Theme">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={cn("text-muted-foreground", className)} aria-label="Change theme">
            {isDark ? <Moon /> : <Sun />}
          </Button>
        </DropdownMenuTrigger>
      </Hint>
      <DropdownMenuContent>
        {[
          { v: "light", label: "Light", icon: Sun },
          { v: "dark", label: "Dark", icon: Moon },
          { v: "system", label: "System", icon: Monitor },
        ].map((o) => (
          <DropdownMenuItem key={o.v} onSelect={() => setTheme(o.v)}>
            <o.icon /> {o.label}
            {hydrated && theme === o.v && <Check className="ml-auto !text-brand" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RegionSelect({ className, compact }: { className?: string; compact?: boolean }) {
  const region = useAppStore((s) => s.region);
  const setRegion = useAppStore((s) => s.setRegion);
  const hydrated = useHydrated();
  const value = hydrated ? region : "US";
  return (
    <Select value={value} onValueChange={(v) => setRegion(v as RegionCode)}>
      <SelectTrigger size="sm" className={cn(compact ? "w-[112px]" : "w-[180px]", className)} aria-label="Region and currency">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={compact ? "w-[200px]" : undefined}>
        {REGION_LIST.map((r) => (
          <SelectItem key={r.code} value={r.code}>
            {!compact && <span aria-hidden>{r.flag}</span>} {compact ? r.code : r.name} <span className="text-subtle-foreground">{r.currency}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DemoDataNotice({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 text-[12px] leading-relaxed text-subtle-foreground", className)}>
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <span>
        Demonstration build. All brands, products, prices, reviews and sources are fictional seed data and do not represent real manufacturers or verified information.
      </span>
    </p>
  );
}

export function SearchField({ value, onChange, placeholder = "Search…", className, autoFocus, ariaLabel }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; autoFocus?: boolean; ariaLabel?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={ariaLabel ?? placeholder} className="pl-10 pr-9" autoFocus={autoFocus} />
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="Clear search" className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-[7px] text-muted-foreground hover:bg-surface-2 hover:text-foreground">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

/** Horizontal filter row: search + chips/selects + trailing actions. */
export function FilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center", className)}>{children}</div>;
}

export function FilterChip({ active, onClick, children, count }: { active?: boolean; onClick?: () => void; children: React.ReactNode; count?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
      )}
    >
      {children}
      {count !== undefined && <span className={cn("tabular text-[11px]", active ? "opacity-80" : "text-subtle-foreground")}>{count}</span>}
    </button>
  );
}

export { DropdownMenuLabel };
