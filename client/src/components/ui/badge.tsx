import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-transparent bg-surface-2 text-foreground",
        outline: "border-border-strong text-muted-foreground",
        brand: "border-transparent bg-brand-soft text-brand-soft-foreground",
        lime: "border-transparent bg-lime-soft text-lime-soft-foreground",
        success: "border-transparent bg-success-soft text-success",
        warning: "border-transparent bg-warning-soft text-warning-foreground",
        danger: "border-transparent bg-danger-soft text-danger-foreground",
        info: "border-transparent bg-info-soft text-info-foreground",
        solid: "border-transparent bg-primary text-primary-foreground",
        sponsored: "border-warning/40 bg-warning-soft text-warning-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}
