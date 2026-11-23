"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Subtle fade-up on scroll. Respects reduced motion via MotionConfig. */
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} className={cn("min-w-0", className)}>
      {children}
    </motion.div>
  );
}
