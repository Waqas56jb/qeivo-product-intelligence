"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps extends Omit<ImageProps, "src" | "alt"> {
  src: string;
  alt: string;
  /** Tailwind aspect class for the wrapper, e.g. "aspect-[4/3]" */
  aspect?: string;
  wrapperClassName?: string;
  /** "cover" for photography, "contain" for product renders */
  fit?: "cover" | "contain";
  /** Render the shimmer while loading */
  shimmer?: boolean;
}

/**
 * Image with loading shimmer and a designed fallback. Uses next/image with fill
 * layout inside a sized wrapper so layout never shifts.
 */
export function ImageWithFallback({ src, alt, aspect, wrapperClassName, fit, className, shimmer = true, priority, sizes = "(max-width: 768px) 100vw, 50vw", ...props }: ImageWithFallbackProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;
  const loaded = loadedSrc === src;
  const isRender = src.startsWith("/images/products/");
  const objectFit = fit ?? (isRender ? "contain" : "cover");

  return (
    <div className={cn("relative overflow-hidden", aspect, wrapperClassName)}>
      {shimmer && !loaded && !failed && <div aria-hidden className="skeleton absolute inset-0" />}
      {failed ? (
        <div role="img" aria-label={alt} className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-surface-2 to-surface-3 text-subtle-foreground">
          <svg viewBox="0 0 32 32" aria-hidden className="size-9 opacity-60">
            <circle cx="15" cy="15" r="7.25" fill="none" strokeWidth="2.4" stroke="currentColor" />
            <path d="M19.6 19.6 L24 24" strokeWidth="2.4" strokeLinecap="round" stroke="currentColor" />
          </svg>
          <span className="flex items-center gap-1 text-[11px] font-medium"><ImageOff className="size-3" /> Image unavailable</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
          className={cn("transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0", objectFit === "contain" ? "object-contain" : "object-cover", className)}
          {...props}
        />
      )}
    </div>
  );
}
