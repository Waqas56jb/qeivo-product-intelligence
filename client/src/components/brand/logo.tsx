import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Qeivo logo — geometric "lens" symbol + wordmark.
 * The symbol is a ring (the lens of evidence) with a lime "insight" tail.
 * Swap `LogoMark` to substitute final brand artwork; every usage goes through here.
 */
export function LogoMark({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8 shrink-0", className)}>
      <rect width="32" height="32" rx="9" className={inverted ? "fill-white" : "fill-navy-900 dark:fill-teal-500"} />
      <circle cx="15" cy="15" r="7.25" fill="none" strokeWidth="3.2" className={inverted ? "stroke-navy-900" : "stroke-teal-400 dark:stroke-navy-950"} />
      <path d="M19.6 19.6 L24 24" strokeWidth="3.2" strokeLinecap="round" className="stroke-[#B6DB70]" />
      <circle cx="15" cy="15" r="2.1" className={inverted ? "fill-teal-600" : "fill-white dark:fill-navy-950"} />
    </svg>
  );
}

export function Logo({ className, href = "/", inverted = false, size = "default" }: { className?: string; href?: string | null; inverted?: boolean; size?: "sm" | "default" | "lg" }) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark inverted={inverted} className={size === "sm" ? "size-7" : size === "lg" ? "size-10" : "size-8"} />
      <span className={cn("font-semibold tracking-[-0.04em]", size === "sm" ? "text-[19px]" : size === "lg" ? "text-[28px]" : "text-[22px]", inverted ? "text-white" : "text-foreground")}>
        qeivo
      </span>
    </span>
  );
  if (href === null) return content;
  return (
    <Link href={href} aria-label="Qeivo home" className="rounded-[10px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
      {content}
    </Link>
  );
}
