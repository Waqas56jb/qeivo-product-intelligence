"use client";

/**
 * Small Radix-based primitives restyled for Qeivo:
 * Label, Separator, Checkbox, Switch, Slider, Progress, Avatar, Tooltip, RadioGroup.
 */
import * as React from "react";
import {
  Avatar as AvatarPrimitive,
  Checkbox as CheckboxPrimitive,
  Label as LabelPrimitive,
  Progress as ProgressPrimitive,
  RadioGroup as RadioGroupPrimitive,
  Separator as SeparatorPrimitive,
  Slider as SliderPrimitive,
  Switch as SwitchPrimitive,
} from "radix-ui";
import { Check, Minus } from "lucide-react";
import { cn, initials } from "@/lib/utils";

export function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root data-slot="label" className={cn("flex select-none items-center gap-2 text-[13px] font-medium leading-none text-foreground peer-disabled:opacity-50", className)} {...props} />;
}

export function Separator({ className, orientation = "horizontal", decorative = true, ...props }: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={cn("shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px", className)}
      {...props}
    />
  );
}

export function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer grid size-[18px] shrink-0 place-items-center rounded-[5px] border border-border-strong bg-surface shadow-xs outline-none transition-colors",
        "focus-visible:ring-[3px] focus-visible:ring-ring/30 data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-brand-foreground data-[state=indeterminate]:border-brand data-[state=indeterminate]:bg-brand disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="grid place-items-center">
        {props.checked === "indeterminate" ? <Minus className="size-3.5" strokeWidth={3} /> : <Check className="size-3.5" strokeWidth={3} />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-transparent p-0.5 shadow-xs outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:opacity-50 data-[state=checked]:bg-brand data-[state=unchecked]:bg-surface-3",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
    </SwitchPrimitive.Root>
  );
}

export function Slider({ className, defaultValue, value, min = 0, max = 100, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const values = React.useMemo(() => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min]), [value, defaultValue, min]);
  return (
    <SliderPrimitive.Root data-slot="slider" defaultValue={defaultValue} value={value} min={min} max={max} className={cn("relative flex w-full touch-none select-none items-center py-2 data-[disabled]:opacity-50", className)} {...props}>
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-surface-3">
        <SliderPrimitive.Range className="absolute h-full bg-brand" />
      </SliderPrimitive.Track>
      {values.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          aria-label={props["aria-label"] ?? "Value"}
          className="block size-5 rounded-full border-2 border-brand bg-white shadow-md outline-none transition-[box-shadow] hover:ring-4 hover:ring-brand/15 focus-visible:ring-4 focus-visible:ring-brand/25"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export function Progress({ className, value, indicatorClassName, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }) {
  return (
    <ProgressPrimitive.Root data-slot="progress" value={value} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-surface-3", className)} {...props}>
      <ProgressPrimitive.Indicator className={cn("h-full rounded-full bg-brand transition-[width] duration-500 ease-out", indicatorClassName)} style={{ width: `${Math.min(100, Math.max(0, value ?? 0))}%` }} />
    </ProgressPrimitive.Root>
  );
}

export function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return <AvatarPrimitive.Root data-slot="avatar" className={cn("relative flex size-9 shrink-0 overflow-hidden rounded-full bg-surface-2 ring-1 ring-border", className)} {...props} />;
}
export function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image className={cn("aspect-square size-full object-cover", className)} {...props} />;
}
export function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return <AvatarPrimitive.Fallback className={cn("flex size-full items-center justify-center bg-brand-soft text-[12px] font-semibold text-brand-soft-foreground", className)} {...props} />;
}
/** Avatar with photo and initials fallback. */
export function UserAvatar({ src, name, className }: { src?: string; name: string; className?: string }) {
  return (
    <Avatar className={className}>
      {src ? <AvatarImage src={src} alt="" /> : null}
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}

export function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} />;
}
export function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn("grid aspect-square size-[18px] shrink-0 place-items-center rounded-full border border-border-strong bg-surface shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 data-[state=checked]:border-brand", className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="size-2.5 rounded-full bg-brand" />
    </RadioGroupPrimitive.Item>
  );
}
/** Card-style radio option used in wizards and settings. */
export const RadioCard = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof RadioGroupPrimitive.Item>>(function RadioCard({ className, children, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full items-start gap-3 rounded-[12px] border border-border bg-surface p-4 text-left shadow-xs outline-none transition-all hover:border-border-strong focus-visible:ring-[3px] focus-visible:ring-ring/30",
        "data-[state=checked]:border-brand data-[state=checked]:bg-brand-soft/40 data-[state=checked]:ring-1 data-[state=checked]:ring-brand",
        className,
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  );
});
