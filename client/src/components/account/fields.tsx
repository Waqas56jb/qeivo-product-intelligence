"use client";

/**
 * Form field wrappers used by auth, onboarding and account screens.
 * (Kept in account/ so they don't collide with a shared `components/forms` folder.)
 */
import * as React from "react";
import { AlertCircle, Check, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label, Switch } from "@/components/ui/primitives";

/** Labelled field: wires id, aria-invalid and aria-describedby onto its single child control. */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  labelAction,
  className,
  children,
}: {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  labelAction?: React.ReactNode;
  className?: string;
  children: React.ReactElement<Record<string, unknown>>;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  const control = React.cloneElement(children, {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  });
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex min-h-4 items-center justify-between gap-3">
        <Label htmlFor={id}>
          {label}
          {optional && <span className="font-normal text-subtle-foreground">(optional)</span>}
        </Label>
        {labelAction}
      </div>
      {control}
      {error ? (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-[12.5px] leading-snug text-danger-foreground">
          <AlertCircle className="mt-px size-3.5 shrink-0" /> {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[12.5px] leading-snug text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Password input with an accessible show/hide toggle. */
export function PasswordInput({ className, ...props }: React.ComponentProps<"input">) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className={cn("pr-12", className)} spellCheck={false} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-0 top-0 grid size-11 place-items-center rounded-r-[10px] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30 sm:size-10"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export const PASSWORD_RULES = [
  { id: "length", label: "8+ characters", test: (v: string) => v.length >= 8 },
  { id: "case", label: "Upper & lower case", test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: "number", label: "A number", test: (v: string) => /\d/.test(v) },
  { id: "symbol", label: "A symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

export function passwordScore(value: string): 0 | 1 | 2 | 3 | 4 {
  if (!value) return 0;
  let s = PASSWORD_RULES.filter((r) => r.test(value)).length;
  if (value.length >= 14 && s >= 3) s += 1;
  if (value.length < 8) s = Math.min(s, 1);
  return Math.min(4, Math.max(1, s)) as 0 | 1 | 2 | 3 | 4;
}

const STRENGTH = [
  { label: "Enter a password", bar: "bg-surface-3", text: "text-subtle-foreground" },
  { label: "Weak", bar: "bg-danger", text: "text-danger-foreground" },
  { label: "Fair", bar: "bg-warning", text: "text-warning-foreground" },
  { label: "Good", bar: "bg-brand", text: "text-brand-soft-foreground" },
  { label: "Strong", bar: "bg-success", text: "text-success" },
] as const;

/** Four-segment strength meter + rule checklist. Purely client-side guidance. */
export function PasswordStrength({ value, className }: { value: string; className?: string }) {
  const score = passwordScore(value);
  const meta = STRENGTH[score];
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden>
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className={cn("h-1.5 rounded-full transition-colors duration-300", i <= score ? meta.bar : "bg-surface-3")} />
          ))}
        </div>
        <span className={cn("w-[92px] text-right text-[12px] font-medium", meta.text)} aria-live="polite">
          <span className="sr-only">Password strength: </span>
          {meta.label}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {PASSWORD_RULES.map((r) => {
          const ok = r.test(value);
          return (
            <li key={r.id} className={cn("flex items-center gap-1.5 text-[12px]", ok ? "text-foreground" : "text-subtle-foreground")}>
              <span className={cn("grid size-3.5 place-items-center rounded-full transition-colors", ok ? "bg-success text-white" : "border border-border-strong")}>
                {ok && <Check className="size-2.5" strokeWidth={3.5} />}
              </span>
              {r.label}
              <span className="sr-only">{ok ? "(met)" : "(not met)"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Settings-style card section. */
export function SettingsCard({
  id,
  title,
  description,
  icon: Icon,
  actions,
  footer,
  className,
  children,
}: {
  id?: string;
  title: string;
  description?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={cn("scroll-mt-24 rounded-[14px] border border-border bg-card shadow-xs", className)}>
      <header className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-muted-foreground">
              <Icon className="size-[18px]" />
            </span>
          )}
          <div className="min-w-0">
            <h2 id={id ? `${id}-title` : undefined} className="text-[16px] font-semibold tracking-tight">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </header>
      <div className="px-5 py-5 sm:px-6">{children}</div>
      {footer && <footer className="flex flex-col-reverse gap-2 border-t border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end sm:px-6">{footer}</footer>}
    </section>
  );
}

/** Label + description + switch row. Whole row is a 44px+ target. */
export function SwitchRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  badge,
}: {
  id: string;
  label: string;
  description?: React.ReactNode;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-11 items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="flex flex-wrap items-center gap-2 text-[14px] font-medium leading-snug">
          {label}
          {badge}
        </label>
        {description && (
          <p id={`${id}-desc`} className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} aria-describedby={description ? `${id}-desc` : undefined} className="mt-0.5" />
    </div>
  );
}

/** Small "demo" pill used beside simulated actions. */
export function DemoPill({ className, children = "Demo" }: { className?: string; children?: React.ReactNode }) {
  return <span className={cn("inline-flex h-5 items-center rounded-full border border-dashed border-brand/50 bg-brand-soft/50 px-2 text-[10.5px] font-semibold uppercase tracking-wider text-brand-soft-foreground", className)}>{children}</span>;
}

/** Shared schema helpers (Zod v4). */
export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
