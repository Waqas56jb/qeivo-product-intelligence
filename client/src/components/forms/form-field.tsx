"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";

/** Inline validation message. role="alert" so screen readers announce it. */
export function FieldError({ id, message, className }: { id?: string; message?: string; className?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className={cn("flex items-start gap-1.5 text-[12px] font-medium leading-snug text-danger-foreground", className)}>
      <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

/**
 * Label + control + description + inline error. Pass `htmlFor` matching the control id
 * and spread `fieldAria(id, error)` on the control to wire aria-invalid / aria-describedby.
 */
export function FormField({
  label,
  htmlFor,
  error,
  description,
  required,
  optional,
  children,
  className,
  labelAction,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  error?: string;
  description?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
  labelAction?: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div className="flex min-h-4 items-center justify-between gap-2">
        <Label htmlFor={htmlFor}>
          {label}
          {required && (
            <span className="-ml-1 text-danger" aria-hidden>
              *
            </span>
          )}
          {optional && <span className="text-[12px] font-normal text-subtle-foreground">Optional</span>}
        </Label>
        {labelAction}
      </div>
      {children}
      {error ? (
        <FieldError id={htmlFor ? `${htmlFor}-error` : undefined} message={error} />
      ) : description ? (
        <p id={htmlFor ? `${htmlFor}-description` : undefined} className="text-[12px] leading-snug text-subtle-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

/** aria props for a control rendered inside <FormField htmlFor={id}>. */
export function fieldAria(id: string, error?: string, hasDescription?: boolean) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hasDescription ? `${id}-description` : undefined,
  } as const;
}

/** Titled group of fields inside a card. */
export function FormSection({
  id,
  title,
  description,
  icon,
  action,
  children,
  className,
  contentClassName,
}: {
  id?: string;
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 rounded-[14px] border border-border bg-card shadow-xs", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          {icon && <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-muted-foreground [&_svg]:size-4">{icon}</span>}
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
            {description && <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action}
      </header>
      <div className={cn("grid gap-5 p-5 sm:p-6", contentClassName)}>{children}</div>
    </section>
  );
}

export interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

/** Controlled select for forms. */
export function SelectField({
  id,
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  error,
  size,
  className,
  ariaLabel,
  disabled,
}: {
  id?: string;
  value: string | undefined;
  onValueChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  size?: "sm" | "default";
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <Select value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        size={size}
        aria-label={ariaLabel}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className={cn(error && "border-danger", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Input with a fixed unit prefix/suffix (mm, kg, kWh/yr, $ …). */
export function InputAffix({ suffix, prefix, children, className }: { suffix?: React.ReactNode; prefix?: React.ReactNode; children: React.ReactElement<{ className?: string }>; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {prefix && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">{prefix}</span>}
      {React.cloneElement(children, { className: cn(children.props.className, prefix && "pl-8", suffix && "pr-16") })}
      {suffix && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-medium text-subtle-foreground">{suffix}</span>}
    </div>
  );
}

/** Sticky action bar for long forms — stays reachable on mobile. */
export function FormActions({ children, status, className }: { children: React.ReactNode; status?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("sticky bottom-0 z-20 -mx-4 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:bottom-4 lg:mx-0 lg:rounded-[14px] lg:border lg:bg-card/95 lg:shadow-md", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-[13px] text-muted-foreground">{status}</div>
        <div className="flex flex-wrap gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">{children}</div>
      </div>
    </div>
  );
}

/** Summarises form errors at submit time with jump links to each field. */
export function ErrorSummary({ errors, className }: { errors: { id: string; message: string }[]; className?: string }) {
  if (!errors.length) return null;
  return (
    <div role="alert" className={cn("rounded-[14px] border border-danger/30 bg-danger-soft/50 p-4", className)}>
      <p className="flex items-center gap-2 text-[14px] font-semibold text-danger-foreground">
        <AlertCircle className="size-4" /> {errors.length === 1 ? "1 field needs attention" : `${errors.length} fields need attention`}
      </p>
      <ul className="mt-2 grid gap-1 pl-6 text-[13px]">
        {errors.slice(0, 8).map((e) => (
          <li key={e.id} className="list-disc text-danger-foreground marker:text-danger/60">
            <button
              type="button"
              className="text-left underline-offset-2 hover:underline"
              onClick={() => {
                const el = document.getElementById(e.id);
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
                el?.focus({ preventScroll: true });
              }}
            >
              {e.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Flattens RHF's nested error object into [{ id, message }] using a field→element id mapper. */
export function collectErrors(errors: object, toId: (path: string) => string = (p) => p.replace(/\./g, "-")): { id: string; message: string }[] {
  const out: { id: string; message: string }[] = [];
  const walk = (node: unknown, path: string) => {
    if (!node || typeof node !== "object") return;
    const rec = node as Record<string, unknown>;
    if (typeof rec.message === "string" && rec.message) {
      out.push({ id: toId(path), message: rec.message });
      return;
    }
    for (const [k, v] of Object.entries(rec)) {
      if (k === "ref" || k === "type" || k === "types") continue;
      walk(v, path ? `${path}.${k}` : k);
    }
  };
  walk(errors, "");
  return out;
}
