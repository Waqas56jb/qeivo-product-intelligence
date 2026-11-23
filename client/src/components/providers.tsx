"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAppStore } from "@/store/app-store";
import { SourceDrawerProvider } from "@/components/analysis/source-drawer";

function StoreHydrator() {
  useEffect(() => {
    void useAppStore.persist.rehydrate();
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange storageKey="qeivo-theme">
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={200}>
          <SourceDrawerProvider>
            <StoreHydrator />
            {children}
            <Toaster position="bottom-right" closeButton toastOptions={{ classNames: { toast: "!rounded-[14px] !border-border !bg-popover !text-popover-foreground !shadow-lg", description: "!text-muted-foreground" } }} />
          </SourceDrawerProvider>
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
