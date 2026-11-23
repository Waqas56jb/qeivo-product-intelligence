import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium transition-[background-color,color,box-shadow,transform,border-color] duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        brand: "bg-brand text-brand-foreground shadow-xs hover:bg-brand-strong",
        secondary: "bg-secondary text-secondary-foreground hover:bg-surface-3",
        outline: "border border-border-strong bg-surface text-foreground shadow-xs hover:bg-surface-2",
        ghost: "text-foreground hover:bg-surface-2",
        subtle: "bg-brand-soft text-brand-soft-foreground hover:bg-brand-soft/70",
        destructive: "bg-danger text-white shadow-xs hover:bg-danger/90",
        link: "h-auto px-0 text-brand-soft-foreground underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 rounded-[8px] px-3 text-[13px]",
        default: "h-10 px-4",
        lg: "h-12 rounded-[12px] px-6 text-[15px]",
        xl: "h-14 rounded-[14px] px-7 text-base",
        icon: "size-10",
        "icon-sm": "size-8 rounded-[8px]",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" type={asChild ? undefined : (type ?? "button")} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
