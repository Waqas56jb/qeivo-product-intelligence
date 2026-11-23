import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-[10px] border border-input bg-surface px-3.5 py-2.5 text-[15px] shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-subtle-foreground sm:text-sm",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 aria-invalid:border-danger disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
