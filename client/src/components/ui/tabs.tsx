"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive, Tabs as TabsPrimitive, ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, variant = "pill", ...props }: React.ComponentProps<typeof TabsPrimitive.List> & { variant?: "pill" | "underline" }) {
  return (
    <TabsPrimitive.List
      data-variant={variant}
      className={cn(
        "scrollbar-none inline-flex max-w-full items-center overflow-x-auto",
        variant === "pill" ? "gap-1 rounded-[12px] bg-surface-2 p-1" : "gap-5 border-b border-border",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap text-[13px] font-medium text-muted-foreground outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:opacity-50 [&_svg]:size-4",
        "[[data-variant=pill]_&]:h-8 [[data-variant=pill]_&]:rounded-[9px] [[data-variant=pill]_&]:px-3 [[data-variant=pill]_&]:data-[state=active]:bg-surface [[data-variant=pill]_&]:data-[state=active]:text-foreground [[data-variant=pill]_&]:data-[state=active]:shadow-sm",
        "[[data-variant=underline]_&]:-mb-px [[data-variant=underline]_&]:h-10 [[data-variant=underline]_&]:border-b-2 [[data-variant=underline]_&]:border-transparent [[data-variant=underline]_&]:data-[state=active]:border-brand [[data-variant=underline]_&]:data-[state=active]:text-foreground",
        "hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0", className)} {...props} />;
}

export const Accordion = AccordionPrimitive.Root;
export function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={cn("border-b border-border last:border-b-0", className)} {...props} />;
}
export function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn("flex flex-1 items-center justify-between gap-4 py-4 text-left text-[15px] font-medium outline-none transition-colors hover:text-brand-soft-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30 [&[data-state=open]>svg]:rotate-180", className)}
        {...props}
      >
        {children}
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}
export function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content className="overflow-hidden text-sm text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" {...props}>
      <div className={cn("pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return <ToggleGroupPrimitive.Root className={cn("inline-flex items-center gap-1 rounded-[10px] border border-border bg-surface p-0.5", className)} {...props} />;
}
export function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-[8px] px-2 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30 data-[state=on]:bg-surface-2 data-[state=on]:text-foreground [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}
