import type { LucideIcon } from "lucide-react";
import { AlertTriangle, RotateCcw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-[20px] border border-dashed border-border-strong bg-surface/60 text-center", compact ? "gap-2 px-6 py-8" : "gap-3 px-6 py-14", className)}>
      <div className="relative">
        <div className="absolute inset-0 -z-0 scale-150 rounded-full bg-brand/10 blur-xl" aria-hidden />
        <div className={cn("relative grid place-items-center rounded-[14px] border border-border bg-surface shadow-sm", compact ? "size-10" : "size-14")}>
          <Icon className={cn("text-brand", compact ? "size-5" : "size-6")} />
        </div>
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className={cn("font-semibold", compact ? "text-sm" : "text-base")}>{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description = "We couldn't load this section. Your data is safe — try again.", onRetry, className }: { title?: string; description?: string; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cn("flex flex-col items-center gap-3 rounded-[20px] border border-danger/25 bg-danger-soft/50 px-6 py-12 text-center", className)}>
      <div className="grid size-12 place-items-center rounded-[14px] bg-danger-soft text-danger">
        <AlertTriangle className="size-6" />
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw /> Try again
        </Button>
      )}
    </div>
  );
}

export function LoadingSkeleton({ variant = "cards", count = 6, className }: { variant?: "cards" | "list" | "detail" | "table"; count?: number; className?: string }) {
  if (variant === "list" || variant === "table")
    return (
      <div className={cn("space-y-2", className)} aria-busy aria-label="Loading">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-[14px] border border-border bg-card p-4">
            <Skeleton className="size-12 rounded-[10px]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  if (variant === "detail")
    return (
      <div className={cn("grid gap-6 lg:grid-cols-[1.1fr_1fr]", className)} aria-busy aria-label="Loading">
        <Skeleton className="aspect-square rounded-[20px]" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full rounded-[14px]" />
          <Skeleton className="h-24 w-full rounded-[14px]" />
        </div>
      </div>
    );
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)} aria-busy aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-[14px] border border-border bg-card">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
